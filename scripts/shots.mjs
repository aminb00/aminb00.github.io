#!/usr/bin/env node
// Full-page screenshots at 375, 768 and 1280 px with the Chrome installed on
// this machine (playwright-core downloads no browser).
//
// Usage: BASE=http://localhost:4321 LABEL=a OUT=proof/phase1 PAGES=/,/experience/ npm run shots
//   VIEWER=/experience/#paris-pitch/3 also shoots that page with the viewer open.

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const LABEL = process.env.LABEL ?? 'site';
const OUT = process.env.OUT ?? 'proof';
const PAGES = (process.env.PAGES ?? '/,/experience/').split(',');
const VIEWER = process.env.VIEWER;
const WIDTHS = [375, 768, 1280];

const name = (p) => (p === '/' ? 'home' : p.replace(/[/#]+/g, '-').replace(/^-|-$/g, ''));

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const width of WIDTHS) {
    const mobile = width < 768;
    const context = await browser.newContext({
      viewport: { width, height: mobile ? 812 : 900 },
      deviceScaleFactor: 2,
      isMobile: mobile,
      hasTouch: mobile,
    });
    const page = await context.newPage();
    for (const p of PAGES) {
      await page.goto(BASE + p, { waitUntil: 'networkidle' });
      // Lazy images below the fold: load them so the full-page shot shows them.
      await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager')));
      await page.waitForLoadState('networkidle');
      const file = path.join(OUT, `${LABEL}-${name(p)}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(file);
    }
    if (VIEWER) {
      await page.goto(BASE + VIEWER, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => {
        const img = document.querySelector('.viewer:not([hidden]) [data-slide]');
        return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
      });
      const file = path.join(OUT, `${LABEL}-viewer-${width}.png`);
      await page.screenshot({ path: file });
      console.log(file);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
