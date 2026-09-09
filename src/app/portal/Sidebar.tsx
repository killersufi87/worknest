import { logout } from "@/app/actions/auth"

const NAV = [
  { key: "dashboard", label: "Dashboard", href: "/portal" },
  { key: "book", label: "Book a Resource", href: "/portal/book" },
  { key: "bookings", label: "My Bookings", href: "/portal/bookings" },
  { key: "billing", label: "Billing & Invoices", href: "/portal/billing" },
  { key: "help", label: "Help & Support", href: "/portal/help" },
]

export default function Sidebar({
  active,
  name,
  tierName,
}: {
  active: string
  name: string
  tierName: string
}) {
  const initial = name.charAt(0).toUpperCase()

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#18181A] px-6 py-10 text-white md:flex">
      <div className="mb-10 text-lg font-bold">WorkNest</div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
              active === item.key
                ? "bg-white/10 font-medium text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs text-white/50">{tierName} Member</p>
        </div>
      </div>
      <form action={logout} className="mt-3">
        <button type="submit" className="text-xs text-white/50 hover:text-white">
          Log out
        </button>
      </form>
    </aside>
  )
}
