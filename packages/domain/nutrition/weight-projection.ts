/** Widely used rule-of-thumb: ~7700 kcal of sustained balance corresponds to ~1kg of body fat. */
const KCAL_PER_KG_FAT = 7700;

export function projectWeight(currentWeightKg: number, avgDailyCalorieBalance: number, daysAhead: number): number {
  const kgChange = (avgDailyCalorieBalance * daysAhead) / KCAL_PER_KG_FAT;
  return Math.round((currentWeightKg + kgChange) * 10) / 10;
}

export interface WeightPoint {
  date: string;
  weightKg: number;
}

/** Simple linear regression over recent weigh-ins, for the "peso_inicio_fin" style trend card. */
export function weightTrend(points: WeightPoint[]): { startKg: number; endKg: number; deltaKg: number } | null {
  if (points.length === 0) return null;
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const startKg = sorted[0].weightKg;
  const endKg = sorted[sorted.length - 1].weightKg;
  return { startKg, endKg, deltaKg: Math.round((endKg - startKg) * 10) / 10 };
}
