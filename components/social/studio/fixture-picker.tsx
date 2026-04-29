"use client";

import type { FixtureRecord } from "@/types/social-data";

type ComposeMode = "single" | "summary";

type Props = {
  composeMode: ComposeMode;
  filteredFixtures: FixtureRecord[];
  fixtureId: string;
  setFixtureId: (value: string) => void;
  availableRounds: string[];
  roundLabel: string;
  setRoundLabel: (value: string) => void;
  summaryFixtureCount: number;
  formatFixtureTime: (value: string) => string;
};

export function FixturePicker({
  composeMode,
  filteredFixtures,
  fixtureId,
  setFixtureId,
  availableRounds,
  roundLabel,
  setRoundLabel,
  summaryFixtureCount,
  formatFixtureTime
}: Props) {
  if (composeMode === "summary") {
    return (
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Round</p>
        <label className="block space-y-1">
          <span className="text-xs text-command-muted">Round</span>
          <select value={roundLabel} onChange={(event) => setRoundLabel(event.target.value)} className="w-full rounded-md border border-white/15 bg-black/20 p-2 text-sm">
            {availableRounds.map((round) => (
              <option key={round} value={round}>
                {round}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-command-muted">{summaryFixtureCount} fixture(s) in this summary.</p>
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <p className="text-xs uppercase tracking-[0.18em] text-command-accent">Fixture</p>
      <ul className="max-h-[320px] space-y-2 overflow-auto pr-1">
        {filteredFixtures.map((fixture) => (
          <li key={fixture.id}>
            <button
              type="button"
              onClick={() => setFixtureId(fixture.id)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                fixture.id === fixtureId ? "border-command-accent bg-command-accent/10" : "border-white/15 bg-black/20 hover:border-command-accent/40"
              }`}
            >
              <p className="text-xs text-command-muted">{fixture.round_label}</p>
              <p className="text-sm font-semibold">
                {fixture.is_bye
                  ? `${fixture.teams?.name ?? "Rebels"} | BYE`
                  : `${fixture.teams?.name ?? "Rebels"} v ${fixture.opponent_name} | ${formatFixtureTime(fixture.fixture_date)} | ${fixture.home_or_away ?? "TBC"}`}
              </p>
            </button>
          </li>
        ))}
        {!filteredFixtures.length ? (
          <li className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 p-3 text-sm text-yellow-100">
            No fixtures available for these filters. If this looks wrong, check source Supabase access and fixture status values.
          </li>
        ) : null}
      </ul>
    </section>
  );
}
