"use client"

import { useActionState } from "react"
import { cancelBooking } from "@/app/actions/cancellation"

type Booking = {
  booking_id: number
  start_time: string
  end_time: string
  status: string
  amount: number | null
  resource_type: string
}

function CancelButton({ bookingId }: { bookingId: number }) {
  const [state, formAction, pending] = useActionState(cancelBooking, null)

  if (state && "success" in state) {
    return (
      <span className="text-xs text-[--status-confirmed-fg]">
        Cancelled · {state.refundPct}% refunded
      </span>
    )
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="booking_id" value={bookingId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "Cancelling…" : "Cancel"}
      </button>
      {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </form>
  )
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-[--status-confirmed-bg] text-[--status-confirmed-fg]",
  cancelled: "bg-[--status-booked-bg] text-[--status-booked-fg]",
  completed: "bg-[--status-upcoming-bg] text-[--status-upcoming-fg]",
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
              {new Date(b.start_time).toLocaleString()} · ₹{b.amount ?? 0}
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
