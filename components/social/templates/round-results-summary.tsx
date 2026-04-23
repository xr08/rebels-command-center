import { TemplateFrame } from "./template-frame";
import type { FixtureRecord, TemplateOptions } from "@/types/social-data";

type Props = {
  fixtures: FixtureRecord[];
  options: TemplateOptions;
  brand: {
    clubName: string;
    primaryColor: string;
    accentColor: string;
    logoPath?: string | null;
  };
};

function groupByStream(fixtures: FixtureRecord[]) {
  return fixtures.reduce<Record<string, FixtureRecord[]>>((acc, fixture) => {
    const key = fixture.teams?.stream ?? "other";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(fixture);
    return acc;
  }, {});
}

export function RoundResultsSummaryTemplate({ fixtures, options, brand }: Props) {
  const round = fixtures[0]?.round_label ?? "Round Results";
  const grouped = groupByStream(fixtures);

  return (
    <TemplateFrame
      title="Round Results"
      subtitle={`${round} | ${fixtures.length} results`}
      clubName={brand.clubName}
      primaryColor={brand.primaryColor}
      accentColor={brand.accentColor}
      logoPath={brand.logoPath}
      options={options}
    >
      <div className="space-y-3 rounded-2xl border border-white/20 bg-black/35 p-4 backdrop-blur-sm md:p-5">
        {Object.entries(grouped).map(([stream, streamFixtures]) => (
          <section key={stream} className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">{stream}</p>
            {streamFixtures.slice(0, options.aspectRatio === "portrait" ? 7 : 5).map((fixture) => (
              <div key={fixture.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <span className="font-semibold">{fixture.teams?.name ?? "Rebels"} vs {fixture.opponent_name}</span>
                <span className="rounded bg-command-accent/20 px-2 py-1 text-xs font-bold text-command-accent">
                  {fixture.home_score ?? "-"}-{fixture.away_score ?? "-"}
                </span>
              </div>
            ))}
          </section>
        ))}
      </div>
    </TemplateFrame>
  );
}
