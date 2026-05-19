// page2.tsx
"use client"
import { fetchWeatherApi } from "openmeteo";
import * as satelliteLib from "satellite.js";
import { getCachedDebris } from "@/utils/Satellitefetcher";
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Navbar, Footer, StatCard, PassCard, TelemetryGauge } from "@/components/orbital"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "../context/ThemeContext" // path adjust kar lena
import {
  Satellite,
  Maximize2,
  MapPin,
  Battery,
  Thermometer,
  Signal,
  Moon,
  Sun,
} from "lucide-react"
// import HeatmapView from "@/components/orbital/HeatmapView";
import HeatmapViewWrapper from '@/components/orbital/HeatmapViewWrapper';
const satellite = {
  name: "Horizon-3R",
  noradId: "47902",
  status: "Operational",
  type: "Low Earth Observation Satellite",
  launchDate: "2018-09-14",
  operator: "Aurora Orbital Systems",
  missionType: "Earth Observation",
  stats: {
    altitude: { value: 542.3, unit: "km" },
    inclination: { value: 97.6, unit: "°" },
    period: { value: 95.4, unit: "min" },
    range: { value: 1338, unit: "km" },
  },
  orbit: {
    anomaly: "Ascending Node near 45°E",
    decayRisk: "Low — 0.02% per orbit",
    nextGroundStation: "Svalbard",
    nextPassTime: "00:14 UTC",
  },
  telemetry: {
    battery: { value: 78, unit: "%" },
    temperature: { value: -12, unit: "°C" },
    signal: { value: -98, unit: "dB" },
    updatedAt: "03:10 UTC",
  },
  "line1": "1 25544U 98067A   26080.51758049  .00014080  00000+0  26848-3 0  9998",
  "line2": "2 25544  51.6347  13.8885 0006310 215.8915 144.1650 15.48422342558163"
}

const smoothRandom = (current: number, min: number, max: number, maxDelta: number) => {
  const delta = (Math.random() * 2 - 1) * maxDelta; // random change between -maxDelta to +maxDelta
  let next = current + delta;
  if (next > max) next = max;
  if (next < min) next = min;
  return next;
};
function fmt2(n: number) { return String(n).padStart(2, "0") }
function fmtTime(d: Date) {
  return `${fmt2(d.getHours())}:${fmt2(d.getMinutes())}:${fmt2(d.getSeconds())}`
}
const upcomingPasses = [
  {
    date: "2026-03-16",
    startTime: "03:12",
    endTime: "03:18",
    peakTime: "03:15",
    elevation: 85,
    azimuth: 132,
    confidence: "High" as const,
  },
  {
    date: "2026-03-16",
    startTime: "05:49",
    endTime: "05:55",
    peakTime: "05:52",
    elevation: 22,
    azimuth: 267,
    confidence: "Medium" as const,
  },
  {
    date: "2026-03-16",
    startTime: "08:21",
    endTime: "08:27",
    peakTime: "08:24",
    elevation: 45,
    azimuth: 310,
    confidence: "High" as const,
  },
  {
    date: "2026-03-16",
    startTime: "11:03",
    endTime: "11:09",
    peakTime: "11:06",
    elevation: 12,
    azimuth: 82,
    confidence: "Low" as const,
  },
]

