import { redirect } from "next/navigation";
import { SocialPostEditor } from "@/components/social/editor/social-post-editor";
import { SocialPageShell } from "@/components/social/social-page-shell";
import { getSocialEditorPageData } from "@/lib/social/editor-page-data";
import { getSocialEditorHref, resolveSocialEditorRoute } from "@/lib/social/editor-route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResultsSocialPage({
  searchParams
}: {
  searchParams?: { draft?: string };
}) {
  const draftId = searchParams?.draft;
  const data = await getSocialEditorPageData(draftId);

  if (draftId && data.initialDraft) {
    const expectedRoute = resolveSocialEditorRoute(data.initialDraft);
    if (expectedRoute !== "results") {
      redirect(getSocialEditorHref(expectedRoute, draftId));
    }
  }

  return (
    <SocialPageShell route="results">
      <SocialPostEditor
        route="results"
        fixtures={data.fixtures}
        templates={data.templates}
        mediaAssets={data.mediaAssets}
        initialDraft={data.initialDraft}
        brand={data.brand}
        sourceState={data.sourceState}
      />
    </SocialPageShell>
  );
}
