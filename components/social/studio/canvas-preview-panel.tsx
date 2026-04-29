"use client";

import { SocialPreview } from "@/components/social/preview/social-preview";
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

export function CanvasPreviewPanel({ template, data, customData, summaryFixtures, options, brand }: Props) {
  return (
    <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0a1d15] p-4 shadow-premium md:min-h-[620px] md:p-8">
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)",
          backgroundSize: "22px 22px"
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,205,0,0.08),transparent_42%)]" />
      <div className="relative z-10 w-full max-w-[min(100%,620px)]">
        <SocialPreview
          template={template}
          data={data}
          customData={customData}
          summaryFixtures={summaryFixtures}
          options={options}
          brand={brand}
        />
      </div>
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-command-muted backdrop-blur">
        {options.aspectRatio === "portrait" ? "1080 x 1350" : "1080 x 1080"} export preview
      </div>
    </div>
  );
}