// ─── Heatmap Component ───────────────────────────────────────────────────────
// function HeatmapView() { ... }
const STATUSES = [
  "Establishing Satellite Link...",
  "Synchronizing Ephemeris Data...",
  "Calculating Orbital Vectors...",
  "Triangulating Signal...",
  "Uplink Established.",
]
const SatelliteLoader = () => {
  const [statusIdx, setStatusIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStatusIdx(i => (i + 1) % STATUSES.length), 600)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.25,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* ── Radar ── */}
        {/* FIX 2: draw rings as SVG so they are guaranteed visible on any bg */}
        <div style={{ position: "relative", width: 240, height: 240, marginBottom: 48 }}>

          {/* SVG rings */}
          <svg
            width="240" height="240"
            viewBox="0 0 240 240"
            style={{ position: "absolute", inset: 0 }}
          >
            {/* 4 concentric rings */}
            {[110, 84, 58, 32].map((r, i) => (
              <circle
                key={i}
                cx="120" cy="120" r={r}
                fill="none"
                stroke="#10b981"
                strokeOpacity={0.45}
                strokeWidth="1"
              />
            ))}
            {/* Cross-hair lines */}
            <line x1="120" y1="10" x2="120" y2="230" stroke="#10b981" strokeOpacity={0.2} strokeWidth="0.5" />
            <line x1="10" y1="120" x2="230" y2="120" stroke="#10b981" strokeOpacity={0.2} strokeWidth="0.5" />
          </svg>

          {/* Rotating sweep — conic-gradient div */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(16,185,129,0.55) 25%, transparent 55%)",
            }}
          />

          {/* Centre dot */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 12, height: 12,
            borderRadius: "50%",
            backgroundColor: "#34d399",
            boxShadow: "0 0 16px 4px #10b981",
          }} />

          {/* Blips */}
          {[
            { top: "22%", left: "35%", delay: 0.3 },
            { top: "65%", left: "70%", delay: 1.1 },
            { top: "40%", left: "78%", delay: 0.7 },
          ].map((b, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.4, 0.8] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: b.delay }}
              style={{
                position: "absolute",
                top: b.top, left: b.left,
                width: 7, height: 7,
                borderRadius: "50%",
                backgroundColor: "#34d399",
                boxShadow: "0 0 8px #10b981",
              }}
            />
          ))}
        </div>

        {/* Text */}
        <div style={{ textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, justifyContent: "center" }}
          >
            <Satellite style={{ color: "#10b981", width: 22, height: 22 }} />
            <h1 style={{
              color: "#fff",
              fontFamily: "monospace",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: 0,
            }}>
              Orbital Tracker
            </h1>
          </motion.div>

          {/* Status line */}
          <div style={{ height: 18 }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={statusIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                style={{
                  color: "rgba(52,211,153,0.75)",
                  fontFamily: "monospace",
                  fontSize: 10,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {STATUSES[statusIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: 40,
          width: 180,
          height: 3,
          backgroundColor: "#18181b",
          borderRadius: 99,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            style={{ height: "100%", backgroundColor: "#10b981", borderRadius: 99 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Windy / Wind Arrow Map Component ────────────────────────────────────────
function WindyView() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    let L: any
    let map: any
    let animFrame: number | undefined
    let tick = 0
    let destroyed = false

    const init = async () => {
      L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css" as any)

      if (destroyed) return

      // Destroy any existing Leaflet instance on this container
      const el = mapRef.current as any
      if (el && el._leaflet_id) {
        L.map(el).remove()
      }

      map = L.map(mapRef.current!, { center: [30, 10], zoom: 2 })
      map.setMaxBounds([
        [-60, -180],
        [85, 180],
      ]);

      map.options.maxBoundsViscosity = 1.0;

      // Dark base tile with country borders and labels visible
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© CartoDB",
      }).addTo(map)

      // Append canvas directly to map container — not to overlayPane
      // so it never gets the CSS transform that panes receive during pan/zoom
      const container: HTMLElement = map.getContainer()
      const W = container.clientWidth
      const H = container.clientHeight

      const canvas = document.createElement("canvas")
      canvas.width = W
      canvas.height = H
      Object.assign(canvas.style, {
        position: "absolute", top: "0", left: "0",
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: "500",
      })
      container.appendChild(canvas)

      const ctx = canvas.getContext("2d")!

      const particles = Array.from({ length: 400 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        age: Math.random() * 80,
      }))

      const windAt = (x: number, y: number, t: number) => {
        const u = Math.sin(y * 0.015 + t * 0.02) * 1.8 + Math.cos(x * 0.01 + t * 0.015) * 1.2
        const v = Math.cos(y * 0.012 + t * 0.018) * 1.5 + Math.sin(x * 0.008 + t * 0.012) * 0.9
        return { u, v }
      }

      const draw = () => {
        tick++
        const w = canvas.width
        const h = canvas.height

        // Fade previous trails without painting over the map tiles
        // Use destination-out to partially erase old strokes instead of filling black
        ctx.globalCompositeOperation = "destination-out"
        ctx.fillStyle = "rgba(0,0,0,0.12)"
        ctx.fillRect(0, 0, w, h)
        ctx.globalCompositeOperation = "source-over"

        const maxAge = 80
        particles.forEach((p) => {
          const { u, v } = windAt(p.x, p.y, tick)
          const speed = Math.sqrt(u * u + v * v)
          const alpha = Math.min(1, (1 - p.age / maxAge) * 0.9)
          const spd = Math.min(speed / 3, 1)

          const r = Math.round(spd < 0.5 ? 0 : (spd - 0.5) * 2 * 255)
          const g = Math.round(spd < 0.5 ? spd * 2 * 220 : 220 - (spd - 0.5) * 2 * 150)
          const b = Math.round(spd < 0.5 ? 200 + spd * 55 : 200 * (1 - (spd - 0.5) * 2))

          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          p.x += u * 1.6
          p.y += v * 1.6
          ctx.lineTo(p.x, p.y)
          ctx.stroke()

          p.age++
          if (p.age > maxAge || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
            p.x = Math.random() * w
            p.y = Math.random() * h
            p.age = 0
          }
        })

        // Legend
        const lgW = 140, lgH = 10, lgX = 12, lgY = h - 28
        const lgGrad = ctx.createLinearGradient(lgX, 0, lgX + lgW, 0)
        lgGrad.addColorStop(0, "rgba(0,180,255,0.9)")
        lgGrad.addColorStop(0.5, "rgba(80,220,80,0.9)")
        lgGrad.addColorStop(1, "rgba(255,60,0,0.9)")
        ctx.fillStyle = lgGrad
        ctx.fillRect(lgX, lgY, lgW, lgH)
        ctx.fillStyle = "rgba(255,255,255,0.75)"
        ctx.font = "10px monospace"
        ctx.fillText("Wind Speed: Low → High", lgX, lgY - 5)

        animFrame = requestAnimationFrame(draw)
      }

      draw()
    }

    init()
    return () => {
      destroyed = true
      if (animFrame !== undefined) cancelAnimationFrame(animFrame)
      map?.remove()
    }
  }, [])

  return <div ref={mapRef} className="w-full h-full" />
}

// ─── Velocity / Ocean Current Map ────────────────────────────────────────────
function VelocityView() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    let L: any
    let map: any
    let animFrame: number | undefined
    let tick = 0
    let destroyed = false

    const init = async () => {
      L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css" as any)

      if (destroyed) return

      // Destroy any existing Leaflet instance on this container
      const el = mapRef.current as any
      if (el && el._leaflet_id) {
        L.map(el).remove()
      }

      map = L.map(mapRef.current!, { center: [20, 0], zoom: 2 })
      map.setMaxBounds([
        [-60, -180],
        [85, 180],
      ]);

      map.options.maxBoundsViscosity = 1.0;

      // Dark base tile with country borders and labels visible
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© CartoDB",
      }).addTo(map)

      // Canvas directly on map container — same fix as WindyView
      const container: HTMLElement = map.getContainer()
      const W = container.clientWidth
      const H = container.clientHeight

      const canvas = document.createElement("canvas")
      canvas.width = W
      canvas.height = H
      Object.assign(canvas.style, {
        position: "absolute", top: "0", left: "0",
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: "500",
      })
      container.appendChild(canvas)

      const ctx = canvas.getContext("2d")!

      const trailLen = 8
      const streaks = Array.from({ length: 500 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        age: Math.random() * 50,
        trail: [] as { x: number; y: number }[],
      }))

      const velAt = (x: number, y: number, t: number) => {
        const cx = W / 2
        const cy = H / 2
        const dx = (x - cx) / cx
        const dy = (y - cy) / cy
        const u = -dy * 1.2 + Math.sin(x * 0.02 + t * 0.01) * 0.8
        const v = dx * 1.2 + Math.cos(y * 0.018 + t * 0.012) * 0.7
        return { u, v }
      }

      const draw = () => {
        tick++
        const w = canvas.width
        const h = canvas.height
        const maxAge = 60

        // Fade trails transparently — destination-out erases instead of painting dark
        ctx.globalCompositeOperation = "destination-out"
        ctx.fillStyle = "rgba(0,0,0,0.14)"
        ctx.fillRect(0, 0, w, h)
        ctx.globalCompositeOperation = "source-over"

        streaks.forEach((s) => {
          const { u, v } = velAt(s.x, s.y, tick)
          s.trail.push({ x: s.x, y: s.y })
          if (s.trail.length > trailLen) s.trail.shift()
          s.x += u * 1.3
          s.y += v * 1.3
          s.age++

          if (s.trail.length >= 2) {
            const speed = Math.sqrt(u * u + v * v)
            const spd = Math.min(speed / 2.5, 1)
            const r = Math.round(80 * (1 - spd))
            const g = Math.round(140 + spd * 100)
            const b = Math.round(200 + spd * 55)
            const alpha = (1 - s.age / maxAge) * 0.75

            ctx.beginPath()
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`
            ctx.lineWidth = 1.5
            ctx.moveTo(s.trail[0].x, s.trail[0].y)
            for (let i = 1; i < s.trail.length; i++) ctx.lineTo(s.trail[i].x, s.trail[i].y)
            ctx.stroke()

            // Arrowhead
            const tip = s.trail[s.trail.length - 1]
            const prev = s.trail[s.trail.length - 2]
            const angle = Math.atan2(tip.y - prev.y, tip.x - prev.x)
            const aw = 5
            ctx.beginPath()
            ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(alpha + 0.2, 1)})`
            ctx.moveTo(tip.x, tip.y)
            ctx.lineTo(tip.x - aw * Math.cos(angle - 0.4), tip.y - aw * Math.sin(angle - 0.4))
            ctx.lineTo(tip.x - aw * Math.cos(angle + 0.4), tip.y - aw * Math.sin(angle + 0.4))
            ctx.closePath()
            ctx.fill()
          }

          if (s.age > maxAge || s.x < 0 || s.x > w || s.y < 0 || s.y > h) {
            s.x = Math.random() * w
            s.y = Math.random() * h
            s.age = 0
            s.trail = []
          }
        })

        ctx.fillStyle = "rgba(80,220,200,0.85)"
        ctx.font = "bold 11px monospace"
        ctx.fillText("⟳ Ocean Current Velocity", 10, h - 12)

        animFrame = requestAnimationFrame(draw)
      }

      draw()
    }

    init()
    return () => {
      destroyed = true
      if (animFrame !== undefined) cancelAnimationFrame(animFrame)
      map?.remove()
    }
  }, [])

  return <div ref={mapRef} className="w-full h-full" />
}
type WeatherData = {
  temp: number;
  wind: number;
};

