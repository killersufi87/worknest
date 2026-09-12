"use client"

import { useState, useEffect, useTransition } from "react"
import { getAvailability, type ResourceType } from "@/app/actions/booking"

type Location = { location_id: number; name: string }

const RESOURCE_TYPES: { value: ResourceType; label: string; icon: string }[] = [
  { value: "hot_desk", label: "Hot Desk", icon: "🪑" },
  { value: "dedicated_desk", label: "Dedicated Desk", icon: "💺" },
  { value: "cabin", label: "Private Cabin", icon: "🚪" },
  { value: "meeting_room", label: "Meeting Room", icon: "🧑‍🤝‍🧑" },
]

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]

export default function GridViewer({ locations }: { locations: Location[] }) {
  const [locationId, setLocationId] = useState<number | null>(locations[0]?.location_id ?? null)
  const [resourceType, setResourceType] = useState<ResourceType>("hot_desk")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [hour, setHour] = useState(9)
  const [availability, setAvailability] = useState<{ resourceIds: number[]; bookings: { resource_id: number; start_time: string; end_time: string }[] } | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      if (!locationId) {
        setAvailability(null)
        return
      }
      const result = await getAvailability(locationId, resourceType, date)
      setAvailability(result)
    })
  }, [locationId, resourceType, date])

  function isBooked(resourceId: number): boolean {
    if (!availability) return false
    const slotStart = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00+05:30`)
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000)
    return availability.bookings.some(
      (b) => b.resource_id === resourceId && new Date(b.start_time) < slotEnd && new Date(b.end_time) > slotStart
    )
  }

  const icon = RESOURCE_TYPES.find((rt) => rt.value === resourceType)?.icon ?? "🪑"
  const availableCount = availability ? availability.resourceIds.filter((id) => !isBooked(id)).length : 0

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
          <label className="mb-1 block text-xs text-muted">Resource Type</label>
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value as ResourceType)}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            {RESOURCE_TYPES.map((rt) => (
              <option key={rt.value} value={rt.value}>{rt.icon} {rt.label}</option>
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
        <div>
          <label className="mb-1 block text-xs text-muted">Time</label>
          <select
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>{h > 12 ? h - 12 : h}:00 {h >= 12 ? "PM" : "AM"}</option>
            ))}
          </select>
        </div>
      </div>

      {availability && (
        <>
          <p className="mb-3 text-sm text-muted">
            {availableCount} of {availability.resourceIds.length} available at this time
          </p>
          <div className="mb-3 flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[var(--status-confirmed-bg)] border border-[var(--status-confirmed-fg)]" /> Available</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[var(--status-booked-bg)] border border-[var(--status-booked-fg)]" /> Booked</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {availability.resourceIds.map((rid, idx) => {
              const booked = isBooked(rid)
              return (
                <div
                  key={rid}
                  title={`Seat ${idx + 1}${booked ? " — booked" : " — available"}`}
                  className={`flex h-16 w-16 flex-col items-center justify-center rounded-xl border-2 text-2xl ${
                    booked
                      ? "border-[var(--status-booked-fg)]/40 bg-[var(--status-booked-bg)]"
                      : "border-[var(--status-confirmed-fg)]/40 bg-[var(--status-confirmed-bg)]"
                  }`}
                >
                  {icon}
                  <span className="text-[10px] text-muted">{idx + 1}</span>
                </div>
              )
            })}
            {availability.resourceIds.length === 0 && (
              <p className="text-sm text-muted">No resources of this type at this location.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
