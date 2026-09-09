import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminSidebar from "./AdminSidebar"
import PortalBackdrop from "../portal/PortalBackdrop"

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]

export default async function AdminPage() {
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

  const today = new Date().toISOString().slice(0, 10)

  const { data: locations } = await supabase
    .from("locations")
    .select("location_id, name")
    .order("location_id")

  const { data: resources } = await supabase
    .from("resources")
    .select("resource_id, location_id, resource_type")
    .eq("active", true)

  const { data: bookings } = await supabase
    .from("bookings")
    .select("resource_id, start_time, end_time")
    .eq("status", "confirmed")
    .gte("start_time", `${today}T00:00:00+00:00`)
    .lte("start_time", `${today}T23:59:59+00:00`)

  const resourceLocationMap = new Map((resources ?? []).map((r) => [r.resource_id, r.location_id]))
  const resourceCountByLocation = new Map<number, number>()
  for (const r of resources ?? []) {
    resourceCountByLocation.set(r.location_id, (resourceCountByLocation.get(r.location_id) ?? 0) + 1)
  }

  function occupancyFor(locationId: number, hour: number) {
    const slotStart = new Date(`${today}T${String(hour).padStart(2, "0")}:00:00+05:30`)
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000)
    const booked = (bookings ?? []).filter((b) => {
      if (resourceLocationMap.get(b.resource_id) !== locationId) return false
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      return slotStart < bEnd && slotEnd > bStart
    }).length
    const total = resourceCountByLocation.get(locationId) ?? 0
    return { booked, total }
  }

  const totalConfirmedToday = bookings?.length ?? 0

  return (
    <div className="relative flex min-h-screen bg-background">
      <AdminSidebar active="grid" name={employee.name} />
      <PortalBackdrop image="photo-1758518730083-4c12527b6742" />

      <main className="relative z-10 flex-1 px-10 py-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Overview</p>
        <h1 className="mb-8 text-3xl font-bold text-foreground">See the whole workspace at once.</h1>

        <div className="mb-10 grid grid-cols-2 gap-8 border-y border-border py-6 md:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-foreground">{totalConfirmedToday}</p>
            <p className="text-sm text-muted">Confirmed bookings today</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{resources?.length ?? 0}</p>
            <p className="text-sm text-muted">Total resources</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{locations?.length ?? 0}</p>
            <p className="text-sm text-muted">Locations</p>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Live Booking Grid <span className="font-normal text-muted">— {today}</span>
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-black/[0.02] text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-3">Time</th>
                {(locations ?? []).map((loc) => (
                  <th key={loc.location_id} className="px-5 py-3">{loc.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">
                    {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"}
                  </td>
                  {(locations ?? []).map((loc) => {
                    const { booked, total } = occupancyFor(loc.location_id, hour)
                    const ratio = total > 0 ? booked / total : 0
                    const cellClass =
                      ratio === 0
                        ? "bg-[--status-confirmed-bg] text-[--status-confirmed-fg]"
                        : ratio < 0.7
                        ? "bg-[--status-partial-bg] text-[--status-partial-fg]"
                        : "bg-[--status-booked-bg] text-[--status-booked-fg]"
                    return (
                      <td key={loc.location_id} className="px-5 py-3">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${cellClass}`}>
                          {booked}/{total} booked
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
