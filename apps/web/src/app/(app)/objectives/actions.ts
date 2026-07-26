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

export async function upsertObjective(formData: FormData) {
  const supabase = createClient();
  const id = str(formData, "id");

  const row = {
    profile_id: PROFILE_ID,
    period_type: String(formData.get("period_type") || "quarter"),
    period_start: String(formData.get("period_start")),
    period_end: String(formData.get("period_end")),
    title: String(formData.get("title")),
    description: str(formData, "description"),
    progress_pct: num(formData, "progress_pct") ?? 0,
  };

  if (id) {
    const { error } = await supabase.from("objectives").update(row).eq("id", id).eq("profile_id", PROFILE_ID);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("objectives").insert(row);
    if (error) throw error;
  }

  revalidatePath("/objectives");
  revalidatePath("/dashboard");
}

export async function deleteObjective(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const { error } = await supabase.from("objectives").delete().eq("id", id).eq("profile_id", PROFILE_ID);
  if (error) throw error;
  revalidatePath("/objectives");
  revalidatePath("/dashboard");
}
