import { createClient } from "@supabase/supabase-js";

let cachedClient: ReturnType<typeof createClient> | null = null;

export function getSourceEnv() {
  const url = process.env.NEXT_PUBLIC_SOURCE_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SOURCE_SUPABASE_ANON_KEY;
  const missing: string[] = [];

  if (!url) {
    missing.push("NEXT_PUBLIC_SOURCE_SUPABASE_URL");
  }
  if (!anonKey) {
    missing.push("NEXT_PUBLIC_SOURCE_SUPABASE_ANON_KEY");
  }

  return { url, anonKey, missing };
}

export function getSourceSupabaseClient() {
  const { url, anonKey, missing } = getSourceEnv();
  if (missing.length > 0 || !url || !anonKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(url, anonKey);
  }

  return cachedClient;
}
