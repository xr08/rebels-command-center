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

function formatStreamLabel(stream: string) {
  if (stream === "mens") {
    return "Mens";
  }
  if (stream === "womens") {
    return "Womens";
  }
  if (stream === "juniors") {
    return "Juniors";
  }
  return "All";
}

function getDivisionTag(teamName?: string) {
  if (!teamName) {
    return "";
  }
  const match = teamName.match(/div\s*\d+[a-z]?/i);
  return match ? match[0].toUpperCase() : "";
}

function getOpponentShortName(opponent: string, isBye?: boolean) {
  if (isBye) {
    return "BYE";
  }
  const [firstWord] = opponent.trim().split(/\s+/);
  return firstWord || opponent;
}

function getFixtureParts(fixture: FixtureRecord) {
  if (fixture.is_bye) {
    return { division: "BYE", matchup: `${fixture.teams?.name ?? "Rebels"} | BYE` };
  }
  const div = getDivisionTag(fixture.teams?.name);
  const opponent = getOpponentShortName(fixture.opponent_name, fixture.is_bye);
  return { division: div || "DIV", matchup: `Rebels v ${opponent}` };
}

export function RoundResultsSummaryTemplate({ fixtures, options, brand }: Props) {
  const round = fixtures[0]?.round_label ?? "Round Results";
  const grouped = groupByStream(fixtures);
  const streamEntries = Object.entries(grouped);

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
        {streamEntries.map(([stream, streamFixtures]) => (
          <section key={stream} className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">
              {`${round} | ${formatStreamLabel(stream)} | ${streamFixtures.length} fixtures`}
            </p>
            {streamFixtures.map((fixture) => {
              const parts = getFixtureParts(fixture);
              return (
              <div key={fixture.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <span className="truncate font-semibold">
                  <span className="text-command-accent">{parts.division}</span>
                  <span className="pl-2 text-white">{parts.matchup}</span>
                </span>
                <span className="rounded bg-command-accent/20 px-2 py-1 text-xs font-bold text-command-accent">
                  {fixture.is_bye ? "BYE" : `${fixture.home_score ?? "-"}-${fixture.away_score ?? "-"}`}
                </span>
              </div>
            )})}
          </section>
        ))}
      </div>
    </TemplateFrame>
  );
}
