#!/usr/bin/env node
// Behavior checks in a real browser (the Chrome installed on this machine):
// slide viewer, deep links, keyboard, swipe, full screen, no-JS fallback, email.
//
// Usage: BASE=http://localhost:4321 PAGE=/experience/ DECK=paris-pitch node scripts/verify.mjs

import { chromium } from 'playwright-core';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const PAGE = process.env.PAGE ?? '/experience/';
const DECK = process.env.DECK ?? 'paris-pitch';

const results = [];
const check = (label, ok, detail = '') => {
  results.push({ label, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
};

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));

  const fig = `figure[data-deck="${DECK}"]`;
  const state = () =>
    page.evaluate((sel) => {
      const f = document.querySelector(sel);
      const img = f.querySelector('[data-slide]');
      return {
        open: !f.querySelector('.viewer').hidden,
        posterHidden: f.querySelector('.poster-link').hidden,
        n: f.querySelector('[data-n]').textContent,
        src: img.getAttribute('src'),
        alt: img.alt,
        live: f.querySelector('[data-live]').textContent,
        hash: location.hash,
        expanded: f.querySelector('[data-toggle]').getAttribute('aria-expanded'),
        toggleText: f.querySelector('[data-toggle]').textContent,
        prevDisabled: f.querySelector('[data-prev]').disabled,
        nextDisabled: f.querySelector('[data-next]').disabled,
        fsVisible: !f.querySelector('[data-fs]').hidden,
        active: document.activeElement?.outerHTML.slice(0, 60),
      };
    }, fig);

  await page.goto(BASE + PAGE, { waitUntil: 'networkidle' });
  let s = await state();
  check('viewer starts closed, poster shown', !s.open && !s.posterHidden);

  await page.click(`${fig} [data-toggle]`);
  s = await state();
  check('View slides opens slide 1 in place of the poster', s.open && s.posterHidden && s.n === '1' && s.src.endsWith('/001.webp'));
  check('toggle has aria-expanded=true and reads Hide slides', s.expanded === 'true' && s.toggleText === 'Hide slides');
  check('hash tracks the slide', s.hash === `#${DECK}/1`, s.hash);
  check('alt text and live region', s.alt.startsWith('Slide 1 of ') && s.live === `Slide 1 of ${await page.getAttribute(fig, 'data-pages')}`, `${s.alt} | ${s.live}`);
  check('prev disabled on slide 1', s.prevDisabled && !s.nextDisabled);

  await page.click(`${fig} [data-next]`);
  s = await state();
  check('next > goes to slide 2', s.n === '2' && s.hash === `#${DECK}/2`);
  const preloaded = await page
    .waitForFunction(() => performance.getEntriesByType('resource').some((r) => r.name.endsWith('/003.webp')), null, { timeout: 3000 })
    .then(() => true, () => false);
  const fetched = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name.split('/').pop()).filter((n) => n.endsWith('.webp')));
  check('previous and next slides preloaded', preloaded, fetched.join(' '));

  await page.keyboard.press('ArrowRight');
  s = await state();
  check('→ key: slide 3', s.n === '3');
  await page.keyboard.press('ArrowLeft');
  s = await state();
  check('← key: slide 2', s.n === '2');
  await page.keyboard.press('End');
  s = await state();
  const pages = await page.getAttribute(fig, 'data-pages');
  check('End key: last slide, next disabled', s.n === pages && s.nextDisabled);
  await page.keyboard.press('Home');
  s = await state();
  check('Home key: slide 1', s.n === '1');
  check('Full screen button shown where the API exists', s.fsVisible);
  await page.keyboard.press('Escape');
  s = await state();
  check('Esc closes, hash cleared, focus back on the toggle', !s.open && s.hash === '' && s.active.includes('data-toggle'), s.active);

  // Deep link
  await page.goto(`${BASE}${PAGE}#${DECK}/3`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  s = await state();
  const inView = await page.evaluate((sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return r.top >= -2 && r.top < innerHeight;
  }, fig);
  check(`deep link #${DECK}/3 opens slide 3 and scrolls to it`, s.open && s.n === '3' && inView);
  await page.goto(`${BASE}${PAGE}#${DECK}/999`, { waitUntil: 'networkidle' });
  s = await state();
  check('out-of-range slide number clamps to the last slide', s.open && s.n === pages);

  // Full screen
  await page.goto(`${BASE}${PAGE}#${DECK}/2`, { waitUntil: 'networkidle' });
  await page.click(`${fig} [data-fs]`);
  await page.waitForTimeout(300);
  const fsOn = await page.evaluate((sel) => document.fullscreenElement === document.querySelector(sel).querySelector('.viewer'), fig);
  const fsLabel = await page.textContent(`${fig} [data-fs]`);
  check('Full screen enters full screen on the viewer', fsOn && fsLabel === 'Exit full screen', fsLabel);
  await page.evaluate(() => document.exitFullscreen());

  // Email
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const mail = await page.evaluate(() => [...document.querySelectorAll('[data-email] a')].map((a) => a.getAttribute('href')));
  check('email turned into mailto links', mail.length >= 2 && mail.every((h) => h === 'mailto:aminborqal10@gmail.com'), mail.join(' '));
  await page.click('[data-copy-email]');
  await page.waitForFunction(() => document.querySelector('[data-copy-status]')?.textContent !== '', null, { timeout: 3000 }).catch(() => {});
  const status = await page.textContent('[data-copy-status]');
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  check('Copy email copies and announces Copied', status === 'Copied' && clip === 'aminborqal10@gmail.com', `${status} | ${clip}`);
  const raw = await (await page.request.get(BASE + '/')).text();
  check('HTML never holds the whole address', !raw.includes('aminborqal10@gmail.com'));

  check('no JS errors', errors.length === 0, errors.join(' | '));
  await ctx.close();

  // Swipe on a phone
  const phone = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p2 = await phone.newPage();
  await p2.goto(`${BASE}${PAGE}#${DECK}/2`, { waitUntil: 'networkidle' });
  const box = await p2.locator(`${fig} [data-slide]`).boundingBox();
  const swipe = async (from, to) => {
    const cdp = await phone.newCDPSession(p2);
    const y = box.y + box.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from, y }] });
    for (let i = 1; i <= 5; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from + ((to - from) * i) / 5, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await swipe(box.x + box.width * 0.8, box.x + box.width * 0.2);
  const afterLeft = await p2.textContent(`${fig} [data-n]`);
  await swipe(box.x + box.width * 0.2, box.x + box.width * 0.8);
  const afterRight = await p2.textContent(`${fig} [data-n]`);
  check('swipe left: next slide, swipe right: previous', afterLeft === '3' && afterRight === '2', `${afterLeft}, ${afterRight}`);
  await phone.close();

  // Without JS
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const p3 = await nojs.newPage();
  await p3.goto(BASE + PAGE, { waitUntil: 'networkidle' });
  const fallback = await p3.evaluate((sel) => {
    const f = document.querySelector(sel);
    const visible = (el) => el && el.getClientRects().length > 0;
    return {
      poster: visible(f.querySelector('.poster')),
      posterLinksPdf: f.querySelector('.poster-link').getAttribute('href').endsWith('.pdf'),
      pdfLink: [...f.querySelectorAll('figcaption a')].some((a) => /PDF, [\d.]+ (KB|MB)/.test(a.textContent)),
      toggle: visible(f.querySelector('[data-toggle]')),
      viewer: visible(f.querySelector('.viewer')),
    };
  }, fig);
  check('without JS: poster and PDF link, no toggle, no viewer', fallback.poster && fallback.posterLinksPdf && fallback.pdfLink && !fallback.toggle && !fallback.viewer, JSON.stringify(fallback));
  const nojsMail = await p3.textContent('[data-email]');
  check('without JS: email shown as "[at] [dot]" text', nojsMail.includes('[at]') && nojsMail.includes('[dot]'), nojsMail);
  await nojs.close();
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
