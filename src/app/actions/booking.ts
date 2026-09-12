"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type ResourceType = "hot_desk" | "dedicated_desk" | "cabin" | "meeting_room"

// Bookings don't have a background job flipping them to 'completed' once
// their time has passed — this runs that transition lazily whenever a
// page that cares about booking status loads. Cheap, no infra needed.
export async function completePastBookings() {
  const supabase = await createClient()
  await supabase
    .from("bookings")
    .update({ status: "completed" })
    .eq("status", "confirmed")
    .lt("end_time", new Date().toISOString())
}

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
    .order("resource_id", { ascending: true })

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
  const chosenResourceId = Number(formData.get("resource_id"))

  if (!locationId || !resourceType || !dateStr || !startHour || !durationHours || !chosenResourceId) {
    return { error: "Please pick a specific seat before confirming." }
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

  // Only ever look up and book the exact resource the customer clicked.
  // No fallback to "any available candidate" — that ambiguity was the
  // root cause of seats not mapping reliably to what was shown on screen.
  const { data: resource } = await supabase
    .from("resources")
    .select("resource_id, resource_pricing(hourly_price)")
    .eq("resource_id", chosenResourceId)
    .eq("location_id", locationId)
    .eq("resource_type", resourceType)
    .eq("active", true)
    .maybeSingle()

  if (!resource) {
    return { error: "That seat is no longer available. Please pick another." }
  }

  const useFreeHours =
    resourceType === "meeting_room" && member.remaining_monthly_hours >= durationHours

  const hourlyPrice =
    (resource.resource_pricing as unknown as { hourly_price: number }[] | null)?.[0]?.hourly_price ?? 0
  const amount = useFreeHours ? 0 : hourlyPrice * durationHours

  const { error: insertError } = await supabase.from("bookings").insert({
    member_id: member.member_id,
    resource_id: resource.resource_id,
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
    revalidatePath("/admin/analytics")
    revalidatePath("/admin")
    revalidatePath("/portal")
    revalidatePath("/portal/bookings")
    return { success: true, amount }
  }

  // 23P01 = exclusion constraint violation — the database itself caught
  // a genuine double-booking attempt on this exact resource and time.
  if (insertError.message.includes("bookings_no_overlap")) {
    return { error: "Someone just booked that seat. Please pick another." }
  }
  return { error: insertError.message }
}
