import "server-only"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getAdminContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: employee, error } = await supabase
    .from("employees")
    .select("employee_id, role, is_active")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (error || employee?.role !== "admin" || !employee.is_active) return null
  return { employee, admin: createAdminClient() }
}
