import type { TransactionType } from "./cashflow";

export interface AccountLike {
  id: string;
  name: string;
}

export interface TransactionForBalance {
  accountId: string | null;
  amount: number;
  type: TransactionType;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  balance: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Balances are derived from the transaction ledger (single source of truth),
 * not stored redundantly on the account row. Transfers are excluded for now —
 * only income/expense affect balance until paired transfer legs are modeled.
 */
export function computeAccountBalances(accounts: AccountLike[], transactions: TransactionForBalance[]): AccountBalance[] {
  const balances = new Map<string, number>();
  for (const t of transactions) {
    if (!t.accountId) continue;
    const delta = t.type === "income" ? t.amount : t.type === "expense" ? -t.amount : 0;
    balances.set(t.accountId, (balances.get(t.accountId) ?? 0) + delta);
  }
  return accounts.map((a) => ({
    accountId: a.id,
    accountName: a.name,
    balance: round2(balances.get(a.id) ?? 0),
  }));
}

export function totalNetWorth(balances: AccountBalance[]): number {
  return round2(balances.reduce((s, b) => s + b.balance, 0));
}
