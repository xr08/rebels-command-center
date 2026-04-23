import Link from "next/link";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/social", label: "Social" },
  { href: "/templates", label: "Templates" },
  { href: "/media", label: "Media" },
  { href: "/history", label: "History" }
];

export function DashboardShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/brands/fremantle-rebels-logo.png"
              alt="Fremantle Rebels"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-command-accent">Rebels Command Center</p>
              <h1 className="text-lg font-bold">Fremantle Rebels</h1>
            </div>
          </div>

          <span className="rounded-md border border-command-accent/40 px-3 py-2 text-xs uppercase tracking-[0.12em] text-command-accent">
            Open Access
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:px-6">
        <aside className="glass-panel rounded-xl p-3">
          <nav className="flex flex-wrap gap-2 md:flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-white/10 px-3 py-2 text-sm text-command-muted transition hover:border-command-accent/60 hover:text-command-text"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="space-y-4">
          <div className="glass-panel rounded-2xl p-5">
            <h2 className="text-2xl font-bold">{title}</h2>
            {subtitle ? <p className="mt-2 text-sm text-command-muted">{subtitle}</p> : null}
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
