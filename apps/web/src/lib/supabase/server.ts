import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Personal single-user app: no login, no session. Every request talks to
 * Supabase as the anon role; RLS policies are intentionally open (see
 * migration 004_open_single_user_access) since there is only one profile.
 */
export function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
