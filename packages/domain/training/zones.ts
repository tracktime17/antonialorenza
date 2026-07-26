export interface ZoneBand {
  label: string;
  minRatio: number;
  maxRatio: number;
}

/**
 * Zone boundaries kept as ratios of the athlete's threshold rather than fixed
 * absolute values. Preserves Antonia's validated 2026-05-09 bands exactly at
 * her current calibration (255s/km run threshold, 205W bike FTP, 83s/100m
 * swim CSS) while scaling proportionally if she recalibrates later.
 */
export const RUN_ZONES: ZoneBand[] = [
  { label: 'Z1 Regenerativo', minRatio: 345 / 255, maxRatio: 390 / 255 },
  { label: 'Z2 Aerobico ext.', minRatio: 315 / 255, maxRatio: 345 / 255 },
  { label: 'Z3 Tempo', minRatio: 285 / 255, maxRatio: 315 / 255 },
  { label: 'Z4 Umbral', minRatio: 260 / 255, maxRatio: 285 / 255 },
  { label: 'Z5a Umbral anaer.', minRatio: 245 / 255, maxRatio: 260 / 255 },
  { label: 'Z5b VO2max', minRatio: 230 / 255, maxRatio: 245 / 255 },
  { label: 'Z6 Velocidad', minRatio: 0, maxRatio: 230 / 255 },
];

export const SWIM_ZONES: ZoneBand[] = [
  { label: 'Z1 Tecnica', minRatio: 95 / 83, maxRatio: 105 / 83 },
  { label: 'Z2 Aerobico', minRatio: 88 / 83, maxRatio: 95 / 83 },
  { label: 'Z3 Tempo', minRatio: 84 / 83, maxRatio: 88 / 83 },
  { label: 'Z4 Threshold', minRatio: 80 / 83, maxRatio: 84 / 83 },
  { label: 'Z5 VO2max', minRatio: 76 / 83, maxRatio: 80 / 83 },
];

export const BIKE_ZONES: ZoneBand[] = [
  { label: 'Z1 Recuperacion', minRatio: 0, maxRatio: 123 / 205 },
  { label: 'Z2 Aerobico ext.', minRatio: 123 / 205, maxRatio: 144 / 205 },
  { label: 'Z3 Tempo', minRatio: 144 / 205, maxRatio: 164 / 205 },
  { label: 'Z4 Umbral (FTP)', minRatio: 164 / 205, maxRatio: 195 / 205 },
  { label: 'Z5 VO2max', minRatio: 195 / 205, maxRatio: 226 / 205 },
  { label: 'Z6 Anaerobico', minRatio: 226 / 205, maxRatio: Infinity },
];

/** value and threshold must be in the same unit (sec/km, sec/100m, or watts). */
export function classifyByRatio(zones: ZoneBand[], value: number, threshold: number): string {
  if (!threshold) return '-';
  const ratio = value / threshold;
  for (const z of zones) {
    if (ratio >= z.minRatio && ratio < z.maxRatio) return z.label;
  }
  return '-';
}
