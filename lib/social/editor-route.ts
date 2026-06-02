import type { CustomPostType, PostType } from "@/types/social";

export type SocialEditorRoute = "upcoming" | "results" | "custom";

type PostRouteInput = {
  post_type: PostType | CustomPostType;
  custom_post_type?: CustomPostType | null;
};

export function resolveSocialEditorRoute({ post_type, custom_post_type }: PostRouteInput): SocialEditorRoute {
  if (custom_post_type) {
    return "custom";
  }

  if (String(post_type).startsWith("result")) {
    return "results";
  }

  return "upcoming";
}

export function getSocialEditorPath(route: SocialEditorRoute) {
  return `/social/${route}`;
}

export function getSocialEditorHref(route: SocialEditorRoute, draftId?: string) {
  if (!draftId) {
    return getSocialEditorPath(route);
  }

  return `${getSocialEditorPath(route)}?draft=${encodeURIComponent(draftId)}`;
}
