"use client"

import { useState, useEffect, useTransition } from "react"
import { getAvailability, getUpcomingBookings, type ResourceType } from "@/app/actions/booking"

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
  const [upcomingBookings, setUpcomingBookings] = useState<Awaited<ReturnType<typeof getUpcomingBookings>>>([])
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => setUpcomingBookings(await getUpcomingBookings()))
    const timer = window.setInterval(() => {
      if (!locationId) return
      startTransition(async () => {
        setAvailability(await getAvailability(locationId, resourceType, date))
        setUpcomingBookings(await getUpcomingBookings())
      })
    }, 10000)
    return () => window.clearInterval(timer)
  }, [locationId, resourceType, date])

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
        <button
          type="button"
          onClick={() => {
            if (!locationId) return
            startTransition(async () => {
              setAvailability(await getAvailability(locationId, resourceType, date))
              setUpcomingBookings(await getUpcomingBookings())
            })
          }}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm hover:border-primary"
        >
          Refresh grid
        </button>
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
            {availability.resourceIds.map((rid) => {
              const booked = isBooked(rid)
              return (
                <div
                  key={rid}
                  title={`Resource #${rid}${booked ? " — booked" : " — available"}`}
                  className={`flex h-16 w-16 flex-col items-center justify-center rounded-xl border-2 text-2xl ${
                    booked
                      ? "border-[var(--status-booked-fg)]/40 bg-[var(--status-booked-bg)]"
                      : "border-[var(--status-confirmed-fg)]/40 bg-[var(--status-confirmed-bg)]"
                  }`}
                >
                  {icon}
                  <span className="text-[10px] text-muted">#{rid}</span>
                </div>
              )
            })}
            {availability.resourceIds.length === 0 && (
              <p className="text-sm text-muted">No resources of this type at this location.</p>
            )}
          </div>
        </>
      )}
      <div className="mt-8 rounded-2xl border border-[#B8CDB5]/60 bg-[#E4EFE7]/75 p-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary">Upcoming bookings</h3>
            <p className="text-xs text-muted">Live view · refreshes every 10 seconds</p>
          </div>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-primary">{upcomingBookings.length} shown</span>
        </div>
        {upcomingBookings.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {upcomingBookings.map((booking) => (
              <div key={booking.bookingId} className="rounded-xl border border-white/80 bg-white/70 p-4 text-sm shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Booking #{booking.bookingId}</span>
                  <span className="rounded-full bg-[#DCE8DC] px-2 py-1 text-[11px] font-medium text-primary">Confirmed</span>
                </div>
                <div className="mt-2 grid gap-1 text-xs text-muted sm:grid-cols-2">
                  <span>Member ID: <strong className="text-foreground">#{booking.memberId}</strong></span>
                  <span>Resource: <strong className="text-foreground">#{booking.resourceId}</strong></span>
                  <span className="capitalize">{booking.resourceType.replace("_", " ")}</span>
                  <span>{booking.locationName}</span>
                  <span className="sm:col-span-2">{formatIST(booking.startTime)} – {formatIST(booking.endTime)} IST</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-white/60 p-4 text-sm text-muted">No upcoming confirmed bookings.</p>
        )}
      </div>
    </div>
  )
}

function formatIST(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}
