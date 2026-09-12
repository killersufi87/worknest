"use client"

import { useTransition } from "react"
import { resolveHelpQuery } from "@/app/actions/help"

export default function ResolveButton({ queryId }: { queryId: number }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => resolveHelpQuery(queryId))}
      disabled={pending}
      className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Marking resolved…" : "Mark as resolved"}
    </button>
  )
}
