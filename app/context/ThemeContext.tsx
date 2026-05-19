"use client"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

type ThemeContextType = {
  globalTheme: Theme
  setGlobalTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [globalTheme, setGlobalTheme] = useState<Theme>("light")

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme
    if (saved) setGlobalTheme(saved)
  }, [])

  // Apply + Save
  useEffect(() => {
    localStorage.setItem("theme", globalTheme)

    if (globalTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [globalTheme])

  return (
    <ThemeContext.Provider value={{ globalTheme, setGlobalTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}