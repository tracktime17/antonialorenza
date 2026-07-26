export interface DailyTss {
  date: string; // 'YYYY-MM-DD'
  tss: number;
}

export interface PmcPoint {
  date: string;
  ctl: number;
  atl: number;
  tsb: number;
}

const CTL_DAYS = 42;
const ATL_DAYS = 7;

function toDateOnly(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Standard Coggan/TrainingPeaks PMC recursion:
 * CTL_today = CTL_yesterday + (TSS_today - CTL_yesterday) / 42
 * ATL_today = ATL_yesterday + (TSS_today - ATL_yesterday) / 7
 * TSB_today = CTL_today - ATL_today
 * Walks every day between the first and last entry (days with no workout count as TSS 0)
 * so the exponential decay is correct even across rest days.
 */
export function computePmcSeries(dailyTss: DailyTss[]): PmcPoint[] {
  if (dailyTss.length === 0) return [];

  const tssByDate = new Map<string, number>();
  for (const d of dailyTss) {
    tssByDate.set(d.date, (tssByDate.get(d.date) ?? 0) + d.tss);
  }

  const sortedDates = [...tssByDate.keys()].sort();
  const start = toDateOnly(sortedDates[0]);
  const end = toDateOnly(sortedDates[sortedDates.length - 1]);

  const points: PmcPoint[] = [];
  let ctl = 0;
  let atl = 0;
  for (let d = start; d <= end; d = new Date(d.getTime() + 86400000)) {
    const key = toISO(d);
    const todayTss = tssByDate.get(key) ?? 0;
    ctl = ctl + (todayTss - ctl) / CTL_DAYS;
    atl = atl + (todayTss - atl) / ATL_DAYS;
    points.push({ date: key, ctl: +ctl.toFixed(1), atl: +atl.toFixed(1), tsb: +(ctl - atl).toFixed(1) });
  }
  return points;
}

export function tsbLabel(tsb: number): string {
  if (tsb > 25) return 'Muy fresca, riesgo de perder forma';
  if (tsb > 5) return 'Fresca, lista para competir';
  if (tsb > -10) return 'Neutra';
  if (tsb > -30) return 'Fatigada, construyendo forma';
  return 'Muy fatigada, riesgo de sobreentrenamiento';
}
