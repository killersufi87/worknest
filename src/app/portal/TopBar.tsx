"use client"

import { useState, useRef, useEffect } from "react"
import { updateMemberLocation } from "@/app/actions/auth"

type Location = { location_id: number; name: string }
type Activity = { id: string; text: string; time: string }

function useClickOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])
  return ref
}

export default function TopBar({
  locationName,
  locations,
  firstName,
  activity,
}: {
  locationName: string
  locations: Location[]
  firstName: string
  activity: Activity[]
}) {
  const [locationOpen, setLocationOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const locationRef = useClickOutside(() => setLocationOpen(false))
  const bellRef = useClickOutside(() => setBellOpen(false))
  const profileRef = useClickOutside(() => setProfileOpen(false))

  async function handleLocationChange(id: number) {
    setPending(true)
    await updateMemberLocation(id)
    setPending(false)
    setLocationOpen(false)
  }

  return (
    <div className="flex items-center justify-between border-b border-border px-10 py-4">
      <input
        type="text"
        placeholder="Search spaces, locations…"
        className="w-72 rounded-lg border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary"
      />

      <div className="flex items-center gap-4">
        {/* Location switcher */}
        <div className="relative" ref={locationRef}>
          <button
            onClick={() => setLocationOpen((v) => !v)}
            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-black/5"
          >
            📍 {locationName} {pending ? "…" : "▾"}
          </button>
          {locationOpen && (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-border bg-white py-1 shadow-lg">
              {locations.map((loc) => (
                <button
                  key={loc.location_id}
                  onClick={() => handleLocationChange(loc.location_id)}
                  className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-black/5"
                >
                  {loc.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <div className="relative" ref={bellRef}>
          <button onClick={() => setBellOpen((v) => !v)} className="relative text-lg">
            🔔
            {activity.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {activity.length}
              </span>
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-border bg-white py-2 shadow-lg">
              <p className="border-b border-border px-4 pb-2 text-xs font-semibold uppercase text-muted">
                Recent activity
              </p>
              {activity.length > 0 ? (
                activity.map((a) => (
                  <div key={a.id} className="px-4 py-2 text-sm">
                    <p className="text-foreground">{a.text}</p>
                    <p className="text-xs text-muted">{a.time}</p>
                  </div>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-muted">No recent activity.</p>
              )}
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
          >
            {firstName.charAt(0).toUpperCase()}
          </button>
          {profileOpen && (
            <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-border bg-white py-1 shadow-lg">
              <a href="/portal/bookings" className="block px-4 py-2 text-sm text-foreground hover:bg-black/5">My Bookings</a>
              <a href="/portal/billing" className="block px-4 py-2 text-sm text-foreground hover:bg-black/5">Billing</a>
              <a href="/portal/help" className="block px-4 py-2 text-sm text-foreground hover:bg-black/5">Help</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
