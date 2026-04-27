import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SOURCE_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SOURCE_SUPABASE_ANON_KEY
);

const { data, error } = await supabase
  .from("fixtures")
  .select("*")
  .limit(5);

console.log("error:", error);
console.log("data:", data);