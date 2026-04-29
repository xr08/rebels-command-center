import { TemplateFrame } from "./template-frame";
import type { CustomTemplateData, TemplateOptions } from "@/types/social-data";

type Props = {
  data: CustomTemplateData;
  options: TemplateOptions;
  brand: {
    clubName: string;
    primaryColor: string;
    accentColor: string;
    logoPath?: string | null;
  };
  title: string;
};

export function CustomPostShell({ data, options, brand, title }: Props) {
  const isPlayer = data.postType === "player_of_the_day";
  const isSponsor = data.postType === "sponsor_highlight";
  const isTraining = data.postType === "training_reminder";
  const isEvent = data.postType === "event_announcement";
  const isPhoto = data.postType === "photo_highlight";
  const showDateTime = Boolean(data.date || data.time || data.location);
  const showBody = Boolean(data.bodyText);
  const showCTA = Boolean(data.ctaText);

  return (
    <TemplateFrame
      title={title}
      subtitle={data.subheading || data.heading || "Rebels Command Center"}
      clubName={brand.clubName}
      primaryColor={brand.primaryColor}
      accentColor={brand.accentColor}
      logoPath={brand.logoPath}
      layoutKind="custom"
      options={options}
    >
      <div className="space-y-3 rounded-2xl border border-white/20 bg-black/55 p-4 md:p-5">
        {data.heading ? <p className="text-xs uppercase tracking-[0.18em] text-command-accent">{data.heading}</p> : null}
        {data.title ? <h4 className="text-2xl font-black leading-tight text-white md:text-3xl">{data.title}</h4> : null}
        {showBody ? <p className="text-sm leading-relaxed text-white/90 md:text-base">{data.bodyText}</p> : null}

        <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
          {isPlayer && data.personName ? <MetaCard label="Player" value={data.personName} /> : null}
          {isSponsor && data.sponsorName ? <MetaCard label="Sponsor" value={data.sponsorName} /> : null}
          {isTraining && data.personName ? <MetaCard label="Coach / Contact" value={data.personName} /> : null}
          {(isEvent || isPhoto) && data.personName ? <MetaCard label="Featured" value={data.personName} /> : null}
          {showDateTime && data.date ? <MetaCard label="Date" value={data.date} /> : null}
          {showDateTime && data.time ? <MetaCard label="Time" value={data.time} /> : null}
          {showDateTime && data.location ? <MetaCard label="Location" value={data.location} /> : null}
          {data.stream && data.stream !== "all" ? <MetaCard label="Stream" value={data.stream} /> : null}
        </div>

        {showCTA ? (
          <div className="inline-flex rounded-full border border-command-accent/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-command-accent">
            {data.ctaText}
          </div>
        ) : null}
      </div>
    </TemplateFrame>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/5 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/65">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
