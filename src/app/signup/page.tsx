import { createClient } from "@/lib/supabase/server"
import SignupForm from "./SignupForm"

export default async function SignupPage() {
  const supabase = await createClient()

  const [{ data: tiers }, { data: locations }] = await Promise.all([
    supabase.from("membership_tiers").select("tier_id, tier_name").order("tier_id"),
    supabase.from("locations").select("location_id, name").order("location_id"),
  ])

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[45%] lg:flex lg:flex-col lg:justify-between">
        <img
          src="https://images.unsplash.com/photo-1700163080760-12c275d3fe36?w=1200&q=80&auto=format&fit=crop"
          alt="A bright coworking lounge with plants"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

        <div className="relative z-10 p-10 text-lg font-bold text-white">WorkNest</div>

        {/* Feature highlights fill the middle of the photo panel */}
        <div className="relative z-10 space-y-5 px-10">
          {[
            ["Book in seconds", "Live availability across every floor."],
            ["Flexible plans", "Hot desks, dedicated desks, and private cabins."],
            ["3 Bangalore locations", "Koramangala, Indiranagar, and HSR."],
          ].map(([title, sub]) => (
            <div key={title} className="flex items-start gap-3 text-white">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs">✓</span>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-white/60">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 p-10 text-white">
          <p className="text-xl font-semibold leading-snug">
            &ldquo;Flexible spaces for focused people.&rdquo;
          </p>
          <p className="mt-2 text-sm text-white/70">— WorkNest</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-8 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden text-lg font-bold text-foreground">WorkNest</div>
          <h1 className="mb-1 text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mb-8 text-sm text-muted">Join WorkNest to start booking spaces.</p>
          <SignupForm tiers={tiers ?? []} locations={locations ?? []} />
        </div>
      </div>
    </div>
  )
}
