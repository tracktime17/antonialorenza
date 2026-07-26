"use client";

import { useMemo, useState } from "react";
import { buildMonthGrid, toISODate } from "@antonia-os/domain";
import type { Tables } from "@/types/database.types";
import { DayModal } from "./day-modal";

type Workout = Tables<"workouts">;

const FILTERS = [
  { key: "run", label: "Running" },
  { key: "bike", label: "Ciclismo" },
  { key: "swim", label: "Natacion" },
  { key: "strength", label: "Fuerza/Otro" },
];

export function CalendarView({ monthDate, workouts }: { monthDate: string; workouts: Workout[] }) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const grid = useMemo(() => buildMonthGrid(new Date(monthDate)), [monthDate]);

  const allByDate = useMemo(() => {
    const map = new Map<string, Workout[]>();
    for (const w of workouts) {
      const arr = map.get(w.date) ?? [];
      arr.push(w);
      map.set(w.date, arr);
    }
    return map;
  }, [workouts]);

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

      <div className="overflow-x-auto rounded-md border border-app-border bg-app-panel p-3">
        <div className="min-w-[760px]">
          <div className="mb-2 grid grid-cols-[repeat(7,1fr)_72px] gap-1 text-[10px] uppercase tracking-wide text-app-muted-2">
            {["lun", "mar", "mie", "jue", "vie", "sab", "dom"].map((d) => (
              <div key={d} className="text-center">
                {d}
              </div>
            ))}
            <div />
          </div>
          <div className="space-y-1">
            {grid.map((week, wi) => {
              const weekTss = week.days.reduce((sum, d) => {
                if (!d) return sum;
                const ws = filteredByDate.get(toISODate(d)) ?? [];
                return sum + ws.reduce((s, w) => s + (w.tss ?? 0), 0);
              }, 0);
              const weekHours = week.days.reduce((sum, d) => {
                if (!d) return sum;
                const ws = filteredByDate.get(toISODate(d)) ?? [];
                return sum + ws.reduce((s, w) => s + (w.duration_min ?? 0), 0);
              }, 0) / 60;

              return (
                <div key={wi} className="grid grid-cols-[repeat(7,1fr)_72px] gap-1">
                  {week.days.map((d, di) => {
                    if (!d) return <div key={di} className="min-h-[92px] rounded bg-transparent" />;
                    const key = toISODate(d);
                    const dayWorkouts = filteredByDate.get(key) ?? [];
                    const isToday = todayIso === key;
                    return (
                      <button
                        key={di}
                        onClick={() => setSelectedDate(key)}
                        className={`flex min-h-[92px] min-w-0 flex-col rounded border p-1.5 text-left transition-colors ${
                          isToday ? "border-run" : "border-app-border"
                        } bg-app-panel-2 hover:border-app-border-bright`}
                      >
                        <span className={`text-[11px] ${isToday ? "font-bold text-run" : "text-app-muted"}`}>
                          {d.getDate()}
                        </span>
                        <div className="mt-1 flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
                          {dayWorkouts.slice(0, 3).map((w) => (
                            <span
                              key={w.id}
                              className={
                                w.kind === "planned"
                                  ? "block w-full truncate rounded border border-dashed border-planned bg-white px-1.5 py-0.5 text-[9.5px] font-bold text-planned"
                                  : `block w-full truncate rounded px-1.5 py-0.5 text-[9.5px] font-semibold text-white ${disciplineBg(
                                      w.discipline
                                    )}`
                              }
                            >
                              {w.title}
                            </span>
                          ))}
                          {dayWorkouts.length > 3 && (
                            <span className="text-[9px] text-app-muted-2">+{dayWorkouts.length - 3} mas</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  <div className="flex flex-col justify-center rounded bg-app-panel-3 p-1 text-center text-[9.5px] text-app-muted">
                    <b className="text-[11px] text-app-text-bright">{Math.round(weekTss)}</b>
                    TSS · {weekHours.toFixed(1)}h
                  </div>
                </div>
              );
            })}
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

function disciplineBg(discipline: Workout["discipline"]) {
  switch (discipline) {
    case "run":
      return "bg-run";
    case "bike":
      return "bg-bike";
    case "swim":
      return "bg-swim";
    default:
      return "bg-other";
  }
}
