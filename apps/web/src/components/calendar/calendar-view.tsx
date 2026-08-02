"use client";

import { useMemo, useState } from "react";
import { buildMonthGrid, parseISODate, toISODate } from "@antonia-os/domain";
import type { Tables } from "@/types/database.types";
import { DayModal } from "./day-modal";
import { WorkoutCard } from "./workout-card";

type Workout = Tables<"workouts">;
type BodyMetric = Tables<"body_metrics">;

const FILTERS = [
  { key: "run", label: "Running" },
  { key: "bike", label: "Ciclismo" },
  { key: "swim", label: "Natacion" },
  { key: "strength", label: "Fuerza/Otro" },
];

export function CalendarView({
  monthDate,
  workouts,
  bodyMetrics = [],
}: {
  monthDate: string;
  workouts: Workout[];
  bodyMetrics?: BodyMetric[];
}) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const grid = useMemo(() => buildMonthGrid(parseISODate(monthDate)), [monthDate]);

  const allByDate = useMemo(() => {
    const map = new Map<string, Workout[]>();
    for (const w of workouts) {
      const arr = map.get(w.date) ?? [];
      arr.push(w);
      map.set(w.date, arr);
    }
    return map;
  }, [workouts]);

  const metricsByDate = useMemo(() => {
    const map = new Map<string, BodyMetric>();
    for (const m of bodyMetrics) map.set(m.date, m);
    return map;
  }, [bodyMetrics]);

  const filteredByDate = useMemo(() => {
    if (activeFilters.size === 0) return allByDate;
    const map = new Map<string, Workout[]>();
    for (const [date, ws] of allByDate) {
      const filtered = ws.filter((w) => activeFilters.has(matchFilterKey(w.discipline)));
      if (filtered.length > 0) map.set(date, filtered);
    }
    return map;
  }, [allByDate, activeFilters]);

  function toggleFilter(key: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const todayIso = toISODate(new Date());

  const upcomingPlanned = useMemo(() => {
    return workouts
      .filter((w) => w.kind === "planned" && w.date >= todayIso)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);
  }, [workouts, todayIso]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => toggleFilter(f.key)}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
              activeFilters.size === 0 || activeFilters.has(f.key)
                ? "border-app-border-bright text-app-text"
                : "border-app-border text-app-muted-2 opacity-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded border border-app-border border-l-2 border-l-planned bg-app-panel-2 px-3 py-2">
        <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-planned">proximos_entrenos_planificados</h4>
        {upcomingPlanned.length === 0 ? (
          <p className="text-[11px] italic text-app-muted-2">
            sin sesiones planificadas — marca &quot;planificado&quot; al crear una sesion futura para que aparezca aqui
          </p>
        ) : (
          <div className="space-y-1">
            {upcomingPlanned.map((w) => (
              <div key={w.id} className="flex justify-between border-b border-dashed border-app-border pb-1 text-[11px] last:border-none last:pb-0">
                <span className="text-app-text">
                  [{w.discipline}] {w.title}
                </span>
                <span className="text-app-muted">{w.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border border-app-border bg-app-panel p-3">
        <div className="min-w-[900px]">
          <div className="mb-2 grid grid-cols-7 gap-1 text-[10px] uppercase tracking-wide text-app-muted-2">
            {["lun", "mar", "mie", "jue", "vie", "sab", "dom"].map((d) => (
              <div key={d} className="text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {grid.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.days.map((d, di) => {
                  if (!d) return <div key={di} className="min-h-[110px] rounded bg-transparent" />;
                  const key = toISODate(d);
                  const dayWorkouts = filteredByDate.get(key) ?? [];
                  const metric = metricsByDate.get(key);
                  const isToday = todayIso === key;
                  return (
                    <button
                      key={di}
                      onClick={() => setSelectedDate(key)}
                      className={`flex min-h-[110px] min-w-0 flex-col rounded border p-1 text-left transition-colors ${
                        isToday ? "border-run" : "border-app-border"
                      } bg-app-panel-2 hover:border-app-border-bright`}
                    >
                      <span className={`px-0.5 text-[11px] ${isToday ? "font-bold text-run" : "text-app-muted"}`}>
                        {d.getDate()}
                      </span>

                      {metric && (metric.sleep_hours != null || metric.body_battery != null || metric.hrv != null) && (
                        <div className="mb-0.5 rounded bg-app-panel-3 px-1.5 py-0.5 text-[8.5px] leading-tight text-app-muted">
                          {metric.sleep_hours != null && <div>Sueno: {metric.sleep_hours}h</div>}
                          {metric.body_battery != null && <div>Body Battery: {metric.body_battery}</div>}
                          {metric.hrv != null && <div>HRV: {metric.hrv}</div>}
                        </div>
                      )}

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        {dayWorkouts.map((w) => (
                          <WorkoutCard key={w.id} workout={w} />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          workouts={allByDate.get(selectedDate) ?? []}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

function matchFilterKey(discipline: Workout["discipline"]) {
  if (discipline === "run" || discipline === "bike" || discipline === "swim") return discipline;
  return "strength";
}
