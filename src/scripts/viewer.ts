// Inline slide viewer for <figure class="deck">. Without JS the poster links
// to the PDF; this script adds the viewer on top of that.
//
//   - opens in the poster's place, under the entry; one open viewer per page
//   - buttons, keys (← → Home End Esc, while focus is in the figure), swipe
//   - preloads the previous and next slide
//   - the URL hash tracks the slide: #paris-pitch/3 opens that slide
//   - "Slide 3 of 13" announced through aria-live
//   - Full screen through the Fullscreen API, hidden where it is missing

interface Viewer {
  slug: string;
  pages: number;
  base: string;
  title: string;
  fig: HTMLElement;
  box: HTMLElement;
  img: HTMLImageElement;
  num: HTMLElement;
  live: HTMLElement;
  prev: HTMLButtonElement;
  next: HTMLButtonElement;
  full: HTMLButtonElement;
  toggle: HTMLButtonElement;
  poster: HTMLAnchorElement;
  current: number;
  /** Kept so the preloads are not garbage-collected before they finish. */
  preloaded: Map<number, HTMLImageElement>;
}

type FsDocument = Document & { webkitFullscreenElement?: Element; webkitFullscreenEnabled?: boolean; webkitExitFullscreen?: () => void };
type FsElement = HTMLElement & { webkitRequestFullscreen?: () => void };

const HASH = /^#([a-z0-9]+(?:-[a-z0-9]+)*)\/(\d+)$/;
const viewers = new Map<string, Viewer>();
let openViewer: Viewer | undefined;

const doc = document as FsDocument;
const fullscreenElement = () => doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
const fullscreenEnabled = () => Boolean(doc.fullscreenEnabled || doc.webkitFullscreenEnabled);
const enterFullscreen = (el: FsElement) => (el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen?.());
const exitFullscreen = () => (doc.exitFullscreen ? doc.exitFullscreen() : doc.webkitExitFullscreen?.());

const slideUrl = (v: Viewer, n: number) => `${v.base}${String(n).padStart(3, '0')}.webp`;
const setHash = (hash: string) => history.replaceState(history.state, '', `${location.pathname}${location.search}${hash}`);

function show(v: Viewer, n: number) {
  const k = Math.min(Math.max(1, n), v.pages);
  v.current = k;
  v.img.src = slideUrl(v, k);
  v.img.alt = `Slide ${k} of ${v.title}`;
  v.num.textContent = String(k);
  v.live.textContent = `Slide ${k} of ${v.pages}`;

  const focused = document.activeElement;
  v.prev.disabled = k === 1;
  v.next.disabled = k === v.pages;
  // A focused button that just got disabled would drop focus to the page.
  if ((focused === v.prev && v.prev.disabled) || (focused === v.next && v.next.disabled)) v.box.focus();

  v.preloaded.set(k, v.img);
  for (const j of [k - 1, k + 1]) {
    if (j < 1 || j > v.pages || v.preloaded.has(j)) continue;
    const img = new Image();
    img.decoding = 'async';
    img.src = slideUrl(v, j);
    v.preloaded.set(j, img);
  }
  setHash(`#${v.slug}/${k}`);
}

function open(v: Viewer, n: number, focusBox: boolean) {
  if (openViewer && openViewer !== v) close(openViewer, false);
  openViewer = v;
  v.poster.hidden = true;
  v.box.hidden = false;
  v.toggle.setAttribute('aria-expanded', 'true');
  v.toggle.textContent = 'Hide slides';
  show(v, n);
  if (focusBox) v.box.focus({ preventScroll: true });
}

function close(v: Viewer, returnFocus: boolean) {
  if (fullscreenElement() === v.box) void exitFullscreen();
  v.box.hidden = true;
  v.poster.hidden = false;
  v.toggle.setAttribute('aria-expanded', 'false');
  v.toggle.textContent = 'View slides';
  v.live.textContent = '';
  if (openViewer === v) openViewer = undefined;
  if (HASH.test(location.hash)) setHash('');
  // Lets the project filter put its own hash back.
  document.dispatchEvent(new CustomEvent('deck:closed'));
  if (returnFocus) v.toggle.focus();
}

function setup(fig: HTMLElement) {
  const q = <T extends Element>(sel: string) => fig.querySelector<T>(sel)!;
  const v: Viewer = {
    slug: fig.dataset.deck!,
    pages: Number(fig.dataset.pages),
    base: fig.dataset.base!,
    title: fig.dataset.title!,
    fig,
    box: q('.viewer'),
    img: q('[data-slide]'),
    num: q('[data-n]'),
    live: q('[data-live]'),
    prev: q('[data-prev]'),
    next: q('[data-next]'),
    full: q('[data-fs]'),
    toggle: q('[data-toggle]'),
    poster: q('.poster-link'),
    current: 1,
    preloaded: new Map(),
  };
  viewers.set(v.slug, v);

  v.toggle.hidden = false;
  v.toggle.addEventListener('click', () => (v.box.hidden ? open(v, 1, false) : close(v, true)));
  v.poster.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new tab: let the PDF open
    e.preventDefault();
    open(v, 1, true);
  });
  v.prev.addEventListener('click', () => show(v, v.current - 1));
  v.next.addEventListener('click', () => show(v, v.current + 1));

  if (fullscreenEnabled()) {
    v.full.hidden = false;
    v.full.addEventListener('click', () => void (fullscreenElement() ? exitFullscreen() : enterFullscreen(v.box)));
  }

  fig.addEventListener('keydown', (e) => {
    if (v.box.hidden || e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case 'ArrowLeft':
        show(v, v.current - 1);
        break;
      case 'ArrowRight':
        show(v, v.current + 1);
        break;
      case 'Home':
        show(v, 1);
        break;
      case 'End':
        show(v, v.pages);
        break;
      case 'Escape':
        if (fullscreenElement()) void exitFullscreen();
        else close(v, true);
        break;
      default:
        return;
    }
    e.preventDefault();
  });

  // Swipe on phones: a mostly horizontal move of 50px or more.
  let start: { x: number; y: number; id: number } | undefined;
  v.img.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') start = { x: e.clientX, y: e.clientY, id: e.pointerId };
  });
  v.img.addEventListener('pointerup', (e) => {
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    start = undefined;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) show(v, v.current + (dx < 0 ? 1 : -1));
  });
  v.img.addEventListener('pointercancel', () => (start = undefined));
}

function fromHash() {
  const m = HASH.exec(location.hash);
  const v = m && viewers.get(m[1]);
  if (!m || !v) return;
  // Lets the project filter show the project first if it is hidden.
  document.dispatchEvent(new CustomEvent('deck:reveal', { detail: v.fig }));
  open(v, Number(m[2]), true);
  v.fig.scrollIntoView({ block: 'start' });
}

function onFullscreenChange() {
  for (const v of viewers.values()) {
    v.full.textContent = fullscreenElement() === v.box ? 'Exit full screen' : 'Full screen';
  }
}

export function initViewers() {
  if (viewers.size) return;
  document.querySelectorAll<HTMLElement>('figure.deck').forEach(setup);
  if (!viewers.size) return;
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);
  window.addEventListener('hashchange', fromHash);
  fromHash();
}
