# Personal website for Amin Borqal: build brief

You are a senior front-end engineer with a strong sense of typography and restraint. Build my personal website. Read the whole brief before doing anything. If you are Claude Code, start in plan mode.

## 0. How we work (plan first)

1. **Plan before code.** Do not write code yet. Write `PLAN.md` with:
   - sitemap and the content of each page (which items of section 8 go where);
   - data model: one schema per content type (profile, experience, education, project, presentation, news), with slugs and cross-links;
   - design: the two variants of section 3 turned into tokens (fonts, sizes, colors, spacing) and a list of components;
   - the slide pipeline and viewer of section 5;
   - tech: stack, folder structure, build and deploy;
   - one consolidated list of content gaps (every TODO in section 8) and your questions for me.

   Then stop and wait for my OK. If something in this brief is unclear or contradictory, ask instead of guessing.
2. **Phase 1, design proof.** Build the Home page and the ROUTEin entry, including its working slide viewer, twice: once per variant of section 3, with real content (no lorem ipsum). Screenshots at 375, 768 and 1280 px. I pick one. Stop and wait.
3. **Phase 2, build.** All pages, data files, slide pipeline, cross-links.
4. **Phase 3, polish and ship.** Accessibility, SEO, performance, link check, deploy workflow, README. Report the checklist of section 10 and how you verified each item.

After every phase: run the site locally, look at it in a browser yourself, and tell me what you verified. Small commits with clear messages.

## 1. Goal and audience

Visitors:
- recruiters and hiring managers (AI/ML engineering, data science, consulting, engineering companies), in Italy and in Europe;
- professors and researchers (my M.Sc. thesis is in a control systems lab).

In 30 seconds they must understand:
- who I am: M.Sc. student in Computer Science and Engineering at the University of Bergamo, graduating April 2027, thesis in progress;
- what I have done: ROUTEin (1st place at an international innovation award in Paris), a research internship in Antwerp, a research grant on emission data;
- where the proof is: slides, reports and code for each experience and project;
- how to contact me.

**Core feature: every relevant experience and project shows its material**, and the slides are visible right on the page (section 5).

## 2. References

**Structure**: https://stefanodecarli.eu/index.html (personal site of a PhD candidate at the University of Bergamo). Take only the information architecture:
- compact header with name and affiliation;
- Home: About (portrait, role, affiliation, short bio, interests), contact links, and a dated "News & updates" list;
- a Talks page with title, event · place · date and the slides;
- a CV page with the PDF and its last-updated date;
- "Last update" in the footer.

Do **not** take its look (it is styled like a video game), its code, texts, images or icons.

**Look**: the homepages of American computer scientists in the 1990s, at Stanford, Princeton, Bell Labs and MIT. Open these and get the feel, without copying code, text or images:
- Donald Knuth: https://www-cs-faculty.stanford.edu/~knuth/
- Brian Kernighan: https://www.cs.princeton.edu/~bwk/
- Dennis Ritchie at Bell Labs: https://www.bell-labs.com/usr/dmr/www/
- John McCarthy: http://jmc.stanford.edu/
- Peter Norvig: https://norvig.com/

## 3. Style: a 1990s computer science homepage, built with 2026 engineering

**Concept.** On the surface, the page looks like plain HTML that a computer scientist at Stanford or Bell Labs could have written in 1996: white page, black serif text, blue underlined links, horizontal rules, bullet lists, a small photo, "Last modified" at the bottom. Underneath, it is modern engineering: instant load, perfect on phones, accessible. The few sophisticated features of section 5 must feel native to the plain page, not decorated.

It is an homage, not a parody. It must look like a page written by a serious person, not like a "retro theme".

**Variant A, "Faculty page"** (my default)
- Background #FFFFFF, text #000000.
- Links #0000EE, visited #551A8B, active #EE0000, always underlined; no hover animation.
- Font: the system serif a 1996 browser would use: `"Times New Roman", Times, Tinos, serif`, 17px, line-height 1.4. Self-host only Tinos (OFL, metric-compatible with Times) as a fallback for Android and Linux.
- Monospace for repo names, file names, numbers in results: `"Courier New", Courier, monospace`.
- Single column, left-aligned, max width 42em, 1em side margins on phones. No grid, no cards.
- Headings: bold serif at browser-like sizes (h1 2em, h2 1.5em, h3 1.17em); no colors, no letter-spacing.
- `<hr>` between sections, with the classic 2px inset look; default disc bullets; `<dl>` where it fits.
- Material links as bracketed text: [slides] [PDF] [code] [report] [dataset].
- Navigation: one text line under my name, `Home | Experience | Projects | Presentations | CV`. The current page is in bold and is not a link.
- Photo: plain rectangular image with a 1px black border, about 150px wide, floated right on desktop and above the text on phones.
- Buttons: native browser controls, unstyled (for example the "Copy email" button).
- Footer: `<hr>`, then an `<address>` with my name and email, then "Last modified: Fri Nov  6 16:02:31 CET 2026", in the format of the Unix `date` command, generated at build time (Europe/Rome).
- `<title>`: "Amin Borqal's Home Page" on Home; "Projects - Amin Borqal" and so on elsewhere.

