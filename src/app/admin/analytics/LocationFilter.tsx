"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function LocationFilter({
  locations,
}: {
  locations: { location_id: number; name: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <select
      defaultValue={searchParams.get("location") ?? ""}
      onChange={(e) => {
        const value = e.target.value
        router.push(value ? `/admin/analytics?location=${value}` : "/admin/analytics")
      }}
      className="rounded-lg border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary"
    >
      <option value="">All locations</option>
      {locations.map((loc) => (
        <option key={loc.location_id} value={loc.location_id}>{loc.name}</option>
      ))}
    </select>
  )
}
