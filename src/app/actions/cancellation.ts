"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type CancelState = { error: string } | { success: true; refundPct: number } | null
export type CancellationPreview =
  | { error: string }
  | { refundPct: number; refundAmount: number; hoursUntilStart: number; noticeWindowHours: number }

type CancellationContext = {
  supabase: Awaited<ReturnType<typeof createClient>>
  member: { member_id: number; remaining_monthly_hours: number }
  booking: { booking_id: number; member_id: number; start_time: string; end_time: string; amount: number | null; status: string }
  tier: { tier_id: number; cancellation_refund_pct: number; notice_window_hours: number } | null
  hoursUntilStart: number
  refundPct: number
  refundAmount: number
}

async function getCancellationContext(bookingId: number): Promise<CancellationContext | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "You're not logged in." }

  const { data: member } = await supabase
    .from("members")
    .select("member_id, remaining_monthly_hours, membership_tiers(tier_id, cancellation_refund_pct, notice_window_hours)")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (!member) return { error: "Member record not found." }

  const { data: booking } = await supabase
    .from("bookings")
    .select("booking_id, member_id, start_time, end_time, amount, status")
    .eq("booking_id", bookingId)
    .maybeSingle()
  if (!booking || booking.member_id !== member.member_id) return { error: "Booking not found." }
  if (booking.status !== "confirmed") return { error: "This booking is already cancelled or completed." }

  const tier = (Array.isArray(member.membership_tiers) ? member.membership_tiers[0] : member.membership_tiers) as {
    tier_id: number
    cancellation_refund_pct: number
    notice_window_hours: number
  } | null
  const hoursUntilStart = (new Date(booking.start_time).getTime() - Date.now()) / (1000 * 60 * 60)
  const withinNotice = tier ? hoursUntilStart >= tier.notice_window_hours : false
  const refundPct = withinNotice ? (tier?.cancellation_refund_pct ?? 0) : 0
  const refundAmount = ((booking.amount ?? 0) * refundPct) / 100

  return {
    supabase,
    member: {
      member_id: member.member_id,
      remaining_monthly_hours: Number(member.remaining_monthly_hours),
    },
    booking: {
      booking_id: booking.booking_id,
      member_id: booking.member_id,
      start_time: booking.start_time,
      end_time: booking.end_time,
      amount: booking.amount,
      status: booking.status,
    },
    tier,
    hoursUntilStart,
    refundPct,
    refundAmount,
  }
}

export async function getCancellationPreview(bookingId: number): Promise<CancellationPreview> {
  if (!bookingId) return { error: "Missing booking." }
  const context = await getCancellationContext(bookingId)
  if ("error" in context) return context
  return {
    refundPct: context.refundPct,
    refundAmount: context.refundAmount,
    hoursUntilStart: context.hoursUntilStart,
    noticeWindowHours: context.tier?.notice_window_hours ?? 0,
  }
}

export async function cancelBooking(
  _prev: CancelState,
  formData: FormData
): Promise<CancelState> {
  const bookingId = Number(formData.get("booking_id"))
  if (!bookingId) return { error: "Missing booking." }

  const context = await getCancellationContext(bookingId)
  if ("error" in context) return context
  const { supabase, member, booking, tier, refundPct, refundAmount } = context

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

  const durationHours =
    (new Date(booking.end_time ?? booking.start_time).getTime() - new Date(booking.start_time).getTime()) /
    (1000 * 60 * 60)
  if (durationHours > 0 && booking.amount === 0) {
    await supabase
      .from("members")
      .update({ remaining_monthly_hours: member.remaining_monthly_hours + durationHours })
      .eq("member_id", member.member_id)
  }

  revalidatePath("/portal/bookings")
  revalidatePath("/portal")
  revalidatePath("/admin/analytics")
  revalidatePath("/admin")
  return { success: true, refundPct }
}
