"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type ShiftState = { error: string } | { success: true } | null

export async function createStaffShift(
  _prev: ShiftState,
  formData: FormData
): Promise<ShiftState> {
  const employeeId = Number(formData.get("employee_id"))
  const locationId = Number(formData.get("location_id"))
  const shiftDate = String(formData.get("shift_date") ?? "")
  const certification = String(formData.get("certification") ?? "").trim()
  if (!employeeId || !locationId || !shiftDate) {
    return { error: "Employee, location and date are required." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "You're not logged in." }

  const { data: admin } = await supabase
    .from("employees")
    .select("role")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (!admin || admin.role !== "admin") return { error: "Only an admin can create staff shifts." }

  const { error } = await supabase.from("staff_shifts").insert({
    employee_id: employeeId,
    location_id: locationId,
    shift_date: shiftDate,
    certification: certification || null,
  })
  if (error) return { error: error.message }

  revalidatePath("/admin/staffing")
  return { success: true }
}

export async function getShiftsForDate(locationId: number, date: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("staff_shifts")
    .select("shift_id, certification, employees(name, role)")
    .eq("location_id", locationId)
    .eq("shift_date", date)

  return (data ?? []).map((s) => ({
    shift_id: s.shift_id,
    certification: s.certification,
    name: (s.employees as unknown as { name: string; role: string } | null)?.name ?? "—",
    role: (s.employees as unknown as { name: string; role: string } | null)?.role ?? "—",
  }))
}
