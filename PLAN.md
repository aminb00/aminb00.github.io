# Plan: aminb00.github.io

Phase 0 of `BRIEF.md`. No code yet. I wait for your OK on this file, and your answers in section 8, before Phase 1.

## Summary

- Astro 7, static output, no client framework. Five pages (Home, Experience, Projects, Presentations, CV), plus `/cv.txt` and a 404.
- Content in six YAML collections with zod schemas. Every cross-link is a slug, and the build fails on a bad one.
- Variants A and B share the same HTML; only CSS and fonts differ. Phase 1 builds the same pages twice.
- PDFs: 11 from your GitHub repos (31.7 MB in total) and the Drive deck (74.5 MB, kept out of git; a compressed copy only if it ends up under 20 MB). A script turns every PDF into WebP slides and posters; the images are committed.
- Slide viewer: inline under the entry, native buttons, keyboard, swipe, full screen, `#slug/3` links. Without JS the poster and the PDF link remain.
- Deploy: GitHub Actions to Pages from `main`. I work on a branch with small commits and open a PR at the end of Phase 3.
- From you: OK on this plan, answers to Q1 to Q10 (each has a default, so "OK" is a valid answer), and the files listed in 8.1.

## 1. What I checked while planning

**This repo.** Public, default branch `main`. GitHub Pages is not enabled (the Pages API returns 404, https://aminb00.github.io/ returns 404). Tracked: old `index.html`, `styles.css`, `AGENTS.md`. `BRIEF.md` is untracked.

**Project page.** https://aminb00.github.io/Italian-Emissions-Daily-Dataset/ is live (200), served from its own repo. No route of the new site starts with that path.

**Source repos.** All 11 exist and all use `main`, so `raw.githubusercontent.com/aminb00/<repo>/main/<path>` works. Every PDF path in section 8 of the brief exists:

| Repo | File | Size |
|---|---|---|
| Adaptive-Fault-Detection-under-Process-Drift-using-Recursive-PCA | `Presentation.pdf` | 6.0 MB |
| same | `LIVESCRIPTS-HTML&PDF/RPCA.pdf` | 1.4 MB |
| same | `LIVESCRIPTS-HTML&PDF/PCA_batch.pdf` | 903 KB |
| same | `LIVESCRIPTS-HTML&PDF/DataPreparation.pdf` | 425 KB |
| Convex-Optimization-for-Machine-Learning | `Presentation/Presentation.pdf` | 4.2 MB |
| StatisticalLearningProject | `StatisticalLearningProject Presentation.pdf` | 3.3 MB |
| StatisticalLearningProject | `StatisticalLearningProject Bolis-Borqal.pdf` | 1.0 MB |
| WikipediaMovie-Embedding-Retrieval-MultiIndexingBenchmark | `Documentation/main.pdf` | 1.3 MB |
| ResNet-Transformer-for-Waste-Classification | `DLassignment2_AminBorqal.pdf` | 2.0 MB |
| IstanbulAirportLandAnalysis | `IstanbulAirportReport.pdf` | 6.5 MB |
| Spendly-Expense-Management-Full-Stack-Application | `Documentazione/Documentazione.pdf` | 4.7 MB |

Total 31.7 MB, every file under 20 MB.

- Forks: RAG (of `alperendavran/Information-Retrieval-Assignment-3`), ann-benchmark (of `pegghe/Information-Retrieval-Assignment-2`), Spendly (of `lorisiaco/PACproject`), EM-CAMS (of `GRINS-Spoke0-WP2/EM-CAMS`).
- Not in the brief: the RAG repo also has `report.pdf` (311 KB) next to `REPORT.md` (gap 13). It also holds course handouts and third-party papers, which I will not use.
- No PDFs in the Antwerp repo or in Italian-Emissions-Daily-Dataset, so their slides, report and thesis stay TODO.

**Drive.** The direct-download URL works without a confirmation page: `OperationalIntelligenceForFS.pdf`, 74,533,820 bytes.

**Fonts.** Tinos is OFL (google/fonts `ofl/tinos`), and so are Courier Prime and IBM Plex Mono. All three ship as woff2 in `@fontsource/*` 5.3.0.

**Tooling.** Astro is at 7.4.7 and needs Node 22.23.4 or later. The Node LTS is 26.13.0. Your Mac has Node 25.9.0, an odd-numbered release that is out of support, so I suggest Node 26 LTS locally too (CI uses 26). Chrome, Ghostscript and cwebp are installed. poppler (`pdftoppm`, `pdfinfo`) and lychee are missing: `brew install poppler lychee` (Q7).

**Astro 7 details that shape the plan.**
- `compressHTML` now defaults to `'jsx'`, which drops whitespace between inline elements and would glue `[code] [PDF]` together. I set `compressHTML: true`.
- The new compiler fails on invalid HTML nesting. Fine: the markup is plain.
- `src/fetch.ts` is a reserved file name. I don't use it.
- Collections are defined in `src/content.config.ts`; the `file()` loader reads one YAML array per collection; `z` comes from `astro/zod`.
- The docs don't promise that `reference()` fails on a missing entry, and they say collection order is not deterministic. So I validate slugs myself and sort explicitly.

**References.** From stefanodecarli.eu I take only the structure: nav; Home with About, interests, contact links and a dated "News & updates"; a Talks page; a CV page with a date; "Last update" in the footer. From the five homepages: one column, the name as a heading with a title line under it, a small portrait, `<hr>` between sections, bulleted lists of links, a row of text links near the top. Two URLs have moved: Ritchie's Bell Labs page now redirects (301) to nokia.com, which blocks automated reads, and jmc.stanford.edu has a broken TLS certificate (McCarthy's old page is still at www-formal.stanford.edu/jmc/). I only read text extracts so far; in Phase 1 I compare my pages with them side by side in a browser.

