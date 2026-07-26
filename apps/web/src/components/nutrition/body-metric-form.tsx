import { upsertBodyMetric } from "@/app/(app)/nutrition/actions";
import type { Tables } from "@/types/database.types";

export function BodyMetricForm({ date, metric }: { date: string; metric: Tables<"body_metrics"> | null }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-4">
      <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">registro_de_hoy</h3>
      <form action={upsertBodyMetric} className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <input type="hidden" name="date" value={date} />
        <input
          name="weight_kg"
          type="number"
          step="0.1"
          defaultValue={metric?.weight_kg ?? ""}
          placeholder="peso (kg)"
          className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
        />
        <input
          name="body_fat_pct"
          type="number"
          step="0.1"
          defaultValue={metric?.body_fat_pct ?? ""}
          placeholder="% grasa"
          className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
        />
        <input
          name="water_l"
          type="number"
          step="0.1"
          defaultValue={metric?.water_l ?? ""}
          placeholder="agua (L)"
          className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
        />
        <input
          name="sleep_hours"
          type="number"
          step="0.1"
          defaultValue={metric?.sleep_hours ?? ""}
          placeholder="sueno (h)"
          className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
        />
        <input
          name="hunger"
          type="number"
          min="1"
          max="5"
          defaultValue={metric?.hunger ?? ""}
          placeholder="hambre (1-5)"
          className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
        />
        <input
          name="energy"
          type="number"
          min="1"
          max="5"
          defaultValue={metric?.energy ?? ""}
          placeholder="energia (1-5)"
          className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
        />
        <input
          name="supplements"
          defaultValue={metric?.supplements ?? ""}
          placeholder="suplementos"
          className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs md:col-span-2"
        />
        <input
          name="notes"
          defaultValue={metric?.notes ?? ""}
          placeholder="notas"
          className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs md:col-span-1"
        />
        <button type="submit" className="col-span-2 rounded bg-nutri py-1.5 text-xs font-bold text-white md:col-span-3">
          guardar
        </button>
      </form>
    </div>
  );
}
