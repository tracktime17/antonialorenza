import { deleteMeal, upsertMeal } from "@/app/(app)/nutrition/actions";
import type { Tables } from "@/types/database.types";

export function MealList({ date, meals }: { date: string; meals: Tables<"meals">[] }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-4">
      <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">comidas_de_hoy</h3>

      <div className="mb-4 space-y-2">
        {meals.length === 0 && <p className="text-xs italic text-app-muted-2">Sin comidas registradas hoy.</p>}
        {meals.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded border border-app-border bg-app-panel-2 px-3 py-2">
            <div>
              <p className="text-xs font-semibold text-app-text-bright">{m.name}</p>
              <p className="text-[10.5px] text-app-muted">
                {m.calories ? `${m.calories} kcal` : "-"}
                {m.protein_g ? ` · P ${m.protein_g}g` : ""}
                {m.carbs_g ? ` · C ${m.carbs_g}g` : ""}
                {m.fat_g ? ` · G ${m.fat_g}g` : ""}
              </p>
            </div>
            <form action={deleteMeal}>
              <input type="hidden" name="id" value={m.id} />
              <button type="submit" className="text-xs text-expense">
                eliminar
              </button>
            </form>
          </div>
        ))}
      </div>

      <form action={upsertMeal} className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <input type="hidden" name="date" value={date} />
        <input name="name" placeholder="nombre" required className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs md:col-span-1" />
        <input name="calories" type="number" placeholder="kcal" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <input name="protein_g" type="number" step="0.1" placeholder="proteina (g)" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <input name="carbs_g" type="number" step="0.1" placeholder="carbs (g)" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <input name="fat_g" type="number" step="0.1" placeholder="grasas (g)" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <input name="fiber_g" type="number" step="0.1" placeholder="fibra (g)" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <input name="notes" placeholder="notas" className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs md:col-span-2" />
        <button type="submit" className="col-span-2 rounded bg-nutri py-1.5 text-xs font-bold text-white md:col-span-4">
          + agregar comida
        </button>
      </form>
    </div>
  );
}