## 2. Sitemap and page content

| Path | Page | `<title>` |
|---|---|---|
| `/` | Home | Amin Borqal's Home Page |
| `/experience/` | Experience | Experience - Amin Borqal |
| `/projects/` | Projects | Projects - Amin Borqal |
| `/presentations/` | Presentations | Presentations - Amin Borqal |
| `/cv/` | CV | CV - Amin Borqal |
| `/cv.txt` | plain-text CV, generated | |
| `/404.html` | Not Found | 404 Not Found |

Files: `/pdf/<id>.pdf`, `/slides/<id>/001.webp ...` and `poster.webp`, `/cv/Amin_Borqal_CV.pdf`, `/img/`, `/fonts/`, `/og.png`, `/favicon.svg` (plus PNG and ICO), `/robots.txt`, `/sitemap.xml`. Nothing under `/Italian-Emissions-Daily-Dataset/`.

**Every page** (for the 404, see Q4):

```
Amin Borqal                                              <h1>
M.Sc. student, Computer Science and Engineering, University of Bergamo
Home | Experience | Projects | Presentations | CV        current page in bold, not a link
<hr>
... page ...
<hr>
Amin Borqal, aminborqal10 [at] gmail [dot] com           <address>, JS turns the email into a mailto link
Last modified: Fri Nov  6 16:02:31 CET 2026              build time, Europe/Rome
```

**Where section 8 goes**

| Brief | Shown on |
|---|---|
| 8.1 identity | header; Home About (role and thesis lines); Home Contact; footer; JSON-LD; cv.txt |
| 8.2 bio, 8.3 interests | Home About |
| 8.4 news | Home, News & updates |
| 8.5 experience | Experience; Home Selected work (routein, antwerp-internship); cv.txt |
| 8.6 education | Experience, Education; cv.txt |
| 8.7 projects | Projects; Home Selected work (rpca); cv.txt |
| 8.8 decks | Presentations, and inside their entries on Home, Experience and Projects |
| 8.9 extracurricular | Experience, Extracurricular; cv.txt |
| 8.10 off-duty | Home, not rendered until the text exists |
| 8.11 skills, 8.12 languages | CV page; cv.txt |

**Home**
- About (h2): photo (gray box with "photo" until `portrait.jpg` exists), role line, thesis line (Q1), bio paragraphs 1 and 2, Interests (h3) as a bullet list.
- Contact (h2): `aminborqal10@gmail.com [Copy email] [LinkedIn] [GitHub] [CV: PDF | text]`. Without JS: the `[at]`/`[dot]` text and no button.
- News & updates (h2): the 7 items of 8.4, newest first, as `Oct 2026: text [details]` with the date in bold. Links: Oct 2026 → `/experience/#msc-thesis`; Jun 2026 → `/presentations/#paris-pitch` as [slides]; Jan 2026 → `/experience/#antwerp-internship`; Sep 2025 none; May 2025 → `/experience/#routein`; Feb 2025 → `/experience/#grins`; Dec 2024 → `/projects/#iedd`.
- Selected work (h2): three one-liners (drafts in 4.4). ROUTEin also gets the Paris Pitch poster and viewer.
- Off-duty: not rendered.

**Experience**
- Experience (h2): routein, antwerp-internship, grins, guarniflon, harnekinfo.
- Education (h2): msc (with the thesis block, anchor `#msc-thesis`), erasmus, bsc.
- Extracurricular (h2): bergamoscienza, school-ambassador (slugs mine, the brief has none).
- Order: ongoing first, then by end date, newest first. This gives exactly your order in 8.5, 8.6 and 8.9.
- Entry: `<h3 id="slug">` with the role; a line "organization · place · dates"; the verbatim bullets; a `Material:` line; the deck poster if there is a deck; `<details><summary>More</summary>` with the Details facts, only where 8.5 has them (education uses it for key subjects).

**Projects**
- One-line intro, then the filter line (hidden without JS): `All · Machine Learning · Control & SysID · IR & LLM · Geospatial · Software`.
- One `<h3 id="slug">` per project, in the order of 8.7 (Q6): rpca, rag, ann-benchmark, resnet-transformer, istanbul-gee, iedd, convex-optimization, aircraft-price, spendly.
- Each: context line, summary, `Result:` with the numbers in monospace (no line for convex-optimization), `Tags:` as text, `Material:` line, poster (Q2), `<details><summary>Method</summary>`.

