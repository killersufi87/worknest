"use client"

import { useActionState } from "react"
import { signupMember } from "@/app/actions/auth"

type Tier = { tier_id: number; tier_name: string }
type Location = { location_id: number; name: string }

export default function SignupForm({
  tiers,
  locations,
}: {
  tiers: Tier[]
  locations: Location[]
}) {
  const [state, formAction, pending] = useActionState(signupMember, null)

  if (state && "memberId" in state) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          ✓
        </div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Account created</h2>
        <p className="mb-4 text-sm text-muted">
          Your Member ID is <span className="font-semibold text-foreground">{state.memberId}</span>.
          Save this, it&rsquo;s what you&rsquo;ll use to log in, along with the password you just set.
        </p>
        <a
          href="/login"
          className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Go to login
        </a>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Full name</label>
        <input
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Membership tier</label>
        <select
          name="tier_id"
          required
          defaultValue=""
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="" disabled>Select a tier</option>
          {tiers.map((t) => (
            <option key={t.tier_id} value={t.tier_id}>{t.tier_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Home location</label>
        <select
          name="location_id"
          required
          defaultValue=""
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="" disabled>Select a location</option>
          {locations.map((l) => (
            <option key={l.location_id} value={l.location_id}>{l.name}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Sign up"}
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  )
}
