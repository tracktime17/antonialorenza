"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_ID } from "@/lib/profile";

function num(formData: FormData, key: string): number | null {
  const v = formData.get(key);
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (v === null || String(v).trim() === "") return null;
  return String(v);
}

export async function upsertTransaction(formData: FormData) {
  const supabase = createClient();
  const id = str(formData, "id");

  const row = {
    profile_id: PROFILE_ID,
    date: String(formData.get("date")),
    account_id: str(formData, "account_id"),
    amount: num(formData, "amount") ?? 0,
    category: str(formData, "category"),
    description: str(formData, "description"),
    type: String(formData.get("type") || "expense"),
  };

  if (id) {
    const { error } = await supabase.from("transactions").update(row).eq("id", id).eq("profile_id", PROFILE_ID);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("transactions").insert(row);
    if (error) throw error;
  }

  revalidatePath("/finance");
  revalidatePath("/dashboard");
}

export async function deleteTransaction(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("profile_id", PROFILE_ID);
  if (error) throw error;
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}

export async function upsertAccount(formData: FormData) {
  const supabase = createClient();
  const row = {
    profile_id: PROFILE_ID,
    name: String(formData.get("name")),
    type: String(formData.get("type") || "checking"),
    currency: String(formData.get("currency") || "CLP"),
  };
  const { error } = await supabase.from("accounts").insert(row);
  if (error) throw error;
  revalidatePath("/finance");
}

export async function deleteAccount(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const { error } = await supabase.from("accounts").delete().eq("id", id).eq("profile_id", PROFILE_ID);
  if (error) throw error;
  revalidatePath("/finance");
}

export async function upsertBudget(formData: FormData) {
  const supabase = createClient();
  const row = {
    profile_id: PROFILE_ID,
    category: String(formData.get("category")),
    month: String(formData.get("month")),
    planned_amount: num(formData, "planned_amount") ?? 0,
  };
  const { error } = await supabase.from("budgets").upsert(row, { onConflict: "profile_id,category,month" });
  if (error) throw error;
  revalidatePath("/finance");
}

export async function upsertSubscription(formData: FormData) {
  const supabase = createClient();
  const row = {
    profile_id: PROFILE_ID,
    name: String(formData.get("name")),
    amount: num(formData, "amount") ?? 0,
    currency: String(formData.get("currency") || "CLP"),
    billing_cycle: String(formData.get("billing_cycle") || "monthly"),
    next_charge_date: str(formData, "next_charge_date"),
    active: true,
  };
  const { error } = await supabase.from("subscriptions").insert(row);
  if (error) throw error;
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}

export async function deleteSubscription(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const { error } = await supabase.from("subscriptions").delete().eq("id", id).eq("profile_id", PROFILE_ID);
  if (error) throw error;
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}
