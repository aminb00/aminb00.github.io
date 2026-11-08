#!/usr/bin/env node
// Downloads the source PDFs named in the data files. Run by hand when a source changes.
//
//   GitHub sources → public/pdf/<file>, committed (each must stay under 20 MB).
//   Drive sources  → .cache/originals/<id>.pdf, never committed. The slide images
//                    are made from this original. A Ghostscript /ebook copy becomes
//                    public/pdf/<file> only if it is under 20 MB.
//
// Then it scans the text of each PDF for personal data (phone numbers, street
// addresses, e-mail addresses, student IDs, grades) and prints every hit, so a
// person can look before anything is published.
//
// Usage: npm run fetch               every document
//        npm run fetch -- paris-pitch only these ids
//        npm run fetch -- --force     also redo the Drive compression
// A PDF with no source (one you dropped in public/pdf/ yourself) is only scanned.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { parse } from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const LIMIT = 20_000_000;
const args = process.argv.slice(2);
const force = args.includes('--force');
const only = new Set(args.filter((a) => a !== '--force'));

const readData = (name) => parse(fs.readFileSync(path.join(ROOT, 'src/data', name), 'utf8')) ?? [];
const mb = (bytes) => `${(bytes / 1e6).toFixed(1)} MB`;

function documents() {
  const docs = [];
  for (const d of readData('presentations.yaml')) docs.push({ id: d.id, file: d.pdf?.file, source: d.source });
  for (const name of ['experience.yaml', 'education.yaml', 'projects.yaml']) {
    for (const entry of readData(name)) {
      for (const m of entry.material ?? []) if (m.type === 'pdf') docs.push({ id: m.id, file: m.file, source: m.source });
    }
  }
  return docs.filter((d) => only.size === 0 || only.has(d.id));
}

// Each path segment URL-encoded: spaces → %20, & → %26.
const rawUrl = ({ repo, path: file, branch = 'main' }) =>
  `https://raw.githubusercontent.com/${repo}/${branch}/${file.split('/').map(encodeURIComponent).join('/')}`;
const driveUrl = (id) => `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;

async function download(url, dest) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok || !res.body) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const part = `${dest}.part`;
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(part));
  const head = Buffer.alloc(5);
  const fd = fs.openSync(part, 'r');
  fs.readSync(fd, head, 0, 5, 0);
  fs.closeSync(fd);
  if (head.toString() !== '%PDF-') {
    fs.rmSync(part);
    throw new Error(`${url} did not return a PDF`);
  }
  fs.renameSync(part, dest);
  return fs.statSync(dest).size;
}

function compress(src, dest) {
  execFileSync('gs', [
    '-q', '-dSAFER', '-dBATCH', '-dNOPAUSE',
    '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.6', '-dPDFSETTINGS=/ebook',
    `-sOutputFile=${dest}`, src,
  ]);
  return fs.statSync(dest).size;
}

// Personal data that must not end up on the site (brief, section 4). Broad on
// purpose: a person reviews every hit.
const CHECKS = [
  ['phone number', /(?:\+|\b00)\d{2,3}[\s./-]?\(?\d{1,4}\)?(?:[\s./-]?\d{2,4}){2,4}|\b3\d{2}[\s./-]?\d{3}[\s./-]?\d{3,4}\b/g],
  ['e-mail address', /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g],
  ['street address', /\b(?:[Vv]ia|[Vv]iale|[Pp]iazza|[Pp]iazzale|[Cc]orso|[Ll]argo|[Vv]icolo|[Ss]treet|[Aa]venue|[Rr]oad|[Ss]traat|[Ll]aan)\s+[A-Z][\w'.-]*(?:\s+[A-Z][\w'.-]*)*,?\s*\d{1,4}\b/g],
  ['student ID', /\b(?:matricola|matr\.|student\s*(?:id|number)|studentnummer|s\d{7})\b[^\n]{0,30}/gi],
  ['grade', /\b(?:grade|voto|mark)\s*[:=]?\s*\d{1,3}(?:[.,]\d+)?(?:\s*\/\s*\d{2,3})?|\b\d{2}\s*\/\s*30\b|\b1[01]\d\s*\/\s*110\b|\be lode\b|\bcum laude\b/gi],
];

function scan(id, file) {
  const text = execFileSync('pdftotext', ['-layout', file, '-'], { maxBuffer: 256 * 1024 * 1024 }).toString();
  const hits = [];
  text.split('\f').forEach((page, i) => {
    for (const [label, re] of CHECKS) {
      for (const m of page.matchAll(re)) hits.push(`  ${id}, page ${i + 1}: ${label}: ${m[0].trim().slice(0, 80)}`);
    }
  });
  return hits;
}

let failed = false;
const report = [];
for (const doc of documents()) {
  try {
    const original = path.join(ROOT, '.cache/originals', `${doc.id}.pdf`);
    const published = doc.file ? path.join(ROOT, 'public/pdf', doc.file) : undefined;
    if (doc.source?.github) {
      const bytes = await download(rawUrl(doc.source.github), published);
      if (bytes >= LIMIT) throw new Error(`${doc.file} is ${mb(bytes)}, over 20 MB`);
      console.log(`fetch: ${doc.id}: ${doc.source.github.path} → public/pdf/${doc.file} (${mb(bytes)})`);
      report.push(...scan(doc.id, published));
    } else if (doc.source?.drive) {
      if (!fs.existsSync(original)) await download(driveUrl(doc.source.drive), original);
      console.log(`fetch: ${doc.id}: Drive original in .cache/originals/ (${mb(fs.statSync(original).size)})`);
      report.push(...scan(doc.id, original));
      if (published && fs.existsSync(published) && !force) {
        console.log(`fetch: ${doc.id}: public/pdf/${doc.file} exists, not recompressed (use --force)`);
      } else if (published) {
        const tmp = path.join(ROOT, '.cache', `${doc.id}.ebook.pdf`);
        const bytes = compress(original, tmp);
        if (bytes < LIMIT) {
          fs.mkdirSync(path.dirname(published), { recursive: true });
          fs.copyFileSync(tmp, published);
          console.log(`fetch: ${doc.id}: /ebook copy is ${mb(bytes)} → public/pdf/${doc.file}`);
        } else {
          console.log(`fetch: ${doc.id}: /ebook copy is ${mb(bytes)}, over 20 MB. Set pdf to { url, bytes } in presentations.yaml.`);
        }
      }
    } else if (published && fs.existsSync(published)) {
      console.log(`fetch: ${doc.id}: no source to download, scanning public/pdf/${doc.file}`);
      report.push(...scan(doc.id, published));
    } else {
      console.log(`fetch: ${doc.id}: no source and no file in public/pdf/`);
    }
  } catch (err) {
    failed = true;
    console.error(`fetch: ${doc.id}: ${err.message}`);
  }
}

console.log(report.length ? `\nPossible personal data, check before publishing:\n${report.join('\n')}` : '\nPersonal data scan: no hits.');
if (failed) process.exit(1);
