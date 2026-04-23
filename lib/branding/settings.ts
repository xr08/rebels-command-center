import { createClient } from "@/lib/supabase/server";

export type BrandSettings = {
  clubId: string;
  clubName: string;
  primaryColor: string;
  accentColor: string;
  logoPath: string | null;
};

export const fallbackBrandSettings: BrandSettings = {
  clubId: "",
  clubName: "Fremantle Rebels",
  primaryColor: "#044229",
  accentColor: "#FFCD00",
  logoPath: "/brands/fremantle-rebels-logo.png"
};

export async function getBrandSettings(): Promise<BrandSettings> {
  const supabase = createClient();
  const { data: rawClub } = await supabase
    .from("clubs")
    .select("id, name")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  const club = (rawClub ?? null) as { id: string; name: string } | null;

  if (!club) {
    return fallbackBrandSettings;
  }

  const { data: rawSetting } = await supabase
    .from("brand_settings")
    .select("primary_color, accent_color, logo_path")
    .eq("club_id", club.id)
    .single();
  const setting = (rawSetting ?? null) as { primary_color: string; accent_color: string; logo_path: string | null } | null;

  if (!setting) {
    return {
      ...fallbackBrandSettings,
      clubId: club.id,
      clubName: club.name
    };
  }

  return {
    clubId: club.id,
    clubName: club.name,
    primaryColor: setting.primary_color,
    accentColor: setting.accent_color,
    logoPath: setting.logo_path || fallbackBrandSettings.logoPath
  };
}