**Variant B, "Plain text"**
- Same structure and link colors, but everything in one monospace font: self-hosted Courier Prime or IBM Plex Mono, whichever renders better.
- Column of about 72 characters.
- Section titles in capitals, separated by CSS border rules (real text, no ASCII art).

**Dark mode**: not required (1996 had none). If you think it is worth it, propose it in the plan with the same plain logic (black background, #E0E0E0 text, light blue and light purple links, AA contrast).

## 4. Hard rules: no kitsch, no AI slop

**Kitsch: banned** (this is an homage, not a parody)
- under-construction GIFs, hit counters, marquee, blink, animated GIFs;
- webrings, guestbooks, MIDI, Comic Sans, "best viewed with Netscape" badges;
- tiled backgrounds, beveled 3D button images, rainbow rules, clip art, frames;
- fake terminal green on black, ASCII art banners.

**AI slop: banned**
- gradients, glassmorphism, blurred blobs, glow, shadows, rounded cards;
- hero sections, CTA buttons ("Let's work together", "Hire me");
- emoji, "Hi, I'm Amin 👋", typing animations, rotating words, scroll-reveal animations, parallax, particles, cursor effects;
- three-card feature grids, logo walls, testimonials, animated counters;
- skill bars, percentages, ratings;
- stock photos, illustrations, icon packs (text links are enough);
- UI kits and the default Tailwind/shadcn look.

**Copy: banned** (these apply to text you write; my verbatim texts stay as they are)
- em dashes (—) and en dashes (–) anywhere, dates included: write ranges as "Sep 2025 - Jan 2026", like my CV;
- the words passionate, leverage, cutting-edge, innovative, seamless, robust, delve, journey, unlock, empower, elevate, harness, spearhead, synergy, game-changer, world-class, dynamic, showcase, foster, "drives", "surfaces";
- self-praise (highly motivated, results-driven, expert) and marketing tone;
- "Welcome to my website" and any About text written by you.

**Content rules**
- **Never invent anything**: facts, numbers, dates, links, titles, roles, publications, quotes. Use only section 8. If a field is missing, keep it as TODO in the data file and hide the element on the page (no empty links, no "coming soon").
- Texts marked **verbatim** are mine: use them exactly, don't paraphrase or "improve" them.
- New microcopy (labels, one-line page intros): plain English, short, factual. American spelling for your text.
- Don't state availability or start dates ("available from", "open to work from"). "Graduating April 2027" is enough.
- ROUTEin was my project end to end, business and technical: never write "co-founder", "team of two" or "technical side".
- My M.Sc. thesis has no results yet: never present results.
- Don't attribute to me the Fixed Rank Kriging models of the GRINS group (don't mention them at all).
- Privacy: no phone number, no street address (city only), no grades, no contacts of my references. Email: a copy button plus an obfuscated mailto assembled in JS, with the plain-text fallback "aminborqal10 [at] gmail [dot] com".

## 5. The sophisticated part (hidden under the plain page)

**1. Slides you can see: the main feature.**
- *Build-time pipeline:* convert every deck (PDF) into one WebP image per slide (about 1600px wide, quality about 80), plus a small poster of slide 1. Store them in `public/slides/<slug>/` and record the page count and aspect ratio in the data. Use `pdftoppm` (poppler-utils) in the GitHub Action, or pdf.js in Node.
- *On the page:*
  - Every entry with a deck shows the slide-1 poster right in the entry (1px border, alt text "First slide of <title>"), with `[view slides] [PDF, 12 MB]`.
  - This applies to experiences and projects, not only to the Presentations page.
- *Viewer:*
  - It opens inline under the entry, with no overlay or modal.
  - It shows the current slide with plain text controls: `[< prev]  3 / 18  [next >]  [full screen]  [PDF]`.
  - Keyboard: ← → Home End Esc. Touch: swipe on phones.
  - It preloads the previous and next slide.
  - The URL hash tracks the slide (`#paris-pitch/3`), so a shared link opens that exact slide.
  - `aria-live` announces "Slide 3 of 18"; each slide has alt text "Slide 3 of <title>".
  - Full screen uses the Fullscreen API.
