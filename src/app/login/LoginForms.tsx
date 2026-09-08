"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { loginMember, loginEmployee } from "@/app/actions/auth"

export default function LoginForms() {
  const [tab, setTab] = useState<"member" | "employee">("member")
  const [memberState, memberAction, memberPending] = useActionState(loginMember, null)
  const [employeeState, employeeAction, employeePending] = useActionState(loginEmployee, null)

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex gap-6 border-b border-border">
        <button
          onClick={() => setTab("member")}
          className={`pb-3 text-sm font-medium transition-colors ${
            tab === "member" ? "border-b-2 border-primary text-foreground" : "text-muted"
          }`}
        >
          Member
        </button>
        <button
          onClick={() => setTab("employee")}
          className={`pb-3 text-sm font-medium transition-colors ${
            tab === "employee" ? "border-b-2 border-primary text-foreground" : "text-muted"
          }`}
        >
          Employee
        </button>
      </div>

      {tab === "member" ? (
        <form action={memberAction} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Member ID</label>
            <input
              name="member_id"
              type="text"
              required
              placeholder="e.g. 1024"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={memberPending}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {memberPending ? "Logging in…" : "Log in"}
          </button>
          {memberState?.error && <p className="text-sm text-red-600">{memberState.error}</p>}
        </form>
      ) : (
        <form action={employeeAction} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input
              name="email"
              type="email"
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
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={employeePending}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {employeePending ? "Logging in…" : "Log in"}
          </button>
          {employeeState?.error && <p className="text-sm text-red-600">{employeeState.error}</p>}
        </form>
      )}

      {tab === "member" && (
        <p className="mt-6 text-sm text-muted">
          No account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      )}
    </div>
  )
}
