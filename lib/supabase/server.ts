import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookieList: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        try {
          cookieList.forEach(({ name, value, options }) => cookieStore.set(name, value, options as never));
        } catch {
          // Setting cookies in Server Components can throw; middleware handles refresh.
        }
      }
    }
  });
}
