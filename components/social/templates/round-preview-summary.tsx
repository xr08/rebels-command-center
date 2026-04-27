import { TemplateFrame } from "./template-frame";
import { formatSummaryName } from "./summary-name-formatter";
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

function getMatchLabel(fixture: FixtureRecord) {
  const teamLabel = formatSummaryName(fixture.teams?.name) || "Rebels";
  if (fixture.is_bye) {
    return {
      compact: `${teamLabel} | BYE`,
      full: `${fixture.teams?.name ?? "Rebels"} | BYE`
    };
  }
  const opponent = formatSummaryName(fixture.opponent_name) || fixture.opponent_name;
  const side = fixture.home_or_away ?? "TBC";
  return {
    compact: `${teamLabel} v ${opponent} | ${formatFixtureTime(fixture.fixture_date)} | ${side}`,
    full: `${fixture.teams?.name ?? "Rebels"} v ${fixture.opponent_name} | ${formatFixtureTime(fixture.fixture_date)} | ${side}`
  };
}

export function RoundPreviewSummaryTemplate({ fixtures, options, brand }: Props) {
  const styleVariant = options.styleVariant ?? "classic-green";
  const round = fixtures[0]?.round_label ?? "Round Preview";
  const grouped = groupByStream(fixtures);
  const streamEntries = Object.entries(grouped);
  const dateLabel = formatRoundDateRange(fixtures);
  const panelClass = styleVariant === "minimal-board"
    ? "space-y-3 rounded-2xl border border-white/30 bg-black/20 p-4 md:p-5"
    : styleVariant === "bold-gold"
      ? "space-y-3 rounded-2xl border border-black/15 bg-white/20 p-4 backdrop-blur-sm md:p-5"
      : "space-y-3 rounded-2xl border border-white/20 bg-black/35 p-4 backdrop-blur-sm md:p-5";
  const rowClass = styleVariant === "bold-gold"
    ? "grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-black/10 bg-white/30 px-3 py-2 text-sm"
    : "grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm";
  const rowTextClass = styleVariant === "bold-gold" ? "truncate font-semibold text-black" : "truncate font-semibold text-white";

  return (
    <TemplateFrame
      title="Round Preview"
      subtitle={`${round} | ${fixtures.length} Fixtures | ${dateLabel}`}
      clubName={brand.clubName}
      primaryColor={brand.primaryColor}
      accentColor={brand.accentColor}
      logoPath={brand.logoPath}
      options={options}
    >
      <div className={panelClass}>
        {streamEntries.map(([stream, streamFixtures]) => (
          <section key={stream} className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">
              {`${round} | ${formatStreamLabel(stream)} | ${streamFixtures.length} fixtures`}
            </p>
            {streamFixtures.map((fixture) => {
              const label = getMatchLabel(fixture);
              return (
                <div key={fixture.id} className={rowClass}>
                  <span className={rowTextClass} title={label.full} aria-label={label.full}>
                    {label.compact}
                  </span>
                  {fixture.is_bye ? <span className="text-xs text-command-accent">BYE</span> : <span />}
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </TemplateFrame>
  );
}
