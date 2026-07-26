import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type TypedClient = SupabaseClient<Database>;

export async function getProfile(supabase: TypedClient, userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function getActiveZoneSet(supabase: TypedClient, profileId: string, onDate: string) {
  const { data, error } = await supabase
    .from("zone_sets")
    .select("*")
    .eq("profile_id", profileId)
    .lte("effective_from", onDate)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getWorkoutsInRange(
  supabase: TypedClient,
  profileId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("profile_id", profileId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getWorkoutHistoryForPmc(supabase: TypedClient, profileId: string, sinceDate: string) {
  const { data, error } = await supabase
    .from("workouts")
    .select("date, tss, kind")
    .eq("profile_id", profileId)
    .eq("kind", "actual")
    .gte("date", sinceDate)
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getUpcomingRace(supabase: TypedClient, profileId: string, todayDate: string) {
  const { data, error } = await supabase
    .from("races")
    .select("*")
    .eq("profile_id", profileId)
    .gte("date", todayDate)
    .order("date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getLatestBodyMetric(supabase: TypedClient, profileId: string) {
  const { data, error } = await supabase
    .from("body_metrics")
    .select("*")
    .eq("profile_id", profileId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getRaces(supabase: TypedClient, profileId: string) {
  const { data, error } = await supabase
    .from("races")
    .select("*")
    .eq("profile_id", profileId)
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getActiveNutritionTarget(supabase: TypedClient, profileId: string, onDate: string) {
  const { data, error } = await supabase
    .from("nutrition_targets")
    .select("*")
    .eq("profile_id", profileId)
    .lte("effective_from", onDate)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getMealsInRange(supabase: TypedClient, profileId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .eq("profile_id", profileId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getBodyMetricsInRange(
  supabase: TypedClient,
  profileId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from("body_metrics")
    .select("*")
    .eq("profile_id", profileId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getBodyMetricForDate(supabase: TypedClient, profileId: string, date: string) {
  const { data, error } = await supabase
    .from("body_metrics")
    .select("*")
    .eq("profile_id", profileId)
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAccounts(supabase: TypedClient, profileId: string) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getTransactionsInRange(
  supabase: TypedClient,
  profileId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("profile_id", profileId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllTransactions(supabase: TypedClient, profileId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select("account_id, amount, type")
    .eq("profile_id", profileId);
  if (error) throw error;
  return data;
}

export async function getBudgetsForMonth(supabase: TypedClient, profileId: string, month: string) {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("profile_id", profileId)
    .eq("month", month)
    .order("category", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getSubscriptions(supabase: TypedClient, profileId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("profile_id", profileId)
    .order("next_charge_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getProjects(supabase: TypedClient, profileId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getProject(supabase: TypedClient, profileId: string, id: string) {
  const { data, error } = await supabase.from("projects").select("*").eq("profile_id", profileId).eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function getIssuesForProject(supabase: TypedClient, profileId: string, projectId: string) {
  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("profile_id", profileId)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getOpenIssuesAcrossProjects(supabase: TypedClient, profileId: string) {
  const { data, error } = await supabase
    .from("issues")
    .select("*, projects(name)")
    .eq("profile_id", profileId)
    .neq("status", "done")
    .in("priority", ["high", "urgent"])
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAiMessages(supabase: TypedClient, profileId: string, limit = 50) {
  const { data, error } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getObjectives(supabase: TypedClient, profileId: string) {
  const { data, error } = await supabase
    .from("objectives")
    .select("*")
    .eq("profile_id", profileId)
    .order("period_start", { ascending: false });
  if (error) throw error;
  return data;
}
