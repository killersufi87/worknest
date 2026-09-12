import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminSidebar from "../AdminSidebar"
import PortalBackdrop from "../../portal/PortalBackdrop"
import ResolveButton from "./ResolveButton"

export default async function AdminHelpPage() {
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

  const { data: queries } = await supabase
    .from("help_queries")
    .select("query_id, message_text, status, created_at, members(member_id, name, locations(name))")
    .order("created_at", { ascending: false })

  const openCount = (queries ?? []).filter((q) => q.status === "open").length

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background">
      <AdminSidebar active="help" name={employee.name} />
      <PortalBackdrop image="photo-1700163080760-12c275d3fe36" />

      <main className="relative z-10 flex-1 px-10 py-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Support</p>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Help &amp; Support Queries</h1>
        <p className="mb-8 text-sm text-muted">{openCount} open {openCount === 1 ? "query" : "queries"}</p>

        <div className="space-y-4">
          {(queries ?? []).map((q) => {
            const member = q.members as unknown as { member_id: number; name: string; locations: { name: string } | null } | null
            return (
              <div key={q.query_id} className="rounded-xl border border-border bg-white p-5">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{member?.name} <span className="font-normal text-muted">(Member ID {member?.member_id})</span></p>
                    <p className="text-xs text-muted">{member?.locations?.name} · {new Date(q.created_at).toLocaleString()}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      q.status === "open"
                        ? "bg-[var(--status-booked-bg)] text-[var(--status-booked-fg)]"
                        : "bg-[var(--status-confirmed-bg)] text-[var(--status-confirmed-fg)]"
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
                <p className="mb-3 text-sm text-foreground">{q.message_text}</p>
                {q.status === "open" && <ResolveButton queryId={q.query_id} />}
              </div>
            )
          })}
          {(!queries || queries.length === 0) && (
            <div className="rounded-xl border border-dashed border-border bg-white/60 px-5 py-10 text-center text-sm text-muted">
              No queries submitted yet.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
