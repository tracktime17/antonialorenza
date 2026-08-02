"use client";

import { useMemo, useState } from "react";
import { buildMonthGrid, toISODate } from "@antonia-os/domain";
import type { Tables } from "@/types/database.types";
import { fmtCLP } from "@/lib/format";
import { FinanceDayModal } from "./finance-day-modal";

type Transaction = Tables<"transactions">;

export function FinanceCalendarView({
  monthDate,
  transactions,
  accounts,
}: {
  monthDate: string;
  transactions: Transaction[];
  accounts: Tables<"accounts">[];
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const grid = useMemo(() => buildMonthGrid(new Date(monthDate)), [monthDate]);

  const byDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const arr = map.get(t.date) ?? [];
      arr.push(t);
      map.set(t.date, arr);
    }
    return map;
  }, [transactions]);

  const todayIso = toISODate(new Date());

  return (
    <div className="overflow-x-auto rounded-md border border-app-border bg-app-panel p-3">
      <div className="min-w-[760px]">
        <div className="mb-2 grid grid-cols-[repeat(7,1fr)_88px] gap-1 text-[10px] uppercase tracking-wide text-app-muted-2">
          {["lun", "mar", "mie", "jue", "vie", "sab", "dom"].map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
          <div />
        </div>
        <div className="space-y-1">
          {grid.map((week, wi) => {
            let weekIncome = 0;
            let weekExpense = 0;
            for (const d of week.days) {
              if (!d) continue;
              const ts = byDate.get(toISODate(d)) ?? [];
              for (const t of ts) {
                if (t.type === "income") weekIncome += t.amount;
                else if (t.type === "expense") weekExpense += t.amount;
              }
            }

            return (
              <div key={wi} className="grid grid-cols-[repeat(7,1fr)_88px] gap-1">
                {week.days.map((d, di) => {
                  if (!d) return <div key={di} className="min-h-[92px] rounded bg-transparent" />;
                  const key = toISODate(d);
                  const dayTx = byDate.get(key) ?? [];
                  const isToday = todayIso === key;
                  return (
                    <button
                      key={di}
                      onClick={() => setSelectedDate(key)}
                      className={`flex min-h-[92px] min-w-0 flex-col rounded border p-1.5 text-left transition-colors ${
                        isToday ? "border-bike" : "border-app-border"
                      } bg-app-panel-2 hover:border-app-border-bright`}
                    >
                      <span className={`text-[11px] ${isToday ? "font-bold text-bike" : "text-app-muted"}`}>{d.getDate()}</span>
                      <div className="mt-1 flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
                        {dayTx.slice(0, 3).map((t) => (
                          <span
                            key={t.id}
                            className={`block w-full truncate rounded px-1.5 py-0.5 text-[9.5px] font-semibold text-white ${
                              t.type === "income" ? "bg-income" : t.type === "savings" ? "bg-savings" : "bg-expense"
                            }`}
                          >
                            {t.type === "income" ? "+" : t.type === "savings" ? "=" : "-"} {fmtCLP(t.amount)}
                          </span>
                        ))}
                        {dayTx.length > 3 && <span className="text-[9px] text-app-muted-2">+{dayTx.length - 3} mas</span>}
                      </div>
                    </button>
                  );
                })}
                <div className="flex flex-col justify-center rounded bg-app-panel-3 p-1 text-center text-[9.5px] text-app-muted">
                  <b className="text-[11px] text-app-text-bright">{fmtCLP(weekIncome - weekExpense)}</b>
                  <span>
                    {fmtCLP(weekIncome)} / {fmtCLP(weekExpense)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <FinanceDayModal
          date={selectedDate}
          transactions={byDate.get(selectedDate) ?? []}
          accounts={accounts}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
