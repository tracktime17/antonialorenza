import { upsertProject } from "@/app/(app)/projects/actions";
import type { Tables } from "@/types/database.types";

export function ProjectForm({ project }: { project?: Tables<"projects"> | null }) {
  return (
    <form action={upsertProject} className="grid grid-cols-2 gap-2 rounded border border-app-border bg-app-panel p-4 md:grid-cols-4">
      {project && <input type="hidden" name="id" value={project.id} />}
      <input
        name="name"
        defaultValue={project?.name ?? ""}
        placeholder="nombre del proyecto"
        required
        className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs"
      />
      <select name="status" defaultValue={project?.status ?? "active"} className="rounded border border-app-border bg-white px-2 py-1.5 text-xs">
        <option value="active">Activo</option>
        <option value="paused">Pausado</option>
        <option value="done">Terminado</option>
        <option value="archived">Archivado</option>
      </select>
      <select name="priority" defaultValue={project?.priority ?? "medium"} className="rounded border border-app-border bg-white px-2 py-1.5 text-xs">
        <option value="urgent">Urgente</option>
        <option value="high">Alta</option>
        <option value="medium">Media</option>
        <option value="low">Baja</option>
      </select>
      <input name="deadline" type="date" defaultValue={project?.deadline ?? ""} className="rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
      <input
        name="progress_pct"
        type="number"
        min="0"
        max="100"
        defaultValue={project?.progress_pct ?? 0}
        placeholder="% avance"
        className="rounded border border-app-border bg-white px-2 py-1.5 text-xs"
      />
      <input
        name="description"
        defaultValue={project?.description ?? ""}
        placeholder="descripcion"
        className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs md:col-span-2"
      />
      <button type="submit" className="col-span-2 rounded bg-other py-1.5 text-xs font-bold text-white md:col-span-4">
        {project ? "guardar cambios" : "+ crear proyecto"}
      </button>
    </form>
  );
}