- *Without JS:* the poster and the PDF link.
- *Reports* (multi-page PDFs that are not slides) show only a first-page poster and the [PDF] link.
- *Heavy files:* never commit files over 20 MB. The Paris Pitch PDF is 74.5 MB (`OperationalIntelligenceForFS.pdf`):
  - download it once from `https://drive.google.com/uc?export=download&id=1sRtdW3rOTNv9IpU1fq_oBxjclYZO4hG0`;
  - generate the slide images from it;
  - commit a compressed copy (Ghostscript `/ebook`) only if it ends up under 20 MB; otherwise the [PDF] link points to the Drive original.
  - Show the file size next to every [PDF] link.

**2. Project filter.** Plain text links (`All · Machine Learning · Control & SysID · IR & LLM · Geospatial · Software`); the active one is bold. State in the URL hash (`#tag=ml`); without JS everything is visible.

**3. Plain-text CV.** `/cv.txt` is generated at build time from the same data files: a 1990s touch that is also useful. It sits next to the PDF.

**4. Speed.** Variant A loads no web fonts on desktop, uses no JS framework, and keeps every page under 100 KB without images.

**5. Print.** Printing any page gives a clean black-on-white document.

## 6. Pages

**All pages**: my name as `<h1>`, a line "M.Sc. student, Computer Science and Engineering, University of Bergamo", the text navigation, then `<hr>`.

**Home**
- About:
  - photo (`public/img/portrait.jpg`);
  - role line and thesis line (8.1);
  - bio (8.2);
  - interests (8.3) as a bullet list.
- Contact: `[Copy email]` (native button; announces "Copied" via `aria-live`) `[LinkedIn] [GitHub] [CV: PDF | text]`.
- News & updates (8.4): newest first, each item starting with the date in bold, with an optional link at the end ([slides], [code], [details] to an internal anchor).
- Selected work: ROUTEin (with the Paris Pitch poster and viewer), Antwerp internship, Recursive PCA project. One line each plus links.
- Off-duty: only if I provide the text (8.10), otherwise hidden.

**Experience**
- Sections: Experience, then Education, then Extracurricular. Reverse chronological order.
- Each entry has:
  - role in bold, organization, place, dates;
  - bullets (verbatim, 8.5);
  - a "Material:" line with bracketed links;
  - the slide poster if there is a deck;
  - a `<details>` "More" with the facts listed as "Details".
- Each entry has an anchor (for example `#routein`) that I can link from LinkedIn.

**Projects** (8.7): the filter, then one `<h3>` per project.
- Each project shows:
  - the context line (course, university, year, stack);
  - a 1-2 sentence summary;
  - "Result:" with the key numbers in monospace;
  - tags;
  - a "Material:" line;
  - the slide poster if there is a deck;
  - `<details>` for the method.
- One anchor per project.

**Presentations** (8.8): every deck in one place, newest first.
- Each deck shows: the slide-1 poster, title, event or course, place and date, `[view slides] [PDF]`, and "Related:" with a link to its experience or project.
- Every experience or project with a deck links here, and every deck links back.

**CV**
- "Last updated: <date>";
- `[PDF]` (`public/cv/Amin_Borqal_CV.pdf`, embedded below with its first-page poster) and `[plain text]` (`/cv.txt`);
- skills (8.11) and languages (8.12) as plain lists.

**404**: "Not Found. The requested URL was not found on this server." plus a link to Home (a quiet nod to old Apache pages).

## 7. Tech

**Stack**
- **Astro**, static output, no client framework.
- Vanilla JS only for: slide viewer, project filter, copy email.
- Hand-written CSS, short and readable; no CSS framework, no UI kit.

**Content**
- Typed data files: Astro content collections with zod schemas, in YAML: `profile`, `experience`, `education`, `projects`, `presentations`, `news`.
- Adding a project, a deck or a news item means editing one YAML file and dropping a PDF in a folder.
- Cross-links use slugs, and the build fails if a slug does not exist.

**PDFs from my GitHub repos**
- Download them from `https://raw.githubusercontent.com/aminb00/<repo>/main/<path>`, URL-encoding spaces and `&`. They are my files and already public.
- Keep a "source on GitHub" link next to each one.
- Markdown reports (`REPORT.md`): link them on GitHub, don't copy.

**Deploy**
- GitHub Pages through GitHub Actions, from the repo `aminb00/aminb00.github.io`.
  - The repo already exists: it holds an old `index.html` (an earlier portfolio page) and Pages is not enabled.
  - Replace its content; the old file stays in git history.
- URL: https://aminb00.github.io
- Don't create routes that clash with my existing project page https://aminb00.github.io/Italian-Emissions-Daily-Dataset/
- Keep the config ready for a custom domain later (`CNAME`).

