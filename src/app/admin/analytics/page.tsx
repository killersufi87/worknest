import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminSidebar from "../AdminSidebar"
import PortalBackdrop from "../../portal/PortalBackdrop"
import LocationFilter from "./LocationFilter"

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>
}) {
  const { location: locationFilter } = await searchParams
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

  const [{ data: bookingsRaw }, { data: locations }, { data: resources }] = await Promise.all([
    supabase
      .from("bookings")
      .select("booking_id, amount, start_time, status, resource_id, resources(resource_type, location_id)")
      .neq("status", "cancelled")
      .gte("start_time", sixMonthsAgo.toISOString()),
    supabase.from("locations").select("location_id, name").order("location_id"),
    supabase.from("resources").select("resource_id, location_id").eq("active", true),
  ])

  // Apply location filter if selected
  const bookings = locationFilter
    ? (bookingsRaw ?? []).filter(
        (b) => String((b.resources as unknown as { location_id: number } | null)?.location_id) === locationFilter
      )
    : bookingsRaw ?? []

  const monthKeys: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  const revenueByMonth = new Map(monthKeys.map((k) => [k, 0]))
  for (const b of bookings) {
    const key = b.start_time.slice(0, 7)
    if (revenueByMonth.has(key)) {
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + (b.amount ?? 0))
    }
  }
  const maxRevenue = Math.max(...revenueByMonth.values(), 1)

  const locationStats = (locations ?? []).map((loc) => {
    const locBookings = bookings.filter(
      (b) => (b.resources as unknown as { location_id: number } | null)?.location_id === loc.location_id
    )
    const revenue = locBookings.reduce((sum, b) => sum + (b.amount ?? 0), 0)
    const totalResources = (resources ?? []).filter((r) => r.location_id === loc.location_id).length
    const occupancyPct = totalResources > 0 ? Math.round((locBookings.length / totalResources) * 100) : 0
    return { name: loc.name, revenue, occupancyPct: Math.min(occupancyPct, 100) }
  })

  // Bookings by resource type — count-based, "most booked" chart
  const typeCounts = new Map<string, number>()
  for (const b of bookings) {
    const type = (b.resources as unknown as { resource_type: string } | null)?.resource_type ?? "other"
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1)
  }
  const maxTypeCount = Math.max(...typeCounts.values(), 1)
  const TYPE_COLORS: Record<string, string> = {
    hot_desk: "bg-primary",
    dedicated_desk: "bg-[#D4AF37]",
    cabin: "bg-[#9CA3AF]",
    meeting_room: "bg-[#B0413A]",
  }

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount ?? 0), 0)

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background">
      <AdminSidebar active="analytics" name={employee.name} />
      <PortalBackdrop image="photo-1700163080760-12c275d3fe36" />

      <main className="relative z-10 flex-1 px-10 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Last 6 months</p>
            <h1 className="text-3xl font-bold text-foreground">Revenue &amp; Occupancy Analytics</h1>
          </div>
          <LocationFilter locations={locations ?? []} />
        </div>

        <div className="mb-10 grid grid-cols-2 gap-8 border-y border-border py-6 md:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-foreground">₹{totalRevenue}</p>
            <p className="text-sm text-muted">Total revenue (6mo)</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{bookings.length}</p>
            <p className="text-sm text-muted">Total bookings (6mo)</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{locations?.length ?? 0}</p>
            <p className="text-sm text-muted">Locations tracked</p>
          </div>
        </div>

        <div className="mb-10 grid gap-6 lg:grid-cols-2">
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
                    <div className="h-2.5 rounded-full bg-primary" style={{ width: `${loc.occupancyPct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most-booked resource type — horizontal bar chart */}
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-5 text-sm font-semibold text-foreground">Most Booked Resource Type</h2>
          <div className="space-y-4">
            {[...typeCounts.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium capitalize text-foreground">{type.replace("_", " ")}</span>
                    <span className="text-foreground">{count} bookings</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-black/[0.06]">
                    <div
                      className={`h-3 rounded-full ${TYPE_COLORS[type] ?? "bg-primary"}`}
                      style={{ width: `${(count / maxTypeCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            {typeCounts.size === 0 && <p className="text-sm text-muted">No bookings in this period yet.</p>}
          </div>
        </div>
      </main>
    </div>
  )
}
