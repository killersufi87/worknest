import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "../Sidebar"
import PortalBackdrop from "../PortalBackdrop"
import BookingWizard from "./BookingWizard"

export default async function BookPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("members")
    .select("name, remaining_monthly_hours, membership_tiers(tier_name)")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (!member) redirect("/login")

  const { data: locations } = await supabase
    .from("locations")
    .select("location_id, name, address")
    .order("location_id")

  const tierName = (member.membership_tiers as unknown as { tier_name: string } | null)?.tier_name ?? "Regular"

  return (
    <div className="relative flex min-h-screen bg-background">
      <Sidebar active="book" name={member.name} tierName={tierName} />
      <PortalBackdrop image="photo-1700163080760-12c275d3fe36" />

      <main className="relative z-10 flex-1 px-10 py-10">
        <div className="mx-auto max-w-4xl">
        {/* Scrolling ticker */}
        <div className="mb-8 overflow-hidden whitespace-nowrap rounded-lg bg-[#18181A] py-3">
          <div className="inline-flex animate-marquee items-center gap-16 text-sm font-medium text-white/80">
            {Array(6).fill(0).map((_, i) => (
              <span key={i} className="shrink-0">
                Co-working made easy by WorkNest — Book now!!
              </span>
            ))}
          </div>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Find your space</p>
        <h1 className="mb-8 text-3xl font-bold text-foreground">Choose the space for the work ahead.</h1>

        <BookingWizard
          locations={locations ?? []}
          remainingHours={member.remaining_monthly_hours}
        />
        </div>
      </main>
    </div>
  )
}
