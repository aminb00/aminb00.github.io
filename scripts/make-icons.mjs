#!/usr/bin/env node
// Favicon and Open Graph image, in the site's plain style: black Tinos on white.
// Text is turned into outlines (satori), then into PNG (resvg), so the result
// does not depend on the fonts installed on the machine. Run it again after
// changing the name or the affiliation line; the outputs are committed.
//
//   public/favicon.svg           "AB", bold serif, black on white
//   public/favicon.ico           the same at 32x32 (a PNG inside an ICO)
//   public/apple-touch-icon.png  180x180
//   public/og.png                1200x630: name, affiliation line, a rule, the address
//
// Usage: npm run icons

import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { parse } from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUB = path.join(ROOT, 'public');
const profile = parse(fs.readFileSync(path.join(ROOT, 'src/data/profile.yaml'), 'utf8'))[0];
const site = new URL(process.env.SITE_URL || 'https://aminb00.github.io');

const font = (weight) => fs.readFileSync(path.join(ROOT, `node_modules/@fontsource/tinos/files/tinos-latin-${weight}-normal.woff`));
const fonts = [
  { name: 'Tinos', data: font(400), weight: 400, style: 'normal' },
  { name: 'Tinos', data: font(700), weight: 700, style: 'normal' },
];
// satori takes a React-like tree; plain objects are enough.
const el = (style, children) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });
const png = (svg, width) => new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();

// Favicon
const icon = el(
  { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#000', fontFamily: 'Tinos', fontWeight: 700, fontSize: 38 },
  'AB',
);
const iconSvg = await satori(icon, { width: 64, height: 64, fonts });
fs.writeFileSync(path.join(PUB, 'favicon.svg'), `${iconSvg}\n`);
fs.writeFileSync(path.join(PUB, 'apple-touch-icon.png'), png(iconSvg, 180));

// favicon.ico: header (6 bytes), one directory entry (16 bytes), then the PNG.
const p32 = png(iconSvg, 32);
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); // reserved
head.writeUInt16LE(1, 2); // type: icon
head.writeUInt16LE(1, 4); // one image
head.writeUInt8(32, 6); // width
head.writeUInt8(32, 7); // height
head.writeUInt16LE(1, 10); // color planes
head.writeUInt16LE(32, 12); // bits per pixel
head.writeUInt32LE(p32.length, 14); // image size
head.writeUInt32LE(22, 18); // image offset
fs.writeFileSync(path.join(PUB, 'favicon.ico'), Buffer.concat([head, p32]));

// Open Graph image
const W = 1000; // text column inside 100px margins
const og = el(
  { width: 1200, height: 630, alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#000', fontFamily: 'Tinos' },
  el({ width: W, flexDirection: 'column' }, [
    el({ width: W, fontSize: 104, fontWeight: 700 }, profile.name),
    el({ width: W, fontSize: 42, lineHeight: 1.3, marginTop: 20 }, profile.affiliationLine),
    // The 2px inset rule of a 1996 <hr>.
    el({ width: W, height: 4, marginTop: 44, borderTop: '2px solid #808080', borderBottom: '2px solid #e0e0e0' }, []),
    el({ width: W, fontSize: 36, marginTop: 36 }, site.host),
  ]),
);
fs.writeFileSync(path.join(PUB, 'og.png'), png(await satori(og, { width: 1200, height: 630, fonts }), 1200));

for (const f of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'og.png']) {
  console.log(`icons: public/${f} (${fs.statSync(path.join(PUB, f)).size} bytes)`);
}
