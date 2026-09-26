import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LocationThemeProvider from "../portal/LocationThemeProvider"

const ADMIN_THEME_COOKIE = "worknest-admin-location-theme"
const LOCATION_NAMES: Record<string, string> = {
  koramangala: "Koramangala",
  indiranagar: "Indiranagar",
  hsr: "HSR",
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: employee, error } = await supabase
    .from("employees")
    .select("employee_id, locations(name)")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!employee) redirect("/login")

  const employeeLocation = Array.isArray(employee.locations) ? employee.locations[0] : employee.locations
  let defaultLocationName = employeeLocation?.name ?? null
  const [savedEmployeeId, savedLocationKey] = cookieStore.get(ADMIN_THEME_COOKIE)?.value.split(":") ?? []

  if (savedEmployeeId === String(employee.employee_id) && savedLocationKey) {
    defaultLocationName = LOCATION_NAMES[savedLocationKey] ?? defaultLocationName
  }

  return (
    <LocationThemeProvider
      scopeId={employee.employee_id}
      storageKey={ADMIN_THEME_COOKIE}
      cookiePath="/admin"
      defaultLocationName={defaultLocationName}
    >
      {children}
    </LocationThemeProvider>
  )
}
