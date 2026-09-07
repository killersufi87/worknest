import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not remove this line. It refreshes the auth token and keeps
  // Server Components in sync with the current session.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPortalRoute = path.startsWith("/portal")
  const isAdminRoute = path.startsWith("/admin")

  // Not logged in but trying to reach a protected portal: bounce to login.
  if ((isPortalRoute || isAdminRoute) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Logged in: make sure they're in the portal that matches their role,
  // not just any authenticated route. A member has no business in /admin
  // and vice versa, even though both are "logged in."
  if (user && (isPortalRoute || isAdminRoute)) {
    const { data: member } = await supabase
      .from("members")
      .select("member_id")
      .eq("auth_user_id", user.id)
      .maybeSingle()

    const isMember = !!member

    if (isPortalRoute && !isMember) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
    if (isAdminRoute && isMember) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
