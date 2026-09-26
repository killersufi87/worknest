"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import type { ResourceType } from "@/app/actions/booking"

const LOCATION_SLUGS: Record<string, string> = {
  koramangala: "koramangala",
  indiranagar: "indiranagar",
  indiranagr: "indiranagar",
  hsr: "hsr",
}

const RESOURCE_LABELS: Record<ResourceType, string> = {
  hot_desk: "Hot Desk",
  dedicated_desk: "Dedicated Desk",
  cabin: "Private Cabin",
  meeting_room: "Meeting Room",
}

export default function ResourceGallery({
  locationName,
  resourceType,
}: {
  locationName: string
  resourceType: ResourceType
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const locationSlug = LOCATION_SLUGS[locationName.toLowerCase().replace(/\s+/g, "")]
  const images = useMemo(
    () => locationSlug
      ? [1, 2, 3].map((number) => `/resource-gallery/${locationSlug}_${resourceType}_${number}.webp`)
      : [],
    [locationSlug, resourceType]
  )

  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 })
  }, [])

  useEffect(() => {
    if (images.length < 2 || isPaused) return
    const timer = window.setInterval(() => {
      const nextIndex = (activeIndex + 1) % images.length
      trackRef.current?.children[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })
      setActiveIndex(nextIndex)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [activeIndex, images.length, isPaused])

  if (!images.length) return null

  function moveTo(index: number) {
    const nextIndex = (index + images.length) % images.length
    trackRef.current?.children[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })
    setActiveIndex(nextIndex)
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false)
      }}
    >
      <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{locationName}</p>
          <h3 className="text-lg font-semibold text-foreground">{RESOURCE_LABELS[resourceType]} spaces</h3>
        </div>
        <div className="flex gap-2">
          <button type="button" aria-label="Previous image" onClick={() => moveTo(activeIndex - 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition hover:border-primary hover:text-primary">←</button>
          <button type="button" aria-label="Next image" onClick={() => moveTo(activeIndex + 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition hover:border-primary hover:text-primary">→</button>
        </div>
      </div>
      <div
        ref={trackRef}
        onScroll={(event) => {
          const track = event.currentTarget
          const index = Math.round(track.scrollLeft / track.clientWidth)
          setActiveIndex(Math.min(index, images.length - 1))
        }}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, index) => (
          <div key={src} className="relative h-64 w-full shrink-0 snap-start overflow-hidden bg-[#E4EFE7] sm:h-80">
            <Image
              src={src}
              alt={`${RESOURCE_LABELS[resourceType]} at ${locationName} - photo ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              className="object-cover transition-transform duration-700 hover:scale-[1.03]"
              priority={index === 0}
            />
            <span className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {index + 1} / {images.length}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 py-4">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Show image ${index + 1}`}
            onClick={() => moveTo(index)}
            className={`h-2 rounded-full transition-all ${activeIndex === index ? "w-7 bg-primary" : "w-2 bg-primary/25 hover:bg-primary/50"}`}
          />
        ))}
      </div>
    </section>
  )
}
