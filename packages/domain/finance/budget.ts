import type { TransactionLike } from "./cashflow";

export interface BudgetLine {
  category: string;
  plannedAmount: number;
}

export interface BudgetStatus {
  category: string;
  planned: number;
  actual: number;
  remaining: number;
  pct: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function computeBudgetStatus(budgets: BudgetLine[], transactions: TransactionLike[]): BudgetStatus[] {
  const spentByCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const cat = t.category ?? "sin categoria";
    spentByCategory.set(cat, (spentByCategory.get(cat) ?? 0) + t.amount);
  }

  return budgets.map((b) => {
    const actual = spentByCategory.get(b.category) ?? 0;
    return {
      category: b.category,
      planned: b.plannedAmount,
      actual: round2(actual),
      remaining: round2(b.plannedAmount - actual),
      pct: b.plannedAmount ? round1((actual / b.plannedAmount) * 100) : 0,
    };
  });
}
