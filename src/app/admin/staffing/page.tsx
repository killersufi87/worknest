import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminSidebar from "../AdminSidebar"
import PortalBackdrop from "../../portal/PortalBackdrop"

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
  const twoWeeksOut = new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const { data: shifts } = await supabase
    .from("staff_shifts")
    .select("shift_id, shift_date, certification, employees(name, role), locations(name)")
    .gte("shift_date", today)
    .lte("shift_date", twoWeeksOut)
    .order("shift_date")

  const { data: staffList } = await supabase
    .from("employees")
    .select("employee_id, name, role, locations(name)")
    .order("role")

  const grouped = new Map<string, typeof shifts>()
  for (const s of shifts ?? []) {
    const key = s.shift_date
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(s)
  }

  // FR18: flag any location+date with zero certified staff on shift.
  const coverageGaps: { date: string; location: string }[] = []
  const byDateLocation = new Map<string, { certified: number; location: string }>()
  for (const s of shifts ?? []) {
    const locName = (s.locations as unknown as { name: string } | null)?.name ?? "—"
    const key = `${s.shift_date}__${locName}`
    const existing = byDateLocation.get(key) ?? { certified: 0, location: locName }
    if (s.certification) existing.certified += 1
    byDateLocation.set(key, existing)
  }
  for (const [key, val] of byDateLocation.entries()) {
    if (val.certified === 0) {
      coverageGaps.push({ date: key.split("__")[0], location: val.location })
    }
  }

  const ROLE_LABELS: Record<string, string> = {
    admin: "Admin",
    manager: "Floor Manager",
    front_desk: "Front Desk",
  }

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background">
      <AdminSidebar active="staffing" name={employee.name} />
      <PortalBackdrop image="photo-1498049860654-af1a5c566876" />

      <main className="relative z-10 flex-1 px-10 py-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Team</p>
        <h1 className="mb-8 text-3xl font-bold text-foreground">Shift &amp; Certification Tracker</h1>

        {/* Staff roster */}
        <h2 className="mb-4 text-lg font-semibold text-foreground">Staff Roster</h2>
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(staffList ?? []).map((s) => (
            <div key={s.employee_id} className="min-w-0 rounded-xl border border-border bg-white px-4 py-3">
              <p className="font-medium text-foreground">{s.name}</p>
              <p className="text-xs text-muted">
                {ROLE_LABELS[s.role] ?? s.role} · {(s.locations as unknown as { name: string } | null)?.name}
              </p>
            </div>
          ))}
        </div>

        {/* FR18: coverage gap flag */}
        {coverageGaps.length > 0 && (
          <div className="mb-10 rounded-xl border border-[--status-booked-fg]/30 bg-[--status-booked-bg] px-5 py-4">
            <p className="mb-2 text-sm font-semibold text-[--status-booked-fg]">
              ⚠ {coverageGaps.length} shift{coverageGaps.length > 1 ? "s" : ""} with no certified staff
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

        {/* Upcoming shifts, next 14 days */}
        <h2 className="mb-4 text-lg font-semibold text-foreground">Upcoming Shifts (next 14 days)</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-black/[0.02] text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Staff</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Certification</th>
              </tr>
            </thead>
            <tbody>
              {[...grouped.entries()].flatMap(([date, dayShifts]) =>
                (dayShifts ?? []).map((s) => (
                  <tr key={s.shift_id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-foreground">{new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</td>
                    <td className="px-5 py-3 text-foreground">
                      {(s.employees as unknown as { name: string } | null)?.name}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {(s.locations as unknown as { name: string } | null)?.name}
                    </td>
                    <td className="px-5 py-3">
                      {s.certification ? (
                        <span className="rounded-full bg-[--status-confirmed-bg] px-2.5 py-1 text-xs font-medium text-[--status-confirmed-fg]">
                          {s.certification}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">Not certified</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
