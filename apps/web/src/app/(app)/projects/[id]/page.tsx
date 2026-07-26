import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getIssuesForProject, getProject } from "@/lib/data";
import { PROFILE_ID } from "@/lib/profile";
import { ProjectForm } from "@/components/projects/project-form";
import { IssueList } from "@/components/projects/issue-list";
import { deleteProject } from "@/app/(app)/projects/actions";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  const [project, issues] = await Promise.all([
    getProject(supabase, PROFILE_ID, id),
    getIssuesForProject(supabase, PROFILE_ID, id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/projects" className="text-[11px] uppercase tracking-widest text-app-muted hover:text-bike">
            ‹ proyectos
          </Link>
          <h1 className="text-xl font-extrabold text-app-text-bright">{project.name}</h1>
        </div>
        <form action={deleteProject}>
          <input type="hidden" name="id" value={project.id} />
          <button type="submit" className="text-xs text-expense">
            eliminar proyecto
          </button>
        </form>
      </div>

      <ProjectForm project={project} />

      <IssueList projectId={project.id} issues={issues ?? []} />
    </div>
  );
}
