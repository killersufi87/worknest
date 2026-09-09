"use client"

import { useState, useEffect, useActionState, useTransition } from "react"
import { getAvailability, createBooking, type ResourceType } from "@/app/actions/booking"

type Location = { location_id: number; name: string; address: string | null }

const LOCATION_IMAGES: Record<string, string> = {
  Koramangala: "photo-1700163080760-12c275d3fe36",
  Indiranagar: "photo-1498049860654-af1a5c566876",
  HSR: "photo-1758518730083-4c12527b6742",
}

const RESOURCE_TYPES: { value: ResourceType; label: string; hourly: number }[] = [
  { value: "hot_desk", label: "Hot Desk", hourly: 150 },
  { value: "dedicated_desk", label: "Dedicated Desk", hourly: 300 },
  { value: "cabin", label: "Private Cabin", hourly: 600 },
  { value: "meeting_room", label: "Meeting Room", hourly: 500 },
]

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const DURATIONS = [1, 2, 4];

export default function BookingWizard({
  locations,
  remainingHours,
}: {
  locations: Location[]
  remainingHours: number
}) {
  const [locationId, setLocationId] = useState<number | null>(null)
  const [resourceType, setResourceType] = useState<ResourceType | null>(null)
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [duration, setDuration] = useState(1)
  const [startHour, setStartHour] = useState<number | null>(null)

  const [availability, setAvailability] = useState<{ totalResources: number; bookings: { start_time: string; end_time: string }[] } | null>(null)
  const [, startTransition] = useTransition()

  const [bookingState, bookingAction, bookingPending] = useActionState(createBooking, null)

  useEffect(() => {
    startTransition(async () => {
      if (!locationId || !resourceType || !date) {
        setAvailability(null)
        return
      }
      const result = await getAvailability(locationId, resourceType, date)
      setAvailability(result)
    })
  }, [locationId, resourceType, date])

  function isSlotAvailable(hour: number): boolean {
    if (!availability) return true
    const slotStart = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00+05:30`)
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 60 * 1000)
    const overlapping = availability.bookings.filter((b) => {
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      return slotStart < bEnd && slotEnd > bStart
    })
    return overlapping.length < availability.totalResources
  }

  if (bookingState && "success" in bookingState) {
    return (
      <div className="max-w-lg rounded-xl border border-border bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[--status-confirmed-bg] text-2xl text-[--status-confirmed-fg]">
          ✓
        </div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">Booking confirmed</h2>
        <p className="mb-6 text-sm text-muted">
          {bookingState.amount === 0
            ? "This booking used your free monthly hours."
            : `₹${bookingState.amount} will be added to your next invoice.`}
        </p>
        <a href="/portal" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Back to dashboard
        </a>
      </div>
    )
  }

  return (
    <form action={bookingAction} className="max-w-3xl space-y-10">
      <input type="hidden" name="location_id" value={locationId ?? ""} />
      <input type="hidden" name="resource_type" value={resourceType ?? ""} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="start_hour" value={startHour ?? ""} />
      <input type="hidden" name="duration_hours" value={duration} />

      {/* Step 1: Location */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-foreground">1. Select Location</h2>
        <div className="grid grid-cols-3 gap-4">
          {locations.map((loc) => (
            <button
              type="button"
              key={loc.location_id}
              onClick={() => setLocationId(loc.location_id)}
              className={`overflow-hidden rounded-xl border-2 bg-white text-left transition-colors ${
                locationId === loc.location_id ? "border-primary" : "border-border"
              }`}
            >
              <div className="h-28 w-full overflow-hidden">
                <img
                  src={`https://images.unsplash.com/${LOCATION_IMAGES[loc.name] ?? LOCATION_IMAGES.Koramangala}?w=500&q=80&auto=format&fit=crop`}
                  alt={loc.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="font-medium text-foreground">{loc.name}</p>
                <p className="text-xs text-muted">{loc.address}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Resource type */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-foreground">2. Select Resource Type</h2>
        <div className="grid grid-cols-4 gap-4">
          {RESOURCE_TYPES.map((rt) => (
            <button
              type="button"
              key={rt.value}
              onClick={() => setResourceType(rt.value)}
              className={`rounded-xl border-2 bg-white p-4 text-left transition-colors ${
                resourceType === rt.value ? "border-primary" : "border-border"
              }`}
            >
              <p className="font-medium text-foreground">{rt.label}</p>
              <p className="text-xs text-muted">From ₹{rt.hourly}/hr</p>
            </button>
          ))}
        </div>
        {resourceType === "meeting_room" && remainingHours > 0 && (
          <p className="mt-2 text-xs text-[--status-confirmed-fg]">
            You have {remainingHours} free hours remaining this month.
          </p>
        )}
      </div>

      {/* Step 3: Date & time */}
      {locationId && resourceType && (
        <div>
          <h2 className="mb-4 text-sm font-semibold text-foreground">3. Pick a Date &amp; Time</h2>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{d} hour{d > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {HOURS.map((h) => {
              const available = isSlotAvailable(h)
              return (
                <button
                  type="button"
                  key={h}
                  disabled={!available}
                  onClick={() => setStartHour(h)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    startHour === h
                      ? "border-primary bg-primary text-white"
                      : available
                      ? "border-border bg-white text-foreground hover:border-primary"
                      : "cursor-not-allowed border-border bg-black/5 text-muted line-through"
                  }`}
                >
                  {h > 12 ? h - 12 : h}:00 {h >= 12 ? "PM" : "AM"}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {startHour && (
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="mb-4 text-sm text-foreground">
            ✓ Looks good! This slot is available and meets the minimum booking duration.
          </p>
          <button
            type="submit"
            disabled={bookingPending}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {bookingPending ? "Confirming…" : "Confirm Booking →"}
          </button>
          {bookingState?.error && <p className="mt-3 text-sm text-red-600">{bookingState.error}</p>}
        </div>
      )}
    </form>
  )
}
