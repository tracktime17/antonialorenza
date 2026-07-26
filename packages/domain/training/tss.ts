import { BIKE_ZONES, RUN_ZONES, SWIM_ZONES, classifyByRatio } from './zones';

export function parseMMSS(s: string | null | undefined): number | null {
  if (!s) return null;
  const p = s.split(':');
  if (p.length !== 2) return null;
  const m = parseInt(p[0], 10);
  const sec = parseInt(p[1], 10);
  if (isNaN(m) || isNaN(sec)) return null;
  return m * 60 + sec;
}

export interface TssResult {
  zone: string;
  tss: number;
  intensityFactor: number;
}

const EMPTY_RESULT: TssResult = { zone: '-', tss: 0, intensityFactor: 0 };

function calcTss(effortValue: number | null, thresholdValue: number, durationMin: number | null, zones: typeof RUN_ZONES): TssResult {
  if (!effortValue || !durationMin || !thresholdValue) return EMPTY_RESULT;
  const ifv = thresholdValue / effortValue;
  const tss = (durationMin / 60) * ifv * ifv * 100;
  return {
    zone: classifyByRatio(zones, effortValue, thresholdValue),
    tss: Math.round(tss),
    intensityFactor: +ifv.toFixed(2),
  };
}

export function calcRunTss(paceSecPerKm: number | null, durationMin: number | null, thresholdSecPerKm: number): TssResult {
  return calcTss(paceSecPerKm, thresholdSecPerKm, durationMin, RUN_ZONES);
}

export function calcSwimTss(paceSecPer100m: number | null, durationMin: number | null, cssSecPer100m: number): TssResult {
  return calcTss(paceSecPer100m, cssSecPer100m, durationMin, SWIM_ZONES);
}

/** Bike IF is watts/FTP (not inverted like pace), reuse the same shape via calcTss with watts as both value+threshold direction. */
export function calcBikeTss(avgWatts: number | null, durationMin: number | null, ftpWatts: number): TssResult {
  if (!avgWatts || !durationMin || !ftpWatts) return EMPTY_RESULT;
  const ifv = avgWatts / ftpWatts;
  const tss = (durationMin / 60) * ifv * ifv * 100;
  return {
    zone: classifyByRatio(BIKE_ZONES, avgWatts, ftpWatts),
    tss: Math.round(tss),
    intensityFactor: +ifv.toFixed(2),
  };
}
