import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminSidebar from "../AdminSidebar"
import PortalBackdrop from "../../portal/PortalBackdrop"

export default async function InvoicesPage() {
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

  const { data: bookings } = await supabase
    .from("bookings")
    .select("booking_id, start_time, amount, status, members(name), resources(resource_type, locations(name))")
    .order("start_time", { ascending: false })
    .limit(100)

  const { data: refunds } = await supabase
    .from("cancellation_refunds")
    .select("booking_id, refund_amount")

  const refundMap = new Map((refunds ?? []).map((r) => [r.booking_id, r.refund_amount]))
  const totalRevenue = (bookings ?? [])
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.amount ?? 0), 0)

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background">
      <AdminSidebar active="invoices" name={employee.name} />
      <PortalBackdrop image="photo-1758518730083-4c12527b6742" />

      <main className="relative z-10 flex-1 px-10 py-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Billing</p>
        <h1 className="mb-8 text-3xl font-bold text-foreground">Invoice Management</h1>

        <div className="mb-10 grid grid-cols-2 gap-8 border-y border-border py-6 md:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-foreground">₹{totalRevenue}</p>
            <p className="text-sm text-muted">Total revenue</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{bookings?.length ?? 0}</p>
            <p className="text-sm text-muted">Total transactions</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-black/[0.02] text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Resource</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(bookings ?? []).map((b) => {
                const resource = b.resources as unknown as { resource_type: string; locations: { name: string } | null } | null
                const refund = refundMap.get(b.booking_id)
                return (
                  <tr key={b.booking_id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-foreground">{new Date(b.start_time).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-foreground">{(b.members as unknown as { name: string } | null)?.name}</td>
                    <td className="px-5 py-3 text-muted">{resource?.locations?.name}</td>
                    <td className="px-5 py-3 capitalize text-muted">{resource?.resource_type.replace("_", " ")}</td>
                    <td className="px-5 py-3 capitalize text-muted">{b.status}</td>
                    <td className="px-5 py-3 text-right text-foreground">
                      ₹{b.amount ?? 0}
                      {refund != null && <span className="ml-2 text-xs text-[--status-confirmed-fg]">(₹{refund} refunded)</span>}
                    </td>
                  </tr>
                )
              })}
              {(!bookings || bookings.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted">No transactions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
