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
      <div className="space-y-4 rounded-2xl border border-white/20 bg-black/35 p-4 backdrop-blur-sm md:p-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
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

        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/70">Outcome</p>
          <p className="mt-1 text-lg font-bold">{renderOutcome(data.resultOutcome)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm md:text-base">
          <InfoRow label="Date" value={data.date} />
          <InfoRow label="Time" value={data.time} />
          <InfoRow label="Round" value={data.round} />
          <InfoRow label="Venue" value={data.venue} />
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/5 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/70">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
