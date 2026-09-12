"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

async function getMyLocation() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: employee } = await supabase
    .from("employees")
    .select("location_id")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  return employee?.location_id ?? null
}

// Resource/pricing changes need to show up everywhere that reads them,
// not just the management screen itself.
function revalidateResourceDependents() {
  revalidatePath("/admin/resources")
  revalidatePath("/portal/book")
  revalidatePath("/admin")
  revalidatePath("/admin/analytics")
}

export type ResourceFormState = { error: string } | { success: true } | null

// FR3: add a resource for the admin's own location.
export async function addResource(
  _prev: ResourceFormState,
  formData: FormData
): Promise<ResourceFormState> {
  const locationId = await getMyLocation()
  if (!locationId) return { error: "Could not determine your location." }

  const resourceType = String(formData.get("resource_type"))
  const capacityTier = String(formData.get("capacity_tier") ?? "")
  const minDuration = Number(formData.get("min_booking_duration_minutes")) || 30
  const hourlyPrice = Number(formData.get("hourly_price")) || 0
  const monthlyPrice = formData.get("monthly_price") ? Number(formData.get("monthly_price")) : null

  const supabase = await createClient()
  const { data: resource, error } = await supabase
    .from("resources")
    .insert({
      location_id: locationId,
      resource_type: resourceType,
      capacity_tier: capacityTier || null,
      min_booking_duration_minutes: minDuration,
    })
    .select("resource_id")
    .single()

  if (error || !resource) return { error: error?.message ?? "Could not add resource." }

  await supabase.from("resource_pricing").insert({
    resource_id: resource.resource_id,
    hourly_price: hourlyPrice,
    monthly_price: monthlyPrice,
  })

  revalidateResourceDependents()
  return { success: true }
}

// FR3: remove (deactivate) a resource — soft delete via active flag so
// existing bookings/history referencing it stay intact.
export async function removeResource(resourceId: number) {
  const supabase = await createClient()
  await supabase.from("resources").update({ active: false }).eq("resource_id", resourceId)
  revalidateResourceDependents()
}

// FR4: update minimum booking duration for a resource.
export async function updateMinDuration(resourceId: number, minutes: number) {
  const supabase = await createClient()
  await supabase
    .from("resources")
    .update({ min_booking_duration_minutes: minutes })
    .eq("resource_id", resourceId)
  revalidateResourceDependents()
}

// FR5: update hourly/monthly pricing for a resource.
export async function updatePricing(resourceId: number, hourlyPrice: number, monthlyPrice: number | null) {
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from("resource_pricing")
    .select("pricing_id")
    .eq("resource_id", resourceId)
    .order("pricing_id", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    await supabase
      .from("resource_pricing")
      .update({ hourly_price: hourlyPrice, monthly_price: monthlyPrice })
      .eq("pricing_id", existing.pricing_id)
  } else {
    await supabase
      .from("resource_pricing")
      .insert({ resource_id: resourceId, hourly_price: hourlyPrice, monthly_price: monthlyPrice })
  }
  revalidateResourceDependents()
}
