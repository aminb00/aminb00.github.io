// /cv.txt: the CV as plain text, 72 columns, built from the same data files as
// the pages. Bold and links are dropped; the email keeps its [at]/[dot] form.

import type { Site } from './site';
import { fmtDates, fmtWhen, unixDate } from './format';
import { plain } from './text';

const WIDTH = 72;

/** Word-wrap to 72 columns. `first` prefixes the first line, `rest` the others. */
function wrap(text: string, first = '', rest = first): string {
  const lines: string[] = [];
  let line = first;
  let empty = true;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (!empty && line.length + 1 + word.length > WIDTH) {
      lines.push(line);
      line = rest + word;
    } else {
      line += (empty ? '' : ' ') + word;
    }
    empty = false;
  }
  lines.push(line);
  return lines.join('\n');
}

const bullet = (text: string) => wrap(plain(text), '  - ', '    ');
const indented = (text: string) => wrap(plain(text), '  ', '  ');
const commas = (text: string) => text.replaceAll(' · ', ', ');

export function cvText(site: Site, base: URL): string {
  const p = site.profile;
  const url = (path: string) => new URL(path, base).href;
  const out: string[] = [];
  const section = (title: string) => out.push('', '', title.toUpperCase());

  out.push(
    p.name.toUpperCase(),
    wrap(commas(p.roleLine)),
    p.location,
    '',
    `Email:    ${p.email.user} [at] ${p.email.domain.split('.').join(' [dot] ')}`,
    `Web:      ${url('/')}`,
    `GitHub:   ${p.links.github}`,
    `LinkedIn: ${p.links.linkedin}`,
  );

  section('Education');
  for (const e of site.education) {
    const d = e.data;
    out.push('', wrap(d.degree), wrap(`${d.school}, ${fmtDates(d)}`));
    const t = d.thesis;
    if (t?.project) {
      out.push(bullet(`Thesis: ${t.title}, ${url(site.resolve(t.project, 'cv.txt'))}`));
    } else if (t) {
      const head = ['Thesis', t.status, `${t.workingTitle ? 'working title ' : ''}"${t.title}"`, t.lab].filter(Boolean).join(', ');
      out.push(bullet(`${head}.${t.supervisors.length ? ` Supervisors: ${t.supervisors.join(', ')}.` : ''}`));
      if (t.topic) out.push(wrap(`Topic: ${plain(t.topic)}`, '      ', '      '));
      if (t.statusText) out.push(wrap(`Status: ${t.statusText}`, '      ', '      '));
    }
    d.lines.forEach((line) => out.push(bullet(line)));
    if (d.subjects.length) out.push(bullet(`Key subjects: ${d.subjects.map(plain).join(', ')}.`));
  }

  const entries = (section: 'work' | 'extracurricular') => {
    for (const e of site.experience.filter((x) => x.data.section === section)) {
      const d = e.data;
      out.push('', wrap(d.role), wrap(`${d.org}, ${d.place}`), fmtDates(d));
      d.bullets.forEach((b) => out.push(bullet(b)));
      for (const deck of site.decksFor(e.id)) out.push(`    Slides: ${url(site.resolve(deck.id, 'cv.txt'))}`);
      for (const m of d.material) if (m.type === 'code') out.push(`    Code: ${m.url}`);
    }
  };

  section('Experience');
  entries('work');

  section('Projects');
  for (const pr of site.projects) {
    const d = pr.data;
    out.push('', wrap(d.title), wrap(d.context.filter((c) => !/^TODO/i.test(c)).join(', ')));
    out.push(indented(d.summaryVerbatim ? d.summary : d.summary.charAt(0).toUpperCase() + d.summary.slice(1)));
    if (d.result) out.push(indented(`Result: ${d.result}`));
    for (const m of d.material) if (m.type === 'code') out.push(`  Code: ${m.url}`);
    for (const deck of site.decksFor(pr.id)) out.push(`  Slides: ${url(site.resolve(deck.id, 'cv.txt'))}`);
  }

  section('Presentations');
  for (const deck of site.presentations) {
    const d = deck.data;
    out.push('', wrap(d.label ? `${d.title} (${d.label})` : d.title), wrap(`${d.event}, ${d.place}, ${fmtWhen(d.date, d.datesText)}`));
    out.push(`  ${url(site.resolve(deck.id, 'cv.txt'))}`);
  }

  section('Extracurricular');
  entries('extracurricular');

  section('Skills');
  out.push('');
  for (const g of p.skills) out.push(wrap(`${g.group}: ${g.items.join(', ')}`, '  ', '    '));

  section('Languages');
  out.push('', wrap(p.languages.map((l) => `${l.name} (${l.level})`).join(', '), '  ', '  '));

  out.push('', '', `Last modified: ${unixDate()}`);
  return `${out.join('\n')}\n`;
}
