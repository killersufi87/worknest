import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "../Sidebar"
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
    <div className="flex min-h-screen bg-background">
      <Sidebar active="book" name={member.name} tierName={tierName} />
      <main className="flex-1 px-10 py-10">
        {/* Scrolling ticker */}
        <div className="mb-8 overflow-hidden whitespace-nowrap rounded-lg bg-[#18181A] py-2.5">
          <div className="inline-block animate-marquee text-sm text-white/70">
            {Array(4).fill(
              "Koramangala · Indiranagar · HSR · Hot Desks · Dedicated Desks · Private Cabins · Meeting Rooms · "
            ).join("")}
          </div>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Find your space</p>
        <h1 className="mb-8 text-3xl font-bold text-foreground">Choose the space for the work ahead.</h1>

        <BookingWizard
          locations={locations ?? []}
          remainingHours={member.remaining_monthly_hours}
        />
      </main>
    </div>
  )
}