**Presentations**
- One-line intro, then the 4 decks, newest first: paris-pitch (Jun 2026), convex-slides (Mar 2026), rpca-slides (2026, month unknown, gap 10), aircraft-slides (A.Y. 2024/25).
- Each: `<h3 id="slug">` title, "event · place · date", poster, `[View slides] [PDF, 6.0 MB]` with its viewer, `Related:` link to the entry.

**CV**
- `Last updated: <date>`, `[PDF, size] [plain text]`, then the PDF's first page as an image linking to the PDF (Q3). Skills (h3) as a `<dl>` of groups, Languages (h3) as a list.
- Until you add the PDF: no PDF link, no image, no date. `cv.txt` works from day one.

**404**: "Not Found", "The requested URL was not found on this server.", link to Home (Q4).

**cv.txt**: 72 columns, UTF-8, built from the same data files. Header (name, affiliation, city, email in the `[at]`/`[dot]` form, GitHub, LinkedIn, site), Education, Experience, Projects (title, context, result), Presentations, Extracurricular, Skills, Languages, and the "Last modified" line. Bold marks dropped, bullets as `-`.

```
EXPERIENCE

Founder & AI Project Lead, May 2025 - Present
ROUTEin, AI-driven Field Service Management Startup, Bergamo, Italy
  - Born in the UniBg Entrepreneurship Lab CREO from an industrial
    challenge by Magris S.p.A.: reducing the hidden travel costs that
    erode contract margins in small and medium-sized Italian
    maintenance and installation companies.
```

## 3. Data model

One YAML file per collection in `src/data/`, each an array of entries with an `id`, which is the slug. Schemas in `src/content.config.ts`.

**Shared rules**
- **Slug**: `a-z`, `0-9` and `-`. Unique across all collections, because news, decks and text link by slug alone. The anchor on the page is the slug.
- **Month**: `"2025-05"`; an end date can be `present`. `datesText` overrides the display when a date is not a plain range ("Feb 2018 & Jun 2018", "A.Y. 2024/25", "2025/26").
- **Text**: plain strings with three marks: `**bold**`, `` `mono` `` and `[label](#slug)` for internal links (for example "Continuation of my B.Sc. thesis" linking to `#iedd`). Everything else is escaped.
- **Verbatim**: the fields you marked verbatim render inside an element with `data-verbatim`. I never edit them, and the copy check skips them.
- **TODO**: any optional field can be the string `TODO`. The schema treats it as missing, the page leaves the element out, and `npm run todo` lists every open TODO.

**profile** (one entry, `amin`)
```ts
name, affiliationLine, roleLine, thesisLine, location: string
email: { user: "aminborqal10", domain: "gmail.com" }  // the HTML only ever holds the [at]/[dot] form
links: { github: url, linkedin: url }
bio: text[]                         // verbatim
interests: string[]
selectedWork: slug[]                // routein, antwerp-internship, rpca
offDuty?: text | TODO
skills: { group: string, items: string[] }[]
languages: { name: string, level: string }[]
cv: { file?: path, updated?: date } // updated defaults to the PDF's last git commit date
```

**experience** (work and extracurricular)
```ts
id: slug
section: "work" | "extracurricular"
role, org, place: string
start: month, end: month | "present", datesText?: string
bullets: text[]                     // verbatim
details?: text[]                    // under "More"
material?: Material[]
oneLine?: text                      // Home, Selected work
```

**education**
```ts
id: slug, degree, school: string
start?: month, end: month, expected?: boolean, datesText?: string
thesis?: { id: slug, title, lab, status: string, workingTitle?: boolean,
           supervisors: string[], topic: text, project?: slug }   // bsc → iedd
focus?: string, subjects?: string[]
```

**project**
```ts
id: slug, title: string
context: string[]                   // joined with " · "; TODO parts dropped
summary: text, summaryVerbatim: boolean
result?: text                       // `numbers` in monospace
method?: text | text[]              // under "Method"
tags: ("ml" | "control" | "ir" | "geo" | "software")[]
material: Material[]
oneLine?: text
draft?: boolean                     // fhdgm-argo stays out of the build
sortDate?: month                    // only if you pick newest first (Q6)
```

**presentation** (deck)
```ts
id: slug
title: string                       // paris-pitch: from slide 1
label?: string                      // paris-pitch: "Paris Pitch"
event, place: string, date: month, datesText?: string
pdf: { file: string } | { url: string, bytes: number }   // local copy, or the Drive original
source?: { github: { repo, path } } | { drive: string }
related: slug[]                     // the one place where a deck and its entry are linked
```

**news**
```ts
id: slug, date: month, text: text
link?: { label: "details" | "slides" | "code", to: slug | url }
```

