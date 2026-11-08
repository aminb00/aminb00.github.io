// /sitemap.xml: the five pages, last modified at build time.
import type { APIRoute } from 'astro';
import { isoDate } from '../lib/format';

const PAGES = ['/', '/experience/', '/projects/', '/presentations/', '/cv/'];

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://aminb00.github.io/');
  const day = isoDate().slice(0, 10);
  const urls = PAGES.map((p) => `  <url><loc>${new URL(p, base).href}</loc><lastmod>${day}</lastmod></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
