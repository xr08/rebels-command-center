import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getTemplates } from "@/lib/social/queries";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <DashboardShell title="Templates" subtitle="Manage branded layouts used by the social generator.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <article key={template.id} className="glass-panel rounded-xl p-4">
            <h3 className="text-lg font-bold">{template.name}</h3>
            <p className="mt-2 text-sm text-command-muted">Post Type: {template.post_type}</p>
            <p className="text-sm text-command-muted">Component Key: {template.component_key}</p>
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}
