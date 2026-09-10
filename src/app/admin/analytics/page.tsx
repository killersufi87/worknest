import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminSidebar from "../AdminSidebar"
import PortalBackdrop from "../../portal/PortalBackdrop"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: employee } = await supabase
    .from("employees")
    .select("employee_id, name")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (!employee) redirect("/login")

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const [{ data: bookings }, { data: locations }, { data: resources }] = await Promise.all([
    supabase
      .from("bookings")
      .select("booking_id, amount, start_time, status, resource_id, resources(resource_type, location_id)")
      .neq("status", "cancelled")
      .gte("start_time", sixMonthsAgo.toISOString()),
    supabase.from("locations").select("location_id, name").order("location_id"),
    supabase.from("resources").select("resource_id, location_id").eq("active", true),
  ])

  // Revenue by month, last 6 months, matches FR16's acceptance criteria
  // exactly: chart totals must match the underlying bookings table.
  const monthKeys: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  const revenueByMonth = new Map(monthKeys.map((k) => [k, 0]))
  for (const b of bookings ?? []) {
    const key = b.start_time.slice(0, 7)
    if (revenueByMonth.has(key)) {
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + (b.amount ?? 0))
    }
  }
  const maxRevenue = Math.max(...revenueByMonth.values(), 1)

  // Revenue + occupancy by location
  const locationStats = (locations ?? []).map((loc) => {
    const locBookings = (bookings ?? []).filter(
      (b) => (b.resources as unknown as { location_id: number } | null)?.location_id === loc.location_id
    )
    const revenue = locBookings.reduce((sum, b) => sum + (b.amount ?? 0), 0)
    const totalResources = (resources ?? []).filter((r) => r.location_id === loc.location_id).length
    const occupancyPct = totalResources > 0 ? Math.round((locBookings.length / totalResources) * 100) : 0
    return { name: loc.name, revenue, occupancyPct: Math.min(occupancyPct, 100) }
  })

  // Revenue by resource type
  const typeMap = new Map<string, number>()
  for (const b of bookings ?? []) {
    const type = (b.resources as unknown as { resource_type: string } | null)?.resource_type ?? "other"
    typeMap.set(type, (typeMap.get(type) ?? 0) + (b.amount ?? 0))
  }

  const totalRevenue = (bookings ?? []).reduce((sum, b) => sum + (b.amount ?? 0), 0)

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background">
      <AdminSidebar active="analytics" name={employee.name} />
      <PortalBackdrop image="photo-1700163080760-12c275d3fe36" />

      <main className="relative z-10 flex-1 px-10 py-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Last 6 months</p>
        <h1 className="mb-8 text-3xl font-bold text-foreground">Revenue &amp; Occupancy Analytics</h1>

        <div className="mb-10 grid grid-cols-2 gap-8 border-y border-border py-6 md:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-foreground">₹{totalRevenue}</p>
            <p className="text-sm text-muted">Total revenue (6mo)</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{bookings?.length ?? 0}</p>
            <p className="text-sm text-muted">Total bookings (6mo)</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{locations?.length ?? 0}</p>
            <p className="text-sm text-muted">Locations tracked</p>
          </div>
        </div>

        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          {/* Revenue by month */}
          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-5 text-sm font-semibold text-foreground">Revenue by Month</h2>
            <div className="flex h-40 items-end gap-3">
              {monthKeys.map((key) => {
                const value = revenueByMonth.get(key) ?? 0
                const height = Math.max((value / maxRevenue) * 130, value > 0 ? 6 : 2)
                const label = new Date(key + "-01").toLocaleDateString(undefined, { month: "short" })
                return (
                  <div key={key} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-sm bg-primary" style={{ height }} />
                    <p className="text-xs text-muted">{label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Occupancy by location */}
          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-5 text-sm font-semibold text-foreground">Occupancy by Location</h2>
            <div className="space-y-4">
              {locationStats.map((loc) => (
                <div key={loc.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{loc.name}</span>
                    <span className="text-foreground">{loc.occupancyPct}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-black/[0.06]">
                    <div
                      className="h-2.5 rounded-full bg-primary"
                      style={{ width: `${loc.occupancyPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by resource type */}
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-5 text-sm font-semibold text-foreground">Revenue by Resource Type</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...typeMap.entries()].map(([type, revenue]) => (
              <div key={type}>
                <p className="text-xl font-bold capitalize text-foreground">₹{revenue}</p>
                <p className="text-xs capitalize text-muted">{type.replace("_", " ")}</p>
              </div>
            ))}
            {typeMap.size === 0 && (
              <p className="col-span-full text-sm text-muted">No bookings in the last 6 months yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
