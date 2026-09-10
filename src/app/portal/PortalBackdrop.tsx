import Image from "next/image"

export default function PortalBackdrop({ image }: { image: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Image
        src={`https://images.unsplash.com/${image}?w=800&q=30&auto=format&fit=crop`}
        alt=""
        fill
        priority={false}
        sizes="100vw"
        className="object-cover opacity-[0.06]"
      />
    </div>
  )
}
