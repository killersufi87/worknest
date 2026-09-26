import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminSidebar from "../AdminSidebar"
import PortalBackdrop from "../../portal/PortalBackdrop"
import ShiftFinder from "./ShiftFinder"
import ShiftForm from "./ShiftForm"
import EmployeeManager from "./EmployeeManager"
import { getAdminContext } from "@/lib/auth/admin"

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
    .select("employee_id, name, role, is_active")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (!employee?.is_active) redirect("/login")

  const { data: locations } = await supabase
    .from("locations")
    .select("location_id, name")
    .order("location_id")

  const { data: staffList } = await supabase
    .from("employees")
    .select("employee_id, name, role, location_id, certification_status")
    .eq("is_active", true)
    .neq("role", "admin")
    .order("role")

  const adminContext = employee.role === "admin" ? await getAdminContext() : null
  const [{ data: allEmployees, error: employeesError }, { data: allLocations, error: locationsError }] = adminContext
    ? await Promise.all([
      adminContext.admin
        .from("employees")
        .select("employee_id, name, email, role, location_id, certification_status, is_active")
        .neq("role", "admin")
        .order("employee_id"),
      adminContext.admin.from("locations").select("location_id, name").order("location_id"),
    ])
    : [{ data: null, error: null }, { data: null, error: null }]

  if (employeesError) throw new Error(employeesError.message)
  if (locationsError) throw new Error(locationsError.message)

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
                <p className="mt-2 text-xs text-muted">
                  Certification: {s.certification_status === "certified" ? "Certified" : s.certification_status === "training" ? "Training in progress" : "Not certified"}
                </p>
              </div>
            )
          })}
        </div>

        {employee.role === "admin" && (
          <EmployeeManager employees={allEmployees ?? []} locations={allLocations ?? []} />
        )}
        {employee.role === "admin" && (
          <>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Create a shift</h2>
            <ShiftForm locations={locations ?? []} staff={staffList ?? []} />
          </>
        )}
        <h2 className="mb-4 mt-10 text-lg font-semibold text-foreground">Who&rsquo;s Working — pick a location and date</h2>
        <ShiftFinder locations={locations ?? []} />
      </main>
    </div>
  )
}
