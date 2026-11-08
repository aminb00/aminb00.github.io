# aminb00.github.io

Personal website of Amin Borqal: <https://aminb00.github.io>

Plain HTML in the style of a 1990s computer science home page, built with
[Astro](https://astro.build) (static output, no client framework). Three small
scripts run in the browser: the slide viewer, the project filter and the email
button. Without JavaScript every page still works.

## Run, build, deploy

You need Node 26 (see `.nvmrc`). To turn a new or changed PDF into slide
images you also need poppler: `brew install poppler` on macOS,
`sudo apt-get install poppler-utils` on Linux.

```bash
npm ci            # install
npm run dev       # http://localhost:4321, reloads when you edit a file
npm run build     # build into dist/, then run the checks
npm run preview   # serve dist/ at http://localhost:4321
```

Checks (the build already runs `scripts/check.mjs`: dashes, banned words,
image sizes, PDF sizes, page weight, 20 MB limit):

```bash
npm run links            # internal links and anchors (needs lychee: brew install lychee)
npm run links:external   # external links too (LinkedIn blocks bots: check it by hand)
npm run verify           # browser checks against a running preview (needs Google Chrome)
npm run shots            # screenshots at 375, 768 and 1280 px into proof/
```

`verify` and `shots` read the address from `BASE`, for example
`BASE=http://localhost:4321 npm run verify`.

**Deploy.** Every push to `main` builds the site and publishes it to GitHub
Pages (`.github/workflows/deploy.yml`). One-time setup: repository Settings →
Pages → Build and deployment → Source: **GitHub Actions**. A second workflow
(`.github/workflows/links.yml`) checks every link each Monday and fails if one
is broken.

## Update the content

Everything on the site comes from the YAML files in `src/data/`:

| File | What |
|---|---|
| `profile.yaml` | name, role and thesis lines, bio, interests, contact, skills, languages, Selected work |
| `news.yaml` | News & updates on Home |
| `experience.yaml` | Experience and Extracurricular |
| `education.yaml` | Education |
| `projects.yaml` | Projects, in page order |
| `presentations.yaml` | decks (slides) |

Every entry has an `id`. It is the slug: the anchor on its page
(`https://aminb00.github.io/experience/#routein`, good for LinkedIn) and the
name other entries use to link to it. The build stops with a clear message if
a slug is unknown or a file is missing.

Text fields accept three marks: `**bold**`, `` `monospace` `` (numbers in
results) and `[label](#slug)` for a link to another entry. Write a missing
value as `TODO`: it stays off the page.

The build also checks the writing rules: no en dash or em dash anywhere (write
ranges as `Sep 2025 - Jan 2026`), and none of the banned words of the brief
outside your verbatim texts (the list is in `scripts/check.mjs`).

### Add a news item

Add an entry to `src/data/news.yaml`. The order in the file does not matter:
the page sorts by date.

```yaml
- id: 2027-04-graduation
  date: 2027-04
  text: Graduated in Computer Science and Engineering, University of Bergamo.
  link: { label: details, to: msc }   # optional; "to" is a slug or a URL
```

### Add a project

Add an entry to `src/data/projects.yaml` where you want it on the page (copy an
existing one). Its PDFs go in `public/pdf/` and are listed under `material`:

```yaml
    - type: pdf
      id: my-project-report          # also the folder of its poster
      label: report
      file: my-project-report.pdf    # in public/pdf/
      poster: true                   # show the first page (one poster per project)
      source: { github: { repo: aminb00/my-repo, path: docs/report.pdf } }
```

With a `source`, `npm run fetch -- my-project-report` downloads the file from
GitHub for you, and the page links back to it ("source on GitHub").
`npm run fetch` also scans every PDF for phone numbers, addresses, student IDs
and grades, and prints what it finds.

### Add a deck

1. Put the PDF in `public/pdf/`, for example `public/pdf/thesis-defense.pdf`.
   It must be under 20 MB.
2. Add an entry to `src/data/presentations.yaml`. `related` names the
   experience or project it belongs to: the entry then shows the deck, and the
   deck links back to the entry.

   ```yaml
   - id: thesis-defense
     title: Blood Glucose Model Predictive Control via Compartmental Recurrent Neural Networks
     event: M.Sc. thesis defense
     place: University of Bergamo
     date: 2027-04            # or just 2027 if you don't know the month
     pdf: { file: thesis-defense.pdf }
     related: [msc]
     poster: 1                # use 2 if slide 1 is only a logo
   ```
3. Run `npm run dev` or `npm run build`: the slides become WebP images in
   `public/slides/thesis-defense/`. Commit them together with the PDF.

A PDF over 20 MB: make a smaller copy with
`gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook -o small.pdf big.pdf`, or keep it
elsewhere and write `pdf: { url: https://..., bytes: 74533820 }` (the slide
images still need the PDF once, in `.cache/originals/<id>.pdf`).

### Replace the CV PDF

Save it as `public/cv/Amin_Borqal_CV.pdf` and commit. The CV page and Home
then link it with its size, and the CV page shows its first page and "Last
updated", the date of the commit (or `cv.updated` in `profile.yaml`). The
plain-text CV at `/cv.txt` is generated from the data files: nothing to do.

### Replace the portrait

Save it as `public/img/portrait.jpg`. The build makes a 300px WebP without
metadata (camera, GPS); the JPG itself is not published.

### Off-duty

Write the text in `offDuty` in `profile.yaml` (instead of `TODO`): the section
appears on Home.

### Favicon and Open Graph image

`npm run icons` makes them again from `profile.yaml`, for example after a new
affiliation line.

## Custom domain

1. Set up the DNS records as GitHub explains:
   <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site>.
2. Settings → Pages → Custom domain. With a deploy from GitHub Actions a
   `CNAME` file is ignored: the domain lives in this setting.
3. Settings → Secrets and variables → Actions → Variables: add `SITE_URL`
   with the new address (`https://example.com`), so canonical URLs, the
   sitemap and the Open Graph tags use it. Run
   `SITE_URL=https://example.com npm run icons` and commit `public/og.png`.

Your project page (`/Italian-Emissions-Daily-Dataset/`) moves to the same
domain on its own.

## Where things are

```
src/data/              content (YAML); generated/docs.json is written by scripts/docs.mjs
src/content.config.ts  schemas of the data files
src/lib/site.ts        loads the data, slug registry, cross-link checks
src/pages/             pages, plus cv.txt, sitemap.xml, robots.txt
src/components/        page parts (entries, decks, filter, header, footer)
src/scripts/           the three browser scripts: viewer, filter, email
src/styles/            site.css (inlined in every page), print.css
public/pdf/            hosted PDFs        public/slides/  slide images and posters
scripts/               fetch-pdfs, docs (PDF to images), check, verify, shots, make-icons
```
