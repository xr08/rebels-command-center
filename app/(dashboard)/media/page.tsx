import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MediaManager } from "@/components/media/media-manager";
import { getClubId } from "@/lib/social/queries";
import { getMediaAssets } from "@/lib/social/queries";

export default async function MediaPage() {
  const [media, clubId] = await Promise.all([getMediaAssets(), getClubId()]);

  return (
    <DashboardShell title="Media Library" subtitle="Supabase Storage-backed assets available to templates and post generation.">
      <MediaManager initialMedia={media} clubId={clubId ?? ""} />
    </DashboardShell>
  );
}
