import { createClient } from "@supabase/supabase-js"

/**
 * Server-only admin client. Uses the service role key, which bypasses
 * every RLS policy from Phase 1 entirely.
 *
 * NEVER import this file from a Client Component ("use client") or from
 * anything that ships to the browser. It must only be called from Server
 * Actions or Route Handlers, where process.env.SUPABASE_SERVICE_ROLE_KEY
 * stays on the server.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
