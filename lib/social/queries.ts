import { createClient } from "@/lib/supabase/server";
import { getSourceEnv, getSourceSupabaseClient } from "@/lib/supabase/source-client";
import type { Stream } from "@/types/social";
import type { FixtureRecord, MediaAssetRecord, SocialPostDraftRecord, SocialPostHistoryRecord, TemplateRecord } from "@/types/social-data";

const REBELS_SOURCE_CLUB_ID = "943e9654-2b45-48c5-9c35-45dec02e4bea";

type SourceQueryResult<T> = {
  data: T;
  issues: string[];
};

function normalizeFixtureStatus(value: unknown): "scheduled" | "completed" | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "scheduled" || normalized === "completed") {
    return normalized;
  }

  return null;
}

function mapStreamFromGrade(grade: unknown): Stream {
  if (typeof grade !== "string") {
    return "all";
  }

  const normalized = grade.toLowerCase();
  if (normalized.includes("women")) {
    return "womens";
  }
  if (normalized.includes("junior")) {
    return "juniors";
  }
  if (normalized.includes("men")) {
    return "mens";
  }

  return "all";
}

function combineFixtureDateTime(dateValue: unknown, timeValue: unknown) {
  if (typeof dateValue !== "string" || !dateValue.trim()) {
    return new Date().toISOString();
  }

  const datePart = dateValue.includes("T") ? dateValue.split("T")[0] : dateValue;
  if (typeof timeValue === "string" && timeValue.trim()) {
    const cleanTime = timeValue.replace("Z", "");
    return `${datePart}T${cleanTime}`;
  }

  return dateValue.includes("T") ? dateValue : `${datePart}T00:00:00`;
}

function inferOutcome(rebelsScore: number | null, opponentScore: number | null) {
  if (rebelsScore === null || opponentScore === null) {
    return null;
  }
  if (rebelsScore > opponentScore) {
    return "win";
  }
  if (rebelsScore < opponentScore) {
    return "loss";
  }
  return "draw";
}

function mapSourceFixture(row: any, issues: string[]): FixtureRecord | null {
  const status = normalizeFixtureStatus(row?.status);
  if (!status) {
    return null;
  }

  const homeTeam = Array.isArray(row?.home_team) ? row.home_team[0] : row?.home_team;
  const awayTeam = Array.isArray(row?.away_team) ? row.away_team[0] : row?.away_team;
  const venue = Array.isArray(row?.venue) ? row.venue[0] : row?.venue;

  const isRebelsHome = homeTeam?.club_id === REBELS_SOURCE_CLUB_ID;
  const isRebelsAway = awayTeam?.club_id === REBELS_SOURCE_CLUB_ID;

  if (!isRebelsHome && !isRebelsAway) {
    issues.push(`Fixture ${row?.id ?? "unknown"} skipped: neither side matches the Rebels club id.`);
    return null;
  }

  const rebelsTeam = isRebelsHome ? homeTeam : awayTeam;
  const opponentTeam = isRebelsHome ? awayTeam : homeTeam;

  const homeScore = typeof row?.home_score === "number" ? row.home_score : null;
  const awayScore = typeof row?.away_score === "number" ? row.away_score : null;
  const rebelsScore = isRebelsHome ? homeScore : awayScore;
  const opponentScore = isRebelsHome ? awayScore : homeScore;
  const stream = mapStreamFromGrade(rebelsTeam?.grade);
  const roundLabel = row?.round ? `Round ${row.round}` : "Round TBC";

  return {
    id: String(row?.id),
    club_id: REBELS_SOURCE_CLUB_ID,
    team_id: String(rebelsTeam?.id ?? row?.id ?? "unknown-team"),
    opponent_name: opponentTeam?.team_label ?? "BYE",
    round_label: roundLabel,
    fixture_date: combineFixtureDateTime(row?.fixture_date, row?.fixture_time),
    venue: venue?.name ?? row?.diamond ?? "TBC",
    status,
    home_score: rebelsScore,
    away_score: opponentScore,
    result_outcome: inferOutcome(rebelsScore, opponentScore),
    is_bye: !opponentTeam,
    home_or_away: isRebelsHome ? "Home" : "Away",
    source: row?.source ?? "website",
    notes: row?.notes ?? null,
    teams: {
      name: rebelsTeam?.team_label ?? "Rebels",
      stream
    }
  };
}

