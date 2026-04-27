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

function formatFixtureTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(new Date(value)).toLowerCase();
}

function formatRoundDateRange(fixtures: FixtureRecord[]) {
  const uniqueDates = Array.from(
    new Set(
      fixtures.map((fixture) => {
        const d = new Date(fixture.fixture_date);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    )
  )
    .map((key) => {
      const [year, month, day] = key.split("-").map(Number);
      return new Date(year, month, day);
    })
    .sort((a, b) => a.getTime() - b.getTime());

  if (uniqueDates.length === 0) {
    return "Date TBC";
  }

  if (uniqueDates.length === 1) {
    return new Intl.DateTimeFormat("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(uniqueDates[0]);
  }

  const start = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(uniqueDates[0]);
  const end = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(uniqueDates[uniqueDates.length - 1]);

  return `${start} - ${end}`;
}

function getOpponentShortName(opponent: string, isBye?: boolean) {
  if (isBye) {
    return "BYE";
  }
  const [firstWord] = opponent.trim().split(/\s+/);
  return firstWord || opponent;
}

function getMatchLabel(fixture: FixtureRecord) {
  const teamLabel = fixture.teams?.name ?? "Rebels";
  if (fixture.is_bye) {
    return `${teamLabel} | BYE`;
  }
  const opponent = getOpponentShortName(fixture.opponent_name, fixture.is_bye);
  return `${teamLabel} v ${opponent} · ${formatFixtureTime(fixture.fixture_date)}`;
}

export function RoundResultsSummaryTemplate({ fixtures, options, brand }: Props) {
  const round = fixtures[0]?.round_label ?? "Round Results";
  const grouped = groupByStream(fixtures);
  const streamEntries = Object.entries(grouped);
  const dateLabel = formatRoundDateRange(fixtures);

  return (
    <TemplateFrame
      title="Round Results"
      subtitle={`${round} | ${fixtures.length} Fixtures | ${dateLabel}`}
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
            {streamFixtures.map((fixture) => (
              <div key={fixture.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <span className="truncate font-semibold text-white">{getMatchLabel(fixture)}</span>
                <span className="rounded bg-command-accent/20 px-2 py-1 text-xs font-bold text-command-accent">
                  {fixture.is_bye ? "BYE" : `${fixture.home_score ?? "-"}-${fixture.away_score ?? "-"}`}
                </span>
              </div>
            ))}
          </section>
        ))}
      </div>
    </TemplateFrame>
  );
}
