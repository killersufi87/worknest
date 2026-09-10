import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminSidebar from "../AdminSidebar"
import PortalBackdrop from "../../portal/PortalBackdrop"
import ResourceManager from "./ResourceManager"

export default async function ResourcesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: employee } = await supabase
    .from("employees")
    .select("employee_id, name, location_id, locations(name)")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (!employee) redirect("/login")

  const { data: resourcesRaw } = await supabase
    .from("resources")
    .select("resource_id, resource_type, capacity_tier, min_booking_duration_minutes, active, resource_pricing(hourly_price, monthly_price)")
    .eq("location_id", employee.location_id)
    .eq("active", true)
    .order("resource_type")

  const resources = (resourcesRaw ?? []).map((r) => {
    const pricing = r.resource_pricing as unknown as { hourly_price: number; monthly_price: number | null }[]
    return {
      resource_id: r.resource_id,
      resource_type: r.resource_type,
      capacity_tier: r.capacity_tier,
      min_booking_duration_minutes: r.min_booking_duration_minutes,
      active: r.active,
      hourly_price: pricing?.[0]?.hourly_price ?? null,
      monthly_price: pricing?.[0]?.monthly_price ?? null,
    }
  })

  const locationName = (employee.locations as unknown as { name: string } | null)?.name ?? "—"

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background">
      <AdminSidebar active="resources" name={employee.name} />
      <PortalBackdrop image="photo-1700163080760-12c275d3fe36" />

      <main className="relative z-10 flex-1 px-10 py-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{locationName}</p>
        <h1 className="mb-8 text-3xl font-bold text-foreground">Manage Resources &amp; Pricing</h1>
        <ResourceManager resources={resources} />
      </main>
    </div>
  )
}
