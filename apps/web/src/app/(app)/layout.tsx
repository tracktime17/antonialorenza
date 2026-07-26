import Link from "next/link";
import { NavDropdown } from "@/components/layout/nav-dropdown";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/training", label: "Calendario" },
  { href: "/nutrition", label: "Nutricion" },
  { href: "/finance", label: "Finanzas" },
];

const MORE_NAV = [
  { href: "/projects", label: "Proyectos" },
  { href: "/objectives", label: "Objetivos" },
  { href: "/analytics", label: "Analitica & IA" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-app-bg">
      <div className="border-b border-app-border bg-app-text-bright">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
          <span className="text-sm font-extrabold text-white">
            antonia<span className="text-run">_os</span>
          </span>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#AEB4BC] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <NavDropdown label="Mas" items={MORE_NAV} />
          </nav>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
