"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveZoneSet } from "@/lib/data";
import { PROFILE_ID } from "@/lib/profile";
import { calcBikeTss, calcRunTss, calcSwimTss, parseMMSS } from "@antonia-os/domain";
import type { Database } from "@/types/database.types";

type Discipline = Database["public"]["Enums"]["discipline"];
type WorkoutKind = Database["public"]["Enums"]["workout_kind"];
type RacePriority = Database["public"]["Enums"]["race_priority"];

function requireProfileId() {
  const supabase = createClient();
  return { supabase, profileId: PROFILE_ID };
}

function disciplineLabel(d: string) {
  return ({ run: "Running", bike: "Ciclismo", swim: "Natacion", strength: "Fuerza", other: "Otro" } as Record<string, string>)[d] ?? d;
}

export async function upsertWorkout(formData: FormData) {
  const { supabase, profileId } = await requireProfileId();

  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const date = String(formData.get("date"));
  const discipline = String(formData.get("discipline")) as Discipline;
  const kind = (String(formData.get("kind") || "actual")) as WorkoutKind;
  const title = String(formData.get("title") || "");
  const durationMin = formData.get("duration_min") ? Number(formData.get("duration_min")) : null;
  const distanceKm = formData.get("distance_km") ? Number(formData.get("distance_km")) : null;
  const paceStr = formData.get("pace") ? String(formData.get("pace")) : null;
  const powerWatts = formData.get("power_watts") ? Number(formData.get("power_watts")) : null;
  const avgHr = formData.get("avg_hr") ? Number(formData.get("avg_hr")) : null;
  const cadence = formData.get("cadence") ? Number(formData.get("cadence")) : null;
  const elevation = formData.get("elevation_gain_m") ? Number(formData.get("elevation_gain_m")) : null;
  const description = formData.get("description") ? String(formData.get("description")) : null;

  const zoneSet = await getActiveZoneSet(supabase, profileId, date);

  let tss = 0;
  let intensityFactor = 0;
  let zoneLabel: string | null = null;
  let avgPaceSecPerKm: number | null = null;
  let avgPaceSecPer100m: number | null = null;

  if (kind === "actual" && durationMin) {
    if (discipline === "run") {
      avgPaceSecPerKm = parseMMSS(paceStr);
      const threshold = zoneSet?.run_threshold_sec_per_km ?? 255;
      const r = calcRunTss(avgPaceSecPerKm, durationMin, threshold);
      tss = r.tss;
      intensityFactor = r.intensityFactor;
      zoneLabel = r.zone;
    } else if (discipline === "swim") {
      avgPaceSecPer100m = parseMMSS(paceStr);
      const css = zoneSet?.swim_css_sec_per_100m ?? 83;
      const r = calcSwimTss(avgPaceSecPer100m, durationMin, css);
      tss = r.tss;
      intensityFactor = r.intensityFactor;
      zoneLabel = r.zone;
    } else if (discipline === "bike") {
      const ftp = zoneSet?.bike_ftp_watts ?? 205;
      const r = calcBikeTss(powerWatts, durationMin, ftp);
      tss = r.tss;
      intensityFactor = r.intensityFactor;
      zoneLabel = r.zone;
    }
  }

  const row = {
    profile_id: profileId,
    date,
    discipline,
    kind,
    title: title || disciplineLabel(discipline),
    description,
    duration_min: durationMin,
    distance_km: distanceKm,
    avg_pace_sec_per_km: avgPaceSecPerKm,
    avg_pace_sec_per_100m: avgPaceSecPer100m,
    avg_power_watts: discipline === "bike" ? powerWatts : null,
    avg_hr: avgHr,
    cadence,
    elevation_gain_m: elevation,
    tss: kind === "actual" ? tss : null,
    intensity_factor: kind === "actual" ? intensityFactor : null,
    zone_label: kind === "actual" ? zoneLabel : null,
    planned_duration_min: kind === "planned" ? durationMin : null,
    planned_distance_km: kind === "planned" ? distanceKm : null,
  };

  if (id) {
    const { error } = await supabase.from("workouts").update(row).eq("id", id).eq("profile_id", profileId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("workouts").insert(row);
    if (error) throw error;
  }

  revalidatePath("/calendar");
  revalidatePath("/training");
  revalidatePath("/dashboard");
}

export async function deleteWorkout(id: string) {
  const { supabase, profileId } = await requireProfileId();
  const { error } = await supabase.from("workouts").delete().eq("id", id).eq("profile_id", profileId);
  if (error) throw error;
  revalidatePath("/calendar");
  revalidatePath("/training");
  revalidatePath("/dashboard");
}

export async function upsertRace(formData: FormData) {
  const { supabase, profileId } = await requireProfileId();
  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const row = {
    profile_id: profileId,
    date: String(formData.get("date")),
    name: String(formData.get("name")),
    distance_type: formData.get("distance_type") ? String(formData.get("distance_type")) : null,
    goal_time: formData.get("goal_time") ? String(formData.get("goal_time")) : null,
    priority: (formData.get("priority") ? String(formData.get("priority")) : "B") as RacePriority,
    notes: formData.get("notes") ? String(formData.get("notes")) : null,
  };

  if (id) {
    const { error } = await supabase.from("races").update(row).eq("id", id).eq("profile_id", profileId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("races").insert(row);
    if (error) throw error;
  }

  revalidatePath("/training");
  revalidatePath("/dashboard");
}

export async function deleteRace(formData: FormData) {
  const { supabase, profileId } = await requireProfileId();
  const id = String(formData.get("id"));
  const { error } = await supabase.from("races").delete().eq("id", id).eq("profile_id", profileId);
  if (error) throw error;
  revalidatePath("/training");
  revalidatePath("/dashboard");
}
