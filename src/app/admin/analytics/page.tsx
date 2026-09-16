import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { completePastBookings } from "@/app/actions/booking"
import AdminSidebar from "../AdminSidebar"
import PortalBackdrop from "../../portal/PortalBackdrop"
import LocationFilter from "./LocationFilter"

const TYPE_LABELS: Record<string, string> = {
  hot_desk: "Hot Desk",
  dedicated_desk: "Dedicated Desk",
  cabin: "Private Cabin",
  meeting_room: "Meeting Room",
}

const TYPE_COLORS = ["#2F4A3C", "#6B8F71", "#B8CDB5", "#D7A65D"]

function currency(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

function hoursBetween(start: string, end: string) {
  return Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 3600000)
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; resource?: string; from?: string; to?: string }>
}) {
  const { location: locationFilter, resource: resourceFilter, from: fromFilter, to: toFilter } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: employee } = await supabase.from("employees").select("employee_id, name").eq("auth_user_id", user.id).maybeSingle()
  if (!employee) redirect("/login")

  await completePastBookings()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const [{ data: bookingsRaw }, { data: locations }, { data: resources }, { count: activeMemberCount }] = await Promise.all([
    supabase.from("bookings")
      .select("booking_id, amount, start_time, end_time, status, resource_id, resources(resource_type, location_id, locations(name))")
      .neq("status", "cancelled")
      .gte("start_time", sixMonthsAgo.toISOString()),
    supabase.from("locations").select("location_id, name").order("location_id"),
    supabase.from("resources").select("resource_id, resource_type, capacity_tier, location_id, locations(name)").eq("active", true),
    supabase.from("members").select("member_id", { count: "exact", head: true }).eq("status", "active"),
  ])

  const bookings = (bookingsRaw ?? []).filter((booking) => {
    const resource = booking.resources as unknown as { location_id: number; resource_type: string } | null
    const date = booking.start_time.slice(0, 10)
    return (!locationFilter || String(resource?.location_id) === locationFilter)
      && (!resourceFilter || resource?.resource_type === resourceFilter)
      && (!fromFilter || date >= fromFilter)
      && (!toFilter || date <= toFilter)
  })

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.amount ?? 0), 0)
  const totalHours = bookings.reduce((sum, booking) => sum + hoursBetween(booking.start_time, booking.end_time), 0)
  const completed = bookings.filter((booking) => booking.status === "completed").length
  const typeCounts = new Map<string, number>()
  const resourceCounts = new Map<number, number>()
  bookings.forEach((booking) => {
    const type = (booking.resources as unknown as { resource_type: string } | null)?.resource_type ?? "other"
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1)
    resourceCounts.set(booking.resource_id, (resourceCounts.get(booking.resource_id) ?? 0) + 1)
  })
  const resourceStats = [...resourceCounts.entries()]
    .map(([resourceId, count]) => {
      const resource = (resources ?? []).find((item) => item.resource_id === resourceId) as
        | { resource_id: number; resource_type: string; capacity_tier: string | null; locations: { name: string } | null }
        | undefined
      return {
        resourceId,
        count,
        label: `${TYPE_LABELS[resource?.resource_type ?? ""] ?? "Resource"} #${resourceId}`,
        location: resource?.locations?.name ?? "Unknown location",
        capacity: resource?.capacity_tier,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const monthKeys: string[] = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    monthKeys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`)
  }
  const monthlyRevenue = monthKeys.map((key) => bookings
    .filter((booking) => booking.start_time.slice(0, 7) === key)
    .reduce((sum, booking) => sum + (booking.amount ?? 0), 0))
  const maxMonthlyRevenue = Math.max(...monthlyRevenue, 1)

  const locationStats = (locations ?? []).map((location) => {
    const locationBookings = bookings.filter((booking) =>
      (booking.resources as unknown as { location_id: number } | null)?.location_id === location.location_id)
    const resourceCount = (resources ?? []).filter((resource) => resource.location_id === location.location_id).length
    const occupiedHours = locationBookings.reduce((sum, booking) => sum + hoursBetween(booking.start_time, booking.end_time), 0)
    const occupancy = resourceCount ? Math.min(Math.round((occupiedHours / (resourceCount * 12 * 30)) * 100), 100) : 0
    return { name: location.name, occupancy, revenue: locationBookings.reduce((sum, booking) => sum + (booking.amount ?? 0), 0) }
  })
  const averageOccupancy = locationStats.length
    ? Math.round(locationStats.reduce((sum, location) => sum + location.occupancy, 0) / locationStats.length)
    : 0
  const revenuePoints = monthlyRevenue.map((value, index) => {
    const x = 20 + (index * 560) / Math.max(monthlyRevenue.length - 1, 1)
    const y = 172 - (value / maxMonthlyRevenue) * 144
    return `${x},${y}`
  }).join(" ")

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background">
      <AdminSidebar active="analytics" name={employee.name} />
      <PortalBackdrop image="photo-1700163080760-12c275d3fe36" />
      <main className="relative z-10 flex-1 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Operational insights</p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics Overview</h1>
              <p className="mt-1 text-sm text-muted">Bookings and resources only · Last 6 months</p>
            </div>
            <LocationFilter locations={locations ?? []} />
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Total bookings", bookings.length.toLocaleString("en-IN"), "All confirmed and completed"],
              ["Total revenue", currency(totalRevenue), "From booking amounts"],
              ["Hours booked", `${totalHours.toFixed(1)} hrs`, "Reserved workspace time"],
              ["Avg. occupancy", `${averageOccupancy}%`, "Across active locations"],
              ["Active members", (activeMemberCount ?? 0).toLocaleString("en-IN"), "Current member records"],
            ].map(([label, value, note], index) => (
              <div key={label} className="rounded-2xl border border-border bg-white p-4 shadow-[0_8px_24px_rgba(47,74,60,0.06)]">
                <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl text-lg ${["bg-[#E4EFE7]", "bg-[#E8F1E8]", "bg-[#FBF0D9]", "bg-[#E9E6F4]", "bg-[#FBE3E1]"][index]}`}>
                  {["▣", "₹", "◷", "%", "♙"][index]}
                </div>
                <p className="text-xs font-medium text-muted">{label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
                <p className="mt-1 text-[11px] text-muted">{note}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-2xl border border-border bg-white p-5 shadow-[0_8px_24px_rgba(47,74,60,0.05)]">
              <div className="mb-4 flex items-center justify-between">
                <div><h2 className="font-semibold text-foreground">Revenue over time</h2><p className="text-xs text-muted">Monthly booking revenue</p></div>
                <span className="rounded-full bg-[#E4EFE7] px-3 py-1 text-xs font-medium text-primary">{currency(totalRevenue)}</span>
              </div>
              <svg viewBox="0 0 600 220" preserveAspectRatio="none" className="h-56 w-full overflow-visible" role="img" aria-label="Revenue over the last six months">
                {[28, 76, 124, 172].map((y) => <line key={y} x1="20" x2="580" y1={y} y2={y} stroke="#E5E1DA" strokeWidth="1" />)}
                <polyline points={revenuePoints} fill="none" stroke="#2F4A3C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                {monthlyRevenue.map((value, index) => {
                  const x = 20 + (index * 560) / Math.max(monthlyRevenue.length - 1, 1)
                  const y = 172 - (value / maxMonthlyRevenue) * 144
                  return (
                    <circle key={monthKeys[index]} cx={x} cy={y} r="4.5" fill="#6B8F71" stroke="white" strokeWidth="1.5" className="cursor-pointer">
                      <title>{new Date(`${monthKeys[index]}-01`).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}: {currency(value)}</title>
                    </circle>
                  )
                })}
              </svg>
              <div className="flex justify-between px-1 text-[11px] text-muted">
                {monthKeys.map((key) => <span key={key}>{new Date(`${key}-01`).toLocaleDateString("en-IN", { month: "short" })}</span>)}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-white p-5 shadow-[0_8px_24px_rgba(47,74,60,0.05)]">
              <h2 className="font-semibold text-foreground">Occupancy by location</h2>
              <p className="mb-6 text-xs text-muted">Reserved hours against available capacity</p>
              <div className="space-y-5">
                {locationStats.map((location) => (
                  <div key={location.name}>
                    <div className="mb-2 flex justify-between text-sm"><span className="font-medium">{location.name}</span><span className="text-muted">{location.occupancy}%</span></div>
                    <div className="h-2.5 rounded-full bg-[#EEF1EC]"><div className="h-2.5 rounded-full bg-[#6B8F71]" style={{ width: `${location.occupancy}%` }} /></div>
                    <p className="mt-1 text-[11px] text-muted">{currency(location.revenue)} revenue</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-white p-5 shadow-[0_8px_24px_rgba(47,74,60,0.05)]">
              <h2 className="font-semibold text-foreground">Bookings by resource type</h2>
              <p className="mb-5 text-xs text-muted">Distribution of confirmed and completed bookings</p>
              <div className="flex items-center gap-6">
                <div className="relative h-36 w-36 shrink-0" role="img" aria-label="Bookings by resource type">
                  <svg viewBox="0 0 42 42" className="-rotate-90">
                    <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#EEF1EC" strokeWidth="8" />
                    {[...typeCounts.entries()].sort((a, b) => b[1] - a[1]).reduce<{ type: string; count: number; offset: number }[]>((segments, [type, count]) => {
                      const previous = segments[segments.length - 1]
                      segments.push({ type, count, offset: previous ? previous.offset + previous.count : 0 })
                      return segments
                    }, []).map(({ type, count, offset }, index) => (
                      <circle
                        key={type}
                        cx="21"
                        cy="21"
                        r="15.9155"
                        fill="none"
                        stroke={TYPE_COLORS[index % TYPE_COLORS.length]}
                        strokeWidth="8"
                        strokeDasharray={`${(count / Math.max(bookings.length, 1)) * 100} ${100 - (count / Math.max(bookings.length, 1)) * 100}`}
                        strokeDashoffset={-offset / Math.max(bookings.length, 1) * 100}
                        className="cursor-pointer transition-[stroke-width] hover:stroke-[9]"
                      >
                        <title>{TYPE_LABELS[type] ?? type}: {count} bookings ({Math.round((count / Math.max(bookings.length, 1)) * 100)}%)</title>
                      </circle>
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-bold">{bookings.length}</span></div>
                </div>
                <div className="space-y-2 text-xs">
                  {[...typeCounts.entries()].sort((a, b) => b[1] - a[1]).map(([type, count], index) => (
                    <div key={type} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: TYPE_COLORS[index % TYPE_COLORS.length] }} /><span className="capitalize text-muted">{TYPE_LABELS[type] ?? type}</span><strong className="ml-auto text-foreground">{count}</strong></div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-white p-5 shadow-[0_8px_24px_rgba(47,74,60,0.05)]">
              <div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold text-foreground">Most booked resources</h2><p className="text-xs text-muted">Ranked by booking count</p></div><span className="text-xs text-muted">{completed} completed</span></div>
              <div className="space-y-4">
                {resourceStats.map((resource, index) => (
                  <div key={resource.resourceId}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{resource.label} · {resource.location}{resource.capacity ? ` · ${resource.capacity}` : ""}</span>
                      <span className="text-muted">{resource.count}</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#EEF1EC]">
                      <div className="h-3 rounded-full" style={{ width: `${(resource.count / Math.max(resourceStats[0]?.count ?? 1, 1)) * 100}%`, background: TYPE_COLORS[index % TYPE_COLORS.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <p className="mt-6 rounded-xl border border-[#DCE8DC] bg-[#F1F7F0] px-4 py-3 text-xs text-primary">ⓘ Analytics are computed from existing bookings, resources, locations, and active members. No additional business data is introduced.</p>
        </div>
      </main>
    </div>
  )
}
