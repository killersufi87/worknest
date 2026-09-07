"use client"

import { useActionState } from "react"
import Link from "next/link"
import { loginMember, loginEmployee } from "@/app/actions/auth"

export default function LoginForms() {
  const [memberState, memberAction, memberPending] = useActionState(
    loginMember,
    null
  )
  const [employeeState, employeeAction, employeePending] = useActionState(
    loginEmployee,
    null
  )

  return (
    <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
      <section>
        <h2>Member Login</h2>
        <form action={memberAction} style={{ display: "grid", gap: "0.5rem", maxWidth: 280 }}>
          <label>
            Member ID
            <input name="member_id" type="text" required />
          </label>
          <label>
            Password
            <input name="password" type="password" required />
          </label>
          <button type="submit" disabled={memberPending}>
            {memberPending ? "Logging in..." : "Log in"}
          </button>
          {memberState?.error && (
            <p style={{ color: "crimson" }}>{memberState.error}</p>
          )}
        </form>
        <p>
          No account? <Link href="/signup">Sign up</Link>
        </p>
      </section>

      <section>
        <h2>Employee Login</h2>
        <form action={employeeAction} style={{ display: "grid", gap: "0.5rem", maxWidth: 280 }}>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" required />
          </label>
          <button type="submit" disabled={employeePending}>
            {employeePending ? "Logging in..." : "Log in"}
          </button>
          {employeeState?.error && (
            <p style={{ color: "crimson" }}>{employeeState.error}</p>
          )}
        </form>
      </section>
    </div>
  )
}
