#!/usr/bin/env node
// Turns PDFs into the images the site shows, and records what it made in
// src/data/generated/docs.json. Runs before every `npm run dev` and `npm run build`.
//
//   decks    public/slides/<id>/001.webp ... (1600px wide, WebP quality 80)
//            and poster.webp (slide 1, 640px wide, shown at 320px)
//   reports  public/slides/<id>/poster.webp only (first page)
//   CV       public/slides/cv/poster.webp, once public/cv/... exists
//   portrait public/img/portrait.jpg → portrait.webp (300px wide, metadata removed)
//
// A document is skipped when its PDF has not changed and its images exist. So
// the build needs poppler only for new or changed PDFs, and a deck whose original
// lives outside the repo (Drive) still builds from its committed images.

import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { parse } from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUB = path.join(ROOT, 'public');
const OUT = path.join(ROOT, 'src/data/generated/docs.json');
const LIMIT = 20_000_000;
const SLIDE_WIDTH = 1600;
const POSTER_WIDTH = 640;
const QUALITY = 80;

const readData = (name) => parse(fs.readFileSync(path.join(ROOT, 'src/data', name), 'utf8')) ?? [];
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const exists = (file) => fs.existsSync(file);
const rel = (file) => path.relative(ROOT, file);
const slideName = (n) => `${String(n).padStart(3, '0')}.webp`;
const previous = exists(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { docs: {} };

function documents() {
  const list = [];
  for (const d of readData('presentations.yaml')) {
    list.push({ id: d.id, kind: 'deck', file: d.pdf?.file ? `pdf/${d.pdf.file}` : undefined });
  }
  for (const name of ['experience.yaml', 'education.yaml', 'projects.yaml']) {
    for (const entry of readData(name)) {
      for (const m of entry.material ?? []) {
        if (m.type === 'pdf' && m.poster) list.push({ id: m.id, kind: 'report', file: `pdf/${m.file}` });
      }
    }
  }
  const profile = readData('profile.yaml')[0];
  if (profile?.cv?.file && exists(path.join(PUB, profile.cv.file))) {
    list.push({ id: 'cv', kind: 'report', file: profile.cv.file });
  }
  return list;
}

function imagesExist(doc, info) {
  const dir = path.join(PUB, 'slides', doc.id);
  if (!exists(path.join(dir, 'poster.webp'))) return false;
  if (doc.kind === 'deck') {
    for (let n = 1; n <= info.pages; n++) if (!exists(path.join(dir, slideName(n)))) return false;
  }
  return true;
}

function run(cmd, args) {
  try {
    return execFileSync(cmd, args, { maxBuffer: 64 * 1024 * 1024 }).toString();
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`${cmd} not found: install poppler (brew install poppler, or apt-get install poppler-utils)`);
    throw err;
  }
}

async function render(doc, src) {
  const pages = Number(/^Pages:\s+(\d+)/m.exec(run('pdfinfo', [src]))[1]);
  const sizes = new Set(
    [...run('pdfinfo', ['-f', '1', '-l', String(pages), src]).matchAll(/^Page\s+\d+ size:\s+([\d.]+ x [\d.]+)/gm)].map((m) => m[1]),
  );
  if (sizes.size > 1) console.warn(`docs: warning: ${doc.id} mixes page sizes (${[...sizes].join(', ')})`);

  const dir = path.join(PUB, 'slides', doc.id);
  const tmp = path.join(ROOT, '.cache/render', doc.id);
  for (const d of [dir, tmp]) {
    fs.rmSync(d, { recursive: true, force: true });
    fs.mkdirSync(d, { recursive: true });
  }
  const last = doc.kind === 'deck' ? pages : 1;
  run('pdftoppm', ['-png', '-scale-to-x', String(SLIDE_WIDTH), '-scale-to-y', '-1', '-f', '1', '-l', String(last), src, path.join(tmp, 'p')]);
  const pngs = fs.readdirSync(tmp).filter((f) => f.endsWith('.png')).sort();
  if (pngs.length !== last) throw new Error(`${doc.id}: expected ${last} pages from pdftoppm, got ${pngs.length}`);

  const first = await sharp(path.join(tmp, pngs[0])).metadata();
  const poster = await sharp(path.join(tmp, pngs[0])).resize({ width: POSTER_WIDTH }).webp({ quality: QUALITY }).toFile(path.join(dir, 'poster.webp'));
  if (doc.kind === 'deck') {
    for (const [i, png] of pngs.entries()) {
      await sharp(path.join(tmp, png)).webp({ quality: QUALITY }).toFile(path.join(dir, slideName(i + 1)));
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  return { kind: doc.kind, pages, width: first.width, height: first.height, poster: [poster.width, poster.height] };
}

const docs = {};
for (const doc of documents()) {
  const original = path.join(ROOT, '.cache/originals', `${doc.id}.pdf`);
  const published = doc.file ? path.join(PUB, doc.file) : undefined;
  const prev = previous.docs?.[doc.id];
  const pdf = published && exists(published) ? { path: doc.file, bytes: fs.statSync(published).size, sha256: sha256(published) } : undefined;
  const hasOriginal = exists(original);
  const source = hasOriginal ? original : pdf ? published : undefined;
  const sourceHash = hasOriginal ? sha256(original) : pdf?.sha256;

  const upToDate =
    prev &&
    imagesExist(doc, prev) &&
    (!source || sourceHash === prev.renderedFrom || (!hasOriginal && pdf && pdf.sha256 === prev.pdf?.sha256));
  if (upToDate) {
    docs[doc.id] = { ...prev, ...(pdf && { pdf }) };
    continue;
  }
  if (!source) {
    console.error(`docs: ${doc.id}: no PDF (expected public/${doc.file ?? 'pdf/...'} or ${rel(original)}). Run npm run fetch.`);
    process.exit(1);
  }
  console.log(`docs: ${doc.id}: rendering from ${rel(source)}`);
  docs[doc.id] = { ...(await render(doc, source)), ...(pdf && { pdf }), renderedFrom: sourceHash };
}

// Portrait: WebP at 2x of the 150px display width, EXIF and GPS removed.
let portrait;
const profile = readData('profile.yaml')[0];
const jpg = profile?.portrait ? path.join(PUB, profile.portrait) : undefined;
if (jpg && exists(jpg)) {
  const webp = jpg.replace(/\.[a-z]+$/i, '.webp');
  const hash = sha256(jpg);
  if (previous.portrait?.sha256 === hash && exists(webp)) {
    portrait = previous.portrait;
  } else {
    const out = await sharp(jpg).rotate().resize({ width: 300 }).webp({ quality: 82 }).toFile(webp);
    portrait = { src: `/${path.relative(PUB, webp)}`, width: 150, height: Math.round(out.height / 2), sha256: hash };
    console.log(`docs: portrait → ${rel(webp)}`);
  }
}

// No file over 20 MB may be published or committed.
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const heavy = walk(PUB).filter((f) => fs.statSync(f).size >= LIMIT);
if (heavy.length) {
  console.error(`docs: over 20 MB: ${heavy.map(rel).join(', ')}`);
  process.exit(1);
}

const sorted = Object.fromEntries(Object.keys(docs).sort().map((k) => [k, docs[k]]));
const json = `${JSON.stringify({ docs: sorted, ...(portrait && { portrait }) }, null, 2)}\n`;
if (!exists(OUT) || fs.readFileSync(OUT, 'utf8') !== json) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, json);
  console.log(`docs: wrote ${rel(OUT)}`);
}
