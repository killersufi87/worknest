const NAV = [
  { key: "dashboard", label: "Dashboard", href: "/portal" },
  { key: "book", label: "Book a Resource", href: "/portal/book" },
  { key: "bookings", label: "My Bookings", href: "/portal/bookings" },
  { key: "billing", label: "Billing & Invoices", href: "/portal/billing" },
  { key: "help", label: "Help & Support", href: "/portal/help" },
]

export default function Sidebar({ active }: { active: string }) {
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
    </aside>
  )
}
