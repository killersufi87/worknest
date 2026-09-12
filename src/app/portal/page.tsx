import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { completePastBookings } from "@/app/actions/booking"
import Sidebar from "./Sidebar"
import PortalBackdrop from "./PortalBackdrop"
import TopBar from "./TopBar"
import CountUp from "./CountUp"

export default async function PortalPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("members")
    .select("member_id, name, remaining_monthly_hours, plan_renewal_date, membership_tiers(tier_name), locations(name)")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (!member) redirect("/login")

  await completePastBookings()

  // Parallelize everything that doesn't depend on each other.
  const [{ data: bookings }, { count: bookingCount }, { count: completedCount }, { data: locations }, { data: recentCancellations }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("booking_id, start_time, end_time, status, resources(resource_type)")
        .eq("member_id", member.member_id)
        .eq("status", "confirmed")
        .order("start_time", { ascending: true })
        .limit(5),
      supabase
        .from("bookings")
        .select("booking_id", { count: "exact", head: true })
        .eq("member_id", member.member_id)
        .eq("status", "confirmed"),
      supabase
        .from("bookings")
        .select("booking_id", { count: "exact", head: true })
        .eq("member_id", member.member_id)
        .eq("status", "completed"),
      supabase.from("locations").select("location_id, name").order("location_id"),
      supabase
        .from("cancellation_refunds")
        .select("cancelled_at, bookings(member_id)")
        .order("cancelled_at", { ascending: false })
        .limit(3),
    ])

  const tierName = (member.membership_tiers as unknown as { tier_name: string } | null)?.tier_name ?? "Regular"
  const locationName = (member.locations as unknown as { name: string } | null)?.name ?? "—"
  const firstName = member.name.split(" ")[0]

  const tierStyles: Record<string, string> = {
    Regular: "bg-primary text-primary-foreground",
    Silver: "bg-[#9CA3AF] text-[#1C1B19]",
    Gold: "bg-[#D4AF37] text-[#1C1B19]",
    Platinum: "bg-gradient-to-r from-[#2A2A2E] to-[#4A4A52] text-white",
  }
  const bannerClass = tierStyles[tierName] ?? tierStyles.Regular

  // Derive "notifications" from real activity, no separate table invented
  // beyond what the SDD already defines.
  const bookingActivity = (bookings ?? []).slice(0, 2).map((b) => ({
    id: `booking-${b.booking_id}`,
    text: `Booking confirmed: ${(b.resources as unknown as { resource_type: string } | null)?.resource_type}`,
    time: new Date(b.start_time).toLocaleDateString(),
  }))
  const cancellationActivity = (recentCancellations ?? [])
    .filter((c) => (c.bookings as unknown as { member_id: number } | null)?.member_id === member.member_id)
    .slice(0, 2)
    .map((c, i) => ({
      id: `cancel-${i}`,
      text: "Booking cancelled",
      time: new Date(c.cancelled_at).toLocaleDateString(),
    }))
  const activity = [...bookingActivity, ...cancellationActivity].slice(0, 3)

  return (
    <div className="relative flex min-h-screen bg-background">
      <Sidebar active="dashboard" name={member.name} tierName={tierName} />
      <PortalBackdrop image="photo-1758518730083-4c12527b6742" />

      <main className="relative z-10 flex-1">
        <TopBar
          locationName={locationName}
          locations={locations ?? []}
          firstName={firstName}
          activity={activity}
        />

        <div className="px-10 py-10">
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
                src="https://images.unsplash.com/photo-1758518730083-4c12527b6742?w=500&q=70&auto=format&fit=crop"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className={`mb-10 flex items-center justify-between rounded-xl px-6 py-4 ${bannerClass}`}>
            <div>
              <p className="font-semibold">{tierName} Member</p>
              <p className="text-sm opacity-70">
                {locationName}
                {member.plan_renewal_date && ` · Renews ${new Date(member.plan_renewal_date).toLocaleDateString()}`}
              </p>
            </div>
            <span className="rounded-lg border border-current/30 px-4 py-2 text-sm font-medium">
              Manage Plan →
            </span>
          </div>

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
              <p className="text-3xl font-bold text-foreground"><CountUp value={completedCount ?? 0} /></p>
              <p className="text-sm text-muted">Bookings completed</p>
            </div>
          </div>

          <a
            href="/portal/book"
            className="relative mb-10 flex items-center justify-between overflow-hidden rounded-xl px-8 py-7 text-white transition-opacity hover:opacity-95"
          >
            <img
              src="https://images.unsplash.com/photo-1700163080760-12c275d3fe36?w=900&q=70&auto=format&fit=crop"
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
                    <span className="rounded-full bg-[var(--status-confirmed-bg)] px-3 py-1 text-xs font-medium text-[var(--status-confirmed-fg)]">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted">
                No upcoming bookings yet.
              </div>
            )}
          </div>
        </div>

        <div className="relative h-56 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1498049860654-af1a5c566876?w=1200&q=70&auto=format&fit=crop"
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
