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

export async function upsertProject(formData: FormData) {
  const supabase = createClient();
  const id = str(formData, "id");

  const row = {
    profile_id: PROFILE_ID,
    name: String(formData.get("name")),
    status: String(formData.get("status") || "active"),
    priority: String(formData.get("priority") || "medium"),
    deadline: str(formData, "deadline"),
    description: str(formData, "description"),
    progress_pct: num(formData, "progress_pct") ?? 0,
  };

  if (id) {
    const { error } = await supabase.from("projects").update(row).eq("id", id).eq("profile_id", PROFILE_ID);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("projects").insert(row);
    if (error) throw error;
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function deleteProject(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const { error } = await supabase.from("projects").delete().eq("id", id).eq("profile_id", PROFILE_ID);
  if (error) throw error;
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function upsertIssue(formData: FormData) {
  const supabase = createClient();
  const id = str(formData, "id");
  const projectId = String(formData.get("project_id"));

  const row = {
    profile_id: PROFILE_ID,
    project_id: projectId,
    title: String(formData.get("title")),
    status: String(formData.get("status") || "todo"),
    priority: String(formData.get("priority") || "medium"),
  };

  if (id) {
    const { error } = await supabase.from("issues").update(row).eq("id", id).eq("profile_id", PROFILE_ID);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("issues").insert(row);
    if (error) throw error;
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
}

export async function deleteIssue(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const projectId = String(formData.get("project_id"));
  const { error } = await supabase.from("issues").delete().eq("id", id).eq("profile_id", PROFILE_ID);
  if (error) throw error;
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
}
