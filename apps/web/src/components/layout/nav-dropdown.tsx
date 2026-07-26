"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function NavDropdown({ label, items }: { label: string; items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#AEB4BC] hover:text-white"
      >
        {label} ▾
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[160px] rounded border border-app-border bg-app-panel py-1 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-app-text hover:bg-app-panel-2"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