**Quality**
- Performance: Lighthouse mobile 100 on Performance, at least 95 on the other three categories; images in WebP or AVIF with width and height set; slide images lazy-loaded.
- SEO:
  - title and description per page, canonical URLs, `lang="en"`;
  - an Open Graph image in the same plain style;
  - JSON-LD `Person` (name, affiliation, alumniOf, sameAs GitHub and LinkedIn);
  - `sitemap.xml` and `robots.txt`.
- Accessibility: WCAG 2.1 AA, landmarks, skip link, visible focus, alt texts, keyboard-usable viewer and filter, `aria-expanded` on toggles.
- No analytics, no cookies, no third-party requests at page load.
- README covers:
  - run, build and deploy;
  - adding a project, a deck or a news item;
  - replacing the CV PDF and the portrait.

## 8. Content (single source of truth)

### 8.1 Identity
- Name: Amin Borqal
- Location: Bergamo, Italy
- Email: aminborqal10@gmail.com (obfuscated, see section 4)
- GitHub: https://github.com/aminb00
- LinkedIn: https://www.linkedin.com/in/aminborqal
- Role line: M.Sc. student in Computer Science and Engineering, University of Bergamo · graduating April 2027
- Thesis line: M.Sc. thesis in progress at the Control Systems and Automation Laboratory, University of Bergamo · Supervisors: Davide Previtali, Nicola Licini

### 8.2 Bio
Paragraph 1 (**verbatim**):
> M.Sc. student in Computer Science and Engineering at the University of Bergamo, with a background in GeoStatistics, AI & ML Engineering and Data Engineering. I am driven by problems that sit at the intersection of mathematical modelling and real world impact. Organized, cheerful, and curious, I thrive in dynamic, multicultural environments. I like moving from solving technical problems to designing and managing the solution.

Paragraph 2 (**verbatim**, draft I may still change):
> I am now working on my M.Sc. thesis on blood glucose control for the artificial pancreas: compartmental recurrent neural networks used as the prediction model inside a Model Predictive Control scheme.

### 8.3 Interests
- Machine Learning and Deep Learning
- System Identification and Control (Model Predictive Control)
- Geostatistics and spatio-temporal data
- Information Retrieval and LLM applications (RAG)
- Data Engineering and HPC

### 8.4 News & updates (newest first)
- **Oct 2026**: Started my M.Sc. thesis at the Control Systems and Automation Laboratory (University of Bergamo): blood glucose Model Predictive Control with compartmental recurrent neural networks. Link: `#msc-thesis`
- **Jun 2026**: ROUTEin won 1st place at the CoDEMO 5.0 International Innovation Award in Paris (Industry 5.0 category), among 8 national winners from across Europe. Link: slides `paris-pitch`
- **Jan 2026**: Finished my research internship at the ADReM Data Lab (Universiteit Antwerpen) and presented the results to the lab. Link: `#antwerp-internship`
- **Sep 2025**: Started my Erasmus+ semester at Universiteit Antwerpen, Belgium.
- **May 2025**: Started ROUTEin in the UniBg Entrepreneurship Lab CREO, from an industrial challenge by Magris S.p.A. Link: `#routein`
- **Feb 2025**: Started a research grant in the PNRR GRINS project (Dept. of Economics, University of Bergamo) on daily emission data for all Italian municipalities. Link: `#grins`
- **Dec 2024**: B.Sc. in Computer Science and Engineering, University of Bergamo. Thesis: Italian Emission Daily Dataset. Link: `#iedd`

### 8.5 Experience (bullets **verbatim**)

**`routein`**
- Role: Founder & AI Project Lead
- Organization: ROUTEin, AI-driven Field Service Management Startup
- Place: Bergamo, Italy · Dates: May 2025 - Present
- Bullets:
  - Born in the UniBg Entrepreneurship Lab CREO from an industrial challenge by Magris S.p.A.: reducing the hidden travel costs that erode contract margins in small and medium-sized Italian maintenance and installation companies.
  - Managed the whole project, from the business side (need validation, business plan, pitch) to the technical design of the platform: AI-based technician dispatching, cost tracking per contract and an AI assistant that finds process bottlenecks.
  - **1st place** at the CoDEMO International Innovation Award (Paris, 2026), **Industry 5.0** category, among 8 national winners from across Europe. Validated on real operational data from a leading Italian field service company.
- Material:
  - Slides "Paris Pitch" (deck `paris-pitch`, 8.8): https://drive.google.com/file/d/1sRtdW3rOTNv9IpU1fq_oBxjclYZO4hG0/view?usp=sharing
  - Award: https://www.codemo-project.eu/

