"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function LocationFilter({
  locations,
}: {
  locations: { location_id: number; name: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/admin/analytics${params.toString() ? `?${params.toString()}` : ""}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select
        defaultValue={searchParams.get("location") ?? ""}
        onChange={(e) => updateFilter("location", e.target.value)}
        className="rounded-lg border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary"
      >
        <option value="">All locations</option>
        {locations.map((loc) => <option key={loc.location_id} value={loc.location_id}>{loc.name}</option>)}
      </select>
      <select
        defaultValue={searchParams.get("resource") ?? ""}
        onChange={(e) => updateFilter("resource", e.target.value)}
        className="rounded-lg border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary"
      >
        <option value="">All resource types</option>
        <option value="hot_desk">Hot Desk</option>
        <option value="dedicated_desk">Dedicated Desk</option>
        <option value="cabin">Private Cabin</option>
        <option value="meeting_room">Meeting Room</option>
      </select>
      <input
        type="date"
        defaultValue={searchParams.get("from") ?? ""}
        onChange={(e) => updateFilter("from", e.target.value)}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        aria-label="Analytics start date"
      />
      <input
        type="date"
        defaultValue={searchParams.get("to") ?? ""}
        onChange={(e) => updateFilter("to", e.target.value)}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
        aria-label="Analytics end date"
      />
    </div>
  )
}