**Material** (inside experience and projects)
```ts
{ type: "code", url, label?: string }          // [code], [my fork]
{ type: "link", label, url }                   // [award], [dataset], [report] to REPORT.md on GitHub
{ type: "pdf", id: slug, label, file, source?: { github: { repo, path } }, poster?: boolean }
```
Decks are not listed under material: an entry shows every deck whose `related` names it. So adding a deck means one YAML entry and one PDF, and the links in both directions can't drift apart.

**Generated manifest** `src/data/generated/docs.json`, written by the pipeline, committed, validated with zod (example values):
```json
{ "paris-pitch": { "kind": "deck", "pages": 18, "width": 1600, "height": 900,
                   "poster": [640, 360], "pdfBytes": 9812345, "sha256": "..." } }
```

**Cross-links** (`src/lib/registry.ts`): a map slug → URL (experience, education, thesis → `/experience/#slug`; projects → `/projects/#slug`; decks → `/presentations/#slug`). The build fails on an unknown slug (news, `related`, `selectedWork`, text links), a duplicate slug, a deck or report without its PDF or manifest entry, a missing slide image, or a file over 20 MB.

**Adding content** (the README repeats this): a news item is three lines in `news.yaml`; a project is one entry in `projects.yaml` plus its PDFs in `public/pdf/`; a deck is one entry in `presentations.yaml` plus its PDF in `public/pdf/`. `npm run dev` and `npm run build` generate the images.

## 4. Design

### 4.1 Tokens

| | Variant A, "Faculty page" | Variant B, "Plain text" |
|---|---|---|
| background, text | #FFFFFF, #000000 | same |
| link, visited, active | #0000EE, #551A8B, #EE0000; always underlined; no hover effect | same |
| body font | `"Faculty Serif", "Times New Roman", Times, Tinos, serif` (font note) | Courier Prime or IBM Plex Mono, self-hosted, picked in Phase 1 |
| monospace | `"Courier New", Courier, monospace` | the body font |
| size, line height | 17px, 1.4 | 16px, 1.5 (tuned in Phase 1) |
| h1, h2, h3 | 2em, 1.5em, 1.17em; bold; browser margins | 1.5em, 1em, 1em; bold; h2 in capitals with a 1px top border |
| column | max-width 42em, left-aligned, 1em side margins | max-width 72ch |
| rules | `<hr>` with the 2px inset look | `<hr>` as a 1px solid line |
| lists | disc bullets, browser indent; `<dl>` for skills | same |
| photo | 150px wide, 1px solid black, float right; above the text below 30em | same |
| poster | 320px wide (at most 100%), 1px solid black | same |
| buttons | native, no CSS | same |
| focus | browser focus ring, checked on every control | same |

Contrast on white: text 21:1, link 9.4:1, visited 11.0:1, active 4.5:1. All pass AA.

**Font note (Variant A).** Android's font config aliases "Times New Roman" and "times" to its own serif (Noto Serif), so with the stack as written Android would likely never reach Tinos. Fix: one `@font-face` family "Faculty Serif" whose `src` is `local("Times New Roman")`, `local("TimesNewRomanPSMT")`, then the Tinos woff2, one rule per weight and style. Mac, Windows and iOS match the local font and download nothing; Android, and Linux without Times New Roman, get Tinos (Latin subset). I can't test on a real Android phone here, so I verify the mechanism on desktop by forcing the fallback. `font-display` (swap or optional) gets decided in Phase 1 after measuring layout shift. Variant B preloads its regular weight with `font-display: optional`, so the font never shifts the layout.

**Dark mode.** My advice is no: 1996 had none, the white page is the concept, and it doubles the visual checks. If you want it (Q5): only through `prefers-color-scheme`, no toggle; black background, #E0E0E0 text (15.9:1), links #8AB4F8 (10.0:1), visited #C58AF9 (8.4:1), active #FF6B6B (7.6:1).

**Print.** Black on white; nav, buttons, filter, viewer and posters hidden; the URL printed after each external link; no page break inside an entry.

### 4.2 Components

All rendered at build time; JS only in the three scripts of section 5.

- `Base.astro`: `<html lang="en">`, head (title, description, canonical, Open Graph, favicons, JSON-LD on Home, inline CSS of the variant), skip link, header, `<main id="content">`, footer.
- `SiteHeader.astro`: h1, affiliation line, `Nav`.
- `Nav.astro`: `Home | Experience | Projects | Presentations | CV`; the current page is `<b aria-current="page">`.
- `SiteFooter.astro`: `<hr>`, `<address>`, "Last modified" in Unix `date` format.
- `Email.astro`: `[at]`/`[dot]` fallback, mailto link, Copy email button, live region.
- `Portrait.astro`: WebP with width and height, or the gray placeholder.
- `NewsList.astro`, `SelectedWork.astro`.
- `Entry.astro`: experience, education and extracurricular entries.
- `Project.astro`, `Filter.astro`.
- `MaterialLine.astro`: bracketed links, file sizes, GitHub source links, hidden context for screen readers ("code" is read as "code for ROUTEin").
- `DocFigure.astro`: poster and caption; for a deck, the toggle button and the viewer box.
- `DeckItem.astro`: one deck on the Presentations page.
- `Text.astro` and `lib/format.ts`: inline marks, dates and ranges, file sizes, the Unix date.
- Pages: `index`, `experience`, `projects`, `presentations`, `cv`, `404`, and endpoints `cv.txt.ts`, `robots.txt.ts`, `sitemap.xml.ts`.

