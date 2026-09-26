import { redirect } from "next/navigation"
import AdminSidebar from "../AdminSidebar"
import PortalBackdrop from "../../portal/PortalBackdrop"
import MembershipManager from "./MembershipManager"
import { getAdminContext } from "@/lib/auth/admin"

export default async function MembershipsPage() {
  const context = await getAdminContext()
  if (!context) redirect("/login")

  const [{ data: tiers, error: tierError }, { data: employee, error: employeeError }] = await Promise.all([
    context.admin
      .from("membership_tiers")
      .select("tier_id, tier_name, monthly_rate, cancellation_refund_pct, notice_window_hours, free_conference_hours_allowance, is_active")
      .order("tier_id"),
    context.admin
      .from("employees")
      .select("name")
      .eq("employee_id", context.employee.employee_id)
      .single(),
  ])

  if (tierError) throw new Error(tierError.message)
  if (employeeError) throw new Error(employeeError.message)

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background">
      <AdminSidebar active="memberships" name={employee.name} isAdmin />
      <PortalBackdrop image="photo-1498049860654-af1a5c566876" />
      <main className="relative z-10 flex-1 px-10 py-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Admin settings</p>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Membership Plans</h1>
        <p className="mb-8 max-w-3xl text-sm text-muted">
          Manage the monthly plan price, cancellation refund percentage, cancellation notice window, and free meeting-room hours for each tier.
        </p>
        <MembershipManager tiers={tiers ?? []} />
      </main>
    </div>
  )
}
