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
    "--primary": "#71364B",
    "--primary-foreground": "#FFFFFF",
    "--border": "#E8DCD4",
    "--status-confirmed-bg": "#F1E5E2",
    "--status-confirmed-fg": "#71364B",
    "--location-gold": "#C4974B",
    "--location-gold-soft": "#F5EBD9",
  } as CSSProperties,
  indiranagar: {
    "--primary": "#38644F",
    "--primary-foreground": "#FFFFFF",
    "--border": "#DCE6D9",
    "--status-confirmed-bg": "#E4EEE5",
    "--status-confirmed-fg": "#38644F",
    "--location-gold": "#B98A35",
    "--location-gold-soft": "#F4ECD8",
  } as CSSProperties,
  hsr: {
    "--primary": "#315C78",
    "--primary-foreground": "#FFFFFF",
    "--border": "#D9E3E8",
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
        className="min-h-screen bg-background transition-colors duration-500"
        style={theme}
      >
        {children}
      </div>
    </LocationThemeContext.Provider>
  )
}
