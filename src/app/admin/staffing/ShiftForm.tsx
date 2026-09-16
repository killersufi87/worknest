"use client"

import { useActionState } from "react"
import { createStaffShift } from "@/app/actions/staffing"

type Location = { location_id: number; name: string }
type Staff = { employee_id: number; name: string; role: string; location_id: number }

export default function ShiftForm({ locations, staff }: { locations: Location[]; staff: Staff[] }) {
  const [state, action, pending] = useActionState(createStaffShift, null)

  return (
    <form action={action} className="mb-8 rounded-xl border border-border bg-white p-5">
      <div className="grid gap-4 md:grid-cols-4">
        <label className="text-xs text-muted">
          Staff
          <select name="employee_id" required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
            <option value="">Select staff</option>
            {staff.map((person) => <option key={person.employee_id} value={person.employee_id}>{person.name}</option>)}
          </select>
        </label>
        <label className="text-xs text-muted">
          Location
          <select name="location_id" required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
            <option value="">Select location</option>
            {locations.map((location) => <option key={location.location_id} value={location.location_id}>{location.name}</option>)}
          </select>
        </label>
        <label className="text-xs text-muted">
          Date
          <input name="shift_date" type="date" required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </label>
        <label className="text-xs text-muted">
          Certification
          <input name="certification" placeholder="Process certified" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </label>
      </div>
      <button type="submit" disabled={pending} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {pending ? "Saving…" : "Create shift"}
      </button>
      {state && "error" in state && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      {state && "success" in state && <p className="mt-2 text-sm text-[var(--status-confirmed-fg)]">Shift saved.</p>}
    </form>
  )
}
