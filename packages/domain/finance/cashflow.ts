export type TransactionType = "income" | "expense" | "transfer";

export interface TransactionLike {
  amount: number;
  type: TransactionType;
  category?: string | null;
}

export interface CashflowSummary {
  income: number;
  expense: number;
  balance: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeCashflow(transactions: TransactionLike[]): CashflowSummary {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else if (t.type === "expense") expense += t.amount;
  }
  return { income: round2(income), expense: round2(expense), balance: round2(income - expense) };
}

/** Simple average-of-recent-months forecast, no seasonality modeling. */
export function forecastNextBalance(monthlyCashflows: CashflowSummary[]): number {
  if (monthlyCashflows.length === 0) return 0;
  const avg = monthlyCashflows.reduce((s, c) => s + c.balance, 0) / monthlyCashflows.length;
  return round2(avg);
}
