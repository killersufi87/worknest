import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "./Sidebar"
import PortalBackdrop from "./PortalBackdrop"
import CountUp from "./CountUp"

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
    <div className="relative flex min-h-screen bg-background">
      <Sidebar active="dashboard" name={member.name} tierName={tierName} />
      <PortalBackdrop image="photo-1758518730083-4c12527b6742" />

      <main className="relative z-10 flex-1">
        {/* Top app bar */}
        <div className="flex items-center justify-between border-b border-border px-10 py-4">
          <input
            type="text"
            placeholder="Search spaces, locations…"
            className="w-72 rounded-lg border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground">
              📍 {locationName}
            </span>
            <span className="text-lg">🔔</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="px-10 py-10">
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
                src="https://images.unsplash.com/photo-1758518730083-4c12527b6742?w=600&q=80&auto=format&fit=crop"
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

          {/* Stat row */}
          <div className="mb-10 grid grid-cols-3 gap-8 border-y border-border py-6">
            <div>
              <p className="text-3xl font-bold text-foreground"><CountUp value={member.remaining_monthly_hours} /></p>
              <p className="text-sm text-muted">Hours remaining</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground"><CountUp value={bookingCount ?? 0} /></p>
              <p className="text-sm text-muted">Active bookings</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground"><CountUp value={1} /></p>
              <p className="text-sm text-muted">Location access</p>
            </div>
          </div>

          {/* Book a resource CTA, now with a real photo behind it */}
          <a
            href="/portal/book"
            className="relative mb-10 flex items-center justify-between overflow-hidden rounded-xl px-8 py-7 text-white transition-opacity hover:opacity-95"
          >
            <img
              src="https://images.unsplash.com/photo-1700163080760-12c275d3fe36?w=1200&q=80&auto=format&fit=crop"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/65" />
            <div className="relative z-10">
              <p className="text-xl font-semibold">Book a Resource</p>
              <p className="text-sm text-white/70">Desks, meeting rooms, cabins and more.</p>
            </div>
            <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#18181A]">
              →
            </span>
          </a>

          {/* Upcoming bookings */}
          <div className="mb-16">
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
        </div>

        {/* Bottom photo + quote banner */}
        <div className="relative h-56 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1498049860654-af1a5c566876?w=1600&q=80&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
            <p className="text-xl font-semibold">&ldquo;Good work starts with a great space.&rdquo;</p>
            <p className="mt-2 text-sm text-white/70">— The WorkNest Way</p>
          </div>
        </div>
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
