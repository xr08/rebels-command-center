import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getFixtures, getSocialPosts, getTemplates } from "@/lib/social/queries";

export default async function DashboardPage() {
  const [fixtures, templates, socialPosts] = await Promise.all([getFixtures("all"), getTemplates(), getSocialPosts()]);

  const upcoming = fixtures.filter((fixture) => fixture.status === "scheduled").length;
  const completed = fixtures.filter((fixture) => fixture.status === "completed").length;
  const drafts = socialPosts.filter((post) => post.status === "draft").length;

  return (
    <DashboardShell title="Command Overview" subtitle="Create social content from verified fixture data and track delivery status.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Upcoming Fixtures" value={upcoming} />
        <MetricCard label="Completed Results" value={completed} />
        <MetricCard label="Active Templates" value={templates.length} />
        <MetricCard label="Draft Posts" value={drafts} />
      </div>

      <div className="glass-panel rounded-2xl p-5">
        <h3 className="text-lg font-bold">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/social" className="rounded-md bg-command-accent px-4 py-2 text-sm font-semibold text-black">
            Open Social Generator
          </Link>
          <Link href="/history" className="rounded-md border border-white/20 px-4 py-2 text-sm">
            View History
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="glass-panel rounded-xl p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-command-muted">{label}</p>
      <p className="mt-2 text-3xl font-black text-command-accent">{value}</p>
    </article>
  );
}
