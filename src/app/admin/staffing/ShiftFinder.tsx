"use client"

import { useState, useEffect, useTransition } from "react"
import { getShiftsForDate } from "@/app/actions/staffing"

type Location = { location_id: number; name: string }
type Shift = { shift_id: number; certification: string | null; name: string; role: string }

const ROLE_LABELS: Record<string, string> = {
  manager: "Floor Manager",
  front_desk: "Front Desk",
}

export default function ShiftFinder({ locations }: { locations: Location[] }) {
  const [locationId, setLocationId] = useState<number | null>(locations[0]?.location_id ?? null)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [shifts, setShifts] = useState<Shift[]>([])
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      if (!locationId) {
        setShifts([])
        return
      }
      const result = await getShiftsForDate(locationId, date)
      setShifts(result)
    })
  }, [locationId, date])

  const certifiedCount = shifts.filter((s) => s.certification).length
  const noCoverage = shifts.length > 0 && certifiedCount === 0

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs text-muted">Location</label>
          <select
            value={locationId ?? ""}
            onChange={(e) => setLocationId(Number(e.target.value))}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            {locations.map((loc) => (
              <option key={loc.location_id} value={loc.location_id}>{loc.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      {noCoverage && (
        <div className="mb-6 rounded-xl border border-[--status-booked-fg]/30 bg-[--status-booked-bg] px-5 py-4">
          <p className="text-sm font-semibold text-[--status-booked-fg]">
            ⚠ No process-certified staff working this location on this date.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-black/[0.02] text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-5 py-3">Staff</th>
              <th className="px-5 py-3">Designation</th>
              <th className="px-5 py-3">Process Certified</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((s) => (
              <tr key={s.shift_id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 text-foreground">{s.name}</td>
                <td className="px-5 py-3 text-muted">{ROLE_LABELS[s.role] ?? s.role}</td>
                <td className="px-5 py-3">
                  {s.certification ? (
                    <span className="rounded-full bg-[--status-confirmed-bg] px-2.5 py-1 text-xs font-medium text-[--status-confirmed-fg]">Yes</span>
                  ) : (
                    <span className="rounded-full bg-[--status-booked-bg] px-2.5 py-1 text-xs font-medium text-[--status-booked-fg]">No</span>
                  )}
                </td>
              </tr>
            ))}
            {shifts.length === 0 && (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-muted">No shifts scheduled for this date.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
