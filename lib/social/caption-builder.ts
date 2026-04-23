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

export function buildPreviewCaption(data: TemplateFixtureProps, clubName: string) {
  const audienceLine =
    data.stream === "womens"
      ? "Our Womens squad is ready to set the tempo."
      : data.stream === "juniors"
        ? "Our Juniors are primed for a big performance."
        : "Our Mens squad is ready to bring the intensity.";

  return `${data.round}: ${data.teamName ?? "Rebels"} vs ${data.opponent}
${data.date} at ${data.time}
Venue: ${data.venue}

${audienceLine}
${clubName} are set for game day.
#FremantleRebels #GameDay ${streamTag(data.stream)}`;
}

export function buildResultCaption(data: TemplateFixtureProps, clubName: string) {
  const scoreLine = data.score ? `Score: ${data.score}` : "Full Time";
  const outcomeLine =
    data.resultOutcome === "win"
      ? "Big win for the Rebels."
      : data.resultOutcome === "loss"
        ? "Tough result, we regroup and go again."
        : data.resultOutcome === "draw"
          ? "Points shared after a hard-fought contest."
          : "Final result locked in.";

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
  return `${round} preview is live.
${fixtureCount} fixtures across ${streamText}.

Big weekend ahead for ${clubName}.
#FremantleRebels #RoundPreview`;
}

export function buildResultSummaryCaption(
  round: string,
  clubName: string,
  stream: "mens" | "womens" | "juniors" | "all",
  fixtureCount: number
) {
  const streamText = stream === "all" ? "all Rebels squads" : `${stream} squad`;
  return `${round} results are in.
${fixtureCount} completed fixtures across ${streamText}.

Strong effort right across ${clubName}.
#FremantleRebels #RoundResults`;
}
