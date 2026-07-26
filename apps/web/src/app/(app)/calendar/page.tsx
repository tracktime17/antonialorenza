import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getWorkoutsInRange } from "@/lib/data";
import { PROFILE_ID } from "@/lib/profile";
import { addMonths, toISODate } from "@antonia-os/domain";
import { CalendarView } from "@/components/calendar/calendar-view";

function parseMonthParam(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const monthDate = parseMonthParam(month);

  const supabase = createClient();

  const rangeStart = toISODate(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  const rangeEnd = toISODate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0));
  const workouts = await getWorkoutsInRange(supabase, PROFILE_ID, rangeStart, rangeEnd);

  const prevMonth = addMonths(monthDate, -1);
  const nextMonth = addMonths(monthDate, 1);
  const monthLabel = monthDate.toLocaleDateString("es-CL", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-app-muted">calendario_entrenamiento</p>
          <h1 className="text-xl font-extrabold text-app-text-bright">{capitalize(monthLabel)}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/calendar?month=${monthKey(prevMonth)}`}
            className="rounded border border-app-border px-2.5 py-1 text-sm text-app-text hover:border-run hover:text-run"
          >
            ‹
          </Link>
          <Link
            href={`/calendar?month=${monthKey(new Date())}`}
            className="rounded border border-app-border px-3 py-1 text-xs text-app-text hover:border-run hover:text-run"
          >
            hoy
          </Link>
          <Link
            href={`/calendar?month=${monthKey(nextMonth)}`}
            className="rounded border border-app-border px-2.5 py-1 text-sm text-app-text hover:border-run hover:text-run"
          >
            ›
          </Link>
        </div>
      </div>

      <CalendarView monthDate={monthDate.toISOString()} workouts={workouts ?? []} />
    </div>
  );
}
