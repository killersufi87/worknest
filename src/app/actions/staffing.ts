"use server"

import { createClient } from "@/lib/supabase/server"

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
