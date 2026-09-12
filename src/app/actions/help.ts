"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type HelpState = { error: string } | { success: true } | null

export async function submitHelpQuery(
  _prev: HelpState,
  formData: FormData
): Promise<HelpState> {
  const message = String(formData.get("message") ?? "").trim()
  if (!message) return { error: "Please enter a message." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "You're not logged in." }

  const { data: member } = await supabase
    .from("members")
    .select("member_id")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (!member) return { error: "Member record not found." }

  const { error } = await supabase.from("help_queries").insert({
    member_id: member.member_id,
    message_text: message,
  })
  if (error) return { error: error.message }

  revalidatePath("/portal/help")
  revalidatePath("/admin/help")
  return { success: true }
}

export async function resolveHelpQuery(queryId: number) {
  const supabase = await createClient()
  await supabase.from("help_queries").update({ status: "resolved" }).eq("query_id", queryId)
  revalidatePath("/admin/help")
}
