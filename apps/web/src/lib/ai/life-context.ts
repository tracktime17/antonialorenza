import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import {
  getAccounts,
  getActiveNutritionTarget,
  getActiveZoneSet,
  getAllTransactions,
  getBodyMetricsInRange,
  getMealsInRange,
  getObjectives,
  getOpenIssuesAcrossProjects,
  getProfile,
  getProjects,
  getSubscriptions,
  getTransactionsInRange,
  getUpcomingRace,
  getWorkoutHistoryForPmc,
  getWorkoutsInRange,
} from "@/lib/data";
import {
  computeAccountBalances,
  computeCashflow,
  computeCompliance,
  computePmcSeries,
  toISODate,
  totalNetWorth,
  tsbLabel,
  type TransactionType,
} from "@antonia-os/domain";

type TypedClient = SupabaseClient<Database>;

/**
 * Builds a compact, human-readable snapshot of every module so the AI chat
 * has real context without dumping the entire database into every prompt.
 * Kept to summaries + a short recent-history table (not full row dumps) to
 * keep token usage bounded as history grows over years.
 */
export async function buildLifeContext(supabase: TypedClient, profileId: string): Promise<string> {
  const today = new Date();
  const todayIso = toISODate(today);
  const last90 = toISODate(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()));
  const last30 = toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30));
  const monthStart = toISODate(new Date(today.getFullYear(), today.getMonth(), 1));
  const monthEnd = toISODate(new Date(today.getFullYear(), today.getMonth() + 1, 0));

  const [
    profile,
    zoneSet,
    upcomingRace,
    workoutHistory,
    last30Workouts,
    nutritionTarget,
    last30Meals,
    last30BodyMetrics,
    monthTransactions,
    allTransactions,
    accounts,
    subscriptions,
    projects,
    criticalIssues,
    objectives,
  ] = await Promise.all([
    getProfile(supabase, profileId),
    getActiveZoneSet(supabase, profileId, todayIso),
    getUpcomingRace(supabase, profileId, todayIso),
    getWorkoutHistoryForPmc(supabase, profileId, last90),
    getWorkoutsInRange(supabase, profileId, last30, todayIso),
    getActiveNutritionTarget(supabase, profileId, todayIso),
    getMealsInRange(supabase, profileId, last30, todayIso),
    getBodyMetricsInRange(supabase, profileId, last30, todayIso),
    getTransactionsInRange(supabase, profileId, monthStart, monthEnd),
    getAllTransactions(supabase, profileId),
    getAccounts(supabase, profileId),
    getSubscriptions(supabase, profileId),
    getProjects(supabase, profileId),
    getOpenIssuesAcrossProjects(supabase, profileId),
    getObjectives(supabase, profileId),
  ]);

  const pmc = computePmcSeries((workoutHistory ?? []).map((w) => ({ date: w.date, tss: w.tss ?? 0 })));
  const latestPmc = pmc[pmc.length - 1];

  const hoursByDiscipline: Record<string, number> = {};
  for (const w of (last30Workouts ?? []).filter((w) => w.kind === "actual")) {
    hoursByDiscipline[w.discipline] = (hoursByDiscipline[w.discipline] ?? 0) + (w.duration_min ?? 0) / 60;
  }

  const cashflowMonth = computeCashflow(
    (monthTransactions ?? []).map((t) => ({ amount: t.amount, type: t.type as TransactionType, category: t.category }))
  );
  const balances = computeAccountBalances(
    (accounts ?? []).map((a) => ({ id: a.id, name: a.name })),
    (allTransactions ?? []).map((t) => ({ accountId: t.account_id, amount: t.amount, type: t.type as TransactionType }))
  );
  const netWorth = totalNetWorth(balances);

  const mealsByDate = new Map<string, { calories: number; proteinG: number; carbsG: number; fatG: number }>();
  for (const m of last30Meals ?? []) {
    const cur = mealsByDate.get(m.date) ?? { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
    cur.calories += m.calories ?? 0;
    cur.proteinG += m.protein_g ?? 0;
    cur.carbsG += m.carbs_g ?? 0;
    cur.fatG += m.fat_g ?? 0;
    mealsByDate.set(m.date, cur);
  }
  let avgCaloriesCompliance: number | null = null;
  if (nutritionTarget?.calories_target && mealsByDate.size > 0) {
    const pcts = [...mealsByDate.values()].map(
      (d) =>
        computeCompliance(d, {
          caloriesTarget: nutritionTarget.calories_target,
          proteinGTarget: nutritionTarget.protein_g_target,
          carbsGTarget: nutritionTarget.carbs_g_target,
          fatGTarget: nutritionTarget.fat_g_target,
        }).caloriesPct ?? 0
    );
    avgCaloriesCompliance = Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
  }

  const bodyMetricsByDate = new Map((last30BodyMetrics ?? []).map((m) => [m.date, m]));
  const runByDate = new Map(
    (last30Workouts ?? [])
      .filter((w) => w.kind === "actual" && w.discipline === "run" && w.avg_pace_sec_per_km)
      .map((w) => [w.date, w.avg_pace_sec_per_km as number])
  );
  const dailyTableRows: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - i));
    const bm = bodyMetricsByDate.get(d);
    const pace = runByDate.get(d);
    if (!bm && !pace) continue;
    const paceLabel = pace ? `${Math.floor(pace / 60)}:${String(Math.round(pace % 60)).padStart(2, "0")}/km` : "-";
    dailyTableRows.push(
      `${d} | sueno=${bm?.sleep_hours ?? "-"}h | hrv=${bm?.hrv ?? "-"} | body_battery=${bm?.body_battery ?? "-"} | peso=${bm?.weight_kg ?? "-"}kg | ritmo_run=${paceLabel}`
    );
  }

  const lines: string[] = [];
  lines.push(`Perfil: ${profile?.display_name ?? "Antonia"}. Fecha de hoy: ${todayIso}.`);

  lines.push("\n== ENTRENAMIENTO ==");
  if (zoneSet) {
    lines.push(
      `Calibracion activa (desde ${zoneSet.effective_from}): umbral running ${zoneSet.run_threshold_sec_per_km}s/km, FTP bici ${zoneSet.bike_ftp_watts}W, CSS nado ${zoneSet.swim_css_sec_per_100m}s/100m.`
    );
  }
  if (latestPmc) {
    lines.push(`PMC actual: CTL(fitness)=${latestPmc.ctl}, ATL(fatiga)=${latestPmc.atl}, TSB(forma)=${latestPmc.tsb} (${tsbLabel(latestPmc.tsb)}).`);
  }
  lines.push(
    `Horas entrenadas ultimos 30 dias por disciplina: ${Object.entries(hoursByDiscipline)
      .map(([d, h]) => `${d}=${h.toFixed(1)}h`)
      .join(", ") || "sin datos"}.`
  );
  if (upcomingRace) {
    lines.push(
      `Proxima carrera objetivo: ${upcomingRace.name} el ${upcomingRace.date} (${upcomingRace.distance_type ?? "-"}, prioridad ${upcomingRace.priority}).`
    );
  } else {
    lines.push("Sin carrera objetivo registrada.");
  }

  lines.push("\n== NUTRICION ==");
  if (nutritionTarget) {
    lines.push(
      `Pauta activa (desde ${nutritionTarget.effective_from}): ${nutritionTarget.calories_target ?? "-"} kcal, ${nutritionTarget.protein_g_target ?? "-"}g proteina, ${nutritionTarget.carbs_g_target ?? "-"}g carbos, ${nutritionTarget.fat_g_target ?? "-"}g grasas. ${nutritionTarget.notes ?? ""}`
    );
  } else {
    lines.push("Sin pauta nutricional cargada.");
  }
  lines.push(`Cumplimiento calorico promedio (ultimos 30 dias con registro): ${avgCaloriesCompliance != null ? avgCaloriesCompliance + "%" : "sin datos suficientes"}.`);

  lines.push("\n== FINANZAS ==");
  lines.push(`Este mes: ingresos ${cashflowMonth.income}, gastos ${cashflowMonth.expense}, balance ${cashflowMonth.balance} (moneda local).`);
  lines.push(`Patrimonio total (suma de cuentas): ${netWorth}.`);
  const upcomingPayments = (subscriptions ?? []).filter((s) => s.active && s.next_charge_date && s.next_charge_date >= todayIso);
  if (upcomingPayments.length > 0) {
    lines.push(
      `Proximos pagos/suscripciones: ${upcomingPayments.map((s) => `${s.name} (${s.amount}, ${s.next_charge_date})`).join("; ")}`
    );
  }

  lines.push("\n== PROYECTOS ==");
  if ((projects ?? []).length === 0) {
    lines.push("Sin proyectos registrados.");
  } else {
    for (const p of projects ?? []) {
      lines.push(`- ${p.name}: estado=${p.status}, prioridad=${p.priority}, avance=${p.progress_pct}%${p.deadline ? `, deadline=${p.deadline}` : ""}`);
    }
  }
  if (criticalIssues && criticalIssues.length > 0) {
    lines.push(
      `Issues criticos abiertos: ${criticalIssues
        .map((i) => `"${i.title}" (${(i as { projects?: { name: string } | null }).projects?.name ?? ""}, prioridad ${i.priority})`)
        .join("; ")}`
    );
  }

  lines.push("\n== OBJETIVOS (OKRs) ==");
  if ((objectives ?? []).length === 0) {
    lines.push("Sin objetivos registrados.");
  } else {
    for (const o of objectives ?? []) {
      lines.push(`- [${o.period_type}] ${o.title}: ${o.progress_pct}% (${o.period_start} a ${o.period_end})`);
    }
  }

  if (dailyTableRows.length > 0) {
    lines.push("\n== HISTORIAL DIARIO RECIENTE (para preguntas de correlacion) ==");
    lines.push(...dailyTableRows);
  }

  return lines.join("\n");
}