function mapSourceBye(row: any): FixtureRecord | null {
  const team = Array.isArray(row?.teams) ? row.teams[0] : row?.teams;
  if (!team || team.club_id !== REBELS_SOURCE_CLUB_ID) {
    return null;
  }

  const stream = mapStreamFromGrade(team.grade);
  const roundLabel = row?.round ? `Round ${row.round}` : "Round TBC";

  return {
    id: `bye-${String(row?.id)}`,
    club_id: REBELS_SOURCE_CLUB_ID,
    team_id: String(team.id),
    opponent_name: "BYE",
    round_label: roundLabel,
    fixture_date: combineFixtureDateTime(row?.updated_at ?? new Date().toISOString(), null),
    venue: "BYE",
    status: "scheduled",
    home_score: null,
    away_score: null,
    result_outcome: null,
    is_bye: true,
    home_or_away: "BYE",
    source: "team_byes",
    notes: "BYE",
    teams: {
      name: team.team_label ?? "Rebels",
      stream
    }
  };
}

export async function getClubId() {
  const supabase = createClient();
  const { data, error } = await supabase.from("clubs").select("id").order("created_at", { ascending: true }).limit(1).single();
  if (error) {
    console.error("[queries.getClubId] Failed to load club id:", error.message);
    return null;
  }
  return data?.id ?? null;
}

async function readSourceFixturesAndByes(): Promise<SourceQueryResult<FixtureRecord[]>> {
  const issues: string[] = [];
  const { missing } = getSourceEnv();
  const sourceSupabase = getSourceSupabaseClient();

  if (!sourceSupabase || missing.length > 0) {
    issues.push(`Missing source Supabase env vars: ${missing.join(", ")}`);
    return { data: [], issues };
  }

  const { data: fixtureRows, error: fixtureError } = await sourceSupabase
    .from("fixtures")
    .select(
      "id, season, round, fixture_date, fixture_time, diamond, venue_id, home_team_id, away_team_id, source, notes, home_score, away_score, status, updated_at, news_article_id, home_team:home_team_id(id, grade, season, club_id, division, team_label), away_team:away_team_id(id, grade, season, club_id, division, team_label), venue:venue_id(id, name)"
    )
    .order("fixture_date", { ascending: true });

  if (fixtureError) {
    console.error("[queries.readSourceFixturesAndByes] Fixture read failed:", fixtureError.message);
    issues.push(fixtureError.message.toLowerCase().includes("permission")
      ? "Source database read denied for fixtures."
      : "Source fixtures could not be loaded.");
    return { data: [], issues };
  }

  const mappedFixtures = (fixtureRows ?? [])
    .map((row) => mapSourceFixture(row, issues))
    .filter((fixture): fixture is FixtureRecord => fixture !== null);

  const { data: byeRows, error: byeError } = await sourceSupabase
    .from("team_byes")
    .select("id, season, round, team_id, updated_at, teams:team_id(id, grade, season, club_id, division, team_label)")
    .order("round", { ascending: true });

  if (byeError) {
    console.error("[queries.readSourceFixturesAndByes] BYE read failed:", byeError.message);
    issues.push(byeError.message.toLowerCase().includes("permission")
      ? "Source database read denied for team byes."
      : "Team BYE data could not be loaded.");
  }

  const mappedByes = (byeRows ?? [])
    .map((row) => mapSourceBye(row))
    .filter((fixture): fixture is FixtureRecord => fixture !== null);

  const fixtures = [...mappedFixtures, ...mappedByes].sort((a, b) => {
    const aDate = new Date(a.fixture_date).getTime();
    const bDate = new Date(b.fixture_date).getTime();
    return aDate - bDate;
  });

  if (fixtures.length === 0) {
    issues.push("No fixtures found for the configured Rebels source club id.");
  }

  return {
    data: fixtures,
    issues: Array.from(new Set(issues))
  };
}

export async function getSourceFixtures(stream: Stream = "all"): Promise<SourceQueryResult<FixtureRecord[]>> {
  const result = await readSourceFixturesAndByes();
  if (stream === "all") {
    return result;
  }

  return {
    data: result.data.filter((fixture) => fixture.teams?.stream === stream),
    issues: result.issues
  };
}

export async function getFixtures(stream: Stream = "all"): Promise<FixtureRecord[]> {
  const result = await getSourceFixtures(stream);
  return result.data;
}

export async function getFixturesByStatus(status: "scheduled" | "completed", stream: Stream = "all"): Promise<FixtureRecord[]> {
  const fixtures = await getFixtures(stream);
  const target = status.toLowerCase();
  return fixtures.filter((fixture) => fixture.status.toLowerCase() === target);
}

