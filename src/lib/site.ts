// Loads every collection once, sorts it, builds the slug registry and checks
// every cross-link. Any unknown or duplicate slug, missing PDF or missing slide
// image throws here, which fails the build.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { parse } from 'yaml';
import { inline, linkedSlugs } from './text';

export type Experience = CollectionEntry<'experience'>;
export type Education = CollectionEntry<'education'>;
export type Project = CollectionEntry<'projects'>;
export type Deck = CollectionEntry<'presentations'>;

export interface DocInfo {
  kind: 'deck' | 'report';
  pages: number;
  width: number;
  height: number;
  poster: [number, number];
  posterSlide?: number;
}

/** Project tags, in the order of the filter line. */
export const TAGS = {
  ml: 'Machine Learning',
  control: 'Control & SysID',
  ir: 'IR & LLM',
  geo: 'Geospatial',
  software: 'Software',
} as const;
export type Tag = keyof typeof TAGS;

/** GitHub page of a file in a repo (the "source on GitHub" link). */
export const githubBlob = (s: { repo: string; path: string; branch: string }) =>
  `https://github.com/${s.repo}/blob/${s.branch}/${s.path.split('/').map(encodeURIComponent).join('/')}`;

interface Manifest {
  docs: Record<string, DocInfo>;
  portrait?: { src: string; width: number; height: number };
}

export interface PdfLink {
  href: string;
  bytes: number;
}

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');

function readManifest(): Manifest {
  const file = path.join(ROOT, 'src/data/generated/docs.json');
  if (!fs.existsSync(file)) throw new Error('src/data/generated/docs.json is missing: run npm run docs');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Entry ids in file order. Collections come back in no fixed order. */
function fileOrder(name: string): string[] {
  const list: { id: string }[] = parse(fs.readFileSync(path.join(ROOT, 'src/data', name), 'utf8')) ?? [];
  return list.map((entry) => entry.id);
}

/** Date of the last commit that touched a file, else its modification time. */
function lastChanged(file: string): Date {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { cwd: ROOT }).toString().trim();
    if (out) return new Date(out);
  } catch {
    // not a git checkout: fall through
  }
  return fs.statSync(file).mtime;
}

const endKey = (end: string) => (end === 'present' ? '9999-12' : end);

