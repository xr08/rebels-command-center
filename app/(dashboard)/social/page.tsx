import { redirect } from "next/navigation";
import { getSocialEditorHref } from "@/lib/social/editor-route";
import { getSocialPostDraftById } from "@/lib/social/queries";
import { resolveSocialEditorRoute } from "@/lib/social/editor-route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SocialPage({
  searchParams
}: {
  searchParams?: { draft?: string };
}) {
  const draftId = searchParams?.draft;
  if (!draftId) {
    redirect(getSocialEditorHref("upcoming"));
  }

  const initialDraft = await getSocialPostDraftById(draftId);
  if (!initialDraft) {
    redirect(getSocialEditorHref("upcoming"));
  }

  redirect(getSocialEditorHref(resolveSocialEditorRoute(initialDraft), draftId));
}
