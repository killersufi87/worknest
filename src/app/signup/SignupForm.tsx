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
      <div>
        <h2>Account created</h2>
        <p>
          Your Member ID is <strong>{state.memberId}</strong>. Save this &mdash;
          it&rsquo;s what you&rsquo;ll use to log in, along with the password
          you just set.
        </p>
        <a href="/login">Go to login</a>
      </div>
    )
  }

  return (
    <form action={formAction} style={{ display: "grid", gap: "0.5rem", maxWidth: 320 }}>
      <label>
        Full name
        <input name="name" type="text" required />
      </label>
      <label>
        Password
        <input name="password" type="password" required minLength={6} />
      </label>
      <label>
        Membership tier
        <select name="tier_id" required defaultValue="">
          <option value="" disabled>
            Select a tier
          </option>
          {tiers.map((t) => (
            <option key={t.tier_id} value={t.tier_id}>
              {t.tier_name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Home location
        <select name="location_id" required defaultValue="">
          <option value="" disabled>
            Select a location
          </option>
          {locations.map((l) => (
            <option key={l.location_id} value={l.location_id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Creating account..." : "Sign up"}
      </button>
      {state?.error && <p style={{ color: "crimson" }}>{state.error}</p>}
    </form>
  )
}
