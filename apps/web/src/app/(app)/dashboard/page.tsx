import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getLatestBodyMetric,
  getMealsInRange,
  getObjectives,
  getOpenIssuesAcrossProjects,
  getProfile,
  getProjects,
  getSubscriptions,
  getTransactionsInRange,
  getUpcomingRace,
  getWorkoutsInRange,
} from "@/lib/data";
import { PROFILE_ID } from "@/lib/profile";
import { computeCashflow, toISODate, type TransactionType } from "@antonia-os/domain";
import { fmtCLP } from "@/lib/format";

const PRIORITY_RANK: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "buenos_dias";
  if (h < 19) return "buenas_tardes";
  return "buenas_noches";
}

export default async function DashboardPage() {
  const supabase = createClient();

  const todayIso = toISODate(new Date());
  const today = new Date();
  const monthStart = toISODate(new Date(today.getFullYear(), today.getMonth(), 1));
  const monthEnd = toISODate(new Date(today.getFullYear(), today.getMonth() + 1, 0));

  const [profile, bodyMetric, upcomingRace, todaysWorkouts, todaysMeals, monthTransactions, subscriptions, projects, criticalIssues, objectives] =
    await Promise.all([
      getProfile(supabase, PROFILE_ID),
      getLatestBodyMetric(supabase, PROFILE_ID),
      getUpcomingRace(supabase, PROFILE_ID, todayIso),
      getWorkoutsInRange(supabase, PROFILE_ID, todayIso, todayIso),
      getMealsInRange(supabase, PROFILE_ID, todayIso, todayIso),
      getTransactionsInRange(supabase, PROFILE_ID, monthStart, monthEnd),
      getSubscriptions(supabase, PROFILE_ID),
      getProjects(supabase, PROFILE_ID),
      getOpenIssuesAcrossProjects(supabase, PROFILE_ID),
      getObjectives(supabase, PROFILE_ID),
    ]);

  const todayCalories = (todaysMeals ?? []).reduce((sum, m) => sum + (m.calories ?? 0), 0);
  const cashflow = computeCashflow(
    (monthTransactions ?? []).map((t) => ({ amount: t.amount, type: t.type as TransactionType, category: t.category }))
  );
  const nextPayment = (subscriptions ?? [])
    .filter((s) => s.active && s.next_charge_date && s.next_charge_date >= todayIso)
    .sort((a, b) => (a.next_charge_date ?? "").localeCompare(b.next_charge_date ?? ""))[0];

  const mostImportantProject = (projects ?? [])
    .filter((p) => p.status === "active")
    .sort((a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9))[0];

  const currentQuarterObjectives = (objectives ?? []).filter(
    (o) => o.period_type === "quarter" && o.period_start <= todayIso && o.period_end >= todayIso
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-app-muted">{greeting()}</p>
        <h1 className="text-2xl font-extrabold text-app-text-bright">{profile?.display_name ?? "Antonia"}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Sleep" value={bodyMetric?.sleep_hours ? `${bodyMetric.sleep_hours} h` : "—"} />
        <MetricCard label="HRV" value={bodyMetric?.hrv ?? "—"} />
        <MetricCard label="Body Battery" value={bodyMetric?.body_battery ?? "—"} />
        <MetricCard label="Peso" value={bodyMetric?.weight_kg ? `${bodyMetric.weight_kg} kg` : "—"} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="entrenamiento_de_hoy">
          {todaysWorkouts && todaysWorkouts.length > 0 ? (
            <ul className="space-y-2">
              {todaysWorkouts.map((w) => (
                <li key={w.id} className="text-sm text-app-text">
                  <span className="font-semibold">{w.title}</span>{" "}
                  <span className="text-app-muted">
                    · {w.kind === "planned" ? "planificado" : "real"}
                    {w.tss ? ` · TSS ${w.tss}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-app-muted-2">Sin entrenamiento registrado hoy.</p>
          )}
        </Card>

        <Card title="proxima_competencia">
          {upcomingRace ? (
            <div>
              <p className="text-sm font-semibold text-app-text-bright">{upcomingRace.name}</p>
              <p className="text-xs text-app-muted">
                {upcomingRace.date} · {upcomingRace.distance_type ?? "-"} · prioridad {upcomingRace.priority}
              </p>
            </div>
          ) : (
            <p className="text-sm italic text-app-muted-2">Sin carreras registradas todavia.</p>
          )}
        </Card>

        <Card title="comidas_de_hoy">
          {todaysMeals && todaysMeals.length > 0 ? (
            <div>
              <p className="text-sm font-semibold text-app-text-bright">{Math.round(todayCalories)} kcal registradas</p>
              <p className="text-xs text-app-muted">{todaysMeals.length} comida(s) registradas</p>
            </div>
          ) : (
            <p className="text-sm italic text-app-muted-2">Sin comidas registradas hoy.</p>
          )}
        </Card>
        <Card title="finanzas_del_mes">
          <p className="text-sm text-app-text">
            <span className="font-semibold text-income">{fmtCLP(cashflow.income)}</span> ingresos ·{" "}
            <span className="font-semibold text-expense">{fmtCLP(cashflow.expense)}</span> gastos
          </p>
          <p className="mt-1 text-xs text-app-muted">
            balance: <span className={cashflow.balance >= 0 ? "text-income" : "text-expense"}>{fmtCLP(cashflow.balance)}</span>
          </p>
        </Card>

        <Card title="proximo_pago_importante">
          {nextPayment ? (
            <div>
              <p className="text-sm font-semibold text-app-text-bright">{nextPayment.name}</p>
              <p className="text-xs text-app-muted">
                {fmtCLP(nextPayment.amount)} · {nextPayment.next_charge_date}
              </p>
            </div>
          ) : (
            <p className="text-sm italic text-app-muted-2">Sin pagos proximos registrados.</p>
          )}
        </Card>

        <Card title="objetivos_del_trimestre">
          {currentQuarterObjectives.length > 0 ? (
            <ul className="space-y-2">
              {currentQuarterObjectives.map((o) => (
                <li key={o.id} className="text-sm text-app-text">
                  <span className="font-semibold">{o.title}</span> <span className="text-app-muted">· {o.progress_pct}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-app-muted-2">
              Sin objetivos trimestrales activos. <Link href="/objectives" className="underline">agregar</Link>
            </p>
          )}
        </Card>

        <Card title="tareas_criticas">
          {criticalIssues && criticalIssues.length > 0 ? (
            <ul className="space-y-2">
              {criticalIssues.slice(0, 4).map((i) => (
                <li key={i.id} className="text-sm text-app-text">
                  <span className="font-semibold">{i.title}</span>{" "}
                  <span className="text-app-muted">· {(i as { projects?: { name: string } | null }).projects?.name ?? ""}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-app-muted-2">Sin tareas criticas pendientes.</p>
          )}
        </Card>

        <Card title="proyecto_mas_importante">
          {mostImportantProject ? (
            <Link href={`/projects/${mostImportantProject.id}`} className="block">
              <p className="text-sm font-semibold text-app-text-bright hover:underline">{mostImportantProject.name}</p>
              <p className="text-xs text-app-muted">
                prioridad {mostImportantProject.priority} · {mostImportantProject.progress_pct}% avance
              </p>
            </Link>
          ) : (
            <p className="text-sm italic text-app-muted-2">Sin proyectos activos.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-3.5">
      <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-app-muted">{label}</h3>
      <div className="text-xl font-bold text-app-text-bright">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-4">
      <h3 className="mb-2 text-[11px] uppercase tracking-wide text-app-muted">{title}</h3>
      {children}
    </div>
  );
}
