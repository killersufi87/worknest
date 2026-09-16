"use client"

import { useActionState, useState } from "react"
import { cancelBooking, getCancellationPreview, type CancellationPreview } from "@/app/actions/cancellation"

type Booking = {
  booking_id: number
  start_time: string
  end_time: string
  status: string
  amount: number | null
  resource_type: string
  location_name: string
}

function formatBookingTime(value: string) {
  const date = new Date(value)
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`
}

function CancelButton({ bookingId }: { bookingId: number }) {
  const [state, formAction, pending] = useActionState(cancelBooking, null)
  const [preview, setPreview] = useState<CancellationPreview | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  async function reviewCancellation() {
    setLoadingPreview(true)
    const result = await getCancellationPreview(bookingId)
    setPreview(result)
    setLoadingPreview(false)
  }

  if (state && "success" in state) {
    return (
      <span className="text-xs text-[var(--status-confirmed-fg)]">
        Cancelled · {state.refundPct}% refunded
      </span>
    )
  }

  if (!preview) {
    return (
      <div>
        <button
          type="button"
          onClick={reviewCancellation}
          disabled={loadingPreview}
          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          {loadingPreview ? "Checking…" : "Cancel"}
        </button>
        {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      </div>
    )
  }

  if ("error" in preview) {
    return <p className="text-xs text-red-600">{preview.error}</p>
  }

  return (
    <div className="max-w-xs text-right">
      <p className="mb-2 text-xs text-muted">
        {preview.refundPct}% refund · ₹{preview.refundAmount.toFixed(2)}
        {preview.noticeWindowHours > 0 && ` · ${preview.noticeWindowHours}h notice window`}
      </p>
      <form action={formAction} className="flex justify-end gap-2">
        <input type="hidden" name="booking_id" value={bookingId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {pending ? "Cancelling…" : "Confirm cancellation"}
        </button>
      </form>
      {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-[var(--status-confirmed-bg)] text-[var(--status-confirmed-fg)]",
  cancelled: "bg-[var(--status-booked-bg)] text-[var(--status-booked-fg)]",
  completed: "bg-[var(--status-upcoming-bg)] text-[var(--status-upcoming-fg)]",
}

export default function BookingsList({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white/60 px-5 py-10 text-center text-sm text-muted">
        No bookings yet. <a href="/portal/book" className="text-primary hover:underline">Book a resource →</a>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div
          key={b.booking_id}
          className="flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4"
        >
          <div>
            <p className="font-medium capitalize text-foreground">{b.resource_type.replace("_", " ")}</p>
            <p className="text-sm text-muted">
              {formatBookingTime(b.start_time)} · {b.location_name} · ₹{(b.amount ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[b.status] ?? ""}`}>
              {b.status}
            </span>
            {b.status === "confirmed" && new Date(b.start_time) > new Date() && (
              <CancelButton bookingId={b.booking_id} />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
