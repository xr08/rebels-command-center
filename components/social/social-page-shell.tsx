import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SocialSectionNav } from "@/components/social/social-section-nav";
import type { SocialEditorRoute } from "@/lib/social/editor-route";

const pageCopy: Record<SocialEditorRoute, { title: string; subtitle: string }> = {
  upcoming: {
    title: "Upcoming Fixture Posts",
    subtitle: "Select an upcoming fixture, choose a template, and export a polished pre-game social post."
  },
  results: {
    title: "Result Posts",
    subtitle: "Turn completed fixtures into result graphics and captions without sorting through unrelated controls."
  },
  custom: {
    title: "Custom Posts",
    subtitle: "Build club announcements, highlights, and promotional posts with custom copy, media, and branding."
  }
};

export function SocialPageShell({
  route,
  children
}: {
  route: SocialEditorRoute;
  children: React.ReactNode;
}) {
  const copy = pageCopy[route];

  return (
    <DashboardShell
      title={copy.title}
      subtitle={copy.subtitle}
      headerSlot={<SocialSectionNav />}
    >
      {children}
    </DashboardShell>
  );
}
