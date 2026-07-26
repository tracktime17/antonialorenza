export interface DailyMacros {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface NutritionTargets {
  caloriesTarget: number | null;
  proteinGTarget: number | null;
  carbsGTarget: number | null;
  fatGTarget: number | null;
}

export interface ComplianceResult {
  caloriesPct: number | null;
  proteinPct: number | null;
  carbsPct: number | null;
  fatPct: number | null;
  /** actual - target: positive = superavit, negative = deficit */
  calorieBalance: number | null;
}

function pct(actual: number, target: number | null): number | null {
  if (!target) return null;
  return Math.round((actual / target) * 1000) / 10;
}

export function computeCompliance(actual: DailyMacros, targets: NutritionTargets): ComplianceResult {
  return {
    caloriesPct: pct(actual.calories, targets.caloriesTarget),
    proteinPct: pct(actual.proteinG, targets.proteinGTarget),
    carbsPct: pct(actual.carbsG, targets.carbsGTarget),
    fatPct: pct(actual.fatG, targets.fatGTarget),
    calorieBalance: targets.caloriesTarget != null ? Math.round(actual.calories - targets.caloriesTarget) : null,
  };
}
