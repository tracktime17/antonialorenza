import { createClient } from "@/lib/supabase/server";
import { getObjectives } from "@/lib/data";
import { PROFILE_ID } from "@/lib/profile";
import { ObjectiveForm } from "@/components/objectives/objective-form";
import { ObjectiveItem } from "@/components/objectives/objective-item";
import type { Tables } from "@/types/database.types";

const PERIOD_LABEL: Record<string, string> = {
  year: "Anuales",
  quarter: "Trimestrales",
  month: "Mensuales",
  week: "Semanales",
};

const PERIOD_ORDER = ["year", "quarter", "month", "week"];

export default async function ObjectivesPage() {
  const supabase = createClient();
  const objectives = await getObjectives(supabase, PROFILE_ID);

  const grouped = new Map<string, Tables<"objectives">[]>();
  for (const o of objectives ?? []) {
    const arr = grouped.get(o.period_type) ?? [];
    arr.push(o);
    grouped.set(o.period_type, arr);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-app-muted">objetivos</p>
        <h1 className="text-xl font-extrabold text-app-text-bright">Objetivos (OKRs)</h1>
        <p className="mt-1 text-xs text-app-muted">
          El progreso se actualiza manualmente por ahora — conectarlo automaticamente con entrenamiento/finanzas/habitos
          queda para una fase futura.
        </p>
      </div>

      {(objectives ?? []).length === 0 && <p className="text-xs italic text-app-muted-2">Sin objetivos registrados todavia.</p>}

      {PERIOD_ORDER.filter((p) => grouped.has(p)).map((periodType) => (
        <div key={periodType}>
          <h2 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">{PERIOD_LABEL[periodType]}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {grouped.get(periodType)!.map((o) => (
              <ObjectiveItem key={o.id} objective={o} />
            ))}
          </div>
        </div>
      ))}

      <ObjectiveForm />
    </div>
  );
}
