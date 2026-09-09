export default function Home() {
  const locations = [
    { name: "Koramangala", desc: "42 resources · 100ft Road", img: "photo-1700163080760-12c275d3fe36" },
    { name: "Indiranagar", desc: "38 resources · CMH Road", img: "photo-1498049860654-af1a5c566876" },
    { name: "HSR", desc: "29 resources · 27th Main", img: "photo-1758518730083-4c12527b6742" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-6 lg:px-16">
        <span className="text-lg font-bold text-foreground">WorkNest</span>
        <nav className="flex items-center gap-3">
          <a href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-black/5">
            Log in
          </a>
          <a href="/signup" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Sign up
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="grid gap-10 px-8 py-10 lg:grid-cols-2 lg:items-center lg:px-16 lg:py-16">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Spaces for what&rsquo;s next
          </p>
          <h1 className="mb-4 text-5xl font-bold leading-tight text-foreground">
            A better place to get work done.
          </h1>
          <p className="mb-8 max-w-md text-muted">
            Premium coworking spaces across Bangalore. Book desks, cabins, and
            meeting rooms in seconds, at whichever floor suits your day.
          </p>
          <div className="flex gap-4">
            <a href="/signup" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Get started
            </a>
            <a href="/login" className="rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground hover:bg-black/5">
              Log in
            </a>
          </div>
        </div>
        <div className="relative h-72 overflow-hidden rounded-2xl lg:h-96">
          <img
            src="https://images.unsplash.com/photo-1700163080760-12c275d3fe36?w=1200&q=80&auto=format&fit=crop"
            alt="A bright coworking lounge with plants"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Stat strip */}
      <section className="grid grid-cols-2 gap-8 border-y border-border px-8 py-10 lg:grid-cols-4 lg:px-16">
        {[
          ["3", "Bangalore locations"],
          ["60+", "Bookable resources"],
          ["50–80", "Active members"],
          ["24/7", "Access for members"],
        ].map(([value, label]) => (
          <div key={label}>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </section>

      {/* Locations */}
      <section className="px-8 py-16 lg:px-16">
        <h2 className="mb-8 text-2xl font-bold text-foreground">Find your space</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {locations.map((loc) => (
            <div key={loc.name} className="overflow-hidden rounded-xl border border-border bg-white">
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={`https://images.unsplash.com/${loc.img}?w=800&q=80&auto=format&fit=crop`}
                  alt={loc.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="font-semibold text-foreground">{loc.name}</p>
                <p className="text-sm text-muted">{loc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quote banner */}
      <section className="relative h-72 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1498049860654-af1a5c566876?w=1600&q=80&auto=format&fit=crop"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <p className="max-w-lg text-2xl font-semibold leading-snug">
            &ldquo;Good work starts with a great space.&rdquo;
          </p>
          <p className="mt-3 text-sm text-white/70">— The WorkNest Way</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between px-8 py-8 text-sm text-muted lg:px-16">
        <span>© 2026 WorkNest</span>
        <div className="flex gap-6">
          <a href="/login" className="hover:text-foreground">Log in</a>
          <a href="/signup" className="hover:text-foreground">Sign up</a>
        </div>
      </footer>
    </div>
  );
}
