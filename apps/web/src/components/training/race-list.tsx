import { deleteRace, upsertRace } from "@/app/(app)/training/actions";
import type { Tables } from "@/types/database.types";

export function RaceList({ races }: { races: Tables<"races">[] }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-4">
      <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">carreras_objetivo</h3>

      <div className="mb-4 space-y-2">
        {races.length === 0 && <p className="text-xs italic text-app-muted-2">Sin carreras registradas.</p>}
        {races.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded border border-app-border bg-app-panel-2 px-3 py-2"
          >
            <div>
              <p className="text-xs font-semibold text-app-text-bright">
                {r.name}{" "}
                <span className="ml-1 rounded bg-app-panel-3 px-1.5 py-0.5 text-[9px] text-app-muted">
                  {r.priority}
                </span>
              </p>
              <p className="text-[10.5px] text-app-muted">
                {r.date} · {r.distance_type ?? "-"}
                {r.goal_time ? ` · objetivo ${r.goal_time}` : ""}
              </p>
            </div>
            <form action={deleteRace}>
              <input type="hidden" name="id" value={r.id} />
              <button type="submit" className="text-xs text-expense">
                eliminar
              </button>
            </form>
          </div>
        ))}
      </div>

      <form action={upsertRace} className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <input name="date" type="date" required className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <input
          name="name"
          placeholder="nombre (ej. Ironman 70.3 Lima Elite)"
          required
          className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs md:col-span-1"
        />
        <input name="distance_type" placeholder="distancia (ej. 70.3)" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <input name="goal_time" placeholder="objetivo hh:mm:ss" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <select name="priority" defaultValue="A" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs">
          <option value="A">Prioridad A</option>
          <option value="B">Prioridad B</option>
          <option value="C">Prioridad C</option>
        </select>
        <button type="submit" className="col-span-2 rounded bg-run py-1.5 text-xs font-bold text-white md:col-span-3">
          + agregar carrera
        </button>
      </form>
    </div>
  );
}
