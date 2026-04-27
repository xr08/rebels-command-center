import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SocialPostEditor } from "@/components/social/editor/social-post-editor";
import { getBrandSettings } from "@/lib/branding/settings";
import { getMediaAssets, getSocialPostDraftById, getSourceFixtures, getSourceMediaAssets, getTemplates } from "@/lib/social/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SocialPage({
  searchParams
}: {
  searchParams?: { draft?: string };
}) {
  const draftId = searchParams?.draft;
  const [fixtureResult, sourceMediaResult, commandMediaAssets, templates, brand, initialDraft] = await Promise.all([
    getSourceFixtures("all"),
    getSourceMediaAssets(),
    getMediaAssets(),
    getTemplates(),
    getBrandSettings(),
    draftId ? getSocialPostDraftById(draftId) : Promise.resolve(null)
  ]);
  const mediaAssets = [...sourceMediaResult.data, ...commandMediaAssets];
  const sourceState = {
    issues: Array.from(new Set([...fixtureResult.issues, ...sourceMediaResult.issues]))
  };

  return (
    <DashboardShell
      title="Social Post Generator"
      subtitle="Select a fixture or result, choose a template, then generate and export branded content."
    >
      <SocialPostEditor
        fixtures={fixtureResult.data}
        templates={templates}
        mediaAssets={mediaAssets}
        initialDraft={initialDraft}
        brand={brand}
        sourceState={sourceState}
      />
    </DashboardShell>
  );
}
