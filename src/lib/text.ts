// The three text marks allowed in the data files:
//   **bold**   `mono`   [label](#slug) or [label](https://...)
// Everything else is escaped. No Markdown library: this is all the site needs.

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MARKS = '`([^`]+)`|\\*\\*(.+?)\\*\\*|\\[([^\\]]+)\\]\\(([^)\\s]+)\\)';

/** Text with marks → HTML. `resolve` turns a slug into a URL and throws on unknown slugs. */
export function inline(src: string, resolve: (slug: string) => string): string {
  const re = new RegExp(MARKS, 'g');
  let out = '';
  let last = 0;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    out += esc(src.slice(last, m.index));
    if (m[1] !== undefined) out += `<code>${esc(m[1])}</code>`;
    else if (m[2] !== undefined) out += `<b>${inline(m[2], resolve)}</b>`;
    else {
      const href = m[4].startsWith('#') ? resolve(m[4].slice(1)) : m[4];
      out += `<a href="${esc(href)}">${inline(m[3], resolve)}</a>`;
    }
    last = re.lastIndex;
  }
  return out + esc(src.slice(last));
}

/** Text with marks → plain text (cv.txt, meta tags). */
export function plain(src: string): string {
  return src
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1');
}

/** Slugs used by [label](#slug) marks, for validation. */
export function linkedSlugs(src: string): string[] {
  return [...src.matchAll(/\]\(#([^)\s]+)\)/g)].map((m) => m[1]);
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
