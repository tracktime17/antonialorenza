import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveZoneSet, getBodyMetricsInRange, getRaces, getWorkoutHistoryForPmc, getWorkoutsInRange } from "@/lib/data";
import { PROFILE_ID } from "@/lib/profile";
import { addMonths, computePmcSeries, toISODate, tsbLabel } from "@antonia-os/domain";
import { CalendarView } from "@/components/calendar/calendar-view";
import { SummaryPanel } from "@/components/training/summary-panel";
import { TrainingCharts } from "@/components/training/training-charts";
import { RaceList } from "@/components/training/race-list";

function parseMonthParam(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function secToMMSS(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function TrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const monthDate = parseMonthParam(month);
  const monthStart = toISODate(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  const monthEnd = toISODate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0));

  const today = new Date();
  const todayIso = toISODate(today);
  const sinceDate = toISODate(new Date(today.getFullYear(), today.getMonth() - 7, today.getDate()));

  const supabase = createClient();

  const [zoneSet, history, races, monthWorkouts, monthBodyMetrics] = await Promise.all([
    getActiveZoneSet(supabase, PROFILE_ID, todayIso),
    getWorkoutHistoryForPmc(supabase, PROFILE_ID, sinceDate),
    getRaces(supabase, PROFILE_ID),
    getWorkoutsInRange(supabase, PROFILE_ID, monthStart, monthEnd),
    getBodyMetricsInRange(supabase, PROFILE_ID, monthStart, monthEnd),
  ]);

  const dailyTss = (history ?? []).map((w) => ({ date: w.date, tss: w.tss ?? 0 }));
  const pmc = computePmcSeries(dailyTss);
  const latest = pmc[pmc.length - 1];

  const byDiscipline: Record<"run" | "bike" | "swim", { tss: number; hours: number }> = {
    run: { tss: 0, hours: 0 },
    bike: { tss: 0, hours: 0 },
    swim: { tss: 0, hours: 0 },
  };
  let totalTss = 0;
  let totalDurationMin = 0;
  let runKm = 0;
  let bikeKm = 0;
  let swimKm = 0;
  let elevationM = 0;
  for (const w of monthWorkouts ?? []) {
    if (w.kind !== "actual") continue;
    totalTss += w.tss ?? 0;
    totalDurationMin += w.duration_min ?? 0;
    elevationM += w.elevation_gain_m ?? 0;
    if (w.discipline === "run" || w.discipline === "bike" || w.discipline === "swim") {
      byDiscipline[w.discipline].tss += w.tss ?? 0;
      byDiscipline[w.discipline].hours += (w.duration_min ?? 0) / 60;
    }
    if (w.discipline === "run") runKm += w.distance_km ?? 0;
    if (w.discipline === "bike") bikeKm += w.distance_km ?? 0;
    if (w.discipline === "swim") swimKm += w.distance_km ?? 0;
  }

  const prevMonth = addMonths(monthDate, -1);
  const nextMonth = addMonths(monthDate, 1);
  const monthLabel = monthDate.toLocaleDateString("es-CL", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-app-muted">
            {zoneSet ? (
              <>
                Umbral running {secToMMSS(zoneSet.run_threshold_sec_per_km ?? 0)}/km · FTP {zoneSet.bike_ftp_watts}W ·
                CSS {secToMMSS(zoneSet.swim_css_sec_per_100m ?? 0)}/100m · desde {zoneSet.effective_from}
              </>
            ) : (
              "sin calibracion registrada"
            )}
          </p>
          <h1 className="text-xl font-extrabold text-app-text-bright">{capitalize(monthLabel)}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/training?month=${monthKey(prevMonth)}`}
            className="rounded border border-app-border px-2.5 py-1 text-sm text-app-text hover:border-run hover:text-run"
          >
            ‹
          </Link>
          <Link
            href={`/training?month=${monthKey(new Date())}`}
            className="rounded border border-app-border px-3 py-1 text-xs text-app-text hover:border-run hover:text-run"
          >
            hoy
          </Link>
          <Link
            href={`/training?month=${monthKey(nextMonth)}`}
            className="rounded border border-app-border px-2.5 py-1 text-sm text-app-text hover:border-run hover:text-run"
          >
            ›
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <CalendarView monthDate={toISODate(monthDate)} workouts={monthWorkouts ?? []} bodyMetrics={monthBodyMetrics ?? []} />
        </div>
        <SummaryPanel
          ctl={latest?.ctl ?? 0}
          atl={latest?.atl ?? 0}
          tsb={latest?.tsb ?? 0}
          tsbCaption={latest ? tsbLabel(latest.tsb) : undefined}
          totals={{ durationMin: totalDurationMin, tss: totalTss, runKm, bikeKm, swimKm, elevationM }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="running.tss" value={Math.round(byDiscipline.run.tss)} sub={`${byDiscipline.run.hours.toFixed(1)} h`} color="text-run" />
        <StatCard label="ciclismo.tss" value={Math.round(byDiscipline.bike.tss)} sub={`${byDiscipline.bike.hours.toFixed(1)} h`} color="text-bike" />
        <StatCard label="natacion.tss" value={Math.round(byDiscipline.swim.tss)} sub={`${byDiscipline.swim.hours.toFixed(1)} h`} color="text-swim" />
        <StatCard label="tss_total_mes" value={Math.round(totalTss)} sub={`${(totalDurationMin / 60).toFixed(1)} h totales`} color="text-app-text-bright" />
      </div>

      <TrainingCharts pmc={pmc} />

      <RaceList races={races ?? []} />
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-3.5">
      <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-app-muted">{label}</h3>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="mt-0.5 text-[10.5px] text-app-muted">{sub}</div>
    </div>
  );
}
