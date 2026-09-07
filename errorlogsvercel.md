02:34:00.154 Running build in Washington, D.C., USA (East) – iad1
02:34:00.155 Build machine configuration: 2 cores, 8 GB
02:34:00.283 Cloning github.com/killersufi87/worknest (Branch: main, Commit: a7b1c01)
02:34:01.788 Cloning completed: 1.505s
02:34:01.945 Restored build cache from previous deployment (FB42yE8p9k4GT2VBTwGq144o5WKn)
02:34:02.321 Running "vercel build"
02:34:02.339 Vercel CLI 59.11.7
02:34:02.526 Installing dependencies...
02:34:04.281 
02:34:04.282 up to date in 2s
02:34:04.282 
02:34:04.282 237 packages are looking for funding
02:34:04.282   run `npm fund` for details
02:34:04.283 npm warn allow-scripts 1 package has install scripts not yet covered by allowScripts:
02:34:04.283 npm warn allow-scripts   unrs-resolver@1.12.2 (postinstall: node postinstall.js)
02:34:04.283 npm warn allow-scripts
02:34:04.283 npm warn allow-scripts Run `npm approve-scripts --allow-scripts-pending` to review, or `npm approve-scripts <pkg>` to allow.
02:34:04.313 Detected Next.js version: 16.3.2
02:34:04.320 Running "npm run build"
02:34:04.433 
02:34:04.433 > worknest@0.1.0 build
02:34:04.433 > next build
02:34:04.433 
02:34:04.955 ▲ Next.js 16.3.2 (Turbopack)
02:34:05.193   Applying modifyConfig from Vercel
02:34:05.195 ✓ Running next.config.ts took 242ms
02:34:05.212 
02:34:05.224 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
02:34:05.225 
02:34:05.225   To migrate automatically, run:
02:34:05.225   npx @next/codemod@canary middleware-to-proxy .
02:34:05.225 
02:34:05.225   Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
02:34:05.248   Creating an optimized production build ...
02:34:09.820 
02:34:09.820 > Build error occurred
02:34:09.824 Error: Turbopack build failed with 3 errors:
02:34:09.824 ./src/app/actions/auth.ts:4:1
02:34:09.824 Error: Module not found: Can't resolve '@/lib/supabase/server'
02:34:09.824   2 |
02:34:09.824   3 | import { redirect } from "next/navigation"
02:34:09.824 > 4 | import { createClient } from "@/lib/supabase/server"
02:34:09.825     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
02:34:09.825   5 | import { createAdminClient } from "@/lib/supabase/admin"
02:34:09.825   6 | import { memberIdToEmail, getCurrentRole } from "@/lib/auth/helpers"
02:34:09.825   7 |
02:34:09.825 
02:34:09.825 Import map: aliased to relative './src/lib/supabase/server' inside of [project]/
02:34:09.825 
02:34:09.825 
02:34:09.825 Import trace:
02:34:09.825   Server Component:
02:34:09.825     ./src/app/actions/auth.ts
02:34:09.825     ./src/app/portal/page.tsx
02:34:09.826 
02:34:09.826 https://nextjs.org/docs/messages/module-not-found
02:34:09.826 
02:34:09.826 
02:34:09.826 ./src/app/signup/page.tsx:1:1
02:34:09.826 Error: Module not found: Can't resolve '@/lib/supabase/server'
02:34:09.826 > 1 | import { createClient } from "@/lib/supabase/server"
02:34:09.827     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
02:34:09.827   2 | import SignupForm from "./SignupForm"
02:34:09.827   3 |
02:34:09.827   4 | export default async function SignupPage() {
02:34:09.827 
02:34:09.827 Import map: aliased to relative './src/lib/supabase/server' inside of [project]/
02:34:09.827 
02:34:09.827 
02:34:09.827 https://nextjs.org/docs/messages/module-not-found
02:34:09.827 
02:34:09.827 
02:34:09.827 ./src/lib/supabase/middleware.ts:1:1
02:34:09.827 Error: Module not found: Can't resolve '@supabase/ssr'
02:34:09.827 > 1 | import { createServerClient } from "@supabase/ssr"
02:34:09.827     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
02:34:09.827   2 | import { NextResponse, type NextRequest } from "next/server"
02:34:09.827   3 |
02:34:09.827   4 | export async function updateSession(request: NextRequest) {
02:34:09.827 
02:34:09.827 
02:34:09.827 
02:34:09.828 Import trace:
02:34:09.828   Edge Middleware:
02:34:09.828     ./src/lib/supabase/middleware.ts
02:34:09.828     ./src/middleware.ts
02:34:09.828 
02:34:09.828 https://nextjs.org/docs/messages/module-not-found
02:34:09.828 
02:34:09.828 
02:34:09.828     at <unknown> (./src/app/actions/auth.ts:4:1)
02:34:09.828     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
02:34:09.828     at <unknown> (./src/app/signup/page.tsx:1:1)
02:34:09.828     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
02:34:09.828     at <unknown> (./src/lib/supabase/middleware.ts:1:1)
02:34:09.828     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
02:34:09.883 Error: Command "npm run build" exited with 1