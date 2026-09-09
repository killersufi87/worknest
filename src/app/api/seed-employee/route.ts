import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// TEMPORARY — visit this once to create a test employee login, then
// delete this file. Do not leave an open account-creation route live.
export async function GET() {
  const admin = createAdminClient()

  const { data: location } = await admin
    .from("locations")
    .select("location_id")
    .order("location_id")
    .limit(1)
    .single()

  if (!location) return NextResponse.json({ error: "No locations found." }, { status: 400 })

  const { data: employeeRow, error: insertError } = await admin
    .from("employees")
    .insert({ name: "Admin Demo", role: "admin", email: "admin@worknest.demo", location_id: location.location_id })
    .select("employee_id")
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: "admin@worknest.demo",
    password: "worknest123",
    email_confirm: true,
  })

  if (authError || !authData.user) {
    await admin.from("employees").delete().eq("employee_id", employeeRow.employee_id)
    return NextResponse.json({ error: authError?.message }, { status: 400 })
  }

  await admin.from("employees").update({ auth_user_id: authData.user.id }).eq("employee_id", employeeRow.employee_id)

  return NextResponse.json({
    success: true,
    email: "admin@worknest.demo",
    password: "worknest123",
    note: "Delete this route file now that the account exists.",
  })
}