### 4.3 How entries render (Variant A, text sketch, sizes are examples)

Experience, ROUTEin:
```
Founder & AI Project Lead
ROUTEin, AI-driven Field Service Management Startup · Bergamo, Italy · May 2025 - Present
  * Born in the UniBg Entrepreneurship Lab CREO from an industrial challenge ...
  * Managed the whole project, from the business side ...
  * 1st place at the CoDEMO International Innovation Award (Paris, 2026), ...
Material: [award]
+----------------------+
|   slide 1 (poster)   |   alt: First slide of <title>
+----------------------+
Slides: Paris Pitch, CoDEMO 5.0 International Innovation Award, Paris, Jun 2026.
[View slides] [PDF, 9.8 MB]
```
"Paris Pitch" links to `/presentations/#paris-pitch`. `View slides` is a native button that exists only with JS; `[PDF, 9.8 MB]` is a link.

The viewer, open in place of the poster:
```
[< prev]  3 / 18  [next >]  [Full screen]  [PDF, 9.8 MB]
+---------------------------------------------------+
|                      slide 3                      |
+---------------------------------------------------+
```

Projects, Recursive PCA:
```
Adaptive Fault Detection under Process Drift using Recursive PCA
Course project, Adaptive Learning, Estimation and Supervision of Dynamical Systems · University of Bergamo · 2026 · MATLAB
Built a real-time fault diagnosis system (Recursive PCA, Li et al. 2000) ...
Result: false-alarm rate from 32.6% to near-nominal, step-fault detection above 81%, ...
Tags: Control & SysID, Machine Learning
Material: [code] [live scripts: RPCA.pdf, 1.4 MB | PCA_batch.pdf, 903 KB | DataPreparation.pdf, 425 KB] (sources on GitHub)
+----------------------+
|   slide 1 (poster)   |
+----------------------+
Slides: Adaptive Fault Detection under Process Drift using Recursive PCA, course presentation, 2026.
[View slides] [PDF, 6.0 MB] (source: Presentation.pdf on GitHub)
> Method
```
Rule: actions are native `<button>`s (View slides, prev, next, Full screen, Copy email); navigation is bracketed links. Every PDF copied from GitHub keeps a link to its GitHub file, with the file name in monospace. Hosted PDFs get id-based names (`/pdf/rpca-slides.pdf`) because the originals contain spaces and `&`.

### 4.4 New copy (drafts for your OK)

This is all the text I write. Everything else comes from section 8.

- **Selected work**, built only from section 8 facts:
  - **ROUTEin**: Founder & AI Project Lead, May 2025 - Present. 1st place at the CoDEMO 5.0 International Innovation Award, Paris, Jun 2026 (Industry 5.0 category). [details], plus poster and viewer.
  - **Research Intern: Machine Learning for Proteomics**, ADReM Data Lab, Universiteit Antwerpen (Erasmus+), Sep 2025 - Jan 2026. [details] [code]
  - **Adaptive Fault Detection under Process Drift using Recursive PCA**, course project, University of Bergamo, 2026: false-alarm rate from `32.6%` to near-nominal, step-fault detection above `81%`. [details] [slides] [code]
- **Page intros.** Projects: "Course projects and my B.Sc. thesis, with code, slides and reports." Presentations: "My slides, newest first. Each deck opens on this page."
- **Labels.** Material:, Result:, Tags:, Related:, Slides:, More, Method, Interests, Skills, Languages, Last updated:, Last modified:, Copy email, Copied, View slides, Hide slides, < prev, next >, Full screen, Skip to content, photo.
- **Alt texts.** "First slide of <title>", "Slide 3 of <title>", "First page of <title>" (reports and CV), "Amin Borqal" (portrait).
- **Screen reader only.** "Slide 3 of 18", "Copied", "Showing 4 of 9 projects", link context like "code for ROUTEin".
- **Meta descriptions.**
  - Home: "Amin Borqal, M.Sc. student in Computer Science and Engineering at the University of Bergamo: experience, projects, slides and CV."
  - Experience: "Experience, education and extracurricular activities of Amin Borqal, with slides, reports and code."
  - Projects: "Projects by Amin Borqal in machine learning, control and system identification, information retrieval and LLMs, geospatial data and software."
  - Presentations: "Slides by Amin Borqal, viewable on the page."
  - CV: "CV of Amin Borqal as PDF and plain text, with skills and languages."

## 5. Slides: pipeline and viewer

### 5.1 Pipeline

