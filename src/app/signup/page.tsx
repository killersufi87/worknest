import { createClient } from "@/lib/supabase/server"
import SignupForm from "./SignupForm"

export default async function SignupPage() {
  const supabase = await createClient()

  const [{ data: tiers }, { data: locations }] = await Promise.all([
    supabase.from("membership_tiers").select("tier_id, tier_name").order("tier_id"),
    supabase.from("locations").select("location_id, name").order("location_id"),
  ])

  return (
    <div style={{ padding: "3rem 2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>Sign up for WorkNest</h1>
      <SignupForm tiers={tiers ?? []} locations={locations ?? []} />
    </div>
  )
}
