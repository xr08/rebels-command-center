import type { PostType } from "./social";

export type FixtureRecord = {
  id: string;
  club_id: string;
  team_id: string;
  opponent_name: string;
  round_label: string;
  fixture_date: string;
  venue: string;
  status: "scheduled" | "completed";
  home_score: number | null;
  away_score: number | null;
  result_outcome: string | null;
  teams?: {
    name: string;
    stream: string;
  } | null;
};

export type TemplateRecord = {
  id: string;
  name: string;
  post_type: PostType;
  component_key: string;
  is_active: boolean;
};

export type MediaAssetRecord = {
  id: string;
  file_path: string;
  media_type: string;
  alt_text: string | null;
  storage_bucket: string;
  created_at: string;
};

export type SocialPostHistoryRecord = {
  id: string;
  post_type: PostType;
  caption: string;
  status: "draft" | "posted";
  image_path: string | null;
  created_at: string;
  fixtures?: {
    round_label: string;
    opponent_name: string;
  } | null;
  social_templates?: {
    name: string;
  } | null;
};

export type TemplateFixtureProps = {
  opponent: string;
  round: string;
  date: string;
  time: string;
  venue: string;
  score?: string | null;
  teamName?: string;
  stream?: "mens" | "womens" | "juniors" | "all";
  resultOutcome?: "win" | "loss" | "draw" | null;
};

export type TemplateOptions = {
  aspectRatio: "square" | "portrait";
  showSponsorStrip: boolean;
  showLogo: boolean;
  backgroundImageUrl?: string | null;
};

export type SocialPostDraftRecord = {
  id: string;
  fixture_id: string;
  template_id: string;
  post_type: PostType;
  caption: string;
  status: "draft" | "posted";
  fixtures?: {
    round_label: string;
  } | null;
};
