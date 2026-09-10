import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "../Sidebar"
import PortalBackdrop from "../PortalBackdrop"
import BookingsList from "./BookingsList"

export default async function BookingsPage() {
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

  const { data: bookingsRaw } = await supabase
    .from("bookings")
    .select("booking_id, start_time, end_time, status, amount, resources(resource_type, locations(name))")
    .eq("member_id", member.member_id)
    .order("start_time", { ascending: false })

  const bookings = (bookingsRaw ?? []).map((b) => ({
    booking_id: b.booking_id,
    start_time: b.start_time,
    end_time: b.end_time,
    status: b.status,
    amount: b.amount,
    resource_type: (b.resources as unknown as { resource_type: string } | null)?.resource_type ?? "resource",
    location_name: (b.resources as unknown as { locations: { name: string } | null } | null)?.locations?.name ?? "—",
  }))

  const tierName = (member.membership_tiers as unknown as { tier_name: string } | null)?.tier_name ?? "Regular"

  return (
    <div className="relative flex min-h-screen bg-background">
      <Sidebar active="bookings" name={member.name} tierName={tierName} />
      <PortalBackdrop image="photo-1498049860654-af1a5c566876" />

      <main className="relative z-10 flex-1 px-10 py-10">
        <h1 className="mb-8 text-3xl font-bold text-foreground">My Bookings</h1>
        <BookingsList bookings={bookings} />
      </main>
    </div>
  )
}
