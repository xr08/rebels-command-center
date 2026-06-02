import { getBrandSettings } from "@/lib/branding/settings";
import { getMediaAssets, getSocialPostDraftById, getSourceFixtures, getTemplates } from "@/lib/social/queries";

export async function getSocialEditorPageData(draftId?: string) {
  const [fixtureResult, mediaAssets, templates, brand, initialDraft] = await Promise.all([
    getSourceFixtures("all"),
    getMediaAssets(),
    getTemplates(),
    getBrandSettings(),
    draftId ? getSocialPostDraftById(draftId) : Promise.resolve(null)
  ]);

  return {
    fixtures: fixtureResult.data,
    mediaAssets,
    templates,
    brand,
    initialDraft,
    sourceState: {
      issues: Array.from(new Set(fixtureResult.issues))
    }
  };
}
