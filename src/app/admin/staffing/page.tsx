import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminSidebar from "../AdminSidebar"
import PortalBackdrop from "../../portal/PortalBackdrop"

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Floor Manager",
  front_desk: "Front Desk",
}

export default async function StaffingPage() {
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

  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const tenDaysOut = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const { data: locations } = await supabase
    .from("locations")
    .select("location_id, name")
    .order("location_id")

  const { data: shifts } = await supabase
    .from("staff_shifts")
    .select("shift_id, shift_date, certification, location_id, employees(name, role)")
    .gte("shift_date", today)
    .lte("shift_date", tenDaysOut)
    .order("shift_date")

  const { data: staffList } = await supabase
    .from("employees")
    .select("employee_id, name, role, location_id")
    .neq("role", "admin")
    .order("role")

  // FR18: flag any location+date with zero certified staff on shift.
  const byDateLocation = new Map<string, number>()
  for (const s of shifts ?? []) {
    const key = `${s.shift_date}__${s.location_id}`
    byDateLocation.set(key, (byDateLocation.get(key) ?? 0) + (s.certification ? 1 : 0))
  }
  const coverageGaps: { date: string; location: string }[] = []
  for (const loc of locations ?? []) {
    const dates = new Set((shifts ?? []).filter((s) => s.location_id === loc.location_id).map((s) => s.shift_date))
    for (const date of dates) {
      if ((byDateLocation.get(`${date}__${loc.location_id}`) ?? 0) === 0) {
        coverageGaps.push({ date, location: loc.name })
      }
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background">
      <AdminSidebar active="staffing" name={employee.name} />
      <PortalBackdrop image="photo-1498049860654-af1a5c566876" />

      <main className="relative z-10 flex-1 px-10 py-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Team</p>
        <h1 className="mb-8 text-3xl font-bold text-foreground">Shift &amp; Certification Tracker</h1>

        <h2 className="mb-4 text-lg font-semibold text-foreground">Staff Roster</h2>
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(staffList ?? []).map((s) => {
            const locName = (locations ?? []).find((l) => l.location_id === s.location_id)?.name ?? "—"
            return (
              <div key={s.employee_id} className="min-w-0 rounded-xl border border-border bg-white px-4 py-3">
                <p className="font-medium text-foreground">{s.name}</p>
                <p className="text-xs text-muted">{ROLE_LABELS[s.role] ?? s.role} · {locName}</p>
              </div>
            )
          })}
        </div>

        {coverageGaps.length > 0 && (
          <div className="mb-10 rounded-xl border border-[--status-booked-fg]/30 bg-[--status-booked-bg] px-5 py-4">
            <p className="mb-2 text-sm font-semibold text-[--status-booked-fg]">
              ⚠ {coverageGaps.length} day{coverageGaps.length > 1 ? "s" : ""} with no process-certified staff
            </p>
            <ul className="space-y-1 text-sm text-[--status-booked-fg]">
              {coverageGaps.slice(0, 5).map((g) => (
                <li key={`${g.date}-${g.location}`}>
                  {new Date(g.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} — {g.location}
                </li>
              ))}
            </ul>
          </div>
        )}

        <h2 className="mb-4 text-lg font-semibold text-foreground">Upcoming Shifts (next 10 days)</h2>
        {(locations ?? []).map((loc) => (
          <div key={loc.location_id} className="mb-8">
            <h3 className="mb-3 text-sm font-semibold text-primary">{loc.name}</h3>
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-black/[0.02] text-left text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Staff</th>
                    <th className="px-5 py-3">Designation</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Process Certified</th>
                  </tr>
                </thead>
                <tbody>
                  {(shifts ?? [])
                    .filter((s) => s.location_id === loc.location_id)
                    .map((s) => {
                      const emp = s.employees as unknown as { name: string; role: string } | null
                      return (
                        <tr key={s.shift_id} className="border-b border-border last:border-0">
                          <td className="px-5 py-3 text-foreground">
                            {new Date(s.shift_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                          </td>
                          <td className="px-5 py-3 text-foreground">{emp?.name}</td>
                          <td className="px-5 py-3 text-muted">{ROLE_LABELS[emp?.role ?? ""] ?? emp?.role}</td>
                          <td className="px-5 py-3 text-muted">{loc.name}</td>
                          <td className="px-5 py-3">
                            {s.certification ? (
                              <span className="rounded-full bg-[--status-confirmed-bg] px-2.5 py-1 text-xs font-medium text-[--status-confirmed-fg]">
                                Yes
                              </span>
                            ) : (
                              <span className="rounded-full bg-[--status-booked-bg] px-2.5 py-1 text-xs font-medium text-[--status-booked-fg]">
                                No
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
