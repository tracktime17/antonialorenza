import { deleteAccount, upsertAccount } from "@/app/(app)/finance/actions";
import type { AccountBalance } from "@antonia-os/domain";
import { fmtCLP } from "@/lib/format";

export function AccountList({ balances, netWorth }: { balances: AccountBalance[]; netWorth: number }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] uppercase tracking-wide text-app-muted">cuentas</h3>
        <p className="text-[11px] text-app-muted">
          patrimonio: <span className="font-bold text-app-text-bright">{fmtCLP(netWorth)}</span>
        </p>
      </div>

      <div className="mb-4 space-y-2">
        {balances.length === 0 && <p className="text-xs italic text-app-muted-2">Sin cuentas registradas.</p>}
        {balances.map((b) => (
          <div key={b.accountId} className="flex items-center justify-between rounded border border-app-border bg-app-panel-2 px-3 py-2">
            <p className="text-xs font-semibold text-app-text-bright">{b.accountName}</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${b.balance >= 0 ? "text-income" : "text-expense"}`}>{fmtCLP(b.balance)}</span>
              <form action={deleteAccount}>
                <input type="hidden" name="id" value={b.accountId} />
                <button type="submit" className="text-xs text-expense">
                  x
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <form action={upsertAccount} className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <input name="name" placeholder="nombre cuenta" required className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs md:col-span-1" />
        <select name="type" defaultValue="checking" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs">
          <option value="checking">Corriente</option>
          <option value="savings">Ahorro</option>
          <option value="credit">Credito</option>
          <option value="investment">Inversion</option>
          <option value="cash">Efectivo</option>
        </select>
        <input name="currency" defaultValue="CLP" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <button type="submit" className="col-span-2 rounded bg-bike py-1.5 text-xs font-bold text-white md:col-span-3">
          + agregar cuenta
        </button>
      </form>
    </div>
  );
}
