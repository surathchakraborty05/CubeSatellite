// page3.tsx
"use client";
import * as sat from "satellite.js"
import { useState, useEffect, useRef, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Navbar, Footer } from "@/components/orbital"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext"
import Link from "next/link";
import {
  Play, Pause, SkipBack, SkipForward,
  Download, Settings, Satellite, Radio, MapPin,
  Moon,
  Sun,
} from "lucide-react"
import dynamic from "next/dynamic"

const MapComponenttimeline = dynamic(
  () => import("@/components/orbital/Mapcomponenttimeline"),
  { ssr: false, loading: () => <div className="w-full h-full bg-[oklch(0.15_0.03_220)] animate-pulse rounded-lg" /> }
)

const SVG_W = 800
const SVG_H = 200

function projectToSVG(lat: number, lng: number) {
  return {
    x: ((lng + 180) / 360) * SVG_W,
    y: ((90 - lat) / 180) * SVG_H,
  }
}

const TLE_LINE1 = "1 25544U 98067A   24067.51782528  .00016717  00000+0  10270-3 0  9993"
const TLE_LINE2 = "2 25544  51.6433  21.4473 0007417  51.8621  62.3224 15.50012345678901"

const WINDOW_HALF_MIN = 180
const SAMPLE_STEP_MIN = 1

interface TrackPoint {
  x: number
  y: number
  lng: number
  minuteOffset: number
}

function buildAllPoints(baseTime: Date): TrackPoint[] {
  const satrec = sat.twoline2satrec(TLE_LINE1, TLE_LINE2)
  const points: TrackPoint[] = []

  for (let m = -WINDOW_HALF_MIN; m <= WINDOW_HALF_MIN; m += SAMPLE_STEP_MIN) {
    const t = new Date(baseTime.getTime() + m * 60_000)
    const pv = sat.propagate(satrec, t)
    if (!pv?.position) continue

    const gmst = sat.gstime(t)
    const geo = sat.eciToGeodetic(pv.position as sat.EciVec3<number>, gmst)
    const lat = sat.degreesLat(geo.latitude)
    const lng = sat.degreesLong(geo.longitude)
    const { x, y } = projectToSVG(lat, lng)

    points.push({ x, y, lng, minuteOffset: m })
  }
  return points
}

function toPathD(pts: TrackPoint[]): string {
  if (pts.length === 0) return ""
  let d = ""
  for (let i = 0; i < pts.length; i++) {
    const wrap = i > 0 && Math.abs(pts[i].lng - pts[i - 1].lng) > 90
    d += (i === 0 || wrap)
      ? `M${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)} `
      : `L${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)} `
  }
  return d.trim()
}

const sliderToMinute = (v: number) => (v / 100) * (WINDOW_HALF_MIN * 2) - WINDOW_HALF_MIN

