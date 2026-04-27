import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SOURCE_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SOURCE_SUPABASE_ANON_KEY
);

const { data, error } = await supabase
  .from("fixtures")
  .select(`
    *,
    home_team:home_team_id (*),
    away_team:away_team_id (*),
    venue:venue_id (*)
  `)
  .limit(5);

console.log("error:", error);
console.dir(data, { depth: null });