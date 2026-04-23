import { GameDaySingleTemplate } from "@/components/social/templates/game-day-single";
import { ResultSingleTemplate } from "@/components/social/templates/result-single";
import { RoundPreviewSummaryTemplate } from "@/components/social/templates/round-preview-summary";
import { RoundResultsSummaryTemplate } from "@/components/social/templates/round-results-summary";
import type { FixtureRecord, TemplateFixtureProps, TemplateOptions, TemplateRecord } from "@/types/social-data";

type Props = {
  template: TemplateRecord | null;
  data: TemplateFixtureProps | null;
  summaryFixtures: FixtureRecord[];
  options: TemplateOptions;
  brand: {
    clubName: string;
    primaryColor: string;
    accentColor: string;
    logoPath?: string | null;
  };
};

export function SocialPreview({ template, data, summaryFixtures, options, brand }: Props) {
  if (!template) {
    return (
      <div className="glass-panel flex min-h-[320px] items-center justify-center rounded-2xl p-6 text-center text-command-muted">
        Select a fixture and template to preview your social post.
      </div>
    );
  }

  if (template.component_key === "round_preview_summary") {
    return <RoundPreviewSummaryTemplate fixtures={summaryFixtures} options={options} brand={brand} />;
  }

  if (template.component_key === "round_results_summary") {
    return <RoundResultsSummaryTemplate fixtures={summaryFixtures} options={options} brand={brand} />;
  }

  if (!data) {
    return (
      <div className="glass-panel flex min-h-[320px] items-center justify-center rounded-2xl p-6 text-center text-command-muted">
        Select a fixture and template to preview your social post.
      </div>
    );
  }

  if (template.component_key === "result_single") {
    return <ResultSingleTemplate data={data} options={options} brand={brand} />;
  }

  return <GameDaySingleTemplate data={data} options={options} brand={brand} />;
}
