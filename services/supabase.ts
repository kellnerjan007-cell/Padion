import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/utils/constants";

// NOTE: expo-secure-store crashes on iOS 26.3.1 (uncaught ObjC exception in
// SecItemCopyMatching via TurboModule dispatch). Disabled until expo-secure-store
// ships an iOS 26 patch. Session lives in memory — users re-login after restart.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
