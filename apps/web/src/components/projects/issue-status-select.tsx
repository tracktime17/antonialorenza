"use client";

const COLUMNS = [
  { status: "todo", label: "Por hacer" },
  { status: "in_progress", label: "En curso" },
  { status: "done", label: "Terminado" },
];

export function IssueStatusSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      name="status"
      defaultValue={defaultValue}
      className="rounded border border-app-border bg-white px-1 py-0.5 text-[10px]"
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
    >
      {COLUMNS.map((c) => (
        <option key={c.status} value={c.status}>
          {c.label}
        </option>
      ))}
    </select>
  );
}
