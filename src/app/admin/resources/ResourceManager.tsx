"use client"

import { useState, useActionState } from "react"
import { addResource, removeResource, updateMinDuration, updatePricing } from "@/app/actions/resources"

type Resource = {
  resource_id: number
  resource_type: string
  capacity_tier: string | null
  min_booking_duration_minutes: number
  active: boolean
  hourly_price: number | null
  monthly_price: number | null
}

function ResourceRow({ resource, locationName }: { resource: Resource; locationName: string }) {
  const [minDuration, setMinDuration] = useState(resource.min_booking_duration_minutes)
  const [hourly, setHourly] = useState(resource.hourly_price ?? 0)
  const [monthly, setMonthly] = useState(resource.monthly_price ?? 0)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    await updateMinDuration(resource.resource_id, minDuration)
    await updatePricing(resource.resource_id, hourly, monthly || null)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-muted">{locationName}</td>
      <td className="px-4 py-3 font-medium capitalize text-foreground">
        {resource.resource_type.replace("_", " ")}
      </td>
      <td className="px-4 py-3 text-muted">{resource.capacity_tier ?? "—"}</td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={minDuration}
          onChange={(e) => setMinDuration(Number(e.target.value))}
          className="w-20 rounded border border-border px-2 py-1 text-sm"
        />
        <span className="ml-1 text-xs text-muted">min</span>
      </td>
      <td className="px-4 py-3">
        ₹<input
          type="number"
          value={hourly}
          onChange={(e) => setHourly(Number(e.target.value))}
          className="w-20 rounded border border-border px-2 py-1 text-sm"
        />/hr
      </td>
      <td className="px-4 py-3">
        ₹<input
          type="number"
          value={monthly}
          onChange={(e) => setMonthly(Number(e.target.value))}
          className="w-24 rounded border border-border px-2 py-1 text-sm"
        />/mo
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={handleSave}
          className="mr-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
        <button
          onClick={() => removeResource(resource.resource_id)}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Remove
        </button>
      </td>
    </tr>
  )
}

export default function ResourceManager({ resources, locationName }: { resources: Resource[]; locationName: string }) {
  const [addState, addAction, addPending] = useActionState(addResource, null)

  return (
    <div className="space-y-10">
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-black/[0.02] text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Min. Duration</th>
              <th className="px-4 py-3">Hourly</th>
              <th className="px-4 py-3">Monthly</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <ResourceRow key={r.resource_id} resource={r} locationName={locationName} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Add a new resource</h3>
        <form action={addAction} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs text-muted">Type</label>
            <select name="resource_type" required className="rounded-lg border border-border px-3 py-2 text-sm">
              <option value="hot_desk">Hot Desk</option>
              <option value="dedicated_desk">Dedicated Desk</option>
              <option value="cabin">Cabin</option>
              <option value="meeting_room">Meeting Room</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Capacity</label>
            <input name="capacity_tier" placeholder="e.g. 4-seat" className="w-28 rounded-lg border border-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Min. duration (min)</label>
            <input name="min_booking_duration_minutes" type="number" defaultValue={30} className="w-24 rounded-lg border border-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Hourly ₹</label>
            <input name="hourly_price" type="number" className="w-24 rounded-lg border border-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Monthly ₹ (optional)</label>
            <input name="monthly_price" type="number" className="w-28 rounded-lg border border-border px-3 py-2 text-sm" />
          </div>
          <button
            type="submit"
            disabled={addPending}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {addPending ? "Adding…" : "Add resource"}
          </button>
        </form>
        {addState && "error" in addState && <p className="mt-3 text-sm text-red-600">{addState.error}</p>}
      </div>
    </div>
  )
}
