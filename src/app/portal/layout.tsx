import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import LocationThemeProvider from "./LocationThemeProvider"

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let defaultLocationName: string | null = null
  let memberId: number | null = null

  if (user) {
    const { data: member, error } = await supabase
      .from("members")
      .select("member_id, locations(name)")
      .eq("auth_user_id", user.id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    const memberLocation = Array.isArray(member?.locations) ? member.locations[0] : member?.locations
    memberId = member?.member_id ?? null
    defaultLocationName = memberLocation?.name ?? null
  }

  const savedLocation = cookieStore.get("worknest-member-location-theme")?.value
  const savedLocationName: Record<string, string> = {
    koramangala: "Koramangala",
    indiranagar: "Indiranagar",
    hsr: "HSR",
  }
  const [savedMemberId, savedLocationKey] = savedLocation?.split(":") ?? []
  if (memberId && savedMemberId === String(memberId) && savedLocationKey) {
    defaultLocationName = savedLocationName[savedLocationKey] ?? defaultLocationName
  }

  return (
    <LocationThemeProvider memberId={memberId} defaultLocationName={defaultLocationName}>
      {children}
    </LocationThemeProvider>
  )
}
