#!/usr/bin/env node
// Checks on the built site (dist/, or OUT_DIR). Runs after every build and
// fails it on:
//   - an en dash or em dash in any text file
//   - a banned word or phrase outside elements marked data-verbatim
//   - emoji, "TODO", "lorem ipsum", "coming soon" on a page
//   - an <img> without width, height or alt
//   - a link that says PDF without its size
//   - a page over 100 KB without images (HTML, scripts, styles, and the fonts
//     it downloads on a desktop with Times New Roman installed)
//   - a file over 20 MB

import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(process.env.OUT_DIR ?? 'dist');
const FILE_LIMIT = 20_000_000;
const PAGE_BUDGET = 100_000;

// Brief, section 4: words banned in copy I write (with their inflections),
// self-praise, and claims the site must never make.
const BANNED = [
  'passionate', 'passionately',
  'leverage', 'leverages', 'leveraged', 'leveraging',
  'cutting-edge', 'innovative', 'seamless', 'seamlessly',
  'robust', 'robustly', 'robustness',
  'delve', 'delves', 'delved', 'delving',
  'journey', 'journeys',
  'unlock', 'unlocks', 'unlocked', 'unlocking',
  'empower', 'empowers', 'empowered', 'empowering',
  'elevate', 'elevates', 'elevated', 'elevating',
  'harness', 'harnesses', 'harnessed', 'harnessing',
  'spearhead', 'spearheads', 'spearheaded', 'spearheading',
  'synergy', 'synergies', 'game-changer', 'game-changers', 'world-class',
  'dynamic', 'showcase', 'showcases', 'showcased', 'showcasing',
  'foster', 'fosters', 'fostered', 'fostering',
  'drives', 'surfaces',
  'highly motivated', 'results-driven', 'expert',
  'welcome to my website', "let's work together", 'hire me',
  'co-founder', 'cofounder', 'team of two', 'technical side', 'fixed rank kriging',
  'available from', 'open to work',
  'lorem ipsum', 'coming soon',
];
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BANNED_RE = new RegExp(`(?<![\\w-])(${BANNED.map(escapeRe).join('|')})(?![\\w-])`, 'gi');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const rel = (file) => path.relative(DIST, file);
const kb = (bytes) => `${(bytes / 1000).toFixed(1)} KB`;

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

/** Visible text and readable attributes, without scripts, styles, and verbatim elements. */
function readable(html) {
  let s = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  // Verbatim elements hold no nested element of the same name (flat <p>, <ul> of <li>).
  s = s.replace(/<(\w+)\b[^>]*\bdata-verbatim\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  const attrs = [...s.matchAll(/\b(?:alt|title|aria-label|content)="([^"]*)"/gi)].map((m) => m[1]);
  return decode(`${s.replace(/<[^>]+>/g, ' ')} ${attrs.join(' ')}`).replace(/\s+/g, ' ');
}

const errors = [];
const fail = (file, msg) => errors.push(`${rel(file)}: ${msg}`);
const files = walk(DIST);

for (const file of files) {
  const size = fs.statSync(file).size;
  if (size >= FILE_LIMIT) fail(file, `${(size / 1e6).toFixed(1)} MB, over 20 MB`);
  if (!/\.(html|txt|xml|json|css|js|svg)$/.test(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(/[–—]/g)) {
    fail(file, `dash "${m[0]}" in "${text.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\s+/g, ' ')}"`);
  }
}

const budget = [];
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  const text = readable(html);

  for (const m of text.matchAll(BANNED_RE)) fail(file, `banned: "${m[0]}" in "...${text.slice(Math.max(0, m.index - 40), m.index + 40)}..."`);
  for (const m of text.matchAll(/\p{Extended_Pictographic}/gu)) fail(file, `emoji "${m[0]}"`);
  if (/\bTODO\b/.test(text)) fail(file, 'contains TODO');

  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
    for (const attr of ['width', 'height', 'alt']) if (!new RegExp(`\\s${attr}=`).test(tag)) fail(file, `<img> without ${attr}: ${tag.slice(0, 80)}`);
  }

  for (const [, inner] of html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = decode(inner.replace(/<[^>]+>/g, ''));
    if (/\bPDF\b/.test(label) && !/\d+(?:\.\d)? (?:KB|MB)/.test(label)) fail(file, `PDF link without size: "${label}"`);
  }

  // Page weight without images.
  const linked = [
    ...[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi)].map((m) => m[1]),
    ...[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/gi)].map((m) => m[1]),
  ];
  const css = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('');
  const fonts = new Set(
    [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)]
      .filter(([, block]) => !block.includes('local('))
      .flatMap(([, block]) => [...block.matchAll(/url\("?([^")]+)"?\)/g)].map((m) => m[1])),
  );
  const sizeOf = (url) => {
    const target = path.join(DIST, url.split(/[?#]/)[0]);
    return fs.existsSync(target) ? fs.statSync(target).size : 0;
  };
  const htmlBytes = Buffer.byteLength(html);
  const assetBytes = linked.reduce((sum, u) => sum + sizeOf(u), 0);
  const fontBytes = [...fonts].reduce((sum, u) => sum + sizeOf(u), 0);
  const total = htmlBytes + assetBytes + fontBytes;
  budget.push(`  ${rel(file).padEnd(28)} html ${kb(htmlBytes).padStart(9)}  js/css ${kb(assetBytes).padStart(8)}  fonts ${kb(fontBytes).padStart(8)}  total ${kb(total).padStart(9)}`);
  if (total > PAGE_BUDGET) fail(file, `${kb(total)} without images, over 100 KB`);
}

console.log(`check: ${rel(DIST) || path.basename(DIST)}, page weight without images:\n${budget.join('\n')}`);
if (errors.length) {
  console.error(`\ncheck: ${errors.length} problem(s):\n${errors.map((e) => `  ${e}`).join('\n')}`);
  process.exit(1);
}
console.log('check: no dashes, banned words, emoji or TODO; images sized; PDF links sized; no file over 20 MB.');
