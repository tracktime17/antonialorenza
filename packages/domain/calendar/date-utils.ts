export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parses a plain "YYYY-MM-DD" civil date into a local Date at midnight.
 * Unlike `new Date(isoString)`, this never round-trips through a UTC instant,
 * so the calendar day is stable regardless of the server's or the viewer's
 * timezone (server on Vercel runs in UTC; browsers run in the viewer's local
 * zone — going through `.toISOString()` + `new Date(...)` between them can
 * shift the date by a day). Always use this to parse dates coming from the
 * database or from another `toISODate` call.
 */
export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Monday = 0 ... Sunday = 6, matching the lun/mar/mie/jue/vie/sab/dom header. */
export function dowMondayFirst(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export interface CalendarWeek {
  days: (Date | null)[];
}

export function buildMonthGrid(monthDate: Date): CalendarWeek[] {
  const first = startOfMonth(monthDate);
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const leadingBlanks = dowMondayFirst(first);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: CalendarWeek[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push({ days: cells.slice(i, i + 7) });
  return weeks;
}
