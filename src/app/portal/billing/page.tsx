import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "../Sidebar"
import PortalBackdrop from "../PortalBackdrop"

export default async function BillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("members")
    .select("member_id, name, membership_tiers(tier_name)")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (!member) redirect("/login")

  const { data: bookings } = await supabase
    .from("bookings")
    .select("booking_id, start_time, amount, status, resources(resource_type)")
    .eq("member_id", member.member_id)
    .order("start_time", { ascending: false })

  const { data: refunds } = await supabase
    .from("cancellation_refunds")
    .select("booking_id, refund_pct_applied, refund_amount, cancelled_at")
    .in("booking_id", (bookings ?? []).map((b) => b.booking_id))

  const refundMap = new Map((refunds ?? []).map((r) => [r.booking_id, r]))

  const totalCharged = (bookings ?? [])
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.amount ?? 0), 0)
  const totalRefunded = (refunds ?? []).reduce((sum, r) => sum + (r.refund_amount ?? 0), 0)

  const tierName = (member.membership_tiers as unknown as { tier_name: string } | null)?.tier_name ?? "Regular"

  return (
    <div className="relative flex min-h-screen bg-background">
      <Sidebar active="billing" name={member.name} tierName={tierName} />
      <PortalBackdrop image="photo-1758518730083-4c12527b6742" />

      <main className="relative z-10 flex-1 px-10 py-10">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Billing &amp; Invoices</h1>

        <div className="mb-10 grid grid-cols-2 gap-8 border-y border-border py-6">
          <div>
            <p className="text-3xl font-bold text-foreground">₹{totalCharged}</p>
            <p className="text-sm text-muted">Total charged</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">₹{totalRefunded}</p>
            <p className="text-sm text-muted">Total refunded</p>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-foreground">Transaction History</h2>
        {bookings && bookings.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-black/[0.02] text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Resource</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const refund = refundMap.get(b.booking_id)
                  return (
                    <tr key={b.booking_id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 text-foreground">{new Date(b.start_time).toLocaleDateString()}</td>
                      <td className="px-5 py-3 capitalize text-foreground">
                        {(b.resources as unknown as { resource_type: string } | null)?.resource_type.replace("_", " ")}
                      </td>
                      <td className="px-5 py-3 capitalize text-muted">{b.status}</td>
                      <td className="px-5 py-3 text-right text-foreground">
                        ₹{b.amount ?? 0}
                        {refund && (
                          <span className="ml-2 text-xs text-[--status-confirmed-fg]">
                            (₹{refund.refund_amount} refunded)
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-white/60 px-5 py-10 text-center text-sm text-muted">
            No transactions yet.
          </div>
        )}
      </main>
    </div>
  )
}
