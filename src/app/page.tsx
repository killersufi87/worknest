export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="mb-3 text-4xl font-bold text-foreground">WorkNest</h1>
      <p className="mb-8 max-w-md text-muted">
        Spaces for what&rsquo;s next. Book desks, cabins, and meeting rooms across
        Koramangala, Indiranagar, and HSR.
      </p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Log in
        </a>
        <a
          href="/signup"
          className="rounded-lg border border-border bg-white px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-black/5"
        >
          Sign up
        </a>
      </div>
    </div>
  );
}
