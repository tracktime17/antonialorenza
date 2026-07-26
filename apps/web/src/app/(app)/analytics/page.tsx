import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveNutritionTarget,
  getBodyMetricsInRange,
  getMealsInRange,
  getTransactionsInRange,
  getWorkoutsInRange,
} from "@/lib/data";
import { PROFILE_ID } from "@/lib/profile";
import { computeCashflow, computeCompliance, toISODate, type TransactionType } from "@antonia-os/domain";
import { fmtCLP } from "@/lib/format";
import { MetricLineChart } from "@/components/analytics/metric-line-chart";
import { TssBarChart } from "@/components/analytics/tss-bar-chart";

const RANGES = [
  { key: "3M", label: "3 meses" },
  { key: "6M", label: "6 meses" },
  { key: "12M", label: "12 meses" },
  { key: "YTD", label: "desde enero" },
  { key: "ALL", label: "todo el historial" },
];

function rangeStartDate(range: string, today: Date): Date {
  switch (range) {
    case "3M":
      return new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    case "6M":
      return new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
    case "12M":
      return new Date(today.getFullYear(), today.getMonth() - 12, today.getDate());
    case "YTD":
      return new Date(today.getFullYear(), 0, 1);
    case "ALL":
    default:
      return new Date(2020, 0, 1);
  }
}

