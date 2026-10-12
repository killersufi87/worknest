import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminSidebar from "./AdminSidebar"
import PortalBackdrop from "../portal/PortalBackdrop"
import GridViewer from "./GridViewer"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: employee } = await supabase
    .from("employees")
    .select("employee_id, name, role")
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
    .select("resource_id")
    .eq("active", true)

  const { count: totalConfirmedToday } = await supabase
    .from("bookings")
    .select("booking_id", { count: "exact", head: true })
    .eq("status", "confirmed")
    .gte("start_time", `${today}T00:00:00+00:00`)
    .lte("start_time", `${today}T23:59:59+00:00`)

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background lg:flex-row">
      <AdminSidebar active="grid" name={employee.name} isAdmin={employee.role === "admin"} />
      <PortalBackdrop image="photo-1758518730083-4c12527b6742" />

      <main className="relative z-10 min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Overview</p>
        <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">See the whole workspace at once.</h1>

        <div className="mb-10 grid grid-cols-1 gap-5 border-y border-border py-6 sm:grid-cols-3 sm:gap-8">
          <div>
            <p className="text-3xl font-bold text-foreground">{totalConfirmedToday ?? 0}</p>
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

        <h2 className="mb-4 text-lg font-semibold text-foreground">Live Booking Grid</h2>
        <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
          <GridViewer locations={locations ?? []} />
        </div>
      </main>
    </div>
  )
}
