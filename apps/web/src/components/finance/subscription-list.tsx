import { deleteSubscription, upsertSubscription } from "@/app/(app)/finance/actions";
import type { Tables } from "@/types/database.types";
import { fmtCLP } from "@/lib/format";

export function SubscriptionList({ subscriptions }: { subscriptions: Tables<"subscriptions">[] }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-4">
      <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">suscripciones</h3>

      <div className="mb-4 space-y-2">
        {subscriptions.length === 0 && <p className="text-xs italic text-app-muted-2">Sin suscripciones registradas.</p>}
        {subscriptions.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded border border-app-border bg-app-panel-2 px-3 py-2">
            <div>
              <p className="text-xs font-semibold text-app-text-bright">{s.name}</p>
              <p className="text-[10.5px] text-app-muted">
                {fmtCLP(s.amount)} / {s.billing_cycle} · proximo cobro {s.next_charge_date ?? "-"}
              </p>
            </div>
            <form action={deleteSubscription}>
              <input type="hidden" name="id" value={s.id} />
              <button type="submit" className="text-xs text-expense">
                eliminar
              </button>
            </form>
          </div>
        ))}
      </div>

      <form action={upsertSubscription} className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <input name="name" placeholder="nombre" required className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs md:col-span-1" />
        <input name="amount" type="number" placeholder="monto" required className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <select name="billing_cycle" defaultValue="monthly" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs">
          <option value="monthly">Mensual</option>
          <option value="yearly">Anual</option>
        </select>
        <input name="next_charge_date" type="date" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <button type="submit" className="col-span-2 rounded bg-bike py-1.5 text-xs font-bold text-white md:col-span-4">
          + agregar suscripcion
        </button>
      </form>
    </div>
  );
}
