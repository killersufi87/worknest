"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type CancelState = { error: string } | { success: true; refundPct: number } | null

export async function cancelBooking(
  _prev: CancelState,
  formData: FormData
): Promise<CancelState> {
  const bookingId = Number(formData.get("booking_id"))
  if (!bookingId) return { error: "Missing booking." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "You're not logged in." }

  const { data: member } = await supabase
    .from("members")
    .select("member_id, tier_id, membership_tiers(tier_id, cancellation_refund_pct, notice_window_hours)")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (!member) return { error: "Member record not found." }

  const { data: booking } = await supabase
    .from("bookings")
    .select("booking_id, member_id, start_time, amount, status")
    .eq("booking_id", bookingId)
    .maybeSingle()

  if (!booking || booking.member_id !== member.member_id) {
    return { error: "Booking not found." }
  }
  if (booking.status !== "confirmed") {
    return { error: "This booking is already cancelled or completed." }
  }

  const tier = member.membership_tiers as unknown as {
    tier_id: number
    cancellation_refund_pct: number
    notice_window_hours: number
  } | null

  const hoursUntilStart = (new Date(booking.start_time).getTime() - Date.now()) / (1000 * 60 * 60)
  const withinNotice = tier ? hoursUntilStart >= tier.notice_window_hours : false
  const refundPct = withinNotice ? (tier?.cancellation_refund_pct ?? 0) : 0
  const refundAmount = ((booking.amount ?? 0) * refundPct) / 100

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("booking_id", bookingId)

  if (updateError) return { error: updateError.message }

  await supabase.from("cancellation_refunds").insert({
    booking_id: bookingId,
    tier_rule_id: tier?.tier_id ?? null,
    refund_pct_applied: refundPct,
    refund_amount: refundAmount,
  })

  revalidatePath("/portal/bookings")
  revalidatePath("/portal")
  return { success: true, refundPct }
}
