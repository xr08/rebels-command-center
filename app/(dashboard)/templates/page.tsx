import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TemplateManager } from "@/components/social/templates/template-manager";
import { getTemplates } from "@/lib/social/queries";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <DashboardShell title="Templates" subtitle="Manage branded layouts used by the social generator.">
      <TemplateManager templates={templates} />
    </DashboardShell>
  );
}