type Location = {
  lat: number;
  lon: number;
};
// ─── Main Page ────────────────────────────────────────────────────────────────
type MapMode = "static" | "heatmap" | "windy" | "velocity"

export default function SatelliteDetailsPage() {
  const [activeTab, setActiveTab] = useState("orbit")
  const [mapMode, setMapMode] = useState<MapMode>("heatmap")
  const [loading, setLoading] = useState(true)
  const handleHeatmap = () => setMapMode("heatmap")
  const handleWindy = () => setMapMode("windy")
  const handleVelo = () => setMapMode("velocity")
  const [signal, setSignal] = useState(80); // 0-100%
  const [battery, setBattery] = useState(70); // 0-100%
  const [temp, settemp] = useState(10); // Mbps
  const [wallClock, setWallClock] = useState(" ");
  const LOCATIONS = {
  hottest: { lat: 36.46, lon: -116.87, name: "Death Valley" },
  coldest: { lat: -78.46, lon: 106.83, name: "Vostok Station" },
  windiest: { lat: -67.80, lon: 142.67, name: "Commonwealth Bay" },
  calmest: { lat: 0.0, lon: -30.0, name: "Doldrums" },
};
const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  );
  const data = await res.json();

  return {
    temp: data.current_weather.temperature,
    wind: data.current_weather.windspeed,
  };
};
  const dataConfig = {
  heatmap: {
    title: "Temperature",
    unit: "°C",
    legend: [
      { color: "bg-blue-500", label: "Cold" },
      { color: "bg-green-500", label: "Moderate" },
      { color: "bg-red-500", label: "Hot" },
    ],
    extremeLabel: "Hottest",
    extremeValue: "45°C",
    extremePlace: "Sahara",

    secondaryLabel: "Coldest",
    secondaryValue: "-20°C",
    secondaryPlace: "Antarctica",

    userLabel: "Your Location",
    userValue: "32°C",
    userPlace: "Imphal",
  },

  windy: {
    title: "Wind",
    unit: "km/h",
    legend: [
      { color: "bg-gray-400", label: "Low" },
      { color: "bg-blue-400", label: "Moderate" },
      { color: "bg-purple-500", label: "Strong" },
    ],
    extremeLabel: "Most Windy",
    extremeValue: "120 km/h",
    extremePlace: "Pacific Ocean",

    secondaryLabel: "Calmest",
    secondaryValue: "5 km/h",
    secondaryPlace: "Central Africa",

    userLabel: "Your Location",
    userValue: "18 km/h",
    userPlace: "Imphal",
  },

  velocity: {
    title: "Velocity",
    unit: "m/s",
    legend: [
      { color: "bg-yellow-400", label: "Slow" },
      { color: "bg-orange-400", label: "Medium" },
      { color: "bg-red-500", label: "Fast" },
    ],
    extremeLabel: "Fastest",
    extremeValue: "300 m/s",
    extremePlace: "Jet Stream",

    secondaryLabel: "Slowest",
    secondaryValue: "20 m/s",
    secondaryPlace: "Equator",

    userLabel: "Your Location",
    userValue: "80 m/s",
    userPlace: "Imphal",
  },
}
const [config, setConfig] = useState(dataConfig);
const getUserLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      reject
    );
  });
};
const updateDataConfig = async () => {
  try {
    // Fetch all data in parallel ⚡
    const [hot, cold, windy, calm, userLoc] = await Promise.all([
      fetchWeather(LOCATIONS.hottest.lat, LOCATIONS.hottest.lon),
      fetchWeather(LOCATIONS.coldest.lat, LOCATIONS.coldest.lon),
      fetchWeather(LOCATIONS.windiest.lat, LOCATIONS.windiest.lon),
      fetchWeather(LOCATIONS.calmest.lat, LOCATIONS.calmest.lon),
      getUserLocation(),
    ]);

    const userWeather = await fetchWeather(userLoc.lat, userLoc.lon);

    // Update config dynamically
    setConfig((prev) => ({
      ...prev,

      heatmap: {
        ...prev.heatmap,
        extremeValue: `${hot.temp}°C`,
        extremePlace: LOCATIONS.hottest.name,

        secondaryValue: `${cold.temp}°C`,
        secondaryPlace: LOCATIONS.coldest.name,

        userValue: `${userWeather.temp}°C`,
        userPlace: "Your Location",
      },

      windy: {
        ...prev.windy,
        extremeValue: `${windy.wind} km/h`,
        extremePlace: LOCATIONS.windiest.name,

        secondaryValue: `${calm.wind} km/h`,
        secondaryPlace: LOCATIONS.calmest.name,

        userValue: `${userWeather.wind} km/h`,
        userPlace: "Your Location",
      },
    }));
  } catch (err) {
    console.error("Error updating config:", err);
  }
};
useEffect(() => {
  updateDataConfig();

  const interval = setInterval(updateDataConfig, 60000*20); // every 60 sec
  return () => clearInterval(interval);
}, []);
  type MapMode = keyof typeof dataConfig
  const data = config[mapMode]
  // 1. Initialize state with your default "Horizon" data as a fallback
  const [liveSat, setLiveSat] = useState(satellite);
  const [simTime, setSimTime] = useState(Date.now());
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
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mapRef.current) return;

    const map = (mapRef.current as any)._leaflet_map;
    if (!map) return;

    if (mapMode === "heatmap") {
      map.setMinZoom(3);
      map.setMaxZoom(10);
    } else {
      map.setMinZoom(1);  // normal mode
      map.setMaxZoom(18);
    }
  }, [mapMode]);
  useEffect(() => {
    const TICK_MS = 200
    const id = setInterval(() => {
      const now = new Date()
      setWallClock(fmtTime(now))
    }, TICK_MS)

    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    setLoading(true)
    const interval = setInterval(() => {
      setSignal((prev) => smoothRandom(prev, 20, 100, 0.1));
      setBattery((prev) => smoothRandom(prev, 10, 100, 0.005));
      settemp((prev) => smoothRandom(prev, 10, 100, 0.5));
    }, 10000);
    setLoading(false)
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const data = getCachedDebris();

    // 2. Search for "HORIZON" in the cached data
    const found = data.find((s: any) =>
      s.name.trim().toUpperCase().includes("HST")
    );
    if (found) {
      try {
        const satrec = satelliteLib.twoline2satrec(found.line1, found.line2);
        const now = new Date(simTime);
        const gmst = satelliteLib.gstime(now);
        const pv = satelliteLib.propagate(satrec, now);

        if (pv && pv.position && pv.velocity) {
          // Calculate Altitude (Height above ellipsoid)
          const geo = satelliteLib.eciToGeodetic(pv.position as satelliteLib.EciVec3<number>, gmst);

          // Calculate Period from Mean Motion (no_kozai is rad/min)
          const periodMinutes = (2 * Math.PI) / satrec.no;

          // Calculate Inclination (Convert radians to degrees)
          const inclinationDeg = (satrec.inclo * 180) / Math.PI;

          // Calculate Range (Magnitude of position vector from Earth center)
          const rangeKm = Math.sqrt(
            Math.pow(pv.position.x, 2) +
            Math.pow(pv.position.y, 2) +
            Math.pow(pv.position.z, 2)
          );

          setLiveSat({
            ...satellite,
            name: found.name,
            line1: found.line1,
            line2: found.line2,
            stats: {
              altitude: { value: +geo.height.toFixed(1), unit: "km" },
              inclination: { value: +inclinationDeg.toFixed(1), unit: "°" },
              period: { value: +periodMinutes.toFixed(1), unit: "min" },
              range: { value: Math.round(rangeKm), unit: "km" },
            }
          });
        }
      } catch (err) {
        console.error("Orbit calculation error:", err);
      }
    }
  }, [simTime]);
  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"))
    }, 200)
  }, [activeTab])
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500)
    return () => clearTimeout(timer)
  }, [])
  return (
    <>
      <AnimatePresence>
        {loading && <SatelliteLoader />}
      </AnimatePresence>
      {!loading && (
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar user={{ name: "Maya Ortega" }} />

          <main className="flex-1 flex flex-col">
            <div className="flex flex-col lg:flex-row flex-1">
              {/* Left - Map View - Reduced Height */}
              <div className="w-full lg:w-1/2 relative border-b lg:border-b-0 lg:border-r border-border">
                <div className="h-[250px] sm:h-[300px] lg:h-[450px] bg-muted overflow-hidden lg:sticky lg:top-0">
                  {(mapMode === "heatmap") && (
                    <div className="w-full h-full relative">
                       <HeatmapViewWrapper />
                      <div className="absolute top-3 left-3 z-[50] bg-black/70 text-orange-400 text-[10px] font-mono px-2 py-1 rounded">
                        Population Heat Distribution
                      </div>
                    </div>
                  )}

                  {mapMode === "windy" && (
                    <div className="w-full h-full relative">
                      <WindyView />
                      <div className="absolute top-3 left-3 z-[50] bg-black/70 text-cyan-400 text-[10px] font-mono px-2 py-1 rounded">
                        Global Wind Patterns
                      </div>
                    </div>
                  )}

                  {mapMode === "velocity" && (
                    <div className="w-full h-full relative">
                      <VelocityView />
                      <div className="absolute top-3 left-3 z-[50] bg-black/70 text-teal-400 text-[10px] font-mono px-2 py-1 rounded">
                        Ocean Current Velocity
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-full bg-white/60 backdrop-blur-xl border border-white/50 rounded-xl p-3.5 space-y-3 shadow-2xl transition-all duration-300">

                  {/* Header Section - Compact */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 bg-blue-500 rounded-full" />
                      <h2 className="text-[10px] font-bold tracking-[0.1em] uppercase text-black/90">
                        {data.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Live</span>
                    </div>
                  </div>

                  {/* Legend - Single Line Scrollable */}
                  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                    {data.legend.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 shrink-0 text-[13px] text-black/90">
                        <div className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_5px_currentColor]`} />
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {/* Divider - Ultra Thin */}
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Stats Grid - Lower Height Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Extreme Card */}
                    <div className="bg-orange-500 rounded-lg p-3.5 border border-black/50 min-w-0">
                      <p className="text-[9px] font-bold tracking-widest text-black/90 uppercase mb-1">
                        {data.extremeLabel}
                      </p>

                      <div className="flex flex-wrap items-baseline gap-1">
                        <p className="text-sm font-mono font-bold text-white leading-none">
                          {data.extremeValue}
                        </p>

                        <p className="text-[14px] text-white">
                          {data.extremePlace}
                        </p>
                      </div>
                    </div>

                    {/* Secondary Card */}
                    <div className="bg-blue-400 rounded-lg p-2.5 border border-white/50">
                      <p className="text-[9px] font-bold tracking-widest text-black/90 uppercase mb-1">
                        {data.secondaryLabel}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-sm font-mono font-bold text-white leading-none">
                          {data.secondaryValue}
                        </p>
                        <p className="text-[14px] text-white/80 truncate max-w-[80px]">
                          {data.secondaryPlace}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Focus User Section - Slimmer Version */}
                  <div className="br-green-400 relative overflow-hidden rounded-lg p-2.5 bg-gradient-to-r from-blue-600/15 to-emerald-500/10 border border-blue-500/60">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black tracking-widest text-blue/90-400 uppercase">
                          {data.userLabel}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-[#3250a8] tracking-tight leading-none">
                            {data.userValue}
                          </p>
                          <span className="text-[14px] font-medium text-[#3250a8] truncate max-w-[80px]">
                            ({data.userPlace})
                          </span>
                        </div>
                      </div>

                      {/* Dynamic Waveform Placeholder */}
                      <div className="flex items-center gap-0.5 h-4">
                        {[30, 80, 45, 90, 55, 70].map((h, i) => (
                          <div
                            key={i}
                            className="w-0.5 bg-blue-500/30 rounded-full animate-pulse"
                            style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Minimal ID Tag */}
                  <div className="flex justify-between items-center text-[8px] font-mono text-white/10 uppercase">
                    <span>SNC-SYNC-04B</span>
                    <span className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-white/20 rounded-full" />
                      Orbital Track Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Right - Details Panel */}
              <div className="w-full lg:w-1/2 flex flex-col">
                <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                  {/* Satellite Header */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-[oklch(0.55_0.15_250)] to-[oklch(0.65_0.15_190)] flex items-center justify-center">
                        <Satellite className="h-6 w-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="text-xl font-bold text-foreground truncate">{liveSat.name}</h1>
                          <div className="flex gap-1">
                            <Badge variant="secondary" className="text-[10px]">NORAD {liveSat.noradId}</Badge>
                            <Badge className="bg-[oklch(0.6_0.18_145)] text-white text-[10px]">{liveSat.status}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {satellite.type} · Launched {satellite.launchDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-[10px] uppercase text-muted-foreground">Altitude</p>
                      <p className="text-base font-bold text-foreground">{liveSat.stats.altitude.value}</p>
                      <p className="text-[10px] text-muted-foreground">{liveSat.stats.altitude.unit}</p>
                    </div>
                    <div className="bg-[oklch(0.65_0.15_190)]/10 rounded-lg p-3">
                      <p className="text-[10px] uppercase text-muted-foreground">Inclination</p>
                      <p className="text-base font-bold text-[oklch(0.65_0.15_190)]">{liveSat.stats.inclination.value}</p>
                      <p className="text-[10px] text-muted-foreground">{liveSat.stats.inclination.unit}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-[10px] uppercase text-muted-foreground">Period</p>
                      <p className="text-base font-bold text-foreground">{liveSat.stats.period.value}</p>
                      <p className="text-[10px] text-muted-foreground">{liveSat.stats.period.unit}</p>
                    </div>
                    <div className="bg-[oklch(0.65_0.18_45)]/10 rounded-lg p-3">
                      <p className="text-[10px] uppercase text-muted-foreground">Range</p>
                      <p className="text-base font-bold text-[oklch(0.65_0.18_45)]">{liveSat.stats.range.value}</p>
                      <p className="text-[10px] text-muted-foreground">{liveSat.stats.range.unit}</p>
                    </div>
                  </div>

                  {/* Tabs with Fixed Min-Height for Layout Stability */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-3 sm:flex sm:justify-start h-auto p-1 bg-muted/50">
                      <TabsTrigger value="orbit" className="text-xs py-2">Orbit</TabsTrigger>
                      <TabsTrigger value="passes" className="text-xs py-2">Passes</TabsTrigger>
                      <TabsTrigger value="telemetry" className="text-xs py-2">Telemetry</TabsTrigger>
                    </TabsList>

                    <div className="min-h-[280px]">
                      <TabsContent value="orbit" className="mt-4 focus-visible:outline-none">
                        <div className="bg-card rounded-lg border border-border p-4">
                          <div className="flex flex-col gap-6">
                            <div className="shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-[oklch(0.55_0.15_250)]/20 to-[oklch(0.65_0.15_190)]/20 flex items-center justify-center relative">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[oklch(0.55_0.15_250)] to-[oklch(0.6_0.18_145)] opacity-30 animate-pulse" />
                              <div className="absolute w-3 h-3 rounded-full bg-[oklch(0.55_0.15_250)] top-4 right-6 shadow-[0_0_8px_rgba(0,0,0,0.2)]" />
                            </div>
                            <div className="flex-1 w-full space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-[10px] uppercase text-muted-foreground">Anomaly</p>
                                  <p className="font-semibold text-[oklch(0.6_0.18_145)]">{satellite.orbit.anomaly}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase text-muted-foreground">Decay</p>
                                  <p className="font-semibold text-foreground">{satellite.orbit.decayRisk}</p>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-border">
                                <p className="text-[10px] uppercase text-muted-foreground">Next Station</p>
                                <p className="font-medium text-foreground text-sm">
                                  <span className="text-[oklch(0.55_0.15_250)]">{satellite.orbit.nextGroundStation}</span>
                                  <span className="text-muted-foreground mx-1">at</span>
                                  {satellite.orbit.nextPassTime}
                                </p>
                              </div>
                            </div>

                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="passes" className="mt-4 focus-visible:outline-none">
                        <div className="space-y-3 h-[240px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border  [&::-webkit-scrollbar]:hidden">
                          {upcomingPasses.map((pass, index) => (
                            <PassCard
                              key={index}
                              satelliteName={satellite.name}
                              tle1={satellite.line1}
                              tle2={satellite.line2}
                              date={pass.date}
                              startTime={pass.startTime}
                              endTime={pass.endTime}
                              elevation={pass.elevation}
                              azimuth={pass.azimuth}
                              confidence={pass.confidence}
                              imageUrl="https://thumbs.dreamstime.com/b/colorful-world-map-illustrating-geographical-features-403046639.jpg?w=992"
                            />
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="telemetry" className="mt-4 focus-visible:outline-none">
                        <div className="space-y-4">
                          <p className="text-xs font-medium text-muted-foreground">Real-time Telemetry Snapshot</p>
                          <div className="flex flex-row gap-3 overflow-x-auto pb-4 no-scrollbar">
                            <div className="flex-1 min-w-[140px]">
                              <TelemetryGauge
                                label="Battery"
                                value={battery.toFixed(0)}
                                unit={"%"}
                                updatedAt={` at ${wallClock} UTC`}
                                icon={<Battery className="h-6 w-6" />}
                              />
                            </div>
                            <div className="flex-1 min-w-[140px]">
                              <TelemetryGauge
                                label="Temp"
                                value={-temp.toFixed(1)}
                                unit={satellite.telemetry.temperature.unit}
                                updatedAt={` at ${wallClock} UTC`}
                                icon={<Thermometer className="h-6 w-6" />}
                              />
                            </div>
                            <div className="flex-1 min-w-[140px]">
                              <TelemetryGauge
                                label="Signal"
                                value={-signal.toFixed(2)}
                                unit={satellite.telemetry.signal.unit}
                                updatedAt={` at ${wallClock} UTC`}
                                icon={<Signal className="h-6 w-6" />}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4">
                    <Button
                      onClick={handleHeatmap}
                      className={cn(
                        "flex-1 min-w-[100px] transition-all text-xs py-5",
                        mapMode === "heatmap"
                          ? "bg-orange-500 hover:bg-orange-600 text-white ring-2 ring-orange-400/50"
                          : "bg-[oklch(0.55_0.15_250)] hover:bg-[oklch(0.5_0.15_250)] text-white"
                      )}
                    >
                      {mapMode === "heatmap" ? "✕ Heatmap" : "Heatmap"}
                    </Button>
                    <Button
                      onClick={handleWindy}
                      className={cn(
                        "flex-1 min-w-[100px] transition-all text-xs py-5",
                        mapMode === "windy"
                          ? "bg-orange-500 hover:bg-orange-600 text-white ring-2 ring-orange-400/50"
                          : "bg-[oklch(0.55_0.15_250)] hover:bg-[oklch(0.5_0.15_250)] text-white"
                      )}
                    >
                      {mapMode === "windy" ? "✕ Windy" : "Windy"}
                    </Button>
                    <Button
                      onClick={handleVelo}
                      className={cn(
                        "flex-1 min-w-[100px] transition-all text-xs py-5",
                        mapMode === "velocity"
                          ? "bg-orange-500 hover:bg-orange-600 text-white ring-2 ring-orange-400/50"
                          : "bg-[oklch(0.55_0.15_250)] hover:bg-[oklch(0.5_0.15_250)] text-white"
                      )}
                    >
                      {mapMode === "velocity" ? "✕ Velocity" : "Velocity"}
                    </Button>
                  </div>

                  {/* Footer Info */}
                  <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row justify-between gap-2 text-[10px] text-muted-foreground">
                    <p>NORAD ID: {satellite.noradId} · Operator: {satellite.operator}</p>
                    <p>Launched: {satellite.launchDate} · Mission: {satellite.missionType}</p>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      )}
    </>

  )
}