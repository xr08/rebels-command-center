import { DashboardShell } from "@/components/layout/dashboard-shell";
import { HistoryRowActions } from "@/components/social/history/history-row-actions";
import { getSocialPosts } from "@/lib/social/queries";

export default async function HistoryPage() {
  const posts = await getSocialPosts();

  return (
    <DashboardShell title="Post History" subtitle="Track social generation output and publication status.">
      <div className="space-y-3 md:hidden">
        {posts.map((post) => (
          <article key={post.id} className="glass-panel rounded-xl p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{post.post_type}</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  post.status === "posted" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"
                }`}
              >
                {post.status}
              </span>
            </div>
            <p className="mt-2 text-xs text-command-muted">
              {post.fixtures?.round_label} vs {post.fixtures?.opponent_name}
            </p>
            <p className="mt-1 text-xs text-command-muted">{new Date(post.created_at).toLocaleString("en-AU")}</p>
            <div className="mt-3">
              <HistoryRowActions id={post.id} isDraft={post.status === "draft"} compact />
            </div>
          </article>
        ))}
      </div>

      <div className="glass-panel hidden overflow-hidden rounded-xl md:block">
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
                  <HistoryRowActions id={post.id} isDraft={post.status === "draft"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