**`antwerp-internship`**
- Role: Research Intern: Machine Learning for Proteomics
- Organization: Universiteit Antwerpen, ADReM Data Lab (Erasmus+)
- Place: Antwerp, Belgium · Dates: Sep 2025 - Jan 2026
- Bullets:
  - Worked on Machine Learning for Tandem Mass Spectrometry (MS/MS) chimeric spectra decomposition: from raw proteome data to sparse spectral deconvolution using LASSO regression, on large-scale real experimental proteomics data.
  - Integrated MSFragger-DDA+ for multi-peptide identification, IonQuant for MS1 quantification, and Prosit Deep Learning Model for peptide spectra predictions.
  - Bridged Data Science and Computational Biology to validate results and characterize fragmentation competition, revealing that MS1 abundance and MS2 fragmentation dominance are governed by distinct physicochemical mechanisms.
- Details:
  - Supervised by Prof. Wout Bittremieux and Charlotte Adams (PostDoc); I carried out the project on my own.
  - Scale: 1,276,641 peptide-spectrum matches (PSMs), 693,596 unique MS2 spectra, 355,592 chimeric spectra (51.3%), about 1.1M Prosit predictions, about 50-70 GB of experimental data, about 48 h of processing on the Flemish Supercomputer Center (VSC) with SLURM.
  - Results: linear mixture models reach 0.803 mean cosine similarity (the additive fragmentation assumption holds); MS1 abundance does not predict MS2 fragmentation dominance; reconstruction quality increases with chimericity.
  - Final presentation to the lab as the internship exam.
- Material:
  - Code: https://github.com/aminb00/Exploring-Fragmentation-Competion-in-Proteomics-Data-to-Decode-Chimeric-Spectra
  - Slides: TODO (lab presentation, Jan 2026)
  - Report: TODO

**`grins`**
- Role: Geo-Spatial Data Scientist Researcher (research grant)
- Organization: Research in Environmental Statistics - GRINS, Dept. of Economics, University of Bergamo
- Place: Bergamo, Italy · Dates: Feb 2025 - Nov 2025
- Bullets:
  - Extended my B.Sc. thesis into a reproducible **pipeline** to regularly update a high-resolution daily dataset of atmospheric emissions for all Italian municipalities, contributing to a national-scale research infrastructure.
  - Designed and implemented **geo-matching** (area-weighted allocation) to transform grid-based emissions into municipality-level spatio-temporal time series.
  - Leveraged **High Performance Computing (HPC)** for large-scale spatio-temporal processing and quality assurance.
- Details:
  - Sources: CAMS-REG-ANT and CAMS-REG-TEMPO inventories; 10 pollutants × 12 GNFR sectors, 2000-2026.
  - The data are reused in at least two other GRINS projects.
  - Continuation of my B.Sc. thesis (`#iedd`).
- Material:
  - Code: https://github.com/GRINS-Spoke0-WP2/EM-CAMS (GRINS repository; my fork: https://github.com/aminb00/EM-CAMS)
  - Slides: TODO

**`guarniflon`**
- Role: Extrusion Worker · Organization: Guarniflon S.p.A. · Place: Castelli Calepio, Italy · Dates: Feb 2022 - Jan 2025
- Bullet: Operated and maintained extrusion machinery for PTFE products while studying full-time at university: learned to manage my time, stay responsible, and keep commitments even under pressure.

**`harnekinfo`**
- Role: Internship · Organization: HarnekInfo · Place: Sarnico, Italy · Dates: Feb 2018 & Jun 2018
- Bullet: Contributed to web development projects, gaining practical industry experience.

### 8.6 Education

**`msc`**: M.Sc. in Computer Science and Engineering · University of Bergamo · Expected April 2027
- Thesis (`#msc-thesis`), in progress, working title **Blood Glucose Model Predictive Control via Compartmental Recurrent Neural Networks**, Control Systems and Automation Laboratory. Supervisors: Davide Previtali, Nicola Licini.
  - Topic: blood glucose control for the artificial pancreas (type 1 diabetes). Compartmental recurrent neural networks are the prediction model inside a Model Predictive Control scheme, with a system identification part.
  - Status: started October 2026, study phase, no results yet.
- Focus: System Identification, Data Science and computational methods.
- Key subjects: Algorithms, Advanced Programming, System Identification, Statistical Learning, Adaptive Learning, Estimation and Supervision of Dynamical Systems (RLS, Kalman filter, fault diagnosis), Optimization (convex, stochastic gradient descent, non-convex), Deep Learning, Statistics for High Dimensional Data.

**`erasmus`**: Erasmus+ Exchange, M.Sc. in Computer Science · Universiteit Antwerpen, Belgium · Sep 2025 - Jan 2026
- Subjects: Research Internship in MS/MS Proteomics, Information Retrieval, Geographical Information Systems (GIS).

