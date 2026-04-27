import { createClient } from "@/lib/supabase/server";
import type { Stream } from "@/types/social";
import type { FixtureRecord, MediaAssetRecord, SocialPostDraftRecord, SocialPostHistoryRecord, TemplateRecord } from "@/types/social-data";

export async function getClubId() {
  const supabase = createClient();
  const { data, error } = await supabase.from("clubs").select("id").order("created_at", { ascending: true }).limit(1).single();
  if (error) {
    console.error("[queries.getClubId] Failed to load club id:", error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function getFixtures(stream: Stream = "all"): Promise<FixtureRecord[]> {
  const supabase = createClient();
  const clubId = await getClubId();

  if (!clubId) {
    return [];
  }

  let query = supabase
    .from("fixtures")
    .select(
      "id, club_id, team_id, opponent_name, round_label, fixture_date, venue, status, home_score, away_score, result_outcome, teams (name, stream)"
    )
    .eq("club_id", clubId)
    .order("fixture_date", { ascending: true });

  const { data, error } = await query;
  if (error) {
    console.error("[queries.getFixtures] Failed to load fixtures:", error.message);
    return [];
  }
  const fixtures: FixtureRecord[] = (data ?? []).map((row: any) => ({
    id: row.id,
    club_id: row.club_id,
    team_id: row.team_id,
    opponent_name: row.opponent_name,
    round_label: row.round_label,
    fixture_date: row.fixture_date,
    venue: row.venue,
    status: row.status,
    home_score: row.home_score,
    away_score: row.away_score,
    result_outcome: row.result_outcome,
    teams: Array.isArray(row.teams) ? row.teams[0] : row.teams
  }));

  if (stream === "all") {
    return fixtures;
  }

  return fixtures.filter((fixture) => fixture.teams?.stream === stream);
}

export async function getFixturesByStatus(status: "scheduled" | "completed", stream: Stream = "all"): Promise<FixtureRecord[]> {
  const fixtures = await getFixtures(stream);
  return fixtures.filter((fixture) => fixture.status === status);
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
    .select("id, post_type, caption, status, image_path, created_at, fixtures(round_label, opponent_name), social_templates(name)")
    .eq("club_id", clubId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[queries.getSocialPosts] Failed to load social posts:", error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    post_type: row.post_type,
    caption: row.caption,
    status: row.status,
    image_path: row.image_path,
    created_at: row.created_at,
    fixtures: Array.isArray(row.fixtures) ? row.fixtures[0] : row.fixtures,
    social_templates: Array.isArray(row.social_templates) ? row.social_templates[0] : row.social_templates
  })) as SocialPostHistoryRecord[];
}

export async function getSocialPostDraftById(id: string): Promise<SocialPostDraftRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("social_posts")
    .select("id, fixture_id, template_id, post_type, caption, status, fixtures(round_label)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[queries.getSocialPostDraftById] Failed to load draft:", error.message, "id:", id);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    fixture_id: data.fixture_id,
    template_id: data.template_id,
    post_type: data.post_type,
    caption: data.caption,
    status: data.status,
    fixtures: Array.isArray(data.fixtures) ? data.fixtures[0] : data.fixtures
  } as SocialPostDraftRecord;
}
