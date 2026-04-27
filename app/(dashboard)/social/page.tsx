import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SocialPostEditor } from "@/components/social/editor/social-post-editor";
import { getBrandSettings } from "@/lib/branding/settings";
import { getFixturesByStatus, getMediaAssets, getSocialPostDraftById, getTemplates } from "@/lib/social/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SocialPage({
  searchParams
}: {
  searchParams?: { draft?: string };
}) {
  const draftId = searchParams?.draft;
  const [upcomingFixtures, resultFixtures, templates, mediaAssets, brand, initialDraft] = await Promise.all([
    getFixturesByStatus("scheduled", "all"),
    getFixturesByStatus("completed", "all"),
    getTemplates(),
    getMediaAssets(),
    getBrandSettings(),
    draftId ? getSocialPostDraftById(draftId) : Promise.resolve(null)
  ]);
  const fixtures = [...upcomingFixtures, ...resultFixtures];

  return (
    <DashboardShell
      title="Social Post Generator"
      subtitle="Select a fixture or result, choose a template, then generate and export branded content."
    >
      <SocialPostEditor fixtures={fixtures} templates={templates} mediaAssets={mediaAssets} initialDraft={initialDraft} brand={brand} />
    </DashboardShell>
  );
}
