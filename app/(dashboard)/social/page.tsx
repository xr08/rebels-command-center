import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SocialPostEditor } from "@/components/social/editor/social-post-editor";
import { getBrandSettings } from "@/lib/branding/settings";
import { getMediaAssets, getSocialPostDraftById, getSourceFixtures, getTemplates } from "@/lib/social/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SocialPage({
  searchParams
}: {
  searchParams?: { draft?: string };
}) {
  const draftId = searchParams?.draft;
  const [fixtureResult, commandMediaAssets, templates, brand, initialDraft] = await Promise.all([
    getSourceFixtures("all"),
    getMediaAssets(),
    getTemplates(),
    getBrandSettings(),
    draftId ? getSocialPostDraftById(draftId) : Promise.resolve(null)
  ]);
  const sourceState = {
    issues: Array.from(new Set(fixtureResult.issues))
  };

  return (
    <DashboardShell
      title="Social Post Generator"
      subtitle="Select a fixture or result, choose a template, then generate and export branded content."
    >
      <SocialPostEditor
        fixtures={fixtureResult.data}
        templates={templates}
        mediaAssets={commandMediaAssets}
        initialDraft={initialDraft}
        brand={brand}
        sourceState={sourceState}
      />
    </DashboardShell>
  );
}
