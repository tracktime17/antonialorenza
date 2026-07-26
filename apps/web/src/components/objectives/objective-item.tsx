import { deleteObjective, upsertObjective } from "@/app/(app)/objectives/actions";
import type { Tables } from "@/types/database.types";

export function ObjectiveItem({ objective }: { objective: Tables<"objectives"> }) {
  return (
    <div className="rounded border border-app-border bg-app-panel-2 p-3">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-semibold text-app-text-bright">{objective.title}</p>
        <form action={deleteObjective}>
          <input type="hidden" name="id" value={objective.id} />
          <button type="submit" className="text-[10px] text-expense">
            eliminar
          </button>
        </form>
      </div>
      {objective.description && <p className="mb-2 text-[10.5px] text-app-muted">{objective.description}</p>}
      <p className="mb-2 text-[10px] text-app-muted-2">
        {objective.period_start} → {objective.period_end}
      </p>
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-app-panel-3">
        <div className="h-full rounded-full bg-other" style={{ width: `${Math.min(objective.progress_pct, 100)}%` }} />
      </div>
      <form action={upsertObjective} className="flex items-center gap-2">
        <input type="hidden" name="id" value={objective.id} />
        <input type="hidden" name="period_type" value={objective.period_type} />
        <input type="hidden" name="period_start" value={objective.period_start} />
        <input type="hidden" name="period_end" value={objective.period_end} />
        <input type="hidden" name="title" value={objective.title} />
        <input type="hidden" name="description" value={objective.description ?? ""} />
        <input
          name="progress_pct"
          type="number"
          min="0"
          max="100"
          defaultValue={objective.progress_pct}
          className="w-16 rounded border border-app-border bg-white px-2 py-1 text-[11px]"
        />
        <button type="submit" className="rounded bg-other px-2 py-1 text-[10px] font-bold text-white">
          actualizar %
        </button>
      </form>
    </div>
  );
}
