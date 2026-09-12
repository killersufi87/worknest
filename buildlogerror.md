10:20:11.050 Running build in Washington, D.C., USA (East) – iad1
10:20:11.051 Build machine configuration: 2 cores, 8 GB
10:20:11.200 Cloning github.com/killersufi87/worknest (Branch: main, Commit: f91a185)
10:20:11.874 Cloning completed: 674.000ms
10:20:12.637 Restored build cache from previous deployment (6CDMv3gKzmjr5dyRHVWABDuu9b4Z)
10:20:13.015 Running "vercel build"
10:20:13.030 Vercel CLI 59.11.7
10:20:13.248 Installing dependencies...
10:20:14.608 
10:20:14.608 up to date in 1s
10:20:14.608 
10:20:14.608 238 packages are looking for funding
10:20:14.608   run `npm fund` for details
10:20:14.609 npm warn allow-scripts 1 package has install scripts not yet covered by allowScripts:
10:20:14.609 npm warn allow-scripts   unrs-resolver@1.12.2 (postinstall: node postinstall.js)
10:20:14.609 npm warn allow-scripts
10:20:14.609 npm warn allow-scripts Run `npm approve-scripts --allow-scripts-pending` to review, or `npm approve-scripts <pkg>` to allow.
10:20:14.637 Detected Next.js version: 16.3.2
10:20:14.643 Running "npm run build"
10:20:14.734 
10:20:14.735 > worknest@0.1.0 build
10:20:14.735 > next build
10:20:14.735 
10:20:15.188 ▲ Next.js 16.3.2 (Turbopack)
10:20:15.371   Applying modifyConfig from Vercel
10:20:15.373 ✓ Running next.config.ts took 187ms
10:20:15.386 
10:20:15.388 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
10:20:15.389 
10:20:15.389   To migrate automatically, run:
10:20:15.389   npx @next/codemod@canary middleware-to-proxy .
10:20:15.389 
10:20:15.389   Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
10:20:15.414   Creating an optimized production build ...
10:20:18.929 
10:20:18.930 > Build error occurred
10:20:18.933 Error: Turbopack build failed with 2 errors:
10:20:18.933 ./src/app/help/page.tsx:4:1
10:20:18.934 Error: Module not found: Can't resolve '../../portal/PortalBackdrop'
10:20:18.934   2 | import { createClient } from "@/lib/supabase/server"
10:20:18.934   3 | import AdminSidebar from "../AdminSidebar"
10:20:18.934 > 4 | import PortalBackdrop from "../../portal/PortalBackdrop"
10:20:18.934     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
10:20:18.934   5 | import ResolveButton from "./ResolveButton"
10:20:18.934   6 |
10:20:18.934   7 | export default async function AdminHelpPage() {
10:20:18.934 
10:20:18.934 
10:20:18.934 
10:20:18.934 https://nextjs.org/docs/messages/module-not-found
10:20:18.934 
10:20:18.934 
10:20:18.934 ./src/app/help/page.tsx:3:1
10:20:18.934 Error: Module not found: Can't resolve '../AdminSidebar'
10:20:18.934   1 | import { redirect } from "next/navigation"
10:20:18.934   2 | import { createClient } from "@/lib/supabase/server"
10:20:18.934 > 3 | import AdminSidebar from "../AdminSidebar"
10:20:18.934     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
10:20:18.934   4 | import PortalBackdrop from "../../portal/PortalBackdrop"
10:20:18.934   5 | import ResolveButton from "./ResolveButton"
10:20:18.934   6 |
10:20:18.934 
10:20:18.934 
10:20:18.934 
10:20:18.934 https://nextjs.org/docs/messages/module-not-found
10:20:18.934 
10:20:18.934 
10:20:18.934     at <unknown> (./src/app/help/page.tsx:4:1)
10:20:18.934     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
10:20:18.934     at <unknown> (./src/app/help/page.tsx:3:1)
10:20:18.934     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
10:20:19.001 Error: Command "npm run build" exited with 1