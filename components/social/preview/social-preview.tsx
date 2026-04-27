import { CanvasPreview } from "@/components/social/preview/canvas-preview";
import { PlayerOfTheDayTemplate } from "@/components/social/templates/player-of-the-day";
import { SponsorHighlightTemplate } from "@/components/social/templates/sponsor-highlight";
import { TrainingReminderTemplate } from "@/components/social/templates/training-reminder";
import { EventAnnouncementTemplate } from "@/components/social/templates/event-announcement";
import { GeneralAnnouncementTemplate } from "@/components/social/templates/general-announcement";
import { PhotoHighlightTemplate } from "@/components/social/templates/photo-highlight";
import { isCanvasTemplateKey } from "@/lib/social/canvas/render-post";
import type { CustomTemplateData, FixtureRecord, TemplateFixtureProps, TemplateOptions, TemplateRecord } from "@/types/social-data";

type Props = {
  template: TemplateRecord | null;
  data: TemplateFixtureProps | null;
  customData?: CustomTemplateData | null;
  summaryFixtures: FixtureRecord[];
  options: TemplateOptions;
  brand: {
    clubName: string;
    primaryColor: string;
    accentColor: string;
    logoPath?: string | null;
  };
};

export function SocialPreview({ template, data, customData, summaryFixtures, options, brand }: Props) {
  if (!template) {
    return (
      <div className="glass-panel flex min-h-[320px] items-center justify-center rounded-2xl p-6 text-center text-command-muted">
        Select a fixture and template to preview your social post.
      </div>
    );
  }

  if (template.component_key === "round_preview_summary") {
    return <CanvasPreview templateKey="round_preview_summary" summaryFixtures={summaryFixtures} options={options} brand={brand} />;
  }

  if (template.component_key === "round_results_summary") {
    return <CanvasPreview templateKey="round_results_summary" summaryFixtures={summaryFixtures} options={options} brand={brand} />;
  }

  const missingCustom = (
    <div className="glass-panel flex min-h-[320px] items-center justify-center rounded-2xl p-6 text-center text-command-muted">
      Fill in custom post details to preview this template.
    </div>
  );

  if (template.component_key === "player_of_the_day") {
    return customData ? <PlayerOfTheDayTemplate data={customData} options={options} brand={brand} /> : missingCustom;
  }

  if (template.component_key === "sponsor_highlight") {
    return customData ? <SponsorHighlightTemplate data={customData} options={options} brand={brand} /> : missingCustom;
  }

  if (template.component_key === "training_reminder") {
    return customData ? <TrainingReminderTemplate data={customData} options={options} brand={brand} /> : missingCustom;
  }

  if (template.component_key === "event_announcement") {
    return customData ? <EventAnnouncementTemplate data={customData} options={options} brand={brand} /> : missingCustom;
  }

  if (template.component_key === "general_announcement" || template.component_key === "manual_info_card") {
    return customData ? <GeneralAnnouncementTemplate data={customData} options={options} brand={brand} /> : missingCustom;
  }

  if (template.component_key === "photo_highlight") {
    return customData ? <PhotoHighlightTemplate data={customData} options={options} brand={brand} /> : missingCustom;
  }

  if (!data) {
    return (
      <div className="glass-panel flex min-h-[320px] items-center justify-center rounded-2xl p-6 text-center text-command-muted">
        Select a fixture and template to preview your social post.
      </div>
    );
  }

  if (template.component_key === "result_single") {
    return <CanvasPreview templateKey="result_single" data={data} options={options} brand={brand} />;
  }

  if (template.component_key === "game_day_single" || template.component_key === "preview_single") {
    return <CanvasPreview templateKey="game_day_single" data={data} options={options} brand={brand} />;
  }

  if (isCanvasTemplateKey(template.component_key)) {
    return <CanvasPreview templateKey={template.component_key} data={data} summaryFixtures={summaryFixtures} options={options} brand={brand} />;
  }
  return (
    <div className="glass-panel flex min-h-[320px] items-center justify-center rounded-2xl p-6 text-center text-command-muted">
      Template renderer is not available for this post type.
    </div>
  );
}
