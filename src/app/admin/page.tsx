import { currentRole, logout } from "@/app/actions/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const role = await currentRole()

  if (role.role !== "employee") {
    redirect("/login")
  }

  return (
    <div style={{ padding: "3rem 2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>Admin Portal</h1>
      <p>
        You&rsquo;re logged in as Employee ID {role.employeeId}, Location{" "}
        {role.locationId}.
      </p>
      <p style={{ color: "#666" }}>
        Operations, staffing, and analytics dashboards arrive in Phases 5–7.
      </p>
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
    </div>
  )
}
