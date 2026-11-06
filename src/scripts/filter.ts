// Project filter. The state lives in the URL hash (#tag=ml), so a filtered
// list can be linked and Back works. Without JS the line stays hidden and
// every project shows.

const TAG_HASH = /^#tag=([a-z]+)$/;
const DECK_HASH = /^#[a-z0-9]+(?:-[a-z0-9]+)*\/\d+$/;

export function initFilter() {
  const nav = document.querySelector<HTMLElement>('[data-filter]');
  if (!nav || !nav.hidden) return;
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[data-tag]')];
  const projects = [...document.querySelectorAll<HTMLElement>('.project[data-tags]')];
  const status = document.querySelector<HTMLElement>('[data-filter-status]');
  let current = 'all';

  const apply = (wanted: string, announce: boolean) => {
    const tag = links.some((l) => l.dataset.tag === wanted) ? wanted : 'all';
    current = tag;
    let shown = 0;
    for (const p of projects) {
      const on = tag === 'all' || (p.dataset.tags ?? '').split(' ').includes(tag);
      p.hidden = !on;
      if (on) shown += 1;
    }
    for (const l of links) {
      if (l.dataset.tag === tag) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    }
    if (announce && status) {
      status.textContent =
        tag === 'all' ? `Showing all ${projects.length} projects` : `Showing ${shown} of ${projects.length} projects`;
    }
  };

  const fromHash = (announce: boolean) => {
    const hash = location.hash;
    const m = TAG_HASH.exec(hash);
    if (m) {
      apply(m[1], announce);
      if (current === 'all') history.replaceState(history.state, '', `${location.pathname}${location.search}`);
      return;
    }
    if (!hash || DECK_HASH.test(hash)) return; // decks: see "deck:reveal"
    // A link to one project (#iedd) shows it even if the filter hid it.
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target?.closest('.project[hidden]')) {
      apply('all', announce);
      target.scrollIntoView();
    }
  };

  nav.hidden = false;
  fromHash(false);
  window.addEventListener('hashchange', () => fromHash(true));

  // Before a #deck/3 link opens a deck, make sure its project is visible.
  document.addEventListener('deck:reveal', (e) => {
    const fig = (e as CustomEvent<Element>).detail;
    if (fig?.closest('.project[hidden]')) apply('all', true);
  });
  // The viewer clears the hash when it closes: put the filter back.
  document.addEventListener('deck:closed', () => {
    if (current !== 'all') history.replaceState(history.state, '', `${location.pathname}${location.search}#tag=${current}`);
  });
}
