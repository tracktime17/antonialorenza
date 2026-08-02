"use client";

import { useState } from "react";
import { deleteTransaction, upsertTransaction } from "@/app/(app)/finance/actions";
import type { Tables } from "@/types/database.types";
import { fmtCLP } from "@/lib/format";

type Transaction = Tables<"transactions">;

export function FinanceDayModal({
  date,
  transactions,
  accounts,
  onClose,
}: {
  date: string;
  transactions: Transaction[];
  accounts: Tables<"accounts">[];
  onClose: () => void;
}) {
  const [showForm, setShowForm] = useState(transactions.length === 0);
  const [editing, setEditing] = useState<Transaction | null>(null);

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
          {transactions.map((t) => (
            <div key={t.id} className="relative rounded border border-app-border bg-app-panel-2 p-3">
              <form action={deleteTransaction} className="absolute right-2 top-2">
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className="text-sm text-expense">
                  x
                </button>
              </form>
              <p className="pr-6 text-xs font-semibold text-app-text-bright">
                {t.type === "income" ? "+" : t.type === "savings" ? "=" : "-"} {fmtCLP(t.amount)}
              </p>
              <p className="text-[11px] text-app-muted">
                {t.category ?? "sin categoria"}
                {t.description ? ` · ${t.description}` : ""}
              </p>
              <button
                className="mt-1 text-[11px] text-bike underline"
                onClick={() => {
                  setEditing(t);
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
            className="w-full rounded border border-dashed border-app-border py-2 text-xs text-app-muted hover:border-bike hover:text-bike"
          >
            + agregar movimiento
          </button>
        )}

        {showForm && (
          <form
            action={async (formData) => {
              formData.set("date", date);
              await upsertTransaction(formData);
              setShowForm(false);
              setEditing(null);
            }}
            className="space-y-2 rounded border border-app-border bg-app-panel-2 p-3"
          >
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="grid grid-cols-2 gap-2">
              <select
                name="type"
                defaultValue={editing?.type ?? "expense"}
                className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
                <option value="savings">Ahorro</option>
              </select>
              <input
                name="amount"
                type="number"
                step="1"
                defaultValue={editing?.amount ?? ""}
                placeholder="monto"
                required
                className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
              />
            </div>
            <select
              name="account_id"
              defaultValue={editing?.account_id ?? ""}
              className="w-full rounded border border-app-border bg-white px-2 py-1.5 text-xs"
            >
              <option value="">sin cuenta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <input
              name="category"
              defaultValue={editing?.category ?? ""}
              placeholder="categoria"
              className="w-full rounded border border-app-border bg-white px-2 py-1.5 text-xs"
            />
            <input
              name="description"
              defaultValue={editing?.description ?? ""}
              placeholder="descripcion"
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
              <button type="submit" className="flex-1 rounded bg-bike py-1.5 text-xs font-bold text-white">
                guardar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
