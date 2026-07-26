import { upsertObjective } from "@/app/(app)/objectives/actions";

export function ObjectiveForm() {
  return (
    <form action={upsertObjective} className="grid grid-cols-2 gap-2 rounded border border-app-border bg-app-panel p-4 md:grid-cols-4">
      <select name="period_type" defaultValue="quarter" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs">
        <option value="year">Anual</option>
        <option value="quarter">Trimestral</option>
        <option value="month">Mensual</option>
        <option value="week">Semanal</option>
      </select>
      <input name="period_start" type="date" required className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
      <input name="period_end" type="date" required className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
      <input name="progress_pct" type="number" min="0" max="100" placeholder="% inicial" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
      <input name="title" placeholder="objetivo" required className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs md:col-span-2" />
      <input name="description" placeholder="descripcion" className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs md:col-span-2" />
      <button type="submit" className="col-span-2 rounded bg-other py-1.5 text-xs font-bold text-white md:col-span-4">
        + agregar objetivo
      </button>
    </form>
  );
}
