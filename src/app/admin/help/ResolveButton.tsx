"use client"

import { useActionState } from "react"
import { resolveHelpQuery } from "@/app/actions/help"

export default function ResolveButton({ queryId }: { queryId: number }) {
  const [state, formAction, pending] = useActionState(resolveHelpQuery, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="query_id" value={queryId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Marking resolved…" : "Mark as resolved"}
      </button>
      {state && "error" in state && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </form>
  )
}
