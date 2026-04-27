import { TemplateFrame } from "./template-frame";
import type { TemplateFixtureProps, TemplateOptions } from "@/types/social-data";

type Props = {
  data: TemplateFixtureProps;
  options: TemplateOptions;
  brand: {
    clubName: string;
    primaryColor: string;
    accentColor: string;
    logoPath?: string | null;
  };
};

export function GameDaySingleTemplate({ data, options, brand }: Props) {
  const styleVariant = options.styleVariant ?? "classic-green";
  const cardClass = styleVariant === "minimal-board"
    ? "h-full space-y-4 rounded-2xl border border-white/30 bg-black/20 p-4 md:p-5"
    : styleVariant === "bold-gold"
      ? "h-full space-y-4 rounded-2xl border border-black/15 bg-white/20 p-4 backdrop-blur-sm md:p-5"
      : "h-full space-y-4 rounded-2xl border border-white/20 bg-black/35 p-4 backdrop-blur-sm md:p-5";
  const infoCardClass = styleVariant === "bold-gold"
    ? "rounded-lg border border-black/15 bg-white/30 px-3 py-2"
    : "rounded-lg border border-white/15 bg-white/5 px-3 py-2";
  const textClass = styleVariant === "bold-gold" ? "text-black" : "text-white";

  return (
    <TemplateFrame
      title="Game Day"
      subtitle={`${data.round} | ${data.teamName ?? "Rebels"}`}
      clubName={brand.clubName}
      primaryColor={brand.primaryColor || "#044229"}
      accentColor={brand.accentColor || "#FFCD00"}
      logoPath={brand.logoPath}
      layoutKind="single"
      options={options}
    >
      <div className={cardClass}>
        <div className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center ${textClass}`}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">Home</p>
            <p className="mt-2 text-xl font-black leading-tight break-words md:text-3xl">{data.teamName ?? "Rebels"}</p>
          </div>
          <p className="text-xl font-black" style={{ color: brand.accentColor || "#FFCD00" }}>
            {data.isBye ? "|" : "VS"}
          </p>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">{data.isBye ? "Status" : "Opponent"}</p>
            <p className="mt-2 text-xl font-black leading-tight break-words md:text-3xl">{data.opponent}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm md:text-base">
          <InfoRow label="Date" value={data.date} className={infoCardClass} valueClass={textClass} />
          <InfoRow label="Time" value={data.time} className={infoCardClass} valueClass={textClass} />
          <InfoRow label="Round" value={data.round} className={infoCardClass} valueClass={textClass} />
          <InfoRow label="Venue" value={data.venue} className={infoCardClass} valueClass={textClass} />
        </div>
      </div>
    </TemplateFrame>
  );
}

function InfoRow({
  label,
  value,
  className,
  valueClass
}: {
  label: string;
  value: string;
  className: string;
  valueClass: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/70">{label}</p>
      <p className={`mt-1 font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