function mondayOf(d: Date): Date {
  const day = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  return monday;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const activeRange = RANGES.some((r) => r.key === range) ? (range as string) : "6M";

  const today = new Date();
  const start = rangeStartDate(activeRange, today);
  const startIso = toISODate(start);
  const todayIso = toISODate(today);

  const supabase = createClient();
  const [workouts, meals, transactions, bodyMetrics, nutritionTarget] = await Promise.all([
    getWorkoutsInRange(supabase, PROFILE_ID, startIso, todayIso),
    getMealsInRange(supabase, PROFILE_ID, startIso, todayIso),
    getTransactionsInRange(supabase, PROFILE_ID, startIso, todayIso),
    getBodyMetricsInRange(supabase, PROFILE_ID, startIso, todayIso),
    getActiveNutritionTarget(supabase, PROFILE_ID, todayIso),
  ]);

  const actualWorkouts = (workouts ?? []).filter((w) => w.kind === "actual");
  const totalHours = actualWorkouts.reduce((s, w) => s + (w.duration_min ?? 0), 0) / 60;
  const totalTss = actualWorkouts.reduce((s, w) => s + (w.tss ?? 0), 0);

  const hoursByDiscipline: Record<string, number> = { run: 0, bike: 0, swim: 0, strength: 0, other: 0 };
  for (const w of actualWorkouts) {
    hoursByDiscipline[w.discipline] = (hoursByDiscipline[w.discipline] ?? 0) + (w.duration_min ?? 0) / 60;
  }

  const runWorkouts = actualWorkouts.filter((w) => w.discipline === "run" && w.avg_pace_sec_per_km && w.duration_min);
  const avgPaceSec = runWorkouts.length
    ? runWorkouts.reduce((s, w) => s + (w.avg_pace_sec_per_km ?? 0) * (w.duration_min ?? 0), 0) /
      runWorkouts.reduce((s, w) => s + (w.duration_min ?? 0), 0)
    : null;
  const avgPaceLabel = avgPaceSec ? `${Math.floor(avgPaceSec / 60)}:${String(Math.round(avgPaceSec % 60)).padStart(2, "0")}/km` : "-";

  // training frequency as a proxy for "cumplimiento_entrenamiento" (no planned<->actual link yet)
  const daysInRange = Math.max(1, Math.round((today.getTime() - start.getTime()) / 86400000));
  const daysWithTraining = new Set(actualWorkouts.map((w) => w.date)).size;
  const trainingFrequencyPct = Math.round((daysWithTraining / daysInRange) * 100);

  // weekly TSS buckets, for the chart + best/worst weeks
  const weekMap = new Map<string, number>();
  for (const w of actualWorkouts) {
    const weekStart = toISODate(mondayOf(new Date(w.date)));
    weekMap.set(weekStart, (weekMap.get(weekStart) ?? 0) + (w.tss ?? 0));
  }
  const weeklyTss = [...weekMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([week, tss]) => ({ week: week.slice(5), tss: Math.round(tss) }));
  const rankedWeeks = [...weeklyTss].sort((a, b) => b.tss - a.tss);
  const bestWeeks = rankedWeeks.slice(0, 3);
  const worstWeeks = rankedWeeks.length > 3 ? rankedWeeks.slice(-3).reverse() : [];

  // nutrition compliance: average of daily calories vs target, over days with logged meals
  const mealsByDate = new Map<string, { calories: number }>();
  for (const m of meals ?? []) {
    const existing = mealsByDate.get(m.date) ?? { calories: 0 };
    existing.calories += m.calories ?? 0;
    mealsByDate.set(m.date, existing);
  }
  let nutritionCompliancePct: number | null = null;
  if (nutritionTarget?.calories_target && mealsByDate.size > 0) {
    const pcts = [...mealsByDate.values()].map(
      (d) => computeCompliance({ calories: d.calories, proteinG: 0, carbsG: 0, fatG: 0 }, {
        caloriesTarget: nutritionTarget.calories_target,
        proteinGTarget: null,
        carbsGTarget: null,
        fatGTarget: null,
      }).caloriesPct ?? 0
    );
    nutritionCompliancePct = Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
  }

  const cashflow = computeCashflow(
    (transactions ?? []).map((t) => ({ amount: t.amount, type: t.type as TransactionType, category: t.category }))
  );

  const weightPoints = (bodyMetrics ?? []).filter((m) => m.weight_kg != null).map((m) => ({ date: m.date, value: m.weight_kg as number }));
  const sleepPoints = (bodyMetrics ?? []).filter((m) => m.sleep_hours != null).map((m) => ({ date: m.date, value: m.sleep_hours as number }));
  const hrvPoints = (bodyMetrics ?? []).filter((m) => m.hrv != null).map((m) => ({ date: m.date, value: m.hrv as number }));
  const bodyBatteryPoints = (bodyMetrics ?? []).filter((m) => m.body_battery != null).map((m) => ({ date: m.date, value: m.body_battery as number }));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-app-muted">analiticas</p>
        <h1 className="text-xl font-extrabold text-app-text-bright">Analiticas</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <Link
            key={r.key}
            href={`/analytics?range=${r.key}`}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
              activeRange === r.key ? "border-run bg-run text-white" : "border-app-border text-app-muted hover:border-run hover:text-run"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="horas_entrenadas" value={totalHours.toFixed(1)} sub="total periodo" color="text-run" />
        <StatCard label="tss_total" value={Math.round(totalTss).toString()} sub="total periodo" color="text-bike" />
        <StatCard label="ritmo_promedio_running" value={avgPaceLabel} sub="ponderado por duracion" color="text-run" />
        <StatCard label="cumplimiento_entrenamiento" value={`${trainingFrequencyPct}%`} sub="dias con entrenamiento / dias totales" color="text-income" />
        <StatCard label="cumplimiento_nutricional" value={nutritionCompliancePct != null ? `${nutritionCompliancePct}%` : "-"} sub="kcal promedio vs meta" color="text-nutri" />
        <StatCard label="dinero_gastado" value={fmtCLP(cashflow.expense)} sub="total periodo" color="text-expense" />
        <StatCard label="dinero_ahorrado" value={fmtCLP(cashflow.balance)} sub="balance del periodo" color={cashflow.balance >= 0 ? "text-income" : "text-expense"} />
        <StatCard label="horas_run" value={hoursByDiscipline.run.toFixed(1)} sub={`bici ${hoursByDiscipline.bike.toFixed(1)}h · nado ${hoursByDiscipline.swim.toFixed(1)}h`} color="text-app-text-bright" />
      </div>

      <div className="rounded border border-app-border bg-app-panel p-4">
        <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">evolucion_tss_semanal</h3>
        <TssBarChart points={weeklyTss} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border border-app-border bg-app-panel p-4">
          <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">evolucion_peso</h3>
          <MetricLineChart label="Peso (kg)" color="#16a34a" points={weightPoints} />
        </div>
        <div className="rounded border border-app-border bg-app-panel p-4">
          <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">evolucion_sueno</h3>
          <MetricLineChart label="Sueno (h)" color="#7c4ddb" points={sleepPoints} />
        </div>
        <div className="rounded border border-app-border bg-app-panel p-4">
          <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">evolucion_hrv</h3>
          <MetricLineChart label="HRV" color="#0072ce" points={hrvPoints} />
        </div>
        <div className="rounded border border-app-border bg-app-panel p-4">
          <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">evolucion_body_battery</h3>
          <MetricLineChart label="Body Battery" color="#db2777" points={bodyBatteryPoints} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border border-app-border bg-app-panel p-4">
          <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">mejores_semanas (tss)</h3>
          {bestWeeks.length === 0 ? (
            <p className="text-xs italic text-app-muted-2">Sin datos suficientes.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {bestWeeks.map((w) => (
                <li key={w.week} className="flex justify-between text-app-text">
                  <span>semana {w.week}</span>
                  <span className="font-semibold text-income">{w.tss} TSS</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded border border-app-border bg-app-panel p-4">
          <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">semanas_mas_flojas (tss)</h3>
          {worstWeeks.length === 0 ? (
            <p className="text-xs italic text-app-muted-2">Sin datos suficientes.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {worstWeeks.map((w) => (
                <li key={w.week} className="flex justify-between text-app-text">
                  <span>semana {w.week}</span>
                  <span className="font-semibold text-expense">{w.tss} TSS</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-xs italic text-app-muted-2">
        Aun no se rastrean horas de estudio/horas productivas ni tiempo por proyecto (no hay time-tracking en Proyectos todavia) —
        quedan para una fase futura.
      </p>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-3.5">
      <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-app-muted">{label}</h3>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="mt-0.5 text-[10.5px] text-app-muted">{sub}</div>
    </div>
  );
}
