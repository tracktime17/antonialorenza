import type { Tables } from "@/types/database.types";
import { fmtDurationHMS } from "@/lib/format";

type Workout = Tables<"workouts">;

const DISCIPLINE_BAR: Record<string, string> = {
  run: "bg-run",
  bike: "bg-bike",
  swim: "bg-swim",
  strength: "bg-other",
  other: "bg-other",
};

const DISCIPLINE_LABEL: Record<string, string> = {
  run: "Run",
  bike: "Bike",
  swim: "Swim",
  strength: "Fuerza",
  other: "Otro",
};

export function WorkoutCard({ workout }: { workout: Workout }) {
  const isPlanned = workout.kind === "planned";
  const duration = isPlanned ? workout.planned_duration_min : workout.duration_min;
  const distance = isPlanned ? workout.planned_distance_km : workout.distance_km;

  return (
    <div
      title={workout.title + (workout.description ? ` — ${workout.description}` : "")}
      className={`overflow-hidden rounded border bg-white text-left shadow-sm ${
        isPlanned ? "border-dashed border-planned" : "border-app-border"
      }`}
    >
      <div className={`h-[3px] w-full ${isPlanned ? "bg-planned" : DISCIPLINE_BAR[workout.discipline]}`} />
      <div className="px-1.5 py-1">
        <p className={`truncate text-[10px] font-bold ${isPlanned ? "text-planned" : "text-app-text-bright"}`}>
          {DISCIPLINE_LABEL[workout.discipline]}
          {isPlanned ? " (plan)" : ""}
        </p>
        <p className="truncate text-[9.5px] text-app-muted" title={workout.title}>
          {workout.title}
        </p>
        <p className="mt-0.5 text-[9.5px] font-semibold text-app-text">
          {duration ? fmtDurationHMS(duration) : "-"}
          {duration ? (workout.kind === "actual" ? " ✓" : "") : ""}
        </p>
        <p className="text-[9.5px] text-app-muted">
          {distance ? `${distance.toFixed(1)} km` : ""}
          {distance && workout.tss ? " · " : ""}
          {workout.tss ? `${Math.round(workout.tss)} TSS` : ""}
        </p>
      </div>
    </div>
  );
}
