import { upsertNutritionTarget } from "@/app/(app)/nutrition/actions";
import type { Tables } from "@/types/database.types";

export function TargetForm({ target }: { target: Tables<"nutrition_targets"> | null }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-4">
      <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">pauta_nutricional</h3>
      <form action={upsertNutritionTarget} className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <input
          name="effective_from"
          type="date"
          required
          defaultValue={target?.effective_from ?? new Date().toISOString().slice(0, 10)}
          className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
        />
        <input
          name="calories_target"
          type="number"
          defaultValue={target?.calories_target ?? ""}
          placeholder="kcal objetivo"
          className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
        />
        <input
          name="protein_g_target"
          type="number"
          defaultValue={target?.protein_g_target ?? ""}
          placeholder="proteina (g)"
          className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
        />
        <input
          name="carbs_g_target"
          type="number"
          defaultValue={target?.carbs_g_target ?? ""}
          placeholder="carbs (g)"
          className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
        />
        <input
          name="fat_g_target"
          type="number"
          defaultValue={target?.fat_g_target ?? ""}
          placeholder="grasas (g)"
          className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
        />
        <input
          name="notes"
          defaultValue={target?.notes ?? ""}
          placeholder="notas (ej. hiperproteica, deficit leve)"
          className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs md:col-span-4"
        />
        <button type="submit" className="rounded bg-nutri py-1.5 text-xs font-bold text-white">
          guardar
        </button>
      </form>
    </div>
  );
}
