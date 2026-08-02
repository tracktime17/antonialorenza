import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getAccounts,
  getAllTransactions,
  getBudgetsForMonth,
  getSubscriptions,
  getTransactionsInRange,
} from "@/lib/data";
import { PROFILE_ID } from "@/lib/profile";
import {
  computeAccountBalances,
  computeBudgetStatus,
  computeCashflow,
  totalNetWorth,
  type TransactionType,
} from "@antonia-os/domain";
import { CashflowChart } from "@/components/finance/cashflow-chart";
import { FinanceCalendarView } from "@/components/finance/finance-calendar-view";
import { AccountList } from "@/components/finance/account-list";
import { BudgetList } from "@/components/finance/budget-list";
import { SubscriptionList } from "@/components/finance/subscription-list";
import { fmtCLP } from "@/lib/format";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function parseMonthParam(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const monthDate = parseMonthParam(month);
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}-01`;

  const supabase = createClient();

  const [accounts, allTransactions, monthTransactions, budgets, subscriptions] = await Promise.all([
    getAccounts(supabase, PROFILE_ID),
    getAllTransactions(supabase, PROFILE_ID),
    getTransactionsInRange(supabase, PROFILE_ID, ymd(monthStart), ymd(monthEnd)),
    getBudgetsForMonth(supabase, PROFILE_ID, monthStr),
    getSubscriptions(supabase, PROFILE_ID),
  ]);

  const cashflow = computeCashflow(
    (monthTransactions ?? []).map((t) => ({ amount: t.amount, type: t.type as TransactionType, category: t.category }))
  );

  const balances = computeAccountBalances(
    (accounts ?? []).map((a) => ({ id: a.id, name: a.name })),
    (allTransactions ?? []).map((t) => ({ accountId: t.account_id, amount: t.amount, type: t.type as TransactionType }))
  );
  const netWorth = totalNetWorth(balances);

  const budgetStatuses = computeBudgetStatus(
    (budgets ?? []).map((b) => ({ category: b.category, plannedAmount: b.planned_amount })),
    (monthTransactions ?? []).map((t) => ({ amount: t.amount, type: t.type as TransactionType, category: t.category }))
  );

  // "ahorro_acumulado" mirrors the original prototype: the most recent manually-logged
  // savings-type entry in the month, not a sum (savings is tracked as a running balance
  // you re-enter, not a per-transaction addition).
  const savingsEntries = (monthTransactions ?? [])
    .filter((t) => t.type === "savings")
    .sort((a, b) => a.date.localeCompare(b.date));
  const accumulatedSavings = savingsEntries.length > 0 ? savingsEntries[savingsEntries.length - 1].amount : null;

  // Last 6 months cashflow for the chart (small N, one ranged query per month).
  const chartPoints: { month: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(monthDate.getFullYear(), monthDate.getMonth() - i, 1);
    const start = ymd(new Date(d.getFullYear(), d.getMonth(), 1));
    const end = ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    const txs = await getTransactionsInRange(supabase, PROFILE_ID, start, end);
    const cf = computeCashflow((txs ?? []).map((t) => ({ amount: t.amount, type: t.type as TransactionType, category: t.category })));
    chartPoints.push({ month: monthKey(d), income: cf.income, expense: cf.expense });
  }

  const prevMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
  const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
  const monthLabel = monthDate.toLocaleDateString("es-CL", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-app-muted">calendario_financiero</p>
          <h1 className="text-xl font-extrabold text-app-text-bright">{monthLabel[0].toUpperCase() + monthLabel.slice(1)}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/finance?month=${monthKey(prevMonth)}`} className="rounded border border-app-border px-2.5 py-1 text-sm hover:border-bike hover:text-bike">
            ‹
          </Link>
          <Link href={`/finance?month=${monthKey(new Date())}`} className="rounded border border-app-border px-3 py-1 text-xs hover:border-bike hover:text-bike">
            hoy
          </Link>
          <Link href={`/finance?month=${monthKey(nextMonth)}`} className="rounded border border-app-border px-2.5 py-1 text-sm hover:border-bike hover:text-bike">
            ›
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-[10.5px] text-app-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-sm bg-income" /> ingreso
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-sm bg-expense" /> egreso
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-sm bg-savings" /> ahorro
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="ingresos_mes" value={fmtCLP(cashflow.income)} color="text-income" />
        <StatCard label="gastos_mes" value={fmtCLP(cashflow.expense)} color="text-expense" />
        <StatCard label="balance_mes" value={fmtCLP(cashflow.balance)} color={cashflow.balance >= 0 ? "text-income" : "text-expense"} />
        <StatCard label="ahorro_acumulado" value={accumulatedSavings != null ? fmtCLP(accumulatedSavings) : "-"} color="text-savings" />
      </div>

      <FinanceCalendarView monthDate={monthDate.toISOString()} transactions={monthTransactions ?? []} accounts={accounts ?? []} />

      <div className="rounded border border-app-border bg-app-panel p-4">
        <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">evolucion_cashflow (6 meses)</h3>
        <CashflowChart points={chartPoints} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BudgetList month={monthStr} statuses={budgetStatuses} />
        <AccountList balances={balances} netWorth={netWorth} />
      </div>

      <SubscriptionList subscriptions={subscriptions ?? []} />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-3.5">
      <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-app-muted">{label}</h3>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
