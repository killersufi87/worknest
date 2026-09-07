import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Members log in with a Member ID + password, per the BRD. Supabase Auth
 * only understands email + password, so every member gets a hidden
 * internal email derived from their Member ID. They never see or type
 * this — it only exists so Supabase Auth has something email-shaped
 * to authenticate against.
 */
export function memberIdToEmail(memberId: number | string): string {
  return `member.${memberId}@worknest.internal`
}

export type UserRole =
  | { role: "member"; memberId: number }
  | { role: "employee"; employeeId: number; locationId: number }
  | { role: "none" }

/**
 * After a successful sign-in, figure out whether the logged-in user is
 * a member or an employee, so we know which portal to send them to.
 * Checks members first, then employees. Neither match means the auth
 * account exists but isn't linked to a row in either table yet.
 */
export async function getCurrentRole(
  supabase: SupabaseClient
): Promise<UserRole> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { role: "none" }

  const { data: member } = await supabase
    .from("members")
    .select("member_id")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (member) return { role: "member", memberId: member.member_id }

  const { data: employee } = await supabase
    .from("employees")
    .select("employee_id, location_id")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (employee) {
    return {
      role: "employee",
      employeeId: employee.employee_id,
      locationId: employee.location_id,
    }
  }

  return { role: "none" }
}
