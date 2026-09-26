"use client"

import { createContext, useCallback, useContext, useMemo, useState, type CSSProperties, type ReactNode } from "react"

type LocationThemeContextValue = {
  locationName: string | null
  setLocationTheme: (locationName: string) => void
}

const STORAGE_KEY = "worknest-member-location-theme"
const LocationThemeContext = createContext<LocationThemeContextValue | null>(null)

const LOCATION_THEMES: Record<string, CSSProperties> = {
  koramangala: {
    "--background": "#E7EFE7",
    "--foreground": "#1E2D25",
    "--card": "#FCFEFB",
    "--sidebar": "#244638",
    "--sidebar-hover": "#315C4A",
    "--muted": "#607166",
    "--primary": "#38644F",
    "--primary-foreground": "#FFFFFF",
    "--border": "#C9D9CB",
    "--status-confirmed-bg": "#E4EEE5",
    "--status-confirmed-fg": "#38644F",
    "--location-gold": "#B98A35",
    "--location-gold-soft": "#F4ECD8",
  } as CSSProperties,
  indiranagar: {
    "--background": "#F1E6E7",
    "--foreground": "#2D2024",
    "--card": "#FFFDFC",
    "--sidebar": "#522A3B",
    "--sidebar-hover": "#69394D",
    "--muted": "#78656C",
    "--primary": "#71364B",
    "--primary-foreground": "#FFFFFF",
    "--border": "#DDC9CC",
    "--status-confirmed-bg": "#F1E5E2",
    "--status-confirmed-fg": "#71364B",
    "--location-gold": "#C4974B",
    "--location-gold-soft": "#F5EBD9",
  } as CSSProperties,
  hsr: {
    "--background": "#E5EDF2",
    "--foreground": "#1C2A33",
    "--card": "#FBFDFE",
    "--sidebar": "#23465D",
    "--sidebar-hover": "#315C78",
    "--muted": "#5F707B",
    "--primary": "#315C78",
    "--primary-foreground": "#FFFFFF",
    "--border": "#C8D8E1",
    "--status-confirmed-bg": "#E3EDF2",
    "--status-confirmed-fg": "#315C78",
    "--location-gold": "#C49343",
    "--location-gold-soft": "#F5ECD9",
  } as CSSProperties,
}

function normalizeLocationName(locationName: string) {
  return locationName.toLowerCase().replace(/\s+/g, "")
}

export function useLocationTheme() {
  const context = useContext(LocationThemeContext)
  if (!context) throw new Error("useLocationTheme must be used inside LocationThemeProvider.")
  return context
}

export default function LocationThemeProvider({
  memberId,
  defaultLocationName,
  children,
}: {
  memberId: number | null
  defaultLocationName: string | null
  children: ReactNode
}) {
  const [locationName, setLocationName] = useState(defaultLocationName)

  const setLocationTheme = useCallback((nextLocationName: string) => {
    if (LOCATION_THEMES[normalizeLocationName(nextLocationName)]) {
      setLocationName(nextLocationName)
      if (memberId) {
        const value = `${memberId}:${normalizeLocationName(nextLocationName)}`
        document.cookie = `${STORAGE_KEY}=${value}; Path=/portal; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`
      }
    }
  }, [memberId])

  const value = useMemo(() => ({ locationName, setLocationTheme }), [locationName, setLocationTheme])
  const theme = locationName ? LOCATION_THEMES[normalizeLocationName(locationName)] : undefined

  return (
    <LocationThemeContext.Provider value={value}>
      <div
        data-location-theme={locationName ? normalizeLocationName(locationName) : undefined}
        className="min-h-screen bg-background text-foreground transition-colors duration-500"
        style={theme}
      >
        {children}
      </div>
    </LocationThemeContext.Provider>
  )
}
