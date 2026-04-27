import type { TemplateFixtureProps } from "@/types/social-data";

function streamTag(stream?: TemplateFixtureProps["stream"]) {
  if (stream === "womens") {
    return "#RebelsWomens";
  }
  if (stream === "juniors") {
    return "#RebelsJuniors";
  }
  return "#RebelsMens";
}

function pickVariant(seed: string, variants: string[]) {
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return variants[hash % variants.length];
}

export function buildPreviewCaption(data: TemplateFixtureProps, clubName: string) {
  if (data.isBye) {
    return `${data.round}: ${data.teamName ?? "Rebels"} have the BYE
Next fixture details coming soon.

${clubName} stay ready for the next challenge.
#FremantleRebels ${streamTag(data.stream)}`;
  }

  const audienceBase =
    data.stream === "womens"
      ? "Our Womens squad is ready to set the tempo."
      : data.stream === "juniors"
        ? "Our Juniors are primed for a big performance."
        : "Our Mens squad is ready to bring the intensity.";

  const audienceLine = pickVariant(`${data.round}-${data.opponent}-${data.stream}`, [
    audienceBase,
    `${data.teamName ?? "Rebels"} are dialed in and ready to compete.`,
    `Game day focus is set for the ${data.teamName ?? "Rebels"}.`
  ]);

  return `${data.round}: ${data.teamName ?? "Rebels"} vs ${data.opponent}
${data.date} at ${data.time}
Venue: ${data.venue}

${audienceLine}
${clubName} are set for game day.
#FremantleRebels #GameDay ${streamTag(data.stream)}`;
}

export function buildResultCaption(data: TemplateFixtureProps, clubName: string) {
  if (data.isBye) {
    return `${data.round}: ${data.teamName ?? "Rebels"} | BYE
No match result this round.

${clubName} reset and prepare for next week.
#FremantleRebels #MatchResult ${streamTag(data.stream)}`;
  }

  const scoreLine = data.score ? `Score: ${data.score}` : "Full Time";
  const outcomeBase =
    data.resultOutcome === "win"
      ? "Big win for Rebels."
      : data.resultOutcome === "loss"
        ? "Tough result, we regroup and go again."
        : data.resultOutcome === "draw"
          ? "Points shared after a hard-fought contest."
          : "Final result locked in.";

  const outcomeLine = pickVariant(`${data.round}-${data.score}-${data.resultOutcome}`, [
    outcomeBase,
    `${data.teamName ?? "Rebels"} gave it everything until the last innings.`,
    "Strong effort from the group across all digs"
  ]);

  return `${data.round}: ${data.teamName ?? "Rebels"} vs ${data.opponent}
${scoreLine}
Venue: ${data.venue}

${outcomeLine}
Strong effort from ${clubName}.
#FremantleRebels #MatchResult ${streamTag(data.stream)}`;
}

export function buildCaptionByType(type: "preview_single" | "result_single", data: TemplateFixtureProps, clubName: string) {
  if (type === "result_single") {
    return buildResultCaption(data, clubName);
  }
  return buildPreviewCaption(data, clubName);
}

export function buildPreviewSummaryCaption(
  round: string,
  clubName: string,
  stream: "mens" | "womens" | "juniors" | "all",
  fixtureCount: number
) {
  const streamText = stream === "all" ? "all Rebels squads" : `${stream} squad`;
  const line = pickVariant(`${round}-${stream}-${fixtureCount}`, [
    "Big weekend ahead for Rebels.",
    "A huge round is loading for the club.",
    "Plenty of action coming up this round."
  ]);
  return `${round} preview is live.
${fixtureCount} fixtures across ${streamText}.

${line}
#${clubName.replace(/\s+/g, "")}
#FremantleRebels #RoundPreview`;
}

export function buildResultSummaryCaption(
  round: string,
  clubName: string,
  stream: "mens" | "womens" | "juniors" | "all",
  fixtureCount: number
) {
  const streamText = stream === "all" ? "all Rebels squads" : `${stream} squad`;
  const line = pickVariant(`${round}-${stream}-${fixtureCount}-results`, [
    "Strong effort right across the club.",
    "Another demanding round completed.",
    "Solid work from every Rebels team."
  ]);
  return `${round} results are in.
${fixtureCount} completed fixtures across ${streamText}.

${line}
#${clubName.replace(/\s+/g, "")}
#FremantleRebels #RoundResults`;
}
