"use client"

import { useActionState } from "react"
import {
  createEmployee,
  deleteEmployee,
  updateEmployeeCertification,
  type EmployeeState,
} from "@/app/actions/employees"

type Location = { location_id: number; name: string }
type Employee = {
  employee_id: number
  name: string
  email: string | null
  role: string
  location_id: number
  certification_status: string
  is_active: boolean
}

const CERTIFICATION_LABELS: Record<string, string> = {
  not_certified: "Not certified",
  training: "Training in progress",
  certified: "Certified",
}

function CertificationEditor({ employee }: { employee: Employee }) {
  const [state, action, pending] = useActionState<EmployeeState, FormData>(updateEmployeeCertification, null)
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="employee_id" value={employee.employee_id} />
      <select
        name="certification_status"
        defaultValue={employee.certification_status}
        className="rounded-lg border border-border px-2 py-1.5 text-xs"
        aria-label={`Certification status for ${employee.name}`}
      >
        <option value="not_certified">Not certified</option>
        <option value="training">Training in progress</option>
        <option value="certified">Certified</option>
      </select>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60">
        {pending ? "Saving…" : "Save"}
      </button>
      {state && "error" in state && <span className="w-full text-xs text-red-600">{state.error}</span>}
      {state && "success" in state && <span className="w-full text-xs text-[var(--status-confirmed-fg)]">Status updated.</span>}
    </form>
  )
}

function RemoveEmployeeButton({ employee }: { employee: Employee }) {
  const [state, action, pending] = useActionState<EmployeeState, FormData>(deleteEmployee, null)
  return (
    <form action={action} onSubmit={(event) => {
      if (!window.confirm(`Remove ${employee.name} and disable their login? Their past shift records will be retained.`)) event.preventDefault()
    }}>
      <input type="hidden" name="employee_id" value={employee.employee_id} />
      <button type="submit" disabled={pending} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60">
        {pending ? "Removing…" : "Remove"}
      </button>
      {state && "error" in state && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
      {state && "success" in state && <p className="mt-2 text-xs text-[var(--status-confirmed-fg)]">Employee removed.</p>}
    </form>
  )
}

export default function EmployeeManager({
  employees,
  locations,
}: {
  employees: Employee[]
  locations: Location[]
}) {
  const [state, action, pending] = useActionState<EmployeeState, FormData>(createEmployee, null)
  const locationNames = new Map(locations.map((location) => [location.location_id, location.name]))

  return (
    <section className="mb-10 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Manage employees</h2>
        <p className="mt-1 text-sm text-muted">Add staff accounts, update training status, or remove access while preserving shift history.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border bg-black/[0.02] text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Role / location</th>
                <th className="px-4 py-3">Certification status</th>
                <th className="px-4 py-3">Access</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.employee_id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{employee.name}</p>
                    <p className="text-xs text-muted">{employee.email ?? `Employee #${employee.employee_id}`}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted">
                    {employee.role.replace("_", " ")} · {locationNames.get(employee.location_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {employee.is_active ? (
                      <CertificationEditor employee={employee} />
                    ) : (
                      <span className="text-xs text-muted">{CERTIFICATION_LABELS[employee.certification_status] ?? "Not certified"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${employee.is_active ? "bg-[var(--status-confirmed-bg)] text-[var(--status-confirmed-fg)]" : "bg-[var(--status-booked-bg)] text-[var(--status-booked-fg)]"}`}>
                      {employee.is_active ? "Active" : "Removed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {employee.is_active && employee.role !== "admin" && <RemoveEmployeeButton employee={employee} />}
                  </td>
                </tr>
              ))}
              {employees.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No employee records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <form action={action} className="rounded-xl border border-border bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Add an employee</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs text-muted">Full name
            <input name="name" required maxLength={100} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-muted">Work email
            <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-muted">Initial password
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-muted">Role
            <select name="role" required defaultValue="front_desk" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
              <option value="front_desk">Front desk</option>
              <option value="manager">Floor manager</option>
            </select>
          </label>
          <label className="text-xs text-muted">Location
            <select name="location_id" required defaultValue="" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
              <option value="" disabled>Select location</option>
              {locations.map((location) => <option key={location.location_id} value={location.location_id}>{location.name}</option>)}
            </select>
          </label>
        </div>
        <button type="submit" disabled={pending} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {pending ? "Creating…" : "Create employee"}
        </button>
        {state && "error" in state && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
        {state && "success" in state && <p className="mt-3 text-sm text-[var(--status-confirmed-fg)]">Employee account created with ID #{state.employeeId}.</p>}
      </form>
    </section>
  )
}
