"use server"

import { revalidatePath } from "next/cache"
import { getAdminContext } from "@/lib/auth/admin"

export type MembershipTierState = { error: string } | { success: true; tierId?: number } | null

type TierValues = {
  tier_name: string
  monthly_rate: number
  cancellation_refund_pct: number
  notice_window_hours: number
  free_conference_hours_allowance: number
}

function parseTierValues(formData: FormData): TierValues | string {
  const tierName = String(formData.get("tier_name") ?? "").trim()
  const readNumber = (name: string) => {
    const value = formData.get(name)
    return typeof value === "string" && value.trim() ? Number(value) : Number.NaN
  }
  const monthlyRate = readNumber("monthly_rate")
  const refundPct = readNumber("cancellation_refund_pct")
  const noticeHours = readNumber("notice_window_hours")
  const freeHours = readNumber("free_conference_hours_allowance")

  if (!tierName || tierName.length > 40) return "Tier name must be between 1 and 40 characters."
  if (![monthlyRate, refundPct, noticeHours, freeHours].every(Number.isFinite)) return "Enter a valid value for every plan rule."
  if (monthlyRate < 0 || refundPct < 0 || refundPct > 100 || noticeHours < 0 || freeHours < 0) {
    return "Rates and hour allowances cannot be negative, and refunds must be between 0% and 100%."
  }
  if (!Number.isInteger(noticeHours)) return "Notice window must be a whole number of hours."

  return {
    tier_name: tierName,
    monthly_rate: monthlyRate,
    cancellation_refund_pct: refundPct,
    notice_window_hours: noticeHours,
    free_conference_hours_allowance: freeHours,
  }
}

function refreshTierDependents() {
  revalidatePath("/admin/memberships")
  revalidatePath("/signup")
  revalidatePath("/portal")
  revalidatePath("/portal/book")
  revalidatePath("/portal/bookings")
}

export async function createMembershipTier(
  _previousState: MembershipTierState,
  formData: FormData
): Promise<MembershipTierState> {
  const values = parseTierValues(formData)
  if (typeof values === "string") return { error: values }

  const context = await getAdminContext()
  if (!context) return { error: "Only an active admin can manage membership plans." }

  const { data, error } = await context.admin
    .from("membership_tiers")
    .insert({ ...values, is_active: true })
    .select("tier_id")
    .single()

  if (error || !data) return { error: error?.message ?? "Could not create membership plan." }
  refreshTierDependents()
  return { success: true, tierId: data.tier_id }
}

export async function updateMembershipTier(
  _previousState: MembershipTierState,
  formData: FormData
): Promise<MembershipTierState> {
  const tierId = Number(formData.get("tier_id"))
  const values = parseTierValues(formData)
  if (!tierId) return { error: "Choose a membership plan." }
  if (typeof values === "string") return { error: values }

  const context = await getAdminContext()
  if (!context) return { error: "Only an active admin can manage membership plans." }

  const { data: updatedTier, error } = await context.admin
    .from("membership_tiers")
    .update(values)
    .eq("tier_id", tierId)
    .select("tier_id")
    .maybeSingle()

  if (error) return { error: error.message }
  if (!updatedTier) return { error: "Membership plan not found." }
  refreshTierDependents()
  return { success: true }
}

export async function setMembershipTierActive(
  _previousState: MembershipTierState,
  formData: FormData
): Promise<MembershipTierState> {
  const tierId = Number(formData.get("tier_id"))
  const activeValue = formData.get("is_active")
  if (activeValue !== "true" && activeValue !== "false") {
    return { error: "Choose whether the plan is active for new signups." }
  }
  const isActive = activeValue === "true"
  if (!tierId) return { error: "Choose a membership plan." }

  const context = await getAdminContext()
  if (!context) return { error: "Only an active admin can manage membership plans." }

  const { data: updatedTier, error } = await context.admin
    .from("membership_tiers")
    .update({ is_active: isActive })
    .eq("tier_id", tierId)
    .select("tier_id")
    .maybeSingle()

  if (error) return { error: error.message }
  if (!updatedTier) return { error: "Membership plan not found." }
  refreshTierDependents()
  return { success: true }
}
