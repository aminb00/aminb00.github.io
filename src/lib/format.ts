// Formatting for dates, ranges and file sizes. Months are written the way the CV
// writes them ("Sep 2025 - Jan 2026"), never with en or em dashes.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const split = (month: string) => {
  const [year, m] = month.split('-');
  return { year, index: Number(m) - 1 };
};

/** "2025-09" → "Sep 2025" */
export function fmtMonth(month: string): string {
  const { year, index } = split(month);
  return `${MONTHS[index]} ${year}`;
}

/** A deck date: "2026-03" → "Mar 2026", "2026" → "2026"; datesText wins. */
export function fmtWhen(date: string, datesText?: string): string {
  if (datesText) return datesText;
  return /^\d{4}$/.test(date) ? date : fmtMonth(date);
}

/** "2024-12" → "December 2024" */
export function fmtMonthLong(month: string): string {
  const { year, index } = split(month);
  return `${MONTHS_LONG[index]} ${year}`;
}

interface Dated {
  start?: string;
  end?: string;
  expected?: boolean;
  datesText?: string;
}

/** "Sep 2025 - Jan 2026", "May 2025 - Present", "Expected April 2027", "December 2024" */
export function fmtDates({ start, end, expected, datesText }: Dated): string {
  if (datesText) return datesText;
  if (!end) return start ? fmtMonth(start) : '';
  if (expected) return `Expected ${fmtMonthLong(end)}`;
  if (!start) return fmtMonthLong(end);
  return `${fmtMonth(start)} - ${end === 'present' ? 'Present' : fmtMonth(end)}`;
}

/** Decimal units, as in "74.5 MB" for 74,533,820 bytes. */
export function fmtBytes(bytes: number): string {
  if (bytes < 1_000_000) return `${Math.max(1, Math.round(bytes / 1000))} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

// Build time, the same on every page.
export const BUILD_TIME = new Date();

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (value: string | number, width = 2, fill = '0') => String(value).padStart(width, fill);

function romeParts(date: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Rome',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const zone = (style: 'short' | 'longOffset', locale: string) =>
    new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Rome', timeZoneName: style })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value ?? '';
  // Weekday from the calendar date in Rome, so it can't drift from the day number.
  const weekday = WEEKDAYS[new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day)).getUTCDay()];
  return {
    ...parts,
    weekday,
    abbr: zone('short', 'en-GB'), // CET or CEST
    offset: zone('longOffset', 'en-US').replace('GMT', '') || '+00:00',
  };
}

/** The Unix `date` format: "Fri Nov  6 16:02:31 CET 2026" (Europe/Rome). */
export function unixDate(date = BUILD_TIME): string {
  const p = romeParts(date);
  return `${p.weekday} ${MONTHS[+p.month - 1]} ${pad(p.day, 2, ' ')} ${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)} ${p.abbr} ${p.year}`;
}

/** ISO 8601 with the Rome offset, for <time datetime>. */
export function isoDate(date = BUILD_TIME): string {
  const p = romeParts(date);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}${p.offset}`;
}

/** "November 6, 2026" */
export function fmtDay(date: Date): string {
  const p = romeParts(date);
  return `${MONTHS_LONG[+p.month - 1]} ${+p.day}, ${p.year}`;
}
