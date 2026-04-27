import type { CustomPostType, PostType, StyleVariant } from "./social";

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
  is_bye?: boolean;
  home_or_away?: "Home" | "Away" | "BYE" | null;
  source?: string | null;
  notes?: string | null;
  teams?: {
    name: string;
    stream: string;
  } | null;
};

export type TemplateRecord = {
  id: string;
  name: string;
  post_type: PostType | CustomPostType;
  component_key: string;
  default_style_variant?: StyleVariant | null;
  is_active: boolean;
};

export type MediaAssetRecord = {
  id: string;
  file_path?: string;
  url?: string;
  thumbnail_url?: string | null;
  media_type: string;
  alt_text: string | null;
  storage_bucket?: string;
  created_at: string;
};

export type SocialPostHistoryRecord = {
  id: string;
  post_type: PostType | CustomPostType;
  custom_post_type?: CustomPostType | null;
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
  isBye?: boolean;
  stream?: "mens" | "womens" | "juniors" | "all";
  resultOutcome?: "win" | "loss" | "draw" | null;
};

export type TemplateOptions = {
  aspectRatio: "square" | "portrait";
  showSponsorStrip: boolean;
  showLogo: boolean;
  styleVariant: StyleVariant;
  backgroundImageUrl?: string | null;
  exportMode?: boolean;
};

export type CustomPostFormData = {
  heading: string;
  subheading: string;
  title: string;
  bodyText: string;
  date: string;
  time: string;
  location: string;
  ctaText: string;
  personName: string;
  sponsorName: string;
  stream: "mens" | "womens" | "juniors" | "all";
  selectedMediaId: string;
  selectedLogoId: string;
};

export type CustomTemplateData = CustomPostFormData & {
  postType: CustomPostType;
};

export type SocialPostDraftRecord = {
  id: string;
  fixture_id: string | null;
  template_id: string | null;
  post_type: PostType | CustomPostType;
  custom_post_type?: CustomPostType | null;
  custom_payload?: Partial<CustomPostFormData> | null;
  caption: string;
  status: "draft" | "posted";
  fixtures?: {
    round_label: string;
  } | null;
};

export type SourceLoadState = {
  issues: string[];
};
