import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

// One YAML file per collection in src/data/, each an array of entries.
// Every entry has an `id`, which is its slug and the anchor on its page.

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug: lowercase letters, digits, single hyphens');
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month: YYYY-MM');

/** An optional field that may also hold "TODO". Both mean: missing, leave it off the page. */
const maybe = <T extends z.ZodType>(schema: T) =>
  z
    .union([z.literal('TODO'), schema])
    .optional()
    .transform((value) => (value === 'TODO' ? undefined : value));

const github = z.object({
  repo: z.string(),
  path: z.string(),
  branch: z.string().default('main'),
});

/** Links under "Material:". Decks are not listed here: see presentations.related. */
const material = z.discriminatedUnion('type', [
  z.object({ type: z.literal('code'), url: z.url(), label: z.string().default('code') }),
  z.object({ type: z.literal('link'), url: z.url(), label: z.string(), hreflang: z.string().optional() }),
  z.object({
    type: z.literal('pdf'),
    id: slug,
    label: z.string(),
    file: z.string(),
    title: z.string().optional(),
    source: z.object({ github }).optional(),
    poster: z.boolean().default(false),
    hreflang: z.string().optional(),
  }),
  // Material that exists but that I don't have yet. Never rendered; listed by the build.
  z.object({ type: z.literal('todo'), note: z.string() }),
]);

const profile = defineCollection({
  loader: file('src/data/profile.yaml'),
  schema: z.object({
    name: z.string(),
    affiliationLine: z.string(),
    roleLine: z.string(),
    thesisLine: z.string(),
    location: z.string(),
    email: z.object({ user: z.string(), domain: z.string() }),
    links: z.object({ github: z.url(), linkedin: z.url() }),
    portrait: z.string(),
    cv: z.object({ file: z.string(), updated: z.string().optional() }),
    bio: z.array(z.string()).min(1),
    interests: z.array(z.string()),
    selectedWork: z.array(slug),
    homeDecks: z.array(slug).default([]),
    offDuty: maybe(z.string()),
    skills: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
    languages: z.array(z.object({ name: z.string(), level: z.string() })),
  }),
});

const experience = defineCollection({
  loader: file('src/data/experience.yaml'),
  schema: z.object({
    section: z.enum(['work', 'extracurricular']),
    role: z.string(),
    org: z.string(),
    place: z.string(),
    start: month,
    end: z.union([month, z.literal('present')]),
    datesText: z.string().optional(),
    bullets: z.array(z.string()).min(1),
    details: z.array(z.string()).optional(),
    material: z.array(material).default([]),
    oneLine: z.string().optional(),
  }),
});

const education = defineCollection({
  loader: file('src/data/education.yaml'),
  schema: z.object({
    degree: z.string(),
    school: z.string(),
    start: month.optional(),
    end: month,
    expected: z.boolean().default(false),
    datesText: z.string().optional(),
    thesis: z
      .object({
        id: slug.optional(),
        title: z.string(),
        workingTitle: z.boolean().default(false),
        status: z.string().optional(),
        lab: z.string().optional(),
        supervisors: z.array(z.string()).default([]),
        topic: z.string().optional(),
        statusText: z.string().optional(),
        project: slug.optional(),
      })
      .optional(),
    focus: z.string().optional(),
    subjects: z.array(z.string()).default([]),
    material: z.array(material).default([]),
  }),
});

const projects = defineCollection({
  loader: file('src/data/projects.yaml'),
  schema: z.object({
    title: z.string(),
    context: z.array(z.string()).min(1),
    summary: z.string(),
    summaryVerbatim: z.boolean().default(false),
    result: maybe(z.string()),
    method: z.union([z.string(), z.array(z.string())]).optional(),
    methodVerbatim: z.boolean().default(false),
    tags: z.array(z.enum(['ml', 'control', 'ir', 'geo', 'software'])).min(1),
    material: z.array(material).default([]),
    oneLine: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const presentations = defineCollection({
  loader: file('src/data/presentations.yaml'),
  schema: z.object({
    title: z.string(),
    label: z.string().optional(),
    event: z.string(),
    place: z.string(),
    date: month,
    datesText: z.string().optional(),
    pdf: z.union([
      z.object({ file: z.string() }),
      z.object({ url: z.url(), bytes: z.number().int().positive() }),
    ]),
    source: z.union([z.object({ github }), z.object({ drive: z.string() })]).optional(),
    related: z.array(slug).min(1),
  }),
});

const news = defineCollection({
  loader: file('src/data/news.yaml'),
  schema: z.object({
    date: month,
    text: z.string(),
    link: z.object({ label: z.enum(['details', 'slides', 'code']), to: z.string() }).optional(),
  }),
});

export const collections = { profile, experience, education, projects, presentations, news };
