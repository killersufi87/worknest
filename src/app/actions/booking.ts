"use server"

import { createClient } from "@/lib/supabase/server"

export type ResourceType = "hot_desk" | "dedicated_desk" | "cabin" | "meeting_room"

export async function getAvailability(
  locationId: number,
  resourceType: ResourceType,
  dateStr: string
) {
  const supabase = await createClient()

  const { data: resources } = await supabase
    .from("resources")
    .select("resource_id")
    .eq("location_id", locationId)
    .eq("resource_type", resourceType)
    .eq("active", true)

  const resourceIds = (resources ?? []).map((r) => r.resource_id)
  if (resourceIds.length === 0) {
    return { totalResources: 0, bookings: [] as { start_time: string; end_time: string }[] }
  }

  const dayStart = `${dateStr}T00:00:00+00:00`
  const dayEnd = `${dateStr}T23:59:59+00:00`

  const { data: bookings } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .in("resource_id", resourceIds)
    .eq("status", "confirmed")
    .gte("start_time", dayStart)
    .lte("start_time", dayEnd)

  return { totalResources: resourceIds.length, bookings: bookings ?? [] }
}

export type CreateBookingState = { error: string } | { success: true; amount: number } | null

export async function createBooking(
  _prev: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const locationId = Number(formData.get("location_id"))
  const resourceType = String(formData.get("resource_type")) as ResourceType
  const dateStr = String(formData.get("date"))
  const startHour = Number(formData.get("start_hour"))
  const durationHours = Number(formData.get("duration_hours"))

  if (!locationId || !resourceType || !dateStr || !startHour || !durationHours) {
    return { error: "Please complete every step before confirming." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "You're not logged in." }

  const { data: member } = await supabase
    .from("members")
    .select("member_id, remaining_monthly_hours")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (!member) return { error: "Member record not found." }

  const startTime = new Date(`${dateStr}T${String(startHour).padStart(2, "0")}:00:00+05:30`)
  const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000)

  const { data: candidates } = await supabase
    .from("resources")
    .select("resource_id, resource_pricing(hourly_price)")
    .eq("location_id", locationId)
    .eq("resource_type", resourceType)
    .eq("active", true)

  if (!candidates || candidates.length === 0) {
    return { error: "No resources of this type exist at this location." }
  }

  // Free conference hours apply only to meeting rooms, if the member has enough left.
  const useFreeHours =
    resourceType === "meeting_room" && member.remaining_monthly_hours >= durationHours

  const hourlyPrice =
    (candidates[0].resource_pricing as unknown as { hourly_price: number }[] | null)?.[0]
      ?.hourly_price ?? 0
  const amount = useFreeHours ? 0 : hourlyPrice * durationHours

  // Try each candidate resource in turn. The database's exclusion constraint
  // (from Phase 1) is the real source of truth for conflicts — if one
  // resource is taken, we just try the next one instead of failing outright.
  for (const candidate of candidates) {
    const { error: insertError } = await supabase.from("bookings").insert({
      member_id: member.member_id,
      resource_id: candidate.resource_id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "confirmed",
      amount,
    })

    if (!insertError) {
      if (useFreeHours) {
        await supabase
          .from("members")
          .update({ remaining_monthly_hours: member.remaining_monthly_hours - durationHours })
          .eq("member_id", member.member_id)
      }
      return { success: true, amount }
    }

    // 23P01 = exclusion constraint violation (double-booking). Try the next one.
    if (!insertError.message.includes("bookings_no_overlap")) {
      return { error: insertError.message }
    }
  }

  return { error: `All ${resourceType.replace("_", " ")}s at this location are booked for that time. Try another slot.` }
}
