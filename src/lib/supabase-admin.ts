import { createClient } from "@supabase/supabase-js";
import { assertServerEnv, env } from "./env";

export function getSupabaseAdmin() {
  assertServerEnv();

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
