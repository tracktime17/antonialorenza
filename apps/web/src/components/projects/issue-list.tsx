import { deleteIssue, upsertIssue } from "@/app/(app)/projects/actions";
import { IssueStatusSelect } from "@/components/projects/issue-status-select";
import type { Tables } from "@/types/database.types";

const COLUMNS: { status: string; label: string }[] = [
  { status: "todo", label: "Por hacer" },
  { status: "in_progress", label: "En curso" },
  { status: "done", label: "Terminado" },
];

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "border-l-expense",
  high: "border-l-run",
  medium: "border-l-app-border-bright",
  low: "border-l-app-border",
};

export function IssueList({ projectId, issues }: { projectId: string; issues: Tables<"issues">[] }) {
  return (
    <div className="rounded border border-app-border bg-app-panel p-4">
      <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">issues</h3>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.status}>
            <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-app-muted">
              {col.label} · {issues.filter((i) => i.status === col.status).length}
            </h4>
            <div className="space-y-2">
              {issues
                .filter((i) => i.status === col.status)
                .map((i) => (
                  <div
                    key={i.id}
                    className={`rounded border border-app-border border-l-2 bg-app-panel-2 p-2 ${PRIORITY_COLOR[i.priority] ?? "border-l-app-border"}`}
                  >
                    <p className="text-xs text-app-text-bright">{i.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <form action={upsertIssue}>
                        <input type="hidden" name="id" value={i.id} />
                        <input type="hidden" name="project_id" value={projectId} />
                        <input type="hidden" name="title" value={i.title} />
                        <input type="hidden" name="priority" value={i.priority} />
                        <IssueStatusSelect defaultValue={i.status} />
                      </form>
                      <form action={deleteIssue}>
                        <input type="hidden" name="id" value={i.id} />
                        <input type="hidden" name="project_id" value={projectId} />
                        <button type="submit" className="text-[10px] text-expense">
                          eliminar
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <form action={upsertIssue} className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <input type="hidden" name="project_id" value={projectId} />
        <input name="title" placeholder="nuevo issue" required className="col-span-2 rounded border border-app-border bg-white px-2 py-1.5 text-xs" />
        <select name="priority" defaultValue="medium" className="rounded border border-app-border bg-white px-2 py-1.5 text-xs">
          <option value="urgent">Urgente</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
        <button type="submit" className="rounded bg-other py-1.5 text-xs font-bold text-white">
          + agregar issue
        </button>
      </form>
    </div>
  );
}
