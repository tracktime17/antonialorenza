import { createClient } from "@/lib/supabase/server";
import {
  getActiveNutritionTarget,
  getBodyMetricForDate,
  getBodyMetricsInRange,
  getMealsInRange,
} from "@/lib/data";
import { PROFILE_ID } from "@/lib/profile";
import { computeCompliance, projectWeight, toISODate, weightTrend } from "@antonia-os/domain";
import { WeightChart } from "@/components/nutrition/weight-chart";
import { MealList } from "@/components/nutrition/meal-list";
import { BodyMetricForm } from "@/components/nutrition/body-metric-form";
import { TargetForm } from "@/components/nutrition/target-form";

export default async function NutritionPage() {
  const supabase = createClient();
  const today = new Date();
  const todayIso = toISODate(today);
  const rangeStart = toISODate(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()));

  const [target, todaysMeals, bodyMetrics, todaysMetric] = await Promise.all([
    getActiveNutritionTarget(supabase, PROFILE_ID, todayIso),
    getMealsInRange(supabase, PROFILE_ID, todayIso, todayIso),
    getBodyMetricsInRange(supabase, PROFILE_ID, rangeStart, todayIso),
    getBodyMetricForDate(supabase, PROFILE_ID, todayIso),
  ]);

  const todayTotals = (todaysMeals ?? []).reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      proteinG: acc.proteinG + (m.protein_g ?? 0),
      carbsG: acc.carbsG + (m.carbs_g ?? 0),
      fatG: acc.fatG + (m.fat_g ?? 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  const compliance = computeCompliance(todayTotals, {
    caloriesTarget: target?.calories_target ?? null,
    proteinGTarget: target?.protein_g_target ?? null,
    carbsGTarget: target?.carbs_g_target ?? null,
    fatGTarget: target?.fat_g_target ?? null,
  });

  const weightPoints = (bodyMetrics ?? [])
    .filter((m) => m.weight_kg != null)
    .map((m) => ({ date: m.date, weightKg: m.weight_kg as number }));
  const trend = weightTrend(weightPoints);

  // Average calorie balance over the last 14 days that actually have logged meals + a target
  const last14 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
  const recentDaysWithMeals = new Map<string, { calories: number }>();
  for (const m of (await getMealsInRange(supabase, PROFILE_ID, toISODate(last14), todayIso)) ?? []) {
    const existing = recentDaysWithMeals.get(m.date) ?? { calories: 0 };
    existing.calories += m.calories ?? 0;
    recentDaysWithMeals.set(m.date, existing);
  }
  let projectedWeight: number | null = null;
  if (target?.calories_target && recentDaysWithMeals.size > 0 && trend) {
    const balances = [...recentDaysWithMeals.values()].map((d) => d.calories - (target.calories_target ?? 0));
    const avgBalance = balances.reduce((a, b) => a + b, 0) / balances.length;
    projectedWeight = projectWeight(trend.endKg, avgBalance, 30);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-app-muted">nutricion</p>
        <h1 className="text-xl font-extrabold text-app-text-bright">Nutricion</h1>
      </div>

      <TargetForm target={target} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="cumplimiento_kcal" value={compliance.caloriesPct != null ? `${compliance.caloriesPct}%` : "-"} sub={`${Math.round(todayTotals.calories)} kcal hoy`} color="text-nutri" />
        <StatCard label="cumplimiento_proteina" value={compliance.proteinPct != null ? `${compliance.proteinPct}%` : "-"} sub={`${Math.round(todayTotals.proteinG)} g hoy`} color="text-run" />
        <StatCard
          label="balance_calorico"
          value={compliance.calorieBalance != null ? (compliance.calorieBalance > 0 ? `+${compliance.calorieBalance}` : `${compliance.calorieBalance}`) : "-"}
          sub={compliance.calorieBalance == null ? "-" : compliance.calorieBalance > 0 ? "superavit hoy" : "deficit hoy"}
          color={compliance.calorieBalance != null && compliance.calorieBalance > 0 ? "text-expense" : "text-income"}
        />
        <StatCard
          label="peso_proyectado_30d"
          value={projectedWeight != null ? `${projectedWeight} kg` : "-"}
          sub={trend ? `hoy ${trend.endKg} kg` : "sin pesajes"}
          color="text-app-text-bright"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BodyMetricForm date={todayIso} metric={todaysMetric} />
        <div className="rounded border border-app-border bg-app-panel p-4">
          <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">evolucion_peso</h3>
          <WeightChart points={weightPoints} />
        </div>
      </div>

      <MealList date={todayIso} meals={todaysMeals ?? []} />
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-3.5">
      <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-app-muted">{label}</h3>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="mt-0.5 text-[10.5px] text-app-muted">{sub}</div>
    </div>
  );
}
