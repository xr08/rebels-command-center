"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/social/upcoming", label: "Upcoming Fixtures" },
  { href: "/social/results", label: "Enter Results" },
  { href: "/social/custom", label: "Custom Post" }
];

export function SocialSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
              active
                ? "border-command-accent bg-command-accent text-black"
                : "border-white/10 text-command-muted hover:border-command-accent/60 hover:text-command-text"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
