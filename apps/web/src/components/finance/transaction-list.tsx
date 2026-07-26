import { deleteTransaction, upsertTransaction } from "@/app/(app)/finance/actions";
import type { Tables } from "@/types/database.types";
import { fmtCLP } from "@/lib/format";

export function TransactionList({
  transactions,
  accounts,
}: {
  transactions: Tables<"transactions">[];
  accounts: Tables<"accounts">[];
}) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-4">
      <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">movimientos_del_mes</h3>

      <div className="mb-4 max-h-80 space-y-2 overflow-y-auto">
        {transactions.length === 0 && <p className="text-xs italic text-app-muted-2">Sin movimientos este mes.</p>}
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded border border-app-border bg-app-panel-2 px-3 py-2">
            <div>
              <p className="text-xs font-semibold text-app-text-bright">
                {t.description || t.category || "Movimiento"}{" "}
                <span className={`ml-1 font-bold ${t.type === "income" ? "text-income" : "text-expense"}`}>
                  {t.type === "income" ? "+" : "-"}
                  {fmtCLP(t.amount)}
                </span>
              </p>
              <p className="text-[10.5px] text-app-muted">
                {t.date} {t.category ? `· ${t.category}` : ""}
              </p>
            </div>
            <form action={deleteTransaction}>
              <input type="hidden" name="id" value={t.id} />
              <button type="submit" className="text-xs text-expense">
                eliminar
              </button>
            </form>
          </div>
        ))}
      </div>

      <form action={upsertTransaction} className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <input name="date" type="date" required className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <select name="type" defaultValue="expense" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs">
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>
        <input name="amount" type="number" step="1" placeholder="monto" required className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <select name="account_id" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs">
          <option value="">sin cuenta</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <input name="category" placeholder="categoria" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <input name="description" placeholder="descripcion" className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs md:col-span-2" />
        <button type="submit" className="col-span-2 rounded bg-bike py-1.5 text-xs font-bold text-white md:col-span-4">
          + agregar movimiento
        </button>
      </form>
    </div>
  );
}