function fmt2(n: number) { return String(n).padStart(2, "0") }
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${fmt2(d.getMonth() + 1)}-${fmt2(d.getDate())} ` +
    `${fmt2(d.getHours())}:${fmt2(d.getMinutes())}:${fmt2(d.getSeconds())}`
}
function getDuration(start: Date, end: Date) {
  const diff = Math.abs(end.getTime() - start.getTime())
  return {
    years: Math.floor(diff / (1000 * 60 * 60 * 24 * 365)),
    days: Math.floor(diff / (1000 * 60 * 60 * 24)) % 365,
    hours: Math.floor(diff / (1000 * 60 * 60)) % 24,
    minutes: Math.floor(diff / (1000 * 60)) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  }
}

const visibilityWindows = [
  { name: "Astra-9", date: "2026-03-15", startTime: "14:00:12", endTime: "14:12:45", duration: "12m 33s", elevation: 78, line1: "1 25544U 98067A   26080.51758049  .00014080  00000+0  26848-3 0  9998", line2: "2 25544  51.6347  13.8885 0006310 215.8915 144.1650 15.48422342558163" },
  { name: "PolarNet-2", date: "2026-03-15", startTime: "15:05:00", endTime: "15:12:30", duration: "7m 30s", elevation: 56, line1: "1 25544U 98067A   26080.51758049  .00014080  00000+0  26848-3 0  9998", line2: "2 25544  51.6347  13.8885 0006310 215.8915 144.1650 15.48422342558163" },
  { name: "GeoRelay-1", date: "2026-03-15", startTime: "13:55:30", endTime: "14:05:00", duration: "9m 40s", elevation: 45, line1: "1 25544U 98067A   26080.51758049  .00014080  00000+0  26848-3 0  9998", line2: "2 25544  51.6347  13.8885 0006310 215.8915 144.1650 15.48422342558163" },
  { name: "CommsArray-7", date: "2026-03-15", startTime: "14:30:00", endTime: "14:42:00", duration: "12m 0s", elevation: 62, line1: "1 25544U 98067A   26080.51758049  .00014080  00000+0  26848-3 0  9998", line2: "2 25544  51.6347  13.8885 0006310 215.8915 144.1650 15.48422342558163" },
]
const footprintPreviews = [
  { time: "14:06 UTC", visibility: "14:00 - 14:12", elevation: "78°" },
  { time: "14:20 UTC", visibility: "14:18 - 14:24", elevation: "63°" },
]

export default function TimelinePage() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [copied, setCopied] = useState(false)
  const baseTimeRef = useRef<Date | null>(null)
  if (baseTimeRef.current === null) {
    baseTimeRef.current = new Date()
  }
  const [exporting, setExporting] = useState(false)
  const [markers, setMarkers] = useState<string[]>([])
  const allPoints = useMemo(() => buildAllPoints(baseTimeRef.current!), [])
  const [format, setFormat] = useState("json");
  const [sliderValue, setSliderValue] = useState([50])
  const [isPlaying, setIsPlaying] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [loopEnabled, setLoopEnabled] = useState(true)
  const [includeAnnotations, setIncludeAnnotations] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [wallClock, setWallClock] = useState("")
  const [duration, setDuration] = useState({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 })
  const mapInstanceRef = useRef<any>(null)
  const playRef = useRef(false)
  const rateRef = useRef(playbackRate)
  const loopRef = useRef(loopEnabled)
  const [isDarkMode, setIsDarkMode] = useState<"light" | "dark" | null>(null);
  const { globalTheme } = useTheme()
  const finalTheme = isDarkMode ?? globalTheme

  useEffect(() => {
    if (finalTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [finalTheme])
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      if (prev === null) {
        // first time override → opposite of global
        return globalTheme === "dark" ? "light" : "dark"
      }
      return prev === "dark" ? "light" : "dark"
    })
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])
  useEffect(() => {
    const saved = localStorage.getItem("markers")
    if (saved) {
      setMarkers(JSON.parse(saved))
    }
  }, [])

  playRef.current = isPlaying
  rateRef.current = playbackRate
  loopRef.current = loopEnabled
  const handleJump = (name: string, line1: string, line2: string) => {
    const params = new URLSearchParams({
      name: name,
      tle1: line1,
      tle2: line2,
    });

    router.push(`/map-viewer?${params.toString()}`);
  };
  useEffect(() => {
    const TICK_MS = 200
    const unitsPerSimSecond = 100 / (WINDOW_HALF_MIN * 2 * 60)

    const id = setInterval(() => {
      const now = new Date()
      setWallClock(fmtDate(now))
      setDuration(getDuration(new Date("2026-03-15T13:50:00"), now))

      if (!playRef.current) return

      setSliderValue(prev => {
        const tickSeconds = TICK_MS / 1000
        const delta = tickSeconds * rateRef.current * unitsPerSimSecond
        const next = prev[0] + delta

        if (next >= 100) {
          if (loopRef.current) return [0]
          setTimeout(() => setIsPlaying(false), 0)
          return [100]
        }
        return [next]
      })
    }, TICK_MS)

    return () => clearInterval(id)
  }, [])
  const handleToggleMarker = (name: string) => {
    let updated: string[]

    if (markers.includes(name)) {
      // REMOVE
      updated = markers.filter(m => m !== name)
    } else {
      // ADD
      updated = [...markers, name]
    }

    setMarkers(updated)
    localStorage.setItem("markers", JSON.stringify(updated))
  }
  // const handleExport = () => {
  //   if (format === "json") {
  //     const data = {
  //       satellite: liveSat,
  //       annotations: includeAnnotations,
  //       timestamp: new Date().toISOString(),
  //     };
  //     const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "satellite-data.json";
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   }
  // };

  const handleSaveReplay = async () => {
    try {
      const replay = {
        name: "ISS",
        line1: TLE_LINE1,
        line2: TLE_LINE2,
        savedAt: new Date().toISOString(),
      }

      const text = JSON.stringify(replay, null, 2)

      await navigator.clipboard.writeText(text)

      setToast({ message: "Replay copied to clipboard ✅", type: "success" })
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 3000)
      // auto hide
      setTimeout(() => setToast(null), 3000)

    } catch (err) {
      console.error(err)
      setToast({ message: "Failed to copy ❌", type: "error" })
      setTimeout(() => setToast(null), 3000)
    }
  }
  const exportJSON = () => {
    const data = {
      name: "ISS",
      line1: TLE_LINE1,
      line2: TLE_LINE2,
      timestamp: new Date().toISOString(),
      annotations: includeAnnotations,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "Satellite.json"
    a.click()

    URL.revokeObjectURL(url)
  }


  const exportPNG = () => {
    const map = mapInstanceRef.current

    if (!map) {
      setToast({ message: "Map not ready yet ", type: "error" })
      setTimeout(() => setToast(null), 3000)
      return
    }

    import("leaflet-image").then((leafletImage) => {
      leafletImage.default(map, (err: any, canvas: HTMLCanvasElement) => {
        if (err) {
          setToast({ message: "Failed to export ", type: "error" })
          setTimeout(() => setToast(null), 3000)
          return
        }

        const img = canvas.toDataURL("image/png")

        const a = document.createElement("a")
        a.href = img
        a.download = "satellite.png"
        a.click()

        setToast({ message: "PNG downloaded ", type: "success" })
        setTimeout(() => setToast(null), 3000)
      })
    })
  }
  const handleExport = () => {
    if (format === "json") {
      exportJSON()
    } else if (format === "png") {
      exportPNG()
    } else if (format === "gif") {
      setToast({ message: "GIF export coming soon 🚧", type: "error" });
      setTimeout(() => setToast(null), 3000)
    } else if (format === "mp4") {
      setToast({ message: "MP4 export coming soon 🚧", type: "error" });
      setTimeout(() => setToast(null), 3000)
    }
  }
  const stepSlider = (deltaSec: number) => {
    const unitsPerSimSecond = 100 / (WINDOW_HALF_MIN * 2 * 60)
    setSliderValue(prev => [
      Math.max(0, Math.min(100, prev[0] + deltaSec * unitsPerSimSecond))
    ])
  }

  const currentMinute = sliderToMinute(sliderValue[0])
  const currentTime = useMemo(() => {
    return new Date(baseTimeRef.current!.getTime() + currentMinute * 60_000)
  }, [currentMinute])

  const scrubbedTime = useMemo(() => {
    if (!baseTimeRef.current) return null
    const t = new Date(baseTimeRef.current.getTime() + currentMinute * 60_000)
    return fmtDate(t)
  }, [currentMinute])

  const offsetLabel = useMemo(() => {
    const m = Math.round(currentMinute)
    if (Math.abs(m) < 1) return "Now"
    const sign = m > 0 ? "+" : ""
    return Math.abs(m) < 60
      ? `${sign}${m}m`
      : `${sign}${Math.floor(m / 60)}h ${Math.abs(m) % 60}m`
  }, [currentMinute])

  const pastPoints = useMemo(
    () => allPoints.filter(p => p.minuteOffset <= currentMinute),
    [allPoints, currentMinute]
  )
  const futurePoints = useMemo(
    () => allPoints.filter(p => p.minuteOffset >= currentMinute),
    [allPoints, currentMinute]
  )

  const currentDot = useMemo(() => {
    if (!allPoints.length) return null
    return allPoints.reduce((best, p) =>
      Math.abs(p.minuteOffset - currentMinute) < Math.abs(best.minuteOffset - currentMinute)
        ? p : best
    )
  }, [allPoints, currentMinute])

  const pastPathD = useMemo(() => toPathD(pastPoints), [pastPoints])
  const futurePathD = useMemo(() => toPathD(futurePoints), [futurePoints])

  const timeBadgeClass = currentMinute < -1
    ? "bg-[oklch(0.55_0.15_250)]/20 text-[oklch(0.55_0.15_250)]"
    : currentMinute > 1
      ? "bg-[oklch(0.65_0.18_45)]/20 text-[oklch(0.65_0.18_45)]"
      : "bg-green-500/20 text-green-400"

  const timeBadgeLabel = currentMinute < -1 ? "PAST" : currentMinute > 1 ? "FUTURE" : "NOW"
  const liveSat = {
    name: "ISS",
    tle: [TLE_LINE1, TLE_LINE2],
    currentTime,
    currentPosition: currentDot,
    path: allPoints,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={{ name: "Maya Ortega" }} />
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
      ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
          >
            {toast.message}
          </div>
        </div>
      )}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Map */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="aspect-square sm:aspect-video rounded-lg overflow-hidden bg-[oklch(0.15_0.03_220)] relative">
                <div className="w-full h-full">
                  <MapComponenttimeline
                    tleLine1={TLE_LINE1}
                    tleLine2={TLE_LINE2}
                    currentTime={currentTime}
                    onMapReady={(map) => { mapInstanceRef.current = map }}
                  />
                </div>

                <div className="absolute bottom-1 left-1 flex flex-wrap gap-2 z-[1000] max-w-[70%]">
                  {[
                    { name: "Astra-9", color: "oklch(0.6 0.18 145)" },
                    { name: "PolarNet-2", color: "oklch(0.55 0.15 250)" },
                    { name: "GeoRelay-1", color: "oklch(0.65 0.18 45)" },
                  ].map(s => (
                    <div key={s.name} className="flex items-center gap-1 px-2 py-1 bg-card/90 rounded text-[10px] sm:text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      <span className="text-foreground">{s.name}</span>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-1 right-1 bg-card/90 rounded-lg p-2 text-[10px] sm:text-xs z-[1000]">
                  <div className="flex items-center gap-2">
                    <Radio className="h-3 w-3 sm:h-4 sm:w-4 text-[oklch(0.55_0.15_250)]" />
                    <div>
                      <p className="font-medium text-foreground">Ground Station:</p>
                      <p className="text-[oklch(0.55_0.15_250)]">Santiago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Playback controls */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">Speed</span>
                  <div className="flex gap-1">
                    {[0.5, 1, 2, 5, 10].map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          setPlaybackRate(r)
                          rateRef.current = r
                        }}
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-mono border transition-colors",
                          playbackRate === r
                            ? "bg-[oklch(0.55_0.15_250)] text-white border-[oklch(0.55_0.15_250)]"
                            : "border-border text-muted-foreground hover:border-foreground"
                        )}
                      >
                        {r}×
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => stepSlider(-10)}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary"
                    onClick={() => setIsPlaying(p => !p)}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => stepSlider(10)}>
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="inline-flex dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white"
                    onClick={() => {
                      const map = mapInstanceRef.current
                      const marker = map?._layers &&
                        Object.values(map._layers).find((l: any) => l.getLatLng)
                      if (map && marker) {
                        map.setView((marker as any).getLatLng(), map.getZoom(), { animate: true })
                      }
                    }}
                  >
                    Center
                  </Button>
                </div>

                <div className="hidden md:block text-xs text-muted-foreground">
                  <p>⏮ / ⏭ step ±10 s</p>
                  <p>Range 0.5× — 10×</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 px-4 py-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Loop</span>
                  <span className={cn("text-sm font-medium", loopEnabled ? "text-[oklch(0.65_0.18_45)]" : "text-muted-foreground")}>
                    {loopEnabled ? "On" : "Off"}
                  </span>
                </div>
                <Switch checked={loopEnabled} onCheckedChange={setLoopEnabled} />
              </div>

              <div className="text-center mt-3">
                <p className="text-xs text-muted-foreground">Wall Clock (real time)</p>
                <p className="text-lg sm:text-xl font-mono font-bold text-foreground">
                  {isMounted ? wallClock : "—"} UTC
                </p>
              </div>
            </div>

            {/* Orbit Timeline */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                <div>
                  <span className="text-sm font-semibold text-foreground">ISS Ground Track</span>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">NORAD 25544 · ±3 h window</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] sm:text-xs w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-4 border-t-2 border-dashed border-[oklch(0.55_0.15_250)] opacity-70" />
                      <span className="text-muted-foreground">Past</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-4 border-t-2 border-[oklch(0.65_0.18_45)]" />
                      <span className="text-muted-foreground">Future</span>
                    </span>
                  </div>
                  <span className={cn("font-mono font-bold text-xs px-2 py-0.5 rounded", timeBadgeClass)}>
                    {offsetLabel}
                  </span>
                </div>
              </div>

              <div className="h-40 rounded-lg overflow-x-hidden overflow-y-hidden border border-border/40 relative bg-[oklch(0.10_0.02_220)] scrollbar-hide">
                <div style={{ minWidth: SVG_W }}>
                  <svg
                    className="w-full h-40"
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    preserveAspectRatio="none"
                    suppressHydrationWarning
                  >
                    <line x1="0" y1={SVG_H / 2} x2={SVG_W} y2={SVG_H / 2}
                      stroke="oklch(0.38 0.03 220)" strokeWidth="1" strokeDasharray="4 4" />
                    {[23.5, -23.5].map(lat => (
                      <line key={lat}
                        x1="0" y1={((90 - lat) / 180) * SVG_H}
                        x2={SVG_W} y2={((90 - lat) / 180) * SVG_H}
                        stroke="oklch(0.3 0.03 220)" strokeWidth="0.5" strokeDasharray="2 6" />
                    ))}
                    {[-120, -60, 0, 60, 120].map(lng => (
                      <line key={lng}
                        x1={((lng + 180) / 360) * SVG_W} y1="0"
                        x2={((lng + 180) / 360) * SVG_W} y2={SVG_H}
                        stroke="oklch(0.28 0.03 220)" strokeWidth="0.5" strokeDasharray="2 6" />
                    ))}

                    {isMounted && pastPathD && (
                      <>
                        <path d={pastPathD} fill="none"
                          stroke="oklch(0.55 0.15 250)" strokeWidth="5" strokeOpacity="0.07"
                          strokeLinecap="round" />
                        <path d={pastPathD} fill="none"
                          stroke="oklch(0.55 0.15 250)" strokeWidth="1.5" strokeOpacity="0.55"
                          strokeLinecap="round" strokeLinejoin="round"
                          strokeDasharray="5 3" />
                      </>
                    )}

                    {isMounted && futurePathD && (
                      <>
                        <path d={futurePathD} fill="none"
                          stroke="oklch(0.65 0.18 45)" strokeWidth="7" strokeOpacity="0.12"
                          strokeLinecap="round" />
                        <path d={futurePathD} fill="none"
                          stroke="oklch(0.65 0.18 45)" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    )}

                    {isMounted && currentDot && (
                      <g>
                        <circle cx={currentDot.x} cy={currentDot.y} r="10"
                          fill="oklch(0.65 0.18 45)" opacity="0.10" />
                        <circle cx={currentDot.x} cy={currentDot.y} r="3"
                          fill="oklch(0.65 0.18 45)" />
                        <text
                          x={Math.min(currentDot.x + 9, SVG_W - 95)}
                          y={Math.max(currentDot.y - 7, 10)}
                          fontSize="9" fill="oklch(0.75 0.15 45)"
                          fontFamily="monospace"
                        >
                          {offsetLabel}
                        </text>
                      </g>
                    )}
                  </svg>
                </div>
                <div className="absolute top-1 left-2 text-[9px] text-muted-foreground/50 font-mono pointer-events-none">90°N</div>
                <div className="absolute bottom-1 left-2 text-[9px] text-muted-foreground/50 font-mono pointer-events-none">90°S</div>
              </div>

              <div className="mt-6 px-1">
                <Slider
                  value={sliderValue}
                  onValueChange={v => {
                    setSliderValue(v)
                    setIsPlaying(false)
                  }}
                  min={0} max={100} step={0.1}
                />
              </div>

              <div className="flex items-center justify-between mt-4 text-[10px] sm:text-xs">
                <span className="text-muted-foreground font-mono">−{WINDOW_HALF_MIN}m</span>
                <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <span className="font-mono text-foreground font-semibold">
                    {isMounted ? scrubbedTime : "—"} UTC
                  </span>
                  <span className={cn("px-1.5 py-0.5 rounded font-mono text-[9px]", timeBadgeClass)}>
                    {timeBadgeLabel}
                  </span>
                </span>
                <span className="text-muted-foreground font-mono">+{WINDOW_HALF_MIN}m</span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between mt-4 pt-2 border-t border-border/40 text-[10px] sm:text-xs text-muted-foreground gap-1">
                <span>Start: <span className="text-[oklch(0.55_0.15_250)]">2026-03-15 13:50:00</span></span>
                <span>Duration: <span className="text-foreground font-mono font-medium">
                  {isMounted ? `${duration.years}Y:${duration.days}D:${duration.hours}H:${duration.minutes}M:${duration.seconds}S` : "—"}
                </span></span>
              </div>
            </div>

            {/* Visibility windows */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Predicted Visibility Windows</h2>
              <div className="space-y-3">
                {visibilityWindows.map((w, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted rounded-lg gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[oklch(0.55_0.15_250)]/20 flex items-center justify-center shrink-0 relative overflow-visible">

                          <Satellite className="h-4 w-4 sm:h-5 sm:w-5 text-[oklch(0.55_0.15_250)]" />

                          {markers.includes(w.name) && (
                            <div className="absolute -top-2 -right-2 z-50">
                              <MapPin className="h-4 w-4 text-red-500 fill-red-500" />
                            </div>
                          )}

                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{w.name} — {w.date}</p>
                        <p className="text-xs text-[oklch(0.65_0.18_45)]">
                          {w.startTime} – {w.endTime} ({w.duration}) · Peak {w.elevation}°
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-8 text-xs dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white" onClick={() => handleJump(w.name, w.line1, w.line2)}>Jump To</Button>
                      <Button variant="outline" size="sm" className={`flex-1 sm:flex-none h-8 text-xs transition-all dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white ${markers.includes(w.name) ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white/50 border border-border text-foreground hover:bg-muted"}`} onClick={() => handleToggleMarker(w.name)}>{markers.includes(w.name) ? "Remove Marker" : "Add Marker"}</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-4">
            {/* Instruments */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">Instruments</h3>
                  <p className="text-xs text-muted-foreground">Live telemetry & controls</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                  <Link href="/settings"> <Button variant="ghost" size="icon" ><Settings className="h-4 w-4" /></Button></Link>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Playback Rate</span>
                  <span className="font-bold font-mono text-foreground">{playbackRate}×</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Loop</span>
                  <span className={cn("font-bold", loopEnabled ? "text-[oklch(0.65_0.18_45)]" : "text-muted-foreground")}>
                    {loopEnabled ? "On" : "Off"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Position</span>
                  <span className={cn("font-bold font-mono",
                    currentMinute < -1 ? "text-[oklch(0.55_0.15_250)]"
                      : currentMinute > 1 ? "text-[oklch(0.65_0.18_45)]"
                        : "text-green-400"
                  )}>
                    {offsetLabel}
                  </span>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] text-muted-foreground mb-1">Scrubbed time</p>
                  <p className="text-[10px] sm:text-xs font-mono font-medium text-[oklch(0.55_0.15_250)] break-all">
                    {isMounted ? scrubbedTime : "—"} UTC
                  </p>
                </div>
              </div>
            </div>

            {/* Footprint Preview */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Footprint Preview</h3>
                <span className="text-xs text-muted-foreground">UTC</span>
              </div>
              <div className="space-y-3">
                {footprintPreviews.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded overflow-hidden bg-muted shrink-0">
                      <img
                        src="https://i.pinimg.com/736x/b2/da/24/b2da247529421f98a11b06e02d82aa23.jpg"
                        alt="Footprint" className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[oklch(0.65_0.18_45)]">{p.time}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Vis: {p.visibility} · {p.elevation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">Export & Save</h3>
                  <p className="text-xs text-muted-foreground">Choose format</p>
                </div>
                <Download className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 rounded-lg bg-muted border border-border text-foreground text-xs sm:text-sm"
                >
                  <option value="mp4">MP4 — Animated Orbit</option>
                  <option value="gif">GIF — Looping Animation</option>
                  <option value="png">PNG — Static Frame</option>
                  <option value="json">JSON — Data Export</option>
                </select>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Include annotations</span>
                  <Switch checked={includeAnnotations} onCheckedChange={setIncludeAnnotations} />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="flex-1 h-9 text-xs dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white" onClick={handleExport} disabled={exporting}>
                    {exporting ? "Exporting..." : "Export"}
                  </Button>
                  <Button
                    className={`flex-1 h-9 text-xs transition-all duration-300
    ${copied
                        ? "!bg-emerald-600 hover:!bg-emerald-500 text-white"
                        : "!bg-[oklch(0.55_0.15_250)] hover:!bg-[oklch(0.5_0.15_250)] text-white"
                      }
  `}
                    onClick={handleSaveReplay}
                  >
                    {copied ? "Copied Replay" : "Copy Replay"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}