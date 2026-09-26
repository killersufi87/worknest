"use client"

import { useActionState } from "react"
import {
  createMembershipTier,
  setMembershipTierActive,
  updateMembershipTier,
  type MembershipTierState,
} from "@/app/actions/membership-tiers"

export type MembershipTier = {
  tier_id: number
  tier_name: string
  monthly_rate: number
  cancellation_refund_pct: number
  notice_window_hours: number
  free_conference_hours_allowance: number
  is_active: boolean
}

function TierCard({ tier }: { tier: MembershipTier }) {
  const [saveState, saveAction, saving] = useActionState<MembershipTierState, FormData>(updateMembershipTier, null)
  const [activeState, activeAction, changingActive] = useActionState<MembershipTierState, FormData>(setMembershipTierActive, null)

  return (
    <article className={`rounded-2xl border bg-white p-5 shadow-sm ${tier.is_active ? "border-border" : "border-dashed border-border opacity-75"}`}>
      <form action={saveAction}>
        <input type="hidden" name="tier_id" value={tier.tier_id} />
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Plan #{tier.tier_id}</p>
            <h2 className="text-xl font-semibold text-foreground">{tier.tier_name}</h2>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tier.is_active ? "bg-[var(--status-confirmed-bg)] text-[var(--status-confirmed-fg)]" : "bg-[var(--status-booked-bg)] text-[var(--status-booked-fg)]"}`}>
            {tier.is_active ? "Available for signup" : "Inactive"}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-muted">Plan name
            <input name="tier_name" defaultValue={tier.tier_name} required maxLength={40} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-muted">Monthly plan price (₹)
            <input name="monthly_rate" type="number" min="0" step="0.01" defaultValue={tier.monthly_rate} required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-muted">Cancellation refund (%)
            <input name="cancellation_refund_pct" type="number" min="0" max="100" step="0.01" defaultValue={tier.cancellation_refund_pct} required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-muted">Cancellation notice (hours)
            <input name="notice_window_hours" type="number" min="0" step="1" defaultValue={tier.notice_window_hours} required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-muted sm:col-span-2">Free meeting-room hours per month
            <input name="free_conference_hours_allowance" type="number" min="0" step="0.5" defaultValue={tier.free_conference_hours_allowance} required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
            <span className="mt-1 block text-[11px] text-muted">Used when a new member signs up; existing members keep their current remaining balance.</span>
          </label>
        </div>

        <button type="submit" disabled={saving} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {saving ? "Saving…" : "Save plan rules"}
        </button>
        {saveState && "error" in saveState && <p className="mt-3 text-sm text-red-600">{saveState.error}</p>}
        {saveState && "success" in saveState && <p className="mt-3 text-sm text-[var(--status-confirmed-fg)]">Plan rules saved.</p>}
      </form>

      <form action={activeAction} className="mt-3 border-t border-border pt-3">
        <input type="hidden" name="tier_id" value={tier.tier_id} />
        <input type="hidden" name="is_active" value={String(!tier.is_active)} />
        <button type="submit" disabled={changingActive} className="text-xs font-medium text-primary hover:underline disabled:opacity-60">
          {changingActive ? "Updating…" : tier.is_active ? "Remove from new signups" : "Restore for new signups"}
        </button>
        {activeState && "error" in activeState && <p className="mt-2 text-xs text-red-600">{activeState.error}</p>}
        {activeState && "success" in activeState && <p className="mt-2 text-xs text-[var(--status-confirmed-fg)]">Signup availability updated.</p>}
      </form>
    </article>
  )
}

export default function MembershipManager({ tiers }: { tiers: MembershipTier[] }) {
  const [state, action, pending] = useActionState<MembershipTierState, FormData>(createMembershipTier, null)

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Current membership plans</h2>
          <p className="mt-1 text-sm text-muted">Edit prices, cancellation rules, and free meeting-room hours. Resource booking minimums remain managed separately under Manage Resources.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {tiers.map((tier) => <TierCard key={tier.tier_id} tier={tier} />)}
          {tiers.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted">No membership plans are configured.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Add a membership plan</h2>
        <p className="mb-4 text-sm text-muted">New plans are available to members on the signup page after creation.</p>
        <form action={action}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="text-xs text-muted">Plan name
              <input name="tier_name" required maxLength={40} placeholder="e.g. Emerald" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
            </label>
            <label className="text-xs text-muted">Monthly price (₹)
              <input name="monthly_rate" type="number" min="0" step="0.01" defaultValue={0} required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
            </label>
            <label className="text-xs text-muted">Refund (%)
              <input name="cancellation_refund_pct" type="number" min="0" max="100" step="0.01" defaultValue={0} required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
            </label>
            <label className="text-xs text-muted">Notice (hours)
              <input name="notice_window_hours" type="number" min="0" step="1" defaultValue={0} required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
            </label>
            <label className="text-xs text-muted">Free meeting-room hours/month
              <input name="free_conference_hours_allowance" type="number" min="0" step="0.5" defaultValue={0} required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
            </label>
          </div>
          <button type="submit" disabled={pending} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {pending ? "Creating…" : "Add plan"}
          </button>
          {state && "error" in state && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
          {state && "success" in state && <p className="mt-3 text-sm text-[var(--status-confirmed-fg)]">Membership plan created.</p>}
        </form>
      </section>
    </div>
  )
}
