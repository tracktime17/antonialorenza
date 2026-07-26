import { upsertBudget } from "@/app/(app)/finance/actions";
import type { BudgetStatus } from "@antonia-os/domain";
import { fmtCLP } from "@/lib/format";

export function BudgetList({ month, statuses }: { month: string; statuses: BudgetStatus[] }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-4">
      <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">presupuesto_del_mes</h3>

      <div className="mb-4 space-y-3">
        {statuses.length === 0 && <p className="text-xs italic text-app-muted-2">Sin categorias presupuestadas este mes.</p>}
        {statuses.map((s) => (
          <div key={s.category}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-app-text-bright">{s.category}</span>
              <span className="text-app-muted">
                {fmtCLP(s.actual)} / {fmtCLP(s.planned)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-app-panel-3">
              <div
                className={`h-full rounded-full ${s.pct > 100 ? "bg-expense" : "bg-income"}`}
                style={{ width: `${Math.min(s.pct, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <form action={upsertBudget} className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <input type="hidden" name="month" value={month} />
        <input name="category" placeholder="categoria" required className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <input name="planned_amount" type="number" placeholder="monto planeado" required className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <button type="submit" className="col-span-2 rounded bg-bike py-1.5 text-xs font-bold text-white md:col-span-2">
          + agregar / actualizar categoria
        </button>
      </form>
    </div>
  );
}
