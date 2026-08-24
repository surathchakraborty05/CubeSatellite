// page.tsx
"use client"
import * as satellite from "satellite.js"
import { getLatestSatellite } from "@/utils/Satellitefetcher";
import { useState, useEffect, useRef, ChangeEvent } from "react"
import Link from "next/link"
import { Navbar, Footer, StatCard, PassCard, QuickAction } from "@/components/orbital"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import "leaflet/dist/leaflet.css"
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import {
  Satellite,
  Play,
  RefreshCw,
  Star,
  Search,
  MapPin,
  LocateFixedIcon,
  Moon,
  Sun,
} from "lucide-react"

type SatelliteType = {
  name: string
  type: string
  line1: string
  line2: string
  satelliteId?: number
  lat?: number
  lng?: number
  height?: number
}

function fmt2(n: number) { return String(n).padStart(2, "0") }
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${fmt2(d.getMonth() + 1)}-${fmt2(d.getDate())} ` +
    `${fmt2(d.getHours())}:${fmt2(d.getMinutes())}:${fmt2(d.getSeconds())}`
}
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
function getVelocity(satrec: any, time: Date) {
  const pv = satellite.propagate(satrec, time)
  if (!pv?.velocity) return 0

  const vx = pv.velocity.x
  const vy = pv.velocity.y
  const vz = pv.velocity.z

  return Math.sqrt(vx * vx + vy * vy + vz * vz)
}

// ─── Loader ───────────────────────────────────────────────────────────────────
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
        <div style={{ position: "relative", width: 240, height: 240, marginBottom: 48 }}>

          {/* SVG rings */}
          <svg
            width="240" height="240"
            viewBox="0 0 240 240"
            style={{ position: "absolute", inset: 0 }}
          >
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
            <line x1="120" y1="10" x2="120" y2="230" stroke="#10b981" strokeOpacity={0.2} strokeWidth="0.5" />
            <line x1="10" y1="120" x2="230" y2="120" stroke="#10b981" strokeOpacity={0.2} strokeWidth="0.5" />
          </svg>

          {/* Rotating sweep */}
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

const MapComponent = () => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!mapContainer.current) return

    import("leaflet").then((L) => {
      if (map.current) return

      try {
        L.Icon.Default.mergeOptions({
          iconUrl: "/image.png",
          iconRetinaUrl: "/image.png",
          shadowUrl: "",
        })

        map.current = L.map(mapContainer.current!).setView([19.5, -155.6], 4)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map.current)

        L.marker([19.5, -155.6])
          .addTo(map.current)
          .bindPopup("Mauna Loa<br>19.5°N, 155.6°W")

        setTimeout(() => {
          if (map.current) {
            map.current.invalidateSize()
          }
        }, 300)

        setIsLoading(false)
      } catch (err) {
        console.error("Leaflet initialization failed:", err)
        setIsLoading(false)
      }
    }).catch(err => {
      console.error("Failed to import Leaflet:", err)
      setIsLoading(false)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  return (
    <div
      ref={mapContainer}
      style={{
        height: "300px",
        width: "100%",
        backgroundColor: "#f0f0f0",
      }}
    >
      {isLoading && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          color: "#666",
        }}>
          Loading map...
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [copied, setCopied] = useState(false)
  const [mapLoading, setMapLoading] = useState(true)
  const [Satellites, setSatellites] = useState<SatelliteType[]>([]);
  const router = useRouter();
  useEffect(() => {
    const loadSatellites = async () => {
      const data = await getLatestSatellite();
      setSatellites(data);
    };

    loadSatellites();
  }, []);
  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);
  const [currentSat, setCurrentSat] = useState<SatelliteType | null>(null)
  const [nextPassTime, setNextPassTime] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [passes, setVisibleSatellites] = useState<any[]>([])
  const [wallClock, setWallClock] = useState("")
  // const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [eta, setEta] = useState<string>("calculating...")
  const [isTracking, setIsTracking] = useState(false)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const L = useRef<any>(null)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [suggestions, setSuggestions] = useState<SatelliteType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return next;
    });
  };

  const handleSearchClick = () => {
    // 1. Smoothly scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // 2. Focus the input box once the scroll begins
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // Small delay to wait for scroll initiation
  };
  useEffect(() => {

    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter logic
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 0) {
      const filtered = Satellites.filter(sat =>
        sat.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSatellite = (sat: SatelliteType) => {
    setSearchQuery(sat.name);
    setShowSuggestions(false);

    const params = new URLSearchParams({
      name: sat.name,
      tle1: sat.line1,
      tle2: sat.line2
    });

    router.push(`/map-viewer?${params.toString()}`);
  };

  async function reverseGeocode(lat: number, lng: number, satName: string) {
    const storageKey = `geo_${satName}`;
    const cached = localStorage.getItem(storageKey);

    if (cached) {
      const { city, timestamp } = JSON.parse(cached);
      const oneHour = 60 * 60 * 1000;

      if (Date.now() - timestamp < oneHour) {
        return { city };
      }
    }

    const res = await fetch(`/api/reverse?lat=${lat}&lon=${lng}`);

    if (res.ok) {
      const data = await res.json();
      const cityName =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.state ||
        "Ocean";

      localStorage.setItem(
        storageKey,
        JSON.stringify({ city: cityName, timestamp: Date.now() })
      );

      return { city: cityName };
    }

    return { city: "Ocean" };
  }

  // ✅ FIXED: Proper map initialization with marker
  useEffect(() => {
    if (!currentSat) return
    setMapLoading(true);
    const initializeMap = async () => {
      try {
        // Dynamic import
        const Leaflet = await import("leaflet")
        L.current = Leaflet.default || Leaflet

        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }

        const mapContainer = document.getElementById("mini-map-container")
        if (!mapContainer) return

        // Create map instance
        mapRef.current = L.current.map(mapContainer, {
          center: [20, 0],
          zoom: 3,
          zoomControl: true,
          attributionControl: true,
        })

        // Add tile layer
        const tileLayer = L.current.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
          }
        )

        // 👇 IMPORTANT: wait for tiles to load
        tileLayer.on("load", () => {
          setMapLoading(false)
        })

        tileLayer.addTo(mapRef.current)

        // ✅ Create custom icon for satellite
        const satelliteIcon = L.current.icon({
          iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Ccircle cx='15' cy='15' r='12' fill='%2310b981' opacity='0.8'/%3E%3Ccircle cx='15' cy='15' r='6' fill='%2334d399'/%3E%3C/svg%3E",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15],
        })

        // Get initial satellite position
        const satrec = satellite.twoline2satrec(currentSat.line1, currentSat.line2)
        const now = new Date()
        const pv = satellite.propagate(satrec, now)

        if (pv?.position) {
          const gmst = satellite.gstime(now)
          const geo = satellite.eciToGeodetic(pv.position, gmst)
          const lat = satellite.degreesLat(geo.latitude)
          const lng = satellite.degreesLong(geo.longitude)

          // ✅ Create marker with custom icon
          markerRef.current = L.current.marker([lat, lng], { icon: satelliteIcon })
            .addTo(mapRef.current)
            .bindPopup(`${currentSat.name}<br/>Lat: ${lat.toFixed(2)}°<br/>Lon: ${lng.toFixed(2)}°`)

          // Initial center
          mapRef.current.setView([lat, lng], 3)
        }

        // Trigger resize
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
          }
        }, 100)

      } catch (err) {
        console.error("Map initialization error:", err)
      }
    }

    initializeMap()
    return () => {
      // Cleanup
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [currentSat])
  const handleSaveReplay = async () => {
    try {
      const replay = {
        name: currentSat?.name,
        line1: currentSat?.line1,
        line2: currentSat?.line2,
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
  // ✅ FIXED: Update marker position and map center on tracking
  useEffect(() => {
    if (!currentSat || !mapRef.current || !markerRef.current) return

    const satrec = satellite.twoline2satrec(currentSat.line1, currentSat.line2)

    const updateInterval = setInterval(() => {
      const now = new Date()
      const pv = satellite.propagate(satrec, now)

      if (!pv?.position) return

      const gmst = satellite.gstime(now)
      const geo = satellite.eciToGeodetic(pv.position, gmst)

      const lat = satellite.degreesLat(geo.latitude)
      const lng = satellite.degreesLong(geo.longitude)

      // ✅ Update marker position
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
        markerRef.current.setPopupContent(
          `${currentSat.name}<br/>Lat: ${lat.toFixed(2)}°<br/>Lon: ${lng.toFixed(2)}°`
        )
      }

      // ✅ If tracking is ON, follow the satellite
      if (isTracking && mapRef.current) {
        mapRef.current.panTo([lat, lng])
      }
    }, 1000)

    return () => clearInterval(updateInterval)
  }, [currentSat, isTracking])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        console.error("Geolocation error:", err);
        alert(err.message);
      },
      { enableHighAccuracy: true }
    )
    const id = setInterval(() => setWallClock(fmtDate(new Date())), 1000)
    return () => clearInterval(id)
  }, [])

  function getNextPass(sat: SatelliteType, userLat: number, userLng: number): Date | null {
    const satrec = satellite.twoline2satrec(sat.line1, sat.line2)
    const now = new Date()
    for (let i = 0; i < 180; i++) {
      const time = new Date(now.getTime() + i * 60_000)
      const pv = satellite.propagate(satrec, time)
      if (!pv?.position) continue
      const gmst = satellite.gstime(time)
      const geo = satellite.eciToGeodetic(pv.position, gmst)
      const dist = getDistance(userLat, userLng, satellite.degreesLat(geo.latitude), satellite.degreesLong(geo.longitude))
      if (dist < 7000) return time
    }
    return new Date(now.getTime() + 10 * 60 * 1000)
  }
  // : Promise<(SatelliteType & { lat: number; lng: number; height: number }) | null>

  // Replace findNearestSatellite with this progressive version
  async function findNearestSatellite(
    sats: SatelliteType[],
    userLat: number,
    userLng: number
  ) {
    let minDist = Infinity
    let nearest: any = null
    const observerGd = {
      latitude: satellite.degreesToRadians(userLat),
      longitude: satellite.degreesToRadians(userLng),
      height: 0,
    }

    // ✅ STEP 1: Compute all positions synchronously (no API calls yet)
    // This is fast — pure math. Show nearest satellite immediately.
    const computed = sats.map((sat) => {
      const satrec = satellite.twoline2satrec(sat.line1, sat.line2)
      const now = new Date()
      const pv = satellite.propagate(satrec, now)
      if (!pv?.position) return null

      const gmst = satellite.gstime(now)
      const geo = satellite.eciToGeodetic(pv.position, gmst)
      const lat = satellite.degreesLat(geo.latitude)
      const lng = satellite.degreesLong(geo.longitude)
      const dist = getDistance(userLat, userLng, lat, lng)

      const positionEcf = satellite.eciToEcf(pv.position, gmst)
      const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf)
      const elevation = satellite.degreesLat(lookAngles.elevation)

      return { sat, lat, lng, height: geo.height, dist, elevation }
    }).filter(Boolean) as any[]

    // ✅ STEP 2: Find nearest and set it immediately (unblocks map + stats)
    for (const item of computed) {
      if (item.dist < minDist) {
        minDist = item.dist
        nearest = { ...item.sat, lat: item.lat, lng: item.lng, height: item.height }
      }
    }

    if (nearest) {
      setCurrentSat(nearest)  // ← unblocks map render immediately
      setNextPassTime(getNextPass(nearest, userLat, userLng))
    }

    // ✅ STEP 3: Hide loader as soon as we have the nearest satellite
    setLoading(false)

    // ✅ STEP 4: Geocode visible satellites one-by-one, updating the list progressively
    for (const item of computed) {
      if (item.dist >= 10000) continue

      // Add a placeholder entry immediately (no city yet)
      setVisibleSatellites(prev => {
        const exists = prev.find(p => p.name === item.sat.name)
        if (exists) return prev
        return [...prev, {
          name: item.sat.name,
          line1: item.sat.line1,
          line2: item.sat.line2,
          latitude: item.lat,
          longitude: item.lng,
          height: item.height,
          city: "Locating...",
          elevation: item.elevation.toFixed(2),
        }]
      })

      // Then fetch the real city name and update that entry
      reverseGeocode(item.lat, item.lng, item.sat.name).then((place) => {
        setVisibleSatellites((prev) =>
          prev.map((p) => (p.name === item.sat.name ? { ...p, city: place.city } : p))
        );
      });
    }
  }
  useEffect(() => {
    if (!userLocation) return
    // No setLoading(true) needed here — starts true by default
    findNearestSatellite(Satellites, userLocation.lat, userLocation.lng)
  }, [userLocation])
  const handleManualRefresh = () => {
    setLoading(true)
    try { window.location.reload() }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  // ✅ FIXED: Center button - properly centers the map on satellite
  const handleCenterMap = () => {
    if (!currentSat || !mapRef.current) return

    const satrec = satellite.twoline2satrec(currentSat.line1, currentSat.line2)
    const now = new Date()
    const pv = satellite.propagate(satrec, now)

    if (!pv?.position) return

    const gmst = satellite.gstime(now)
    const geo = satellite.eciToGeodetic(pv.position, gmst)

    const lat = satellite.degreesLat(geo.latitude)
    const lng = satellite.degreesLong(geo.longitude)

    // ✅ Use flyTo for smooth animation
    mapRef.current.flyTo([lat, lng], 5, {
      duration: 1.5,
      easeLinearity: 0.25,
    })
  }

  useEffect(() => {
    if (!userLocation) return
    findNearestSatellite(Satellites, userLocation.lat, userLocation.lng)
  }, [userLocation])

  useEffect(() => {
    if (!nextPassTime || !currentSat || !userLocation) return

    const satrec = satellite.twoline2satrec(currentSat.line1, currentSat.line2)

    const interval = setInterval(() => {
      const now = Date.now()

      const diff = nextPassTime.getTime() - now

      if (diff <= 0) {
        setEta("Visible Now ")
      } else {
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        setEta(`${mins}m ${secs}s`)
      }

      const pv = satellite.propagate(satrec, new Date())
      if (!pv?.position) return

      const gmst = satellite.gstime(new Date())
      const geo = satellite.eciToGeodetic(pv.position, gmst)

      const dist = getDistance(
        userLocation.lat,
        userLocation.lng,
        satellite.degreesLat(geo.latitude),
        satellite.degreesLong(geo.longitude)
      )

      setIsVisible(dist < 80000)

    }, 1000)
    return () => clearInterval(interval)
  }, [nextPassTime, currentSat])

  return (
    <>
      <AnimatePresence>
        {loading && <SatelliteLoader />}
      </AnimatePresence>

      {!loading && (
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar user={{ name: "Maya Ortega", role: "Operator" }} />
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

          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 md:py-6 overflow-x-hidden">
            {/* Header: Stacks on mobile, side-by-side on lg screens */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0 shadow-sm">
                  <Satellite className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground leading-tight">
                    CubeSatellite{" "}
                    <span className="text-muted-foreground font-normal block sm:inline">— Mission Dashboard</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">Connected · Global Constellation Overview</p>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0">
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">UTC Time</p>
                  <p className="text-lg font-mono font-semibold text-foreground whitespace-nowrap">{wallClock}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={toggleTheme} className="h-9 w-9  text-xs sm:text-sm font-medium
             text-foreground border-border 
             hover:bg-accent hover:text-accent-foreground
             dark:hover:text-white dark:hover:bg-white/10 dark:border-white
             transition-all duration-200">
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" className="bg-[oklch(0.65_0.15_190)] text-white hover:bg-[oklch(0.6_0.15_190)] px-4 py-4.5">Live</Button>
                  <Button
                    className={`flex-1 text-xs sm:text-sm font-medium dark:hover:text-white dark:hover:bg-orange-500 dark:border-white hover:bg-accent hover:text-accent-foreground transition-all duration-300
    ${copied
                        ? "!bg-emerald-600 hover:!bg-emerald-500 text-white"
                        : "dark:hover:text-white dark:hover:bg-orange-500 dark:text-white dark:border-white hover:bg-accent hover:text-accent-foreground"
                      }
  `}
                    onClick={handleSaveReplay}
                  >
                    {copied ? "Copied Replay" : "Copy Replay"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Row: 2 columns on mobile, 5 columns on lg screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-wrap gap-4 mb-8">
              <StatCard label="Uptime" value="99.98" unit="%" variant="accent" size="sm" />
              <StatCard label="Satellites Visible" value={passes.length} variant="primary" size="sm" />
              <StatCard label="Next Visibility" value={eta || "calculating.."} variant="muted" size="sm" />
              <div className="col-span-1">
                <StatCard label="Nearest Satellite" value={currentSat?.name || "Loading..."} variant="muted" size="sm" />
              </div>
              <div className="col-span-2 md:col-span-1 lg:flex-1 min-w-[100px]">
                <div className="relative flex items-center dark:border-white">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    placeholder="Search satellites..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                    className="pl-10 h-9 md:h-10"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#c9d8f0] border border-slate-800 rounded-lg shadow-2xl z-[9999] overflow-hidden">
                      <ul className="max-h-60 overflow-y-auto">
                        {suggestions.map((sat) => (
                          <li
                            key={sat.name}
                            onClick={() => handleSelectSatellite(sat)}
                            className="px-4 py-3 hover:bg-blue-600/20 cursor-pointer text-sm text-slate-800 border-b border-slate-800/50 last:border-none transition-colors"
                          >
                            <div className="font-bold">{sat.name}</div>
                            {/* <div className="text-[10px] text-slate-600 font-mono">ID: {sat.satelliteId}</div> */}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Active Satellites Card */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active Satellites</p>
                      <p className="text-4xl font-bold text-foreground tracking-tight">{Satellites.length}</p>
                      <p className="text-sm text-[oklch(0.65_0.18_45)] mt-1 font-medium">In sunlight & tracked</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Network Health</p>
                      <p className="text-lg font-semibold text-[oklch(0.6_0.18_145)]">Nominal</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-widest">Orbital Ticker</p>
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                      {Satellites.map((sat) => (
                        <div key={sat.name} className="flex-shrink-0 px-4 py-2 bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors cursor-default">
                          <span className="text-sm font-semibold text-foreground">{sat.name}</span>
                        </div>
                      ))}
                      <div className="flex-shrink-0 px-4 py-2 bg-[oklch(0.65_0.15_190)]/10 text-[oklch(0.65_0.15_190)] rounded-lg border border-[oklch(0.65_0.15_190)]/20 text-sm font-bold">
                        LIVE
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Passes Card */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col h-[600px] lg:h-[500px]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2 shrink-0">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pass Schedule</p>
                      <h2 className="text-xl font-bold text-[oklch(0.55_0.15_250)]">Imminent Visible Overpasses</h2>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">Update: {wallClock}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {passes.length > 0 ? passes.map((pass) => (
                      <PassCard
                        key={pass.name}
                        satelliteName={pass.name}
                        tle1={pass.line1}
                        tle2={pass.line2}
                        date=""
                        startTime=""
                        endTime=""
                        location={pass.city}
                        elevation={Number(pass.elevation)}
                        eta={pass.eta}
                        variant={isDarkMode ? "dark" : "light"}
                        onJumpTo={() => console.log("Jump to", pass.name)}
                        onAddMarker={() => console.log("Add marker", pass.name)}
                      />
                    )) : (
                      <div className="relative h-full flex items-center justify-center overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800">

                        <div className="absolute inset-0 shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm"></div>

                        <span className="relative z-10 text-muted-foreground text-sm italic">
                          Scanning horizon for upcoming passes...
                        </span>

                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-border shrink-0">
                    <Link href="/map-viewer">
                      <Button
                        variant="outline"
                        className="w-full text-xs sm:text-sm font-medium
             text-foreground border-border
             hover:bg-accent hover:text-accent-foreground
             dark:hover:bg-orange-500 dark:border-white dark:hover:text-white
             transition-all duration-200"
                      >
                        Map
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full text-xs sm:text-sm font-medium
             text-foreground border-border
             hover:bg-accent hover:text-accent-foreground
             dark:hover:bg-orange-500 dark:border-white dark:hover:text-white
             transition-all duration-200"
                      onClick={handleSearchClick}
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Quick Map Card */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Telemetry</p>
                      <h3 className="font-bold text-foreground">Live Satellite Tracker</h3>
                    </div>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">3x Zoom</span>
                  </div>

                  <div className="relative w-full h-[280px] lg:h-[300px] rounded-lg overflow-hidden border border-border mb-4 bg-muted">

                    {/* 🔹 Skeleton Overlay */}
                    {mapLoading && (
                      <div className="absolute inset-0 z-10 overflow-hidden bg-gray-200 dark:bg-gray-800">

                        {/* Shimmer */}
                        <div className="absolute inset-0 shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                        {/* Optional text */}
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm italic">
                          Loading map...
                        </div>

                      </div>
                    )}

                    {/* 🔹 Actual Map */}
                    <div
                      id="mini-map-container"
                      className="w-full h-full "
                    />

                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg mb-4">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-foreground truncate">{currentSat?.name || "Initializing..."}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        LAT: {currentSat?.lat?.toFixed(4) || "Calculating"}°<br />
                        LON: {currentSat?.lng?.toFixed(4) || "Calculating"}°
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm font-medium
             text-foreground border-border
             hover:bg-accent hover:text-accent-foreground
             dark:hover:bg-orange-500 dark:border-white dark:hover:text-white
             transition-all duration-200" asChild>
                      <Link href="/map-viewer">Full Viewer</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs sm:text-sm font-medium
             text-foreground border-border
             hover:bg-accent hover:text-accent-foreground
             dark:hover:bg-orange-500 dark:border-white dark:hover:text-white
             transition-all duration-200"
                      onClick={handleCenterMap}
                    >
                      Center Lock
                    </Button>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <div className="mb-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Control Center</p>
                    <h3 className="font-bold text-foreground">Mission Commands</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <QuickAction
                      label={isTracking ? "Lock On" : "Track"}
                      icon={LocateFixedIcon}
                      variant={isTracking ? "primary" : "secondary"}
                      onClick={() => setIsTracking(prev => !prev)}
                    />
                    <QuickAction label="Play Orbit" icon={Play} variant="primary" onClick={() => { }} />
                    <QuickAction label="Sync Link" icon={RefreshCw} variant="secondary" onClick={handleManualRefresh} />
                   <QuickAction label="Markers" icon={Star} variant="secondary" onClick={() => { router.push("/profile")}} />
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