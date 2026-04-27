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

export function ResultSingleTemplate({ data, options, brand }: Props) {
  const styleVariant = options.styleVariant ?? "classic-green";
  const cardClass = styleVariant === "minimal-board"
    ? "space-y-4 rounded-2xl border border-white/30 bg-black/20 p-4 md:p-5"
    : styleVariant === "bold-gold"
      ? "space-y-4 rounded-2xl border border-black/15 bg-white/20 p-4 backdrop-blur-sm md:p-5"
      : "space-y-4 rounded-2xl border border-white/20 bg-black/35 p-4 backdrop-blur-sm md:p-5";
  const infoCardClass = styleVariant === "bold-gold"
    ? "rounded-lg border border-black/15 bg-white/30 px-3 py-2"
    : "rounded-lg border border-white/15 bg-white/5 px-3 py-2";
  const textClass = styleVariant === "bold-gold" ? "text-black" : "text-white";
  const outcomeClass = styleVariant === "bold-gold"
    ? "rounded-xl border border-black/15 bg-white/30 px-4 py-3 text-center"
    : "rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center";

  return (
    <TemplateFrame
      title="Final Score"
      subtitle={`${data.round} | ${data.teamName ?? "Rebels"}`}
      clubName={brand.clubName}
      primaryColor={brand.primaryColor || "#044229"}
      accentColor={brand.accentColor || "#FFCD00"}
      logoPath={brand.logoPath}
      options={options}
    >
      <div className={cardClass}>
        <div className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center ${textClass}`}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">Rebels</p>
            <p className="mt-2 text-3xl font-black md:text-4xl">{data.isBye ? "BYE" : (data.score ?? "-").split("-")[0] ?? "-"}</p>
          </div>
          <p className="text-3xl font-black" style={{ color: brand.accentColor || "#FFCD00" }}>
            {data.isBye ? "|" : "-"}
          </p>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">{data.opponent}</p>
            <p className="mt-2 text-3xl font-black md:text-4xl">{data.isBye ? "BYE" : (data.score ?? "-").split("-")[1] ?? "-"}</p>
          </div>
        </div>

        <div className={outcomeClass}>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/70">Outcome</p>
          <p className={`mt-1 text-lg font-bold ${textClass}`}>{renderOutcome(data.resultOutcome)}</p>
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

function renderOutcome(outcome: TemplateFixtureProps["resultOutcome"]) {
  if (outcome === "win") {
    return "Win";
  }
  if (outcome === "loss") {
    return "Loss";
  }
  if (outcome === "draw") {
    return "Draw";
  }
  return "Result";
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
