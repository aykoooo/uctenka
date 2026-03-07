// ============================================================
// Supabase Client - Placeholder for future connection
// ============================================================

import { createClient } from "@supabase/supabase-js";

// Allow empty env vars to not break compilation during local testing without envs set yet
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
