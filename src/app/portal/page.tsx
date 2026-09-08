import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { logout } from "@/app/actions/auth"
import Sidebar from "./Sidebar"

export default async function PortalPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("members")
    .select("member_id, name, remaining_monthly_hours, membership_tiers(tier_name), locations(name)")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (!member) redirect("/login")

  const { data: bookings } = await supabase
    .from("bookings")
    .select("booking_id, start_time, end_time, status, resources(resource_type)")
    .eq("member_id", member.member_id)
    .eq("status", "confirmed")
    .order("start_time", { ascending: true })
    .limit(5)

  const { count: bookingCount } = await supabase
    .from("bookings")
    .select("booking_id", { count: "exact", head: true })
    .eq("member_id", member.member_id)
    .eq("status", "confirmed")

  const tierName = (member.membership_tiers as unknown as { tier_name: string } | null)?.tier_name ?? "Regular"
  const locationName = (member.locations as unknown as { name: string } | null)?.name ?? "—"
  const firstName = member.name.split(" ")[0]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar active="dashboard" />

      <main className="flex-1 px-14 py-12">
        {/* Header with photo banner */}
        <div className="mb-10 flex items-start justify-between gap-8">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Good {timeOfDay()}, {firstName}
            </p>
            <h1 className="max-w-md text-4xl font-bold leading-tight text-foreground">
              A better place to get work done.
            </h1>
          </div>
          <div className="relative hidden h-32 w-56 shrink-0 overflow-hidden rounded-xl md:block">
            <img
              src="https://images.unsplash.com/photo-1498049860654-af1a5c566876?w=600&q=80&auto=format&fit=crop"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Tier banner */}
        <div className="mb-10 flex items-center justify-between rounded-xl bg-primary px-6 py-4 text-primary-foreground">
          <div>
            <p className="font-semibold">{tierName} Member</p>
            <p className="text-sm text-white/70">{locationName}</p>
          </div>
          <span className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium">
            Manage Plan →
          </span>
        </div>

        {/* Plain stat row, no boxes */}
        <div className="mb-10 grid grid-cols-3 gap-8 border-y border-border py-6">
          <div>
            <p className="text-3xl font-bold text-foreground">{member.remaining_monthly_hours}</p>
            <p className="text-sm text-muted">Hours remaining</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{bookingCount ?? 0}</p>
            <p className="text-sm text-muted">Active bookings</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">1</p>
            <p className="text-sm text-muted">Location access</p>
          </div>
        </div>

        {/* Book a resource CTA */}
        <a
          href="/portal/book"
          className="mb-10 flex items-center justify-between overflow-hidden rounded-xl bg-[#18181A] px-8 py-7 text-white transition-opacity hover:opacity-95"
        >
          <div>
            <p className="text-xl font-semibold">Book a Resource</p>
            <p className="text-sm text-white/60">Desks, meeting rooms, cabins and more.</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#18181A]">
            →
          </span>
        </a>

        {/* Upcoming bookings */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Upcoming Bookings</h2>
          {bookings && bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.booking_id}
                  className="flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {(b.resources as unknown as { resource_type: string } | null)?.resource_type}
                    </p>
                    <p className="text-sm text-muted">{new Date(b.start_time).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-[--status-confirmed-bg] px-3 py-1 text-xs font-medium text-[--status-confirmed-fg]">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted">
              No upcoming bookings yet. Booking opens in Phase 3.
            </div>
          )}
        </div>

        <form action={logout} className="mt-12">
          <button type="submit" className="text-sm text-muted hover:text-foreground">
            Log out
          </button>
        </form>
      </main>
    </div>
  )
}

function timeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}
