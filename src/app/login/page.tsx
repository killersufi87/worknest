import LoginForms from "./LoginForms"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left: photo panel */}
      <div className="relative hidden w-[45%] lg:block">
        <img
          src="https://images.unsplash.com/photo-1498049860654-af1a5c566876?w=1200&q=80&auto=format&fit=crop"
          alt="A calm, well-lit desk workspace"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-2xl font-semibold leading-snug">
            &ldquo;A better place to get work done.&rdquo;
          </p>
          <p className="mt-2 text-sm text-white/70">— The WorkNest Way</p>
        </div>
        <div className="absolute left-10 top-10 text-lg font-bold text-white">WorkNest</div>
      </div>

      {/* Right: form panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-8">
        <div>
          <div className="mb-8 lg:hidden text-lg font-bold text-foreground">WorkNest</div>
          <h1 className="mb-1 text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="mb-8 text-sm text-muted">Log in to your WorkNest account.</p>
          <LoginForms />
        </div>
      </div>
    </div>
  )
}
