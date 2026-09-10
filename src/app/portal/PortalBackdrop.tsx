export default function PortalBackdrop({ image }: { image: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <img
        src={`https://images.unsplash.com/${image}?w=1000&q=50&auto=format&fit=crop`}
        alt=""
        className="h-full w-full object-cover opacity-[0.06]"
      />
    </div>
  )
}