**`npm run fetch`** (`scripts/fetch-pdfs.mjs`), run by hand when a source changes:
- GitHub sources: downloads `https://raw.githubusercontent.com/aminb00/<repo>/main/<path>`, each path segment URL-encoded (space → `%20`, `&` → `%26`), into `public/pdf/<id>.pdf`.
- Drive (paris-pitch): downloads the 74.5 MB original into `.cache/` (gitignored, never committed) and makes the slide images from that original. Then it makes a Ghostscript `/ebook` copy: under 20 MB, it becomes `public/pdf/paris-pitch.pdf`; otherwise the [PDF] link points to the Drive original with "74.5 MB".
- Privacy check before anything is published: `pdftotext` on every PDF, searched for phone numbers, street addresses, emails of other people, student ID numbers and grades. I show you any hit and publish nothing until you decide. A pitch deck often ends with a contact slide, so I also look at its last slides.

**`scripts/docs.mjs`**, before every `dev` and `build`:
1. Collects every deck, every `pdf` material item with a poster, and the CV.
2. Skips a document when its PDF hash matches the manifest and its images exist. So CI needs no poppler for unchanged files, and the Drive deck builds without its source in the repo.
3. Otherwise: `pdfinfo` (pages, page size), then `pdftoppm -png -scale-to-x 1600 -scale-to-y -1`, then sharp to WebP quality 80: `public/slides/<id>/001.webp`, `002.webp`, ... The poster is page 1 at 640px, shown at 320px, sharp on 2x screens. Reports and the CV get only the poster.
4. Writes the manifest: pages, width, height, poster size, PDF bytes, hash. It warns if a deck mixes page sizes.
5. Converts `public/img/portrait.jpg` to WebP with all metadata removed (GPS, camera) and keeps the original JPG out of the published site.

The images are committed, so CI stays fast and offline. If a PDF arrives without images (for example uploaded through the GitHub web page), CI installs poppler and generates them during the build.

### 5.2 Viewer (`src/scripts/viewer.ts`, vanilla, a few KB)

- Server HTML: the poster inside a link to the PDF, the caption, a hidden `View slides` button (`aria-expanded`, `aria-controls`), and the viewer box (`hidden`).
- Opens in place of the poster, under the entry, without overlay or modal. One open viewer per page.
- Controls: `[< prev]  3 / 18  [next >]  [Full screen]  [PDF, size]`.
- Keyboard, while focus is inside the viewer (the rest of the page keeps its normal keys): ← and → previous and next, Home and End first and last, Esc leaves full screen first, then closes.
- Touch: horizontal swipe through pointer events, about 50px threshold; vertical scrolling stays untouched (`touch-action: pan-y`).
- Preloads slides N-1 and N+1.
- Hash: `#paris-pitch/3` opens that deck at slide 3 (out-of-range numbers clamp); `#paris-pitch` alone is a normal anchor. Slide changes use `history.replaceState`, so Back leaves the page instead of stepping through slides. On Projects the hash holds one thing at a time, a filter (`#tag=ml`) or a slide; closing the viewer restores the filter.
- `aria-live` announces "Slide 3 of 18"; each image has alt "Slide 3 of <title>" and its width and height from the manifest, so nothing jumps.
- Full screen: Fullscreen API on the viewer box. The button is hidden where the API is missing (on iPhone, Safari has long allowed it only for video).
- Without JS: poster and PDF link; the button and the viewer stay hidden.

### 5.3 The other two scripts

- **Filter** (`src/scripts/filter.ts`): links `#tag=ml`, `control`, `ir`, `geo`, `software`; `All` clears the hash. The active one is bold with `aria-current`; other projects get `hidden`; a live region says "Showing 4 of 9 projects". Without JS the line is hidden and every project shows.
- **Email** (`src/scripts/email.ts`): turns "aminborqal10 [at] gmail [dot] com" into a mailto link; `Copy email` uses the Clipboard API and announces "Copied".

## 6. Tech

### 6.1 Stack

- Astro 7.4, `output: 'static'`, TypeScript, no UI framework.
- Vanilla TS for the three scripts. Hand-written CSS: base, one file per variant, print. Inlined in each page.
- No sitemap integration: `@astrojs/sitemap` writes `sitemap-index.xml`, the brief asks for `sitemap.xml`, and five pages fit in a 20-line endpoint.
- Dev dependencies: sharp (images); satori and @resvg/resvg-js (Open Graph image and favicon PNGs from Tinos outlines, generated once and committed); playwright-core driving your installed Chrome (screenshots and checks); lighthouse (CLI).
- System tools: poppler, Ghostscript, lychee.
- Fonts from `@fontsource/tinos` (and the Variant B font), Latin subset, copied into `public/fonts/` with the OFL text.

```js
// astro.config.mjs
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://aminb00.github.io',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
});
```

### 6.2 Folders