async function load() {
  const [profiles, experienceAll, educationAll, projectsAll, decksAll, newsAll] = await Promise.all([
    getCollection('profile'),
    getCollection('experience'),
    getCollection('education'),
    getCollection('projects'),
    getCollection('presentations'),
    getCollection('news'),
  ]);
  if (profiles.length !== 1) throw new Error('profile.yaml must hold exactly one entry');
  const profile = profiles[0].data;
  const manifest = readManifest();

  // Ongoing first, then by end date, newest first.
  const experience = [...experienceAll].sort(
    (a, b) => endKey(b.data.end).localeCompare(endKey(a.data.end)) || b.data.start.localeCompare(a.data.start),
  );
  const education = [...educationAll].sort((a, b) => b.data.end.localeCompare(a.data.end));
  const projectOrder = fileOrder('projects.yaml');
  const projects = projectsAll
    .filter((p) => !p.data.draft)
    .sort((a, b) => projectOrder.indexOf(a.id) - projectOrder.indexOf(b.id));
  const presentations = [...decksAll].sort((a, b) => b.data.date.localeCompare(a.data.date));
  const news = [...newsAll].sort((a, b) => b.data.date.localeCompare(a.data.date));

  // Slug registry: one namespace for every entry, thesis and deck.
  const registry = new Map<string, { url: string; title: string; kind: string }>();
  const add = (id: string, url: string, title: string, kind: string) => {
    const prev = registry.get(id);
    if (prev) throw new Error(`Duplicate slug "${id}" (${prev.kind} and ${kind})`);
    registry.set(id, { url, title, kind });
  };
  // Experience entries read as "role, organization" in links ("Related: ...").
  for (const e of experience) add(e.id, `/experience/#${e.id}`, `${e.data.role}, ${e.data.org.split(',')[0]}`, 'experience');
  for (const e of education) {
    add(e.id, `/experience/#${e.id}`, e.data.degree, 'education');
    const thesis = e.data.thesis;
    if (thesis?.id) add(thesis.id, `/experience/#${thesis.id}`, thesis.title, 'thesis');
  }
  for (const p of projects) add(p.id, `/projects/#${p.id}`, p.data.title, 'project');
  for (const d of presentations) add(d.id, `/presentations/#${d.id}`, d.data.title, 'presentation');

  const resolve = (id: string, where: string) => {
    const hit = registry.get(id);
    if (!hit) throw new Error(`Unknown slug "${id}" in ${where}`);
    return hit.url;
  };
  /** Display name of a slug, for links like "Related: ...". */
  const label = (id: string) => {
    const hit = registry.get(id);
    if (!hit) throw new Error(`Unknown slug "${id}"`);
    return hit.title;
  };
  /** Text with marks → HTML, links resolved through the registry. */
  const text = (src: string, where: string) => inline(src, (id) => resolve(id, where));

  // Check every link now, so a slug on a page that is not built yet still fails.
  const check = (where: string, ...items: (string | undefined)[]) =>
    items.forEach((item) => item && linkedSlugs(item).forEach((id) => resolve(id, where)));
  profile.selectedWork.forEach((id) => resolve(id, 'profile.selectedWork'));
  check('profile.bio', ...profile.bio);
  for (const n of news) {
    check(`news ${n.id}`, n.data.text);
    if (n.data.link && !/^https?:\/\//.test(n.data.link.to)) resolve(n.data.link.to, `news ${n.id}`);
  }
  for (const e of experience) check(`experience ${e.id}`, ...e.data.bullets, ...(e.data.details ?? []), e.data.oneLine);
  for (const e of education) {
    check(`education ${e.id}`, ...e.data.lines, ...e.data.subjects, e.data.thesis?.topic);
    if (e.data.thesis?.project) resolve(e.data.thesis.project, `education ${e.id}.thesis.project`);
  }
  for (const p of projects) {
    const method = p.data.method === undefined ? [] : [p.data.method].flat();
    check(`projects ${p.id}`, p.data.summary, p.data.result, p.data.oneLine, ...method);
  }
  for (const d of presentations) d.data.related.forEach((id) => resolve(id, `presentations ${d.id}.related`));

  // Documents: every deck and every PDF in "Material:" must exist, with its images.
  const doc = (id: string): DocInfo => {
    const info = manifest.docs[id];
    if (!info) throw new Error(`No images for "${id}" in docs.json: run npm run docs`);
    return info;
  };
  const localPdf = (rel: string, where: string): PdfLink => {
    const file = path.join(PUBLIC, rel);
    if (!fs.existsSync(file)) throw new Error(`${where}: public/${rel} is missing (run npm run fetch)`);
    return { href: `/${rel}`, bytes: fs.statSync(file).size };
  };
  const deckPdf = (d: Deck): PdfLink =>
    'file' in d.data.pdf
      ? localPdf(`pdf/${d.data.pdf.file}`, `presentations ${d.id}`)
      : { href: d.data.pdf.url, bytes: d.data.pdf.bytes };
  const materialPdf = (file: string, where: string) => localPdf(`pdf/${file}`, where);
  for (const d of presentations) {
    doc(d.id);
    deckPdf(d);
  }
  for (const e of [...experience, ...education, ...projects]) {
    for (const m of e.data.material) {
      if (m.type !== 'pdf') continue;
      materialPdf(m.file, `${e.id}.material`);
      if (m.poster) doc(m.id);
    }
  }

  /** Decks that name this entry in `related`, newest first. */
  const decksFor = (id: string) => presentations.filter((d) => d.data.related.includes(id));

  /** Experience or project entry by slug (Selected work). */
  const entry = (id: string): Experience | Project => {
    const hit = experience.find((e) => e.id === id) ?? projects.find((p) => p.id === id);
    if (!hit) throw new Error(`Selected work "${id}" is not an experience or project entry`);
    return hit;
  };

  // Files you add later: the page hides them until they exist.
  const cvFile = path.join(PUBLIC, profile.cv.file);
  const cv = fs.existsSync(cvFile)
    ? {
        href: `/${profile.cv.file}`,
        bytes: fs.statSync(cvFile).size,
        updated: profile.cv.updated ? new Date(profile.cv.updated) : lastChanged(cvFile),
        poster: manifest.docs.cv,
      }
    : undefined;
  const portrait = manifest.portrait;

  return {
    profile,
    experience,
    education,
    projects,
    presentations,
    news,
    registry,
    resolve,
    label,
    text,
    doc,
    deckPdf,
    materialPdf,
    decksFor,
    entry,
    cv,
    portrait,
  };
}

export type Site = Awaited<ReturnType<typeof load>>;

let cached: Promise<Site> | undefined;

/** One load per build. In dev, reload on every request so data edits show up. */
export function getSite(): Promise<Site> {
  if (import.meta.env.DEV) return load();
  return (cached ??= load());
}