export async function getSourceMediaAssets(): Promise<SourceQueryResult<MediaAssetRecord[]>> {
  const issues: string[] = [];
  const { missing } = getSourceEnv();
  const sourceSupabase = getSourceSupabaseClient();

  if (!sourceSupabase || missing.length > 0) {
    issues.push(`Missing source Supabase env vars: ${missing.join(", ")}`);
    return { data: [], issues };
  }

  const { data, error } = await sourceSupabase
    .from("media")
    .select("id, media_type, url, thumbnail_url, created_at")
    .eq("media_type", "image")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[queries.getSourceMediaAssets] Source media load failed:", error.message);
    issues.push(error.message.toLowerCase().includes("permission")
      ? "Source database read denied for media."
      : "Source media could not be loaded.");
    return { data: [], issues };
  }

  const assets = (data ?? []).map((row: any) => ({
    id: String(row.id),
    media_type: row.media_type ?? "image",
    url: row.url ?? "",
    thumbnail_url: row.thumbnail_url ?? row.url ?? null,
    alt_text: null,
    created_at: row.created_at ?? new Date().toISOString()
  })) as MediaAssetRecord[];

  return {
    data: assets.filter((asset) => Boolean(asset.url)),
    issues
  };
}

export async function getTemplates(): Promise<TemplateRecord[]> {
  const supabase = createClient();
  const clubId = await getClubId();

  if (!clubId) {
    return [];
  }

  const { data, error } = await supabase
    .from("social_templates")
    .select("id, name, post_type, component_key, is_active")
    .eq("club_id", clubId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("[queries.getTemplates] Failed to load templates:", error.message);
    return [];
  }

  return (data ?? []) as TemplateRecord[];
}

export async function getMediaAssets(): Promise<MediaAssetRecord[]> {
  const supabase = createClient();
  const clubId = await getClubId();

  if (!clubId) {
    return [];
  }

  const { data, error } = await supabase
    .from("media_assets")
    .select("id, file_path, media_type, alt_text, storage_bucket, created_at")
    .eq("club_id", clubId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[queries.getMediaAssets] Failed to load media assets:", error.message);
    return [];
  }

  return (data ?? []) as MediaAssetRecord[];
}

export async function getSocialPosts(): Promise<SocialPostHistoryRecord[]> {
  const supabase = createClient();
  const clubId = await getClubId();

  if (!clubId) {
    return [];
  }

  const { data, error } = await supabase
    .from("social_posts")
    .select("id, fixture_id, post_type, custom_post_type, custom_payload, caption, status, image_path, created_at, social_templates(name)")
    .eq("club_id", clubId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[queries.getSocialPosts] Failed to load social posts:", error.message);
    return [];
  }

  const sourceFixtures = await getFixtures("all");
  const sourceFixtureById = new Map(sourceFixtures.map((fixture) => [fixture.id, fixture]));

  return (data ?? []).map((row: any) => {
    const sourceFixture = sourceFixtureById.get(String(row.fixture_id));
    const fixtureContext = sourceFixture
      ? {
        round_label: sourceFixture.round_label,
        opponent_name: sourceFixture.opponent_name
      }
      : null;

    return {
    id: row.id,
    post_type: row.custom_post_type ?? row.post_type,
    custom_post_type: row.custom_post_type ?? null,
    caption: row.caption,
    status: row.status,
    image_path: row.image_path,
    created_at: row.created_at,
    fixtures: fixtureContext ?? {
      round_label: "External Fixture",
      opponent_name: "Source Data"
    },
    social_templates: Array.isArray(row.social_templates) ? row.social_templates[0] : row.social_templates
    };
  }) as SocialPostHistoryRecord[];
}

export async function getSocialPostDraftById(id: string): Promise<SocialPostDraftRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("social_posts")
    .select("id, fixture_id, template_id, post_type, custom_post_type, custom_payload, caption, status")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[queries.getSocialPostDraftById] Failed to load draft:", error.message, "id:", id);
    return null;
  }

  if (!data) {
    return null;
  }

  let fixtureContext: { round_label: string } | null = null;
  const sourceFixtures = await getFixtures("all");
  const sourceFixture = sourceFixtures.find((fixture) => fixture.id === data.fixture_id);
  if (sourceFixture) {
    fixtureContext = {
      round_label: sourceFixture.round_label
    };
  }

  return {
    id: data.id,
    fixture_id: data.fixture_id,
    template_id: data.template_id,
    post_type: data.custom_post_type ?? data.post_type,
    custom_post_type: data.custom_post_type ?? null,
    custom_payload: data.custom_payload ?? null,
    caption: data.caption,
    status: data.status,
    fixtures: fixtureContext
  } as SocialPostDraftRecord;
}
