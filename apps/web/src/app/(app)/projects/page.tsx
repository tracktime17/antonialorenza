import { createClient } from "@/lib/supabase/server";
import { getProjects } from "@/lib/data";
import { PROFILE_ID } from "@/lib/profile";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectForm } from "@/components/projects/project-form";

export default async function ProjectsPage() {
  const supabase = createClient();
  const projects = await getProjects(supabase, PROFILE_ID);

  const active = (projects ?? []).filter((p) => p.status === "active");
  const other = (projects ?? []).filter((p) => p.status !== "active");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-app-muted">proyectos</p>
        <h1 className="text-xl font-extrabold text-app-text-bright">Proyectos</h1>
      </div>

      {active.length > 0 && (
        <div>
          <h2 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">activos</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {active.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {other.length > 0 && (
        <div>
          <h2 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">otros</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {other.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {(projects ?? []).length === 0 && <p className="text-xs italic text-app-muted-2">Sin proyectos registrados todavia.</p>}

      <ProjectForm />
    </div>
  );
}
