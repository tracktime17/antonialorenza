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

export async function upsertMeal(formData: FormData) {
  const supabase = createClient();
  const id = str(formData, "id");

  const row = {
    profile_id: PROFILE_ID,
    date: String(formData.get("date")),
    name: String(formData.get("name") || "Comida"),
    calories: num(formData, "calories"),
    protein_g: num(formData, "protein_g"),
    carbs_g: num(formData, "carbs_g"),
    fat_g: num(formData, "fat_g"),
    fiber_g: num(formData, "fiber_g"),
    notes: str(formData, "notes"),
  };

  if (id) {
    const { error } = await supabase.from("meals").update(row).eq("id", id).eq("profile_id", PROFILE_ID);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("meals").insert(row);
    if (error) throw error;
  }

  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
}

export async function deleteMeal(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const { error } = await supabase.from("meals").delete().eq("id", id).eq("profile_id", PROFILE_ID);
  if (error) throw error;
  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
}

export async function upsertBodyMetric(formData: FormData) {
  const supabase = createClient();

  const row = {
    profile_id: PROFILE_ID,
    date: String(formData.get("date")),
    weight_kg: num(formData, "weight_kg"),
    body_fat_pct: num(formData, "body_fat_pct"),
    sleep_hours: num(formData, "sleep_hours"),
    hunger: num(formData, "hunger"),
    energy: num(formData, "energy"),
    water_l: num(formData, "water_l"),
    supplements: str(formData, "supplements"),
    notes: str(formData, "notes"),
  };

  const { error } = await supabase.from("body_metrics").upsert(row, { onConflict: "profile_id,date" });
  if (error) throw error;

  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
}

export async function upsertNutritionTarget(formData: FormData) {
  const supabase = createClient();

  const row = {
    profile_id: PROFILE_ID,
    effective_from: String(formData.get("effective_from")),
    calories_target: num(formData, "calories_target"),
    protein_g_target: num(formData, "protein_g_target"),
    carbs_g_target: num(formData, "carbs_g_target"),
    fat_g_target: num(formData, "fat_g_target"),
    notes: str(formData, "notes"),
  };

  const { error } = await supabase.from("nutrition_targets").upsert(row, { onConflict: "profile_id,effective_from" });
  if (error) throw error;

  revalidatePath("/nutrition");
}
