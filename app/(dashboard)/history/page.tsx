import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getSocialPosts } from "@/lib/social/queries";
import Link from "next/link";

export default async function HistoryPage() {
  const posts = await getSocialPosts();

  return (
    <DashboardShell title="Post History" subtitle="Track social generation output and publication status.">
      <div className="glass-panel overflow-hidden rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-left text-xs uppercase tracking-[0.14em] text-command-muted">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Post Type</th>
              <th className="px-4 py-3">Context</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      post.status === "posted" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">{post.post_type}</td>
                <td className="px-4 py-3 text-command-muted">
                  {post.fixtures?.round_label} vs {post.fixtures?.opponent_name}
                </td>
                <td className="px-4 py-3 text-command-muted">
                  {new Date(post.created_at).toLocaleString("en-AU")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/social?draft=${post.id}`} className="rounded-md border border-command-accent/50 px-3 py-1 text-xs text-command-accent hover:bg-command-accent/10">
                    {post.status === "draft" ? "Open Draft" : "Reuse"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
