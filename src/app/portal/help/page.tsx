import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "../Sidebar"
import PortalBackdrop from "../PortalBackdrop"
import HelpForm from "./HelpForm"

export default async function HelpPage() {
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

  const { data: queries } = await supabase
    .from("help_queries")
    .select("query_id, message_text, status, created_at")
    .eq("member_id", member.member_id)
    .order("created_at", { ascending: false })

  const tierName = (member.membership_tiers as unknown as { tier_name: string } | null)?.tier_name ?? "Regular"

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background">
      <Sidebar active="help" name={member.name} tierName={tierName} />
      <PortalBackdrop image="photo-1498049860654-af1a5c566876" />

      <main className="relative z-10 flex-1 px-10 py-10">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Help &amp; Support</h1>
        <HelpForm />

        {queries && queries.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Your Queries</h2>
            <div className="space-y-3">
              {queries.map((q) => (
                <div key={q.query_id} className="rounded-xl border border-border bg-white px-5 py-4">
                  <p className="text-sm text-foreground">{q.message_text}</p>
                  <p className="mt-2 text-xs text-muted">
                    {new Date(q.created_at).toLocaleString()} ·{" "}
                    <span className="capitalize">{q.status}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