```
.github/workflows/deploy.yml   build and deploy to Pages
.github/workflows/links.yml    weekly external link check
astro.config.mjs, package.json, .nvmrc (26)
public/
  pdf/                hosted PDFs, id-based names, each under 20 MB
  slides/<id>/        generated WebP slides and poster.webp (committed)
  cv/                 Amin_Borqal_CV.pdf (from you)
  img/                portrait.jpg (from you), portrait.webp (generated)
  fonts/              Tinos woff2 + OFL.txt, Variant B font
  favicon.svg, favicon.ico, apple-touch-icon.png, og.png
scripts/
  fetch-pdfs.mjs      downloads, compression, privacy check
  docs.mjs            PDF to WebP and manifest, incremental
  make-icons.mjs      favicon and Open Graph image
  check.mjs           checks on the built site
  shots.mjs           screenshots at 375, 768, 1280 px
src/
  content.config.ts   collections and zod schemas
  data/               profile, experience, education, projects, presentations, news (.yaml)
  data/generated/     docs.json
  lib/                registry.ts, format.ts
  components/  layouts/  pages/  scripts/  styles/
BRIEF.md, PLAN.md, README.md, AGENTS.md
```

### 6.3 Commands

```
npm run dev       docs.mjs, then astro dev
npm run build     docs.mjs, astro build, check.mjs
npm run fetch     download the source PDFs (by hand)
npm run todo      list open TODOs in the data
npm run shots     screenshots of every page at 375, 768 and 1280 px
npm run links     lychee on dist/
```

`check.mjs` fails the build on: any "—" or "–"; a banned word outside `data-verbatim` (whole words with their inflections, so the course name "Dynamical Systems" passes); the phrases "co-founder", "team of two", "technical side", "Fixed Rank Kriging", "available from", "open to work"; a page over 100 KB without images (HTML, CSS, JS and fonts, uncompressed); a `[PDF]` link without a size; an `<img>` without width, height or alt; a file over 20 MB. Your verbatim texts contain three words from the banned list ("dynamic" in the bio, "Leveraged" in the GRINS bullets, "showcasing" in the School Ambassador bullet), which is why the check skips verbatim elements.

### 6.4 Build and deploy

- Branch `site-2026`, a small commit per step, a PR into `main` at the end of Phase 3 (Q8).
- `deploy.yml`, on push to `main` and by hand: checkout with full history (for the CV date), Node 26, `apt-get install poppler-utils`, `npm ci`, `npm run build`, lychee offline on `dist/` (internal links and anchors), upload-pages-artifact, deploy-pages.
- `links.yml`: weekly external link check, LinkedIn excluded (you check that one by hand).
- One time: Settings → Pages → Source: "GitHub Actions" (Q8).
- Custom domain later: `SITE_URL` is the only place the domain lives. With an Actions deploy GitHub ignores a `CNAME` file and takes the domain from Settings → Pages, so the README lists the steps (DNS records, Settings, `SITE_URL`) instead of shipping a file that does nothing. The dataset project page then moves under the same domain, and GitHub redirects its old URL.
- Phase 2 deletes the old `index.html` and `styles.css` (they stay in git history). Phase 3 rewrites `AGENTS.md` for the new stack.
- No analytics, no cookies, no third-party requests: fonts, images and PDFs are self-hosted; Drive is contacted only if someone clicks its link.

### 6.5 SEO and accessibility

- SEO: title and description per page; canonical URL from `site`; `lang="en"`; Open Graph and Twitter card with `og.png` (1200×630, white, name and affiliation line in black serif, one rule); JSON-LD `Person` on Home (name, url, affiliation and alumniOf University of Bergamo, sameAs GitHub and LinkedIn, no email); `sitemap.xml`; `robots.txt` pointing to it.
- Accessibility: landmarks; skip link; h1, h2, h3 in order; visible focus; alt on every image; native `<details>` (browsers announce its open state themselves); `aria-expanded` on the slide toggle; viewer and filter usable by keyboard alone; `hreflang="it"` on the Italian Spendly documentation link.

## 7. Phases and verification

**Phase 1, design proof.** The same markup built with `VARIANT=a` and `VARIANT=b`.
1. Scaffold Astro: layout, header, footer, base CSS for both variants.
2. Data for Home and ROUTEin: profile, news, routein, paris-pitch, and the antwerp-internship and rpca fields that Selected work needs.
3. Download the Drive PDF, run the privacy check, generate the slides, try the compression, read the deck title from slide 1.
4. Home and Experience (ROUTEin entry only) with the working viewer and the email script.
5. Build both variants. Screenshots at 375, 768 and 1280 px (saved in `proof/`, not committed, and sent to you). Check the viewer in the browser: buttons, keys, swipe by touch emulation, full screen, `#paris-pitch/3`, JS off. Compare with the reference pages.
6. Report and stop.

**Phase 2, build.** All YAML data, the GitHub PDFs, the pipeline for every document, Experience, Projects, Presentations, CV and 404 pages, the filter, cv.txt, cross-link checks, removal of the old site.

**Phase 3, polish and ship.** Accessibility, SEO, Open Graph image, favicon, print, page budget, link check, Lighthouse, README, AGENTS.md, workflows, Pages, merge, a check of the live site.

**How I'll verify section 10**

