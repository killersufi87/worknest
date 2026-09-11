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
    return { resourceIds: [] as number[], bookings: [] as { resource_id: number; start_time: string; end_time: string }[] }
  }

  const dayStart = `${dateStr}T00:00:00+00:00`
  const dayEnd = `${dateStr}T23:59:59+00:00`

  const { data: bookings } = await supabase
    .from("bookings")
    .select("resource_id, start_time, end_time")
    .in("resource_id", resourceIds)
    .eq("status", "confirmed")
    .gte("start_time", dayStart)
    .lte("start_time", dayEnd)

  return { resourceIds, bookings: bookings ?? [] }
}

// Live per-resource check, used right before letting a customer lock in a
// specific seat, so a race between two customers picking the same
// resource at the same instant is caught before submission.
export async function checkResourceStillFree(
  resourceId: number,
  startIso: string,
  endIso: string
) {
  const supabase = await createClient()
  const { data: overlapping } = await supabase
    .from("bookings")
    .select("booking_id")
    .eq("resource_id", resourceId)
    .eq("status", "confirmed")
    .lt("start_time", endIso)
    .gt("end_time", startIso)
  return (overlapping?.length ?? 0) === 0
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
  const chosenResourceId = formData.get("resource_id") ? Number(formData.get("resource_id")) : null

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

  const { data: allCandidates } = await supabase
    .from("resources")
    .select("resource_id, resource_pricing(hourly_price)")
    .eq("location_id", locationId)
    .eq("resource_type", resourceType)
    .eq("active", true)

  if (!allCandidates || allCandidates.length === 0) {
    return { error: "No resources of this type exist at this location." }
  }

  // If the customer picked a specific seat, only try that one — a race
  // with another customer should surface as a clear error, not silently
  // hand them a different seat than the one they clicked.
  const candidates = chosenResourceId
    ? allCandidates.filter((c) => c.resource_id === chosenResourceId)
    : allCandidates

  if (chosenResourceId && candidates.length === 0) {
    return { error: "That seat is no longer available. Please pick another." }
  }

  const useFreeHours =
    resourceType === "meeting_room" && member.remaining_monthly_hours >= durationHours

  const hourlyPrice =
    (candidates[0].resource_pricing as unknown as { hourly_price: number }[] | null)?.[0]
      ?.hourly_price ?? 0
  const amount = useFreeHours ? 0 : hourlyPrice * durationHours

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

    if (!insertError.message.includes("bookings_no_overlap")) {
      return { error: insertError.message }
    }
  }

  return chosenResourceId
    ? { error: "Someone just booked that seat. Please pick another." }
    : { error: `All ${resourceType.replace("_", " ")}s at this location are booked for that time. Try another slot.` }
}
