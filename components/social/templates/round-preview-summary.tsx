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

function getFixtureTitle(fixture: FixtureRecord) {
  if (fixture.is_bye) {
    return `${fixture.teams?.name ?? "Rebels"} | BYE`;
  }
  const div = getDivisionTag(fixture.teams?.name);
  const opponent = getOpponentShortName(fixture.opponent_name, fixture.is_bye);
  return `${div ? `${div} ` : ""}Rebels v ${opponent}`.trim();
}

export function RoundPreviewSummaryTemplate({ fixtures, options, brand }: Props) {
  const round = fixtures[0]?.round_label ?? "Round Preview";
  const grouped = groupByStream(fixtures);
  const streamEntries = Object.entries(grouped);
  const maxStreams = options.aspectRatio === "portrait" ? 4 : 3;
  const maxPerStream = options.aspectRatio === "portrait" ? 5 : 3;
  const visibleEntries = streamEntries.slice(0, maxStreams);
  const hiddenByStream = streamEntries.slice(maxStreams).reduce((sum, [, list]) => sum + list.length, 0);
  const hiddenWithinVisible = visibleEntries.reduce((sum, [, list]) => sum + Math.max(0, list.length - maxPerStream), 0);
  const hiddenCount = hiddenByStream + hiddenWithinVisible;

  return (
    <TemplateFrame
      title="Round Preview"
      subtitle={`${round} | ${fixtures.length} fixtures`}
      clubName={brand.clubName}
      primaryColor={brand.primaryColor}
      accentColor={brand.accentColor}
      logoPath={brand.logoPath}
      options={options}
    >
      <div className="space-y-3 rounded-2xl border border-white/20 bg-black/35 p-4 backdrop-blur-sm md:p-5">
        {visibleEntries.map(([stream, streamFixtures]) => (
          <section key={stream} className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">{stream}</p>
            {streamFixtures.slice(0, maxPerStream).map((fixture) => (
              <div key={fixture.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <span className="truncate font-semibold">{getFixtureTitle(fixture)}</span>
                <span className="max-w-[45%] truncate text-xs text-command-accent">
                  {fixture.is_bye ? "BYE" : `${fixture.home_or_away ?? "TBC"} | ${fixture.venue}`}
                </span>
              </div>
            ))}
          </section>
        ))}
        {hiddenCount > 0 ? (
          <p className="text-center text-xs uppercase tracking-[0.14em] text-white/65">+ {hiddenCount} more fixtures</p>
        ) : null}
      </div>
    </TemplateFrame>
  );
}