| Item | How |
|---|---|
| PLAN.md approved | your OK in chat |
| content only from section 8, empty fields hidden | data review against the brief, `npm run todo`, no "TODO" in `dist/` |
| no dashes, no banned words | `check.mjs` on `dist/` |
| decks: poster, viewer, keys, swipe, full screen, `#slug/3`, no-JS | Playwright script (keys, hash, touch emulation, JS disabled) and a manual pass in the browser |
| material shown, decks and entries linked both ways | registry checks at build, then the link check |
| no file over 20 MB, a size on every PDF link | `check.mjs` and a size scan of `git ls-files` |
| 0 broken links | lychee, internal (with anchors) and external; LinkedIn by hand |
| Lighthouse mobile | `lighthouse --form-factor=mobile` on the production build, every page |
| screenshots | `npm run shots`, every page at 3 widths |
| keyboard only | Tab through every page in the browser, plus the Playwright script |
| plain 1990s look | page by page against the lists in section 4 of the brief |
| deploy works, README explains updates | the Actions run, the live URL, README review |

Limits: no real Android phone or iPhone here. Touch and full screen are tested by emulation; Tinos on Android by forcing the fallback on desktop.

## 8. Content gaps and questions

### 8.1 Content gaps

All are TODO in the data and hidden on the page until filled.

1. Portrait `public/img/portrait.jpg`. Until then: a gray box with "photo".
2. CV PDF `public/cv/Amin_Borqal_CV.pdf`. Until then: no [PDF] links, no first-page image, no "Last updated"; cv.txt works. Note: the PDF will be public, so check that it has no phone number or street address (your rule in section 4).
3. Antwerp internship: lab presentation slides (Jan 2026) and report.
4. GRINS: slides, if any.
5. iedd: B.Sc. thesis PDF and defense slides (Dec 2024).
6. Slides for rag, ann-benchmark, istanbul-gee and spendly, if any.
7. Off-duty text. Until then: no section.
8. ann-benchmark: team or solo? Its repo is a fork of `pegghe/Information-Retrieval-Assignment-2`, which suggests a team. Until you confirm: "Course project", without "team".
9. resnet-transformer: is the year 2025? Until you confirm: no year.
10. rpca-slides: which month of 2026? Until then it sorts after the dated 2026 decks.
11. fhdgm-argo: kept as a draft, not built.
12. Repos you haven't described: `Job-Matching-Platform-Full-Stack-Application-with-UML-Design-Software-Engineering`, `ProgettoCA`, `WikipediaMoviesRetrieval`. Should any of them go on the site? If yes, I need their facts.
13. RAG: is `report.pdf` (311 KB) the same report as `REPORT.md`? If yes, I can show its first page and a [PDF] link. Until then: only REPORT.md on GitHub.
14. Paris Pitch title: I read it from slide 1 after the download and show it to you in Phase 1.
15. Bio paragraph 2 is a draft: used as written until you change it.
16. Section 8 has no place for the M.Sc. and B.Sc. and no M.Sc. start date: not shown.
17. convex-optimization has no result: no Result line, as you wrote.

### 8.2 Questions

My default is in brackets. "OK" takes every default.

- **Q1.** Home says the same thing three times in a row: the header line under your name ("M.Sc. student, Computer Science and Engineering, University of Bergamo"), the role line two lines later (the same plus "graduating April 2027"), and the first sentence of the bio. [On Home only, the header line becomes the full role line, with "· graduating April 2027", and About starts with the thesis line. The other pages keep the short line.]
- **Q2.** Entries with a deck and a report (aircraft-price) or with several PDFs (rpca): one poster per entry, or one per PDF? [One per entry: the deck if there is one, else the main report. Other PDFs are text links.]
- **Q3.** CV, "embedded below with its first-page poster". [The first page as an image linking to the PDF. No `<iframe>` or `<object>`: heavy, and unreliable on phones.]
- **Q4.** 404 page. [Apache-like, without the site header: "Not Found", the sentence, `<hr>`, link to Home.] Or the normal header on top?
- **Q5.** Dark mode. [No.]
- **Q6.** Order on the Projects page. [As in 8.7, which I read as your priority.] Or newest first?
- **Q7.** OK to download the 11 GitHub PDFs (31.7 MB, table in section 1) and the Drive PDF (`OperationalIntelligenceForFS.pdf`, 74.5 MB, kept out of git), and to run `brew install poppler lychee`? [The Drive PDF and the tools in Phase 1, the GitHub PDFs in Phase 2.]
- **Q8.** Git and Pages. [I commit `BRIEF.md` and `PLAN.md`, then work on branch `site-2026` with small commits and open a PR into `main` in Phase 3. You switch Settings → Pages → Source to "GitHub Actions" (one click), or tell me to do it with `gh`.]
- **Q9.** Answers to gaps 8, 9, 10, 12 and 13.
- **Q10.** Are the sketches in 4.3 and the copy in 4.4 a good starting point for Phase 1? [Yes; you judge the real thing on the screenshots.]
