import Link from "next/link";
import type { Tables } from "@/types/database.types";

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  paused: "Pausado",
  done: "Terminado",
  archived: "Archivado",
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "text-expense",
  high: "text-run",
  medium: "text-app-muted",
  low: "text-app-muted-2",
};

export function ProjectCard({ project }: { project: Tables<"projects"> }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded border border-app-border bg-app-panel p-4 transition-colors hover:border-app-border-bright"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-app-text-bright">{project.name}</h3>
        <span className={`text-[10px] font-bold uppercase ${PRIORITY_COLOR[project.priority] ?? "text-app-muted"}`}>
          {project.priority}
        </span>
      </div>
      {project.description && <p className="mb-3 line-clamp-2 text-xs text-app-muted">{project.description}</p>}
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-app-panel-3">
        <div className="h-full rounded-full bg-bike" style={{ width: `${Math.min(project.progress_pct, 100)}%` }} />
      </div>
      <div className="flex items-center justify-between text-[10.5px] text-app-muted">
        <span>{STATUS_LABEL[project.status] ?? project.status}</span>
        <span>{project.progress_pct}%</span>
        {project.deadline && <span>deadline {project.deadline}</span>}
      </div>
    </Link>
  );
}
