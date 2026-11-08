#!/usr/bin/env node
// Behavior checks in a real browser (the Chrome installed on this machine):
// slide viewer, deep links, keyboard, swipe, full screen, no-JS fallback,
// email, project filter, links between decks and entries.
//
// Usage: BASE=http://localhost:4400 npm run verify

import { chromium } from 'playwright-core';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const PAGE = '/experience/';
const DECK = 'paris-pitch';

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

  // ---- Slide viewer -------------------------------------------------------
  const fig = `figure[data-deck="${DECK}"]`;
  const state = (sel = fig) =>
    page.evaluate((s) => {
      const f = document.querySelector(s);
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
    }, sel);

  await page.goto(BASE + PAGE, { waitUntil: 'networkidle' });
  let s = await state();
  check('viewer starts closed, poster shown', !s.open && !s.posterHidden);

  await page.click(`${fig} [data-toggle]`);
  s = await state();
  check('View slides opens slide 1 in place of the poster', s.open && s.posterHidden && s.n === '1' && s.src.endsWith('/001.webp'));
  check('toggle has aria-expanded=true and reads Hide slides', s.expanded === 'true' && s.toggleText === 'Hide slides');
  check('hash tracks the slide', s.hash === `#${DECK}/1`, s.hash);
  const pages = await page.getAttribute(fig, 'data-pages');
  check('alt text and live region', s.alt.startsWith('Slide 1 of ') && s.live === `Slide 1 of ${pages}`, `${s.alt} | ${s.live}`);
  check('prev disabled on slide 1', s.prevDisabled && !s.nextDisabled);

  await page.click(`${fig} [data-next]`);
  s = await state();
  check('next > goes to slide 2', s.n === '2' && s.hash === `#${DECK}/2`);
  const preloaded = await page
    .waitForFunction(() => performance.getEntriesByType('resource').some((r) => r.name.endsWith('/003.webp')), null, { timeout: 3000 })
    .then(() => true, () => false);
  check('previous and next slides preloaded', preloaded);

  await page.keyboard.press('ArrowRight');
  s = await state();
  check('→ key: slide 3', s.n === '3');
  await page.keyboard.press('ArrowLeft');
  s = await state();
  check('← key: slide 2', s.n === '2');
  await page.keyboard.press('End');
  s = await state();
  check('End key: last slide, next disabled', s.n === pages && s.nextDisabled);
  await page.keyboard.press('Home');
  s = await state();
  check('Home key: slide 1', s.n === '1');
  check('Full screen button shown where the API exists', s.fsVisible);
  await page.keyboard.press('Escape');
  s = await state();
  check('Esc closes, hash cleared, focus back on the toggle', !s.open && s.hash === '' && s.active.includes('data-toggle'), s.active);

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

  await page.goto(`${BASE}${PAGE}#${DECK}/2`, { waitUntil: 'networkidle' });
  await page.click(`${fig} [data-fs]`);
  await page.waitForTimeout(300);
  const fsOn = await page.evaluate((sel) => document.fullscreenElement === document.querySelector(sel).querySelector('.viewer'), fig);
  const fsLabel = await page.textContent(`${fig} [data-fs]`);
  check('Full screen enters full screen on the viewer', fsOn && fsLabel === 'Exit full screen', fsLabel);
  await page.evaluate(() => document.exitFullscreen());

  // Opening a second deck closes the first.
  await page.goto(`${BASE}/presentations/`, { waitUntil: 'networkidle' });
  const decks = await page.$$eval('figure.deck', (fs) => fs.map((f) => f.dataset.deck));
  await page.click(`figure[data-deck="${decks[0]}"] [data-toggle]`);
  await page.click(`figure[data-deck="${decks[1]}"] [data-toggle]`);
  const openNow = await page.$$eval('figure.deck', (fs) => fs.filter((f) => !f.querySelector('.viewer').hidden).map((f) => f.dataset.deck));
  check('one viewer open at a time', openNow.length === 1 && openNow[0] === decks[1], openNow.join(','));

  // Every deck's slides load.
  let allLoad = true;
  for (const id of decks) {
    await page.goto(`${BASE}/presentations/#${id}/2`, { waitUntil: 'networkidle' });
    const ok = await page
      .waitForFunction(
        (d) => {
          const img = document.querySelector(`figure[data-deck="${d}"] [data-slide]`);
          return img.complete && img.naturalWidth > 0 && img.getAttribute('src').endsWith('/002.webp');
        },
        id,
        { timeout: 5000 },
      )
      .then(() => true, () => false);
    if (!ok) allLoad = false;
  }
  check(`every deck opens on the Presentations page (${decks.length} decks)`, allLoad);

  // ---- Links between decks and entries ------------------------------------
  const related = await page.$$eval('main .entry', (entries) =>
    entries.map((e) => ({ id: e.querySelector('h3').id, related: [...e.querySelectorAll('p a')].filter((a) => a.closest('p').textContent.trim().startsWith('Related:')).map((a) => a.getAttribute('href')) })),
  );
  let backAndForth = related.every((d) => d.related.length > 0);
  for (const d of related) {
    for (const href of d.related) {
      await page.goto(BASE + href, { waitUntil: 'networkidle' });
      const anchor = href.split('#')[1];
      const linksBack = await page.evaluate(
        ([a, deck]) => {
          const entry = document.getElementById(a)?.closest('.entry');
          return Boolean(entry?.querySelector(`figure[data-deck="${deck}"] figcaption a[href="/presentations/#${deck}"]`));
        },
        [anchor, d.id],
      );
      if (!linksBack) backAndForth = false;
    }
  }
  check('every deck links to its entry, and the entry shows the deck and links back', backAndForth, related.map((d) => `${d.id}→${d.related.join('+')}`).join(' '));

  // ---- Project filter -------------------------------------------------------
  const visibleProjects = () => page.$$eval('.project', (ps) => ps.filter((p) => !p.hidden).map((p) => p.querySelector('h3').id));
  await page.goto(`${BASE}/projects/`, { waitUntil: 'networkidle' });
  const all = await visibleProjects();
  const filterShown = await page.$eval('[data-filter]', (n) => !n.hidden);
  check('filter shown with JS, all projects visible', filterShown && all.length > 0, `${all.length} projects`);
  const filtered = (tag) =>
    page.waitForFunction((t) => document.querySelector('[data-filter] a[aria-current]')?.dataset.tag === t, tag, { timeout: 3000 }).catch(() => {});
  await page.click('[data-filter] a[data-tag="geo"]');
  await filtered('geo');
  const geo = await visibleProjects();
  const geoState = await page.evaluate(() => ({
    hash: location.hash,
    current: document.querySelector('[data-filter] a[aria-current]')?.dataset.tag,
    status: document.querySelector('[data-filter-status]').textContent,
  }));
  const geoOk = geo.length > 0 && geo.length < all.length && (await page.$$eval('.project:not([hidden])', (ps) => ps.every((p) => p.dataset.tags.split(' ').includes('geo'))));
  check('Geospatial: only geo projects, hash #tag=geo, active link marked, count announced', geoOk && geoState.hash === '#tag=geo' && geoState.current === 'geo' && /^Showing \d+ of \d+ projects$/.test(geoState.status), `${geo.join(',')} | ${geoState.status}`);
  const bold = await page.$eval('[data-filter] a[aria-current]', (a) => getComputedStyle(a).fontWeight);
  check('the active filter is bold', Number(bold) >= 700, bold);
  await page.click('[data-filter] a[data-tag="all"]');
  await filtered('all');
  await page.waitForFunction(() => location.hash === '', null, { timeout: 3000 }).catch(() => {});
  const back = await visibleProjects();
  check('All: every project again, hash cleared', back.length === all.length && (await page.evaluate(() => location.hash)) === '');
  await page.goto(`${BASE}/projects/#tag=ml`, { waitUntil: 'networkidle' });
  const ml = await visibleProjects();
  check('a #tag=ml link opens the filtered list', ml.length > 0 && ml.length < all.length, ml.join(','));
  await page.evaluate(() => (location.hash = '#rpca-slides/2'));
  await page.waitForTimeout(300);
  const deckOpen = await page.evaluate(() => !document.querySelector('figure[data-deck="rpca-slides"] .viewer').hidden);
  check('a deck link opens its viewer even while a filter is on', deckOpen);
  await page.goto(`${BASE}/projects/#tag=software`, { waitUntil: 'networkidle' });
  await page.evaluate(() => (location.hash = '#rpca-slides/2'));
  await page.waitForTimeout(300);
  const revealed = await page.evaluate(() => !document.querySelector('#rpca').closest('.project').hidden && !document.querySelector('figure[data-deck="rpca-slides"] .viewer').hidden);
  check('a deck in a project hidden by the filter: filter resets, deck opens', revealed);
  await page.keyboard.press('Escape');

  // ---- Email ----------------------------------------------------------------
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const mail = await page.evaluate(() => [...document.querySelectorAll('[data-email] a')].map((a) => a.getAttribute('href')));
  check('email turned into mailto links', mail.length >= 2 && mail.every((h) => h === 'mailto:aminborqal10@gmail.com'), mail.join(' '));
  await page.click('[data-copy-email]');
  await page.waitForFunction(() => document.querySelector('[data-copy-status]')?.textContent !== '', null, { timeout: 3000 }).catch(() => {});
  const status = await page.textContent('[data-copy-status]');
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  check('Copy email copies and announces Copied', status === 'Copied' && clip === 'aminborqal10@gmail.com', `${status} | ${clip}`);
  let leaked = false;
  for (const p of ['/', '/experience/', '/projects/', '/presentations/', '/cv/', '/cv.txt']) {
    if ((await (await page.request.get(BASE + p)).text()).includes('aminborqal10@gmail.com')) leaked = true;
  }
  check('no page or file holds the whole address', !leaked);

  check('no JS errors or failed requests', errors.length === 0, errors.join(' | '));
  await ctx.close();

  // ---- Swipe on a phone -----------------------------------------------------
  const phone = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p2 = await phone.newPage();
  await p2.goto(`${BASE}${PAGE}#${DECK}/2`, { waitUntil: 'networkidle' });
  const box = await p2.locator(`${fig} [data-slide]`).boundingBox();
  const cdp = await phone.newCDPSession(p2);
  const swipe = async (from, to) => {
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

  // ---- Keyboard only ----------------------------------------------------------
  // Tab through every page: each focusable element must get focus, in view,
  // with a visible focus indicator. Then open a <details> and a filter by keys.
  const kb = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const kp = await kb.newPage();
  const problems = [];
  let total = 0;
  for (const path of ['/', '/experience/', '/projects/', '/presentations/', '/cv/']) {
    await kp.goto(BASE + path, { waitUntil: 'networkidle' });
    // Links inside a closed <details> are skipped by Tab, as they should be.
    const count = await kp.$$eval('a[href], button, summary, [tabindex]:not([tabindex="-1"])', (els) =>
      els.filter((e) => e.getClientRects().length > 0 && (e.tagName === 'SUMMARY' || !e.closest('details:not([open])'))).length,
    );
    const visited = new Set();
    for (let i = 0; i < count; i++) {
      await kp.keyboard.press('Tab');
      const info = await kp.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          id: [...document.querySelectorAll('*')].indexOf(el),
          tag: el.outerHTML.slice(0, 60),
          ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0,
          inView: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight,
        };
      });
      if (!info) break;
      visited.add(info.id);
      if (!info.ring || !info.inView) problems.push(`${path} ${info.tag}`);
    }
    total += visited.size;
    if (visited.size !== count) problems.push(`${path}: reached ${visited.size} of ${count} focusable elements`);
  }
  check(`keyboard: every link, button and summary gets visible focus (${total} stops on 5 pages)`, problems.length === 0, problems.slice(0, 5).join(' | '));

  await kp.goto(`${BASE}/experience/`, { waitUntil: 'networkidle' });
  await kp.focus('details summary');
  await kp.keyboard.press('Enter');
  const detailsOpen = await kp.$eval('details', (d) => d.open);
  check('keyboard: Enter opens a "More" <details>', detailsOpen);

  await kp.goto(`${BASE}/projects/`, { waitUntil: 'networkidle' });
  await kp.focus('[data-filter] a[data-tag="software"]');
  await kp.keyboard.press('Enter');
  await kp.waitForFunction(() => document.querySelector('[data-filter] a[aria-current]')?.dataset.tag === 'software', null, { timeout: 3000 }).catch(() => {});
  const softwareOnly = await kp.$$eval('.project', (ps) => ps.filter((p) => !p.hidden).map((p) => p.querySelector('h3').id));
  check('keyboard: Enter on a filter link filters', softwareOnly.length === 1 && softwareOnly[0] === 'spendly', softwareOnly.join(','));
  await kb.close();

  // ---- Without JS -------------------------------------------------------------
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
  await p3.goto(`${BASE}/projects/`, { waitUntil: 'networkidle' });
  const nojsProjects = await p3.evaluate(() => ({
    filter: document.querySelector('[data-filter]').getClientRects().length > 0,
    hidden: [...document.querySelectorAll('.project')].filter((p) => p.getClientRects().length === 0).length,
  }));
  check('without JS: no filter line, every project visible', !nojsProjects.filter && nojsProjects.hidden === 0, JSON.stringify(nojsProjects));
  await nojs.close();
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
