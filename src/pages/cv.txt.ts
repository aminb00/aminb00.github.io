// /cv.txt, generated at build time from the data files.
import type { APIRoute } from 'astro';
import { getSite } from '../lib/site';
import { cvText } from '../lib/cvtext';

export const GET: APIRoute = async ({ site }) =>
  new Response(cvText(await getSite(), site ?? new URL('https://aminb00.github.io/')), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
