"use client";

import { useTransition } from "react";
import { useState } from "react";
import { deleteWorkout, upsertWorkout } from "@/app/(app)/training/actions";
import type { Tables } from "@/types/database.types";

type Workout = Tables<"workouts">;

const DISCIPLINE_OPTIONS = [
  { value: "run", label: "Running" },
  { value: "bike", label: "Ciclismo" },
  { value: "swim", label: "Natacion" },
  { value: "strength", label: "Fuerza" },
  { value: "other", label: "Otro" },
];

export function DayModal({
  date,
  workouts,
  onClose,
}: {
  date: string;
  workouts: Workout[];
  onClose: () => void;
}) {
  const [showForm, setShowForm] = useState(workouts.length === 0);
  const [editing, setEditing] = useState<Workout | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteWorkout(id);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-lg border border-app-border-bright bg-app-panel p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-app-text-bright">{date}</h2>
          <button onClick={onClose} className="text-lg leading-none text-app-muted">
            ×
          </button>
        </div>

        <div className="mb-3 space-y-2">
          {workouts.map((w) => (
            <div key={w.id} className="relative rounded border border-app-border bg-app-panel-2 p-3">
              <button
                onClick={() => handleDelete(w.id)}
                disabled={isPending}
                className="absolute right-2 top-2 text-sm text-expense"
              >
                x
              </button>
              <p className="pr-6 text-xs font-semibold text-app-text-bright">{w.title}</p>
              <p className="text-[11px] text-app-muted">
                {w.discipline} · {w.kind === "planned" ? "planificado" : "real"}
                {w.duration_min ? ` · ${w.duration_min} min` : ""}
                {w.tss ? ` · TSS ${w.tss}` : ""}
                {w.zone_label ? ` · ${w.zone_label}` : ""}
              </p>
              <button
                className="mt-1 text-[11px] text-bike underline"
                onClick={() => {
                  setEditing(w);
                  setShowForm(true);
                }}
              >
                editar
              </button>
            </div>
          ))}
        </div>

        {!showForm && (
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="w-full rounded border border-dashed border-app-border py-2 text-xs text-app-muted hover:border-run hover:text-run"
          >
            + agregar entrenamiento
          </button>
        )}

        {showForm && (
          <form
            action={async (formData) => {
              formData.set("date", date);
              await upsertWorkout(formData);
              setShowForm(false);
              setEditing(null);
            }}
            className="space-y-2 rounded border border-app-border bg-app-panel-2 p-3"
          >
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="grid grid-cols-2 gap-2">
              <select
                name="discipline"
                defaultValue={editing?.discipline ?? "run"}
                className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
              >
                {DISCIPLINE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                name="kind"
                defaultValue={editing?.kind ?? "actual"}
                className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
              >
                <option value="actual">Real</option>
                <option value="planned">Planificado</option>
              </select>
            </div>
            <input
              name="title"
              defaultValue={editing?.title ?? ""}
              placeholder="titulo"
              className="w-full rounded border border-app-border bg-white px-2 py-1.5 text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                name="duration_min"
                type="number"
                step="1"
                defaultValue={editing?.duration_min ?? ""}
                placeholder="duracion (min)"
                className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
              />
              <input
                name="distance_km"
                type="number"
                step="0.1"
                defaultValue={editing?.distance_km ?? ""}
                placeholder="distancia (km)"
                className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="pace"
                defaultValue={editing?.avg_pace_sec_per_km ? secToMMSS(editing.avg_pace_sec_per_km) : ""}
                placeholder="ritmo mm:ss (/km o /100m)"
                className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
              />
              <input
                name="power_watts"
                type="number"
                defaultValue={editing?.avg_power_watts ?? ""}
                placeholder="potencia (W, bici)"
                className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="avg_hr"
                type="number"
                defaultValue={editing?.avg_hr ?? ""}
                placeholder="FC prom"
                className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
              />
              <input
                name="cadence"
                type="number"
                defaultValue={editing?.cadence ?? ""}
                placeholder="cadencia"
                className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
              />
            </div>
            <textarea
              name="description"
              defaultValue={editing?.description ?? ""}
              placeholder="notas"
              className="w-full rounded border border-app-border bg-white px-2 py-1.5 text-xs"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="flex-1 rounded border border-app-border py-1.5 text-xs"
              >
                cancelar
              </button>
              <button type="submit" className="flex-1 rounded bg-run py-1.5 text-xs font-bold text-white">
                guardar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function secToMMSS(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
