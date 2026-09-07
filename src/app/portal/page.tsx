import { currentRole, logout } from "@/app/actions/auth"
import { redirect } from "next/navigation"

export default async function PortalPage() {
  const role = await currentRole()

  if (role.role !== "member") {
    redirect("/login")
  }

  return (
    <div style={{ padding: "3rem 2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>Member Portal</h1>
      <p>You&rsquo;re logged in as Member ID {role.memberId}.</p>
      <p style={{ color: "#666" }}>
        Booking, billing, and cancellation features arrive in Phases 3–4.
      </p>
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
    </div>
  )
}
