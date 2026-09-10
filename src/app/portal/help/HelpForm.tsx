"use client"

import { useActionState, useRef } from "react"
import { submitHelpQuery } from "@/app/actions/help"

export default function HelpForm() {
  const [state, formAction, pending] = useActionState(submitHelpQuery, null)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData)
        formRef.current?.reset()
      }}
      className="max-w-lg space-y-3"
    >
      <textarea
        name="message"
        required
        rows={4}
        placeholder="Describe your issue or question…"
        className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit query"}
      </button>
      {state && "error" in state && <p className="text-sm text-red-600">{state.error}</p>}
      {state && "success" in state && <p className="text-sm text-[--status-confirmed-fg]">Query submitted!</p>}
    </form>
  )
}