**`bsc`**: B.Sc. in Computer Science and Engineering · University of Bergamo · December 2024
- Thesis: Italian Emission Daily Dataset (`#iedd`).
- Key subjects: Mathematical Analysis, Linear Algebra, Logics and Algebra, Statistics, Time Series, Control Systems, Object-Oriented Programming, Databases, Web Technologies, Management Accounting.

### 8.7 Projects

**`rpca`**: Adaptive Fault Detection under Process Drift using Recursive PCA
- Context: course project, Adaptive Learning, Estimation and Supervision of Dynamical Systems · University of Bergamo · 2026 · MATLAB
- Summary (**verbatim**): Built a real-time fault diagnosis system (Recursive PCA, Li et al. 2000) for predictive maintenance of non-stationary industrial processes, telling genuine sensor faults apart from benign process drift that defeats fixed-model PCA.
- Result: false-alarm rate from 32.6% to near-nominal, step-fault detection above 81%, on a synthetic multi-sensor dataset with simultaneous drifts and impulsive, incipient and step faults.
- Details: adaptive RPCA with EWMA covariance tracking and incremental eigenstructure updates (Lanczos tridiagonalization, Sturm-sequence bisection, inverse iteration), avoiding full SVD, with VRE-based component selection.
- Tags: Control & SysID, Machine Learning
- Material (repo https://github.com/aminb00/Adaptive-Fault-Detection-under-Process-Drift-using-Recursive-PCA):
  - Code: the repo
  - Slides: `Presentation.pdf` (deck `rpca-slides`)
  - MATLAB live scripts: `LIVESCRIPTS-HTML&PDF/RPCA.pdf`, `PCA_batch.pdf`, `DataPreparation.pdf`

**`rag`**: RAG System for University Knowledge Access
- Context: team course project, Information Retrieval · Universiteit Antwerpen · 2025 · Python
- Summary (**verbatim**): Team project building a RAG system that answers questions about the UAntwerp Master's program, retrieving relevant passages and generating answers with GPT-4o.
- Result: Recall@5 0.80 ± 0.28 and MRR 1.00 on a hand-labelled set (n = 19); optional agentic workflow 0.73 ± 0.30; LLM-as-judge for faithfulness and relevance.
- Details:
  - Data: 588 passages from course and program pages.
  - Chunking: about 250 tokens with 15% overlap, cut at sentence and section boundaries.
  - Embeddings: all-MiniLM-L6-v2 (384-dim, local); all-mpnet-base-v2 and bge-small-en-v1.5 also tested.
  - Index: FAISS IndexFlatIP (cosine on L2-normalized vectors).
  - Retrieval: top-5 with 3×k candidate expansion, rerank, and a boost on course code and section.
  - Generation: GPT-4o (temperature 0.1, prompt restricted to the retrieved context).
  - Optional LangGraph workflow: query tagging, multi-query expansion, RRF fusion, MMR diversification.
  - Error analysis on retrieval failures and hallucinations.
- Tags: IR & LLM
- Material:
  - Code: https://github.com/aminb00/RAG-System-for-University-Knowledge-Access (my fork of the team repo)
  - Report: `REPORT.md` in that repo (link it, don't copy)

**`ann-benchmark`**: Multi-index Retrieval Benchmark on Wikipedia Movie Plots
- Context: course project, Information Retrieval · Universiteit Antwerpen · 2025 · Python · team: TODO confirm
- Summary: benchmark of approximate nearest neighbour search on Word2Vec embeddings of movie plots: vector quantization (VQ), product quantization (PQ), LSH (random hyperplanes + banding) and FAISS (IVF, IVFPQ, LSH).
- Result: VQ 97.6% Recall@10 at 1.18 ms; FAISS-IVF 98.8% at 83.5 µs; LSH 100% at 11.33 ms; PQ 33% at 1.74 ms.
- Details: 21-page LaTeX report.
- Tags: IR & LLM
- Material (repo https://github.com/aminb00/WikipediaMovie-Embedding-Retrieval-MultiIndexingBenchmark):
  - Code: the repo
  - Report: `Documentation/main.pdf`

**`resnet-transformer`**: ResNet-Transformer for Waste Classification
- Context: course project, Deep Learning · University of Bergamo · 2025 (TODO confirm year) · PyTorch
- Summary: hybrid classifier with ResNet-18 (ImageNet weights, last two layers removed) followed by a Transformer encoder (CLS token, positional embeddings, multi-head attention), on 9 waste categories.
- Result: best validation accuracy 80.15% (RandomCrop, HFlip and ColorJitter augmentation + unfrozen layer4); 77-80% across configurations.
- Details: Adam (lr 1e-4), cross-entropy, early stopping (patience 5), 80/20 split (seed 42).
- Tags: Machine Learning
- Material (repo https://github.com/aminb00/ResNet-Transformer-for-Waste-Classification):
  - Code: the repo
  - Report: `DLassignment2_AminBorqal.pdf`

**`istanbul-gee`**: Land Reclamation at Istanbul Airport with Google Earth Engine
- Context: course project, Geographical Information Systems · Universiteit Antwerpen · 2025/26 · Google Earth Engine (JavaScript)
- Summary: how much land was gained from the sea to build Istanbul Airport, compared with 2012.
- Result: water surface from 8.73 km² (2012) to 6.32 km² (2024): about 2.41 km² converted from water to land.
- Details:
  - Area: 6 km buffer around the airport on the Black Sea coast.
  - Imagery: Landsat 5 TM (2011-2012, before construction) and Landsat 9 OLI-2 (2023-2024), Collection 2 Level 2, cloud cover below 50%.
  - Method: water classified with NDWI > 0; change computed as the difference between the water masks; area measured with a reduceRegion sum at 30 m.
- Tags: Geospatial
- Material (repo https://github.com/aminb00/IstanbulAirportLandAnalysis):
  - Code: the repo
  - Report: `IstanbulAirportReport.pdf`

**`iedd`**: Italian Emission Daily Dataset (B.Sc. thesis)
- Context: B.Sc. thesis · University of Bergamo · Apr 2024 - Nov 2024 · R
- Summary: daily emission estimates for the main pollutants over all of Italy, built from the CAMS-REG-ANT and CAMS-REG-TEMPO inventories with temporal downscaling (annual to daily) and spatial aggregation.
- Result: 2000-2022 coverage (v2; v1 covered 2000-2020), 0.05° × 0.1° resolution, 7 pollutants × 12 GNFR sectors (A-L) plus aggregated sectors. It is the basis of my GRINS work (`#grins`).
- Tags: Geospatial
- Material:
  - Code: https://github.com/aminb00/Italian-Emissions-Daily-Dataset
  - Dataset page: https://aminb00.github.io/Italian-Emissions-Daily-Dataset/
  - Thesis PDF and defense slides: TODO

**`convex-optimization`**: Convex Optimization for Machine Learning (MAGIC Gamma Telescope)
- Context: course project, Optimization · University of Bergamo · March 2026 · Python (NumPy, scikit-learn, matplotlib)
- Summary: convergence analysis of first- and second-order methods for binary classification with logistic regression: gradient descent under different assumptions (naive, bounded, smooth, strongly convex), SGD, AdaGrad, Adam and Newton, compared with the theoretical bounds.
- Result: none given (hide the line).
- Tags: Machine Learning
- Material (repo https://github.com/aminb00/Convex-Optimization-for-Machine-Learning):
  - Code: the repo
  - Slides: `Presentation/Presentation.pdf` (deck `convex-slides`)

**`aircraft-price`**: Aircraft Price Analysis
- Context: course project with Filippo Bolis, Statistical Learning · University of Bergamo · A.Y. 2024/25 · Python
- Summary: predicting aircraft prices from technical features (Kaggle dataset, 497 observations, 14 variables, prices from $50K to $15M), with a log transform, linear, Ridge, LASSO, GAM and tree-based models, and bootstrap inference.
- Result: best model: LASSO.
- Tags: Machine Learning
- Material (repo https://github.com/aminb00/StatisticalLearningProject):
  - Code: the repo
  - Report: `StatisticalLearningProject Bolis-Borqal.pdf`
  - Slides: `StatisticalLearningProject Presentation.pdf` (deck `aircraft-slides`)

**`spendly`**: Spendly, Expense Management App
- Context: team course project, Design, Algorithms and Computability · University of Bergamo · 2025 · Vue.js, Spring Boot (Java)
- Summary (**verbatim**): Team project building a modern web app for personal and group expense management with interactive dashboards and analytics, following an Agile Model-Driven Development (AMDD) approach.
- Details (**verbatim**): Frontend in Vue.js and backend in Spring Boot (Java) with REST API, following the MVC pattern and clearly documented request flows. Performed requirements analysis and designed UML diagrams (Use Case, Class, Component, Deployment); ensured code quality with automated JUnit tests and static code analysis.
- Tags: Software
- Material (repo https://github.com/aminb00/Spendly-Expense-Management-Full-Stack-Application):
  - Code: the repo
  - Documentation (in Italian): `Documentazione/Documentazione.pdf`

**Hidden until I confirm**
- `fhdgm-argo`: functional Hidden Dynamic Geostatistical Model on Argo float temperature profiles in the Mediterranean, in progress.
- Repos I have not described yet (ask me, don't show them):
  - `Job-Matching-Platform-Full-Stack-Application-with-UML-Design-Software-Engineering`
  - `ProgettoCA`
  - `WikipediaMoviesRetrieval`

### 8.8 Presentations (decks for the slide pipeline)

**`paris-pitch`**: ROUTEin, Paris Pitch
- Venue: CoDEMO 5.0 International Innovation Award · Paris, France · June 2026
- Source: the Drive PDF of section 5 (74.5 MB). Take the deck title from slide 1 and keep "Paris Pitch" as the label.
- Related: `routein`

**`rpca-slides`**: Adaptive Fault Detection under Process Drift using Recursive PCA
- Venue: course presentation, Adaptive Learning, Estimation and Supervision of Dynamical Systems · University of Bergamo · 2026
- Source: `Presentation.pdf` (8.7)
- Related: `rpca`

**`convex-slides`**: Convex Optimization for Machine Learning
- Venue: course presentation, Optimization · University of Bergamo · March 2026
- Source: `Presentation/Presentation.pdf` (8.7)
- Related: `convex-optimization`

**`aircraft-slides`**: Aircraft Price Analysis
- Venue: course presentation, Statistical Learning · University of Bergamo · A.Y. 2024/25
- Source: `StatisticalLearningProject Presentation.pdf` (8.7)
- Related: `aircraft-price`

**TODO, hidden until I add the file**
- Antwerp internship final presentation (ADReM Data Lab, Jan 2026, `antwerp-internship`)
- B.Sc. thesis defense (Dec 2024, `iedd`)
- GRINS presentations, if any (`grins`)
- any slides for `rag`, `ann-benchmark`, `istanbul-gee`, `spendly`

### 8.9 Extracurricular (bullets **verbatim**)
- Robotics Project Developer · BergamoScienza · Bergamo, Italy · Jan 2019 - Jun 2020
  - In team, we built a domotic greenhouse controlled by Arduino as the main project.
  - Presented the project during school-science events to engage attendees about technology and sustainability.
- School Ambassador · Open Days Initiative · Bergamo, Italy · Sep 2019 - Feb 2020
  - Acted as a representative of the school, explaining educational programs and showcasing student projects to prospective students and their families.

### 8.10 Off-duty
TODO: I will write it. Hide the section until the text exists.

### 8.11 Skills (plain grouped lists, no levels)
- Programming: Python, R, MATLAB, Java, C++, SQL, LaTeX
- Machine Learning and data: PyTorch, scikit-learn, statsmodels, PyGAM, pandas, NumPy
- IR and LLM: RAG, GPT-4o / OpenAI API, LangGraph, sentence-transformers, FAISS, Ollama
- Geospatial: QGIS, Google Earth Engine, Landsat, CAMS inventories
- Infrastructure and tools: HPC with SLURM, Git, GitHub, MySQL, Claude Code
- Web: JavaScript, Vue.js, Flask, Spring Boot (REST APIs), HTML, CSS

### 8.12 Languages
Italian (native) · Moroccan Arabic (native) · English (professional) · French (basic)

## 9. Assets I will provide
- `public/img/portrait.jpg`. Until then, use a plain grey rectangle with a 1px border and the text "photo", never a stock photo.
- `public/cv/Amin_Borqal_CV.pdf`
- the missing slides and reports (the TODO items in 8.5-8.8)
- the Off-duty text (8.10)
- Favicon: you make a plain "AB" in black serif on white (SVG plus PNG fallbacks).

## 10. Acceptance checklist (report each item and how you verified it)
- [ ] `PLAN.md` approved before any code.
- [ ] All content comes from section 8; no lorem ipsum; empty fields are hidden.
- [ ] A search of the built HTML finds no "—" or "–" and none of the banned words outside verbatim texts.
- [ ] Every deck shows its slide-1 poster in its entry and opens in the inline viewer; keyboard, swipe, full screen and the `#slug/3` deep links work; without JS the poster and the PDF link remain.
- [ ] Every experience and project with material shows it; every deck links back to its experience or project, and vice versa.
- [ ] No committed file is over 20 MB; every [PDF] link shows the file size.
- [ ] Link check on the build: 0 broken internal or external links (LinkedIn blocks bots, so check that one by hand).
- [ ] Lighthouse mobile: Performance 100, the other three categories at least 95.
- [ ] Screenshots of every page at 375, 768 and 1280 px.
- [ ] Keyboard only: every link, filter, `<details>` and viewer control works, and focus is always visible.
- [ ] The page still reads like a plain 1990s homepage: no element from the banned lists in section 4.
- [ ] The GitHub Actions deploy to aminb00.github.io works, and the README explains how to update the content.
