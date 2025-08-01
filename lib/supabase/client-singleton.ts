import { createBrowserClient } from '@supabase/ssr';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Get a singleton Supabase client instance for browser environments
 * This prevents creating multiple clients and improves performance
 */
export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  
  return supabaseClient;
}

/**
 * Reset the client (useful for testing)
 */
export function resetSupabaseClient() {
  supabaseClient = null;
}