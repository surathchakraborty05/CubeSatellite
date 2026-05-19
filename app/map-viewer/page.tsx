"use client"
import { useState, useRef, useEffect } from "react"
import * as satellite from "satellite.js"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { InstrumentPanel, Timeline, QuickAction } from "@/components/orbital"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { User } from "firebase/auth";
import { getLatestSatellite } from "@/utils/Satellitefetcher";
import { SATELLITE_DATA as fallbackData } from '@/data/satellitedata';
import { getLatestDebris } from "@/utils/Debrisfetcher";
import { useTheme } from "../context/ThemeContext"
import { useDistanceUnit } from "../context/DistanceUnitContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  FaUserCircle,
} from "react-icons/fa";
import {
  Satellite,
  Search,
  Layers,
  Maximize2,
  User2Icon,
  Play,
  Download,
  Settings,
  LocateFixed,
  Pause,
  CheckCircle,
  Copy,
  CopyIcon,
  ArrowLeft,
  Sun,
  Moon
} from "lucide-react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
const smoothRandom = (current: number, min: number, max: number, maxDelta: number) => {
  const delta = (Math.random() * 2 - 1) * maxDelta; // random change between -maxDelta to +maxDelta
  let next = current + delta;
  if (next > max) next = max;
  if (next < min) next = min;
  return next;
};
const MapComponent = dynamic(() => import("@/components/orbital/Mapcomponent"), {
  ssr: false,
})
const activeSatellites = []

const defaultSatellite = {
  name: "Horizon-3",
  designation: "HZN-3",
  altitude: 420,
  orbitType: "LEO",
  velocity: 7.66,
  nextPass: "In 12m 34s",
  heading: "NE • 63°",
  telemetry: {
    signalStrength: "-65 dBm",
    battery: "78%",
    dataRate: "2.4 Mbps",
  },
  line1: "1 25544U 98067A   26080.51758049  .00014080  00000+0  26848-3 0  9998",
  line2: "2 25544  51.6347  13.8885 0006310 215.8915 144.1650 15.48422342558163"
}
interface SatelliteDisplay {
  name: string;
  altitude: number;
  type: string;
  status: string;
}
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

export default function MapViewerPage({ satelliteData }: { satelliteData?: any }) {
  const { unit } = useDistanceUnit();
  const [isPlaying, setIsPlaying] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState<"light" | "dark" | null>(null);
  const { globalTheme } = useTheme()
  const finalTheme = isDarkMode ?? globalTheme
  // const [isDarkMode, setIsDarkMode] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [smoothMotion, setSmoothMotion] = useState(true);
  const [showInstrumentPanel, setShowInstrumentPanel] = useState(false);
  const [showConstellation, setShowConstellation] = useState(true)
  const [showSatellites, setShowSatellites] = useState(true)
  const [showSatPoints, setShowSatPoints] = useState(true)
  const [activeBtn, setActiveBtn] = useState<string | null>(null)
  const centerFnRef = useRef<() => void>(() => { })
  const followFnRef = useRef<(state: boolean) => void>(() => { })
  const [signal, setSignal] = useState(80); // 0-100%
  const [battery, setBattery] = useState(90); // 0-100%
  const [dataRate, setDataRate] = useState(50); // Mbps
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const [hoveredSatellite, setHoveredSatellite] = useState(defaultSatellite)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const auth = getAuth();
  const [mapType, setMapType] = useState("default")
  const [searchQuery, setSearchQuery] = useState("")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [showSatellite, setShowSatellite] = useState(false)
  const [showDebris, setShowDebris] = useState(false)
  const router = useRouter()
  const [searchCoords, setSearchCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [searchSat, setSearchSat] = useState("");
  const [debrisList, setDebrisList] = useState<any[]>([]);
  const [targetSatelliteName, setTargetSatelliteName] = useState<string>("");
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeDebris, setActiveDebris] = useState(fallbackData);
  const [activeSatellites, setActiveSatellites] = useState<SatelliteDisplay[]>([]);
  const [simTime, setSimTime] = useState<number>(Date.now());
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setSimTime(prev => prev + (100 * speed));
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying, speed]);
  const useinternetstatus = () => {
    const [isOnline, setIsOnline] = useState<string>("Offline");
    useEffect(() => {
      setIsOnline(navigator.onLine ? "Online" : "Offline");
      const handleOnline = () => setIsOnline("Online");
      const handleOffline = () => setIsOnline("Offline");

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }, []);
    return isOnline;
  }
  const isOnline = useinternetstatus();
  useEffect(() => {
    const fetchDebris = async () => {
      const data = await getLatestDebris();
      setDebrisList(data);
      console.log(data);
    };

    fetchDebris();
  }, []);
  useEffect(() => {
    if (hoveredSatellite.line1 && hoveredSatellite.line2) {
      try {
        // 1. Calculate Altitude for Hovered Satellite
        const satrec = satellite.twoline2satrec(hoveredSatellite.line1, hoveredSatellite.line2);
        const now = new Date();
        const pv = satellite.propagate(satrec, now);
        if (!pv || !pv.position) return;

        const gmst = satellite.gstime(now);
        const geo = satellite.eciToGeodetic(pv.position as satellite.EciVec3<number>, gmst);
        const hoverAltitude = Math.round(geo.height * 100) / 100;

        // 2. Prepare the Hovered Satellite object
        const currentHoveredEntry: SatelliteDisplay = {
          name: hoveredSatellite.name,
          altitude: hoverAltitude,
          type: (hoveredSatellite as any).type || "Selected",
          status: isOnline,
        };

        // 3. Get 3 UNIQUE satellites from your API data (activeDebris)
        // Filter out the hovered one so it's not repeated
        const otherThree = activeDebris
          .filter((s: any) => s.name !== hoveredSatellite.name)
          .slice(0, 3)
          .map((sat: any): SatelliteDisplay => {
            // Quick altitude calc for these 3 as well
            const sRec = satellite.twoline2satrec(sat.line1, sat.line2);
            const sPv = satellite.propagate(sRec, now);
            let sAlt = 0;
            if (sPv && sPv.position) {
              const sGeo = satellite.eciToGeodetic(sPv.position as satellite.EciVec3<number>, gmst);
              sAlt = Math.round(sGeo.height * 100) / 100;
            }
            return {
              name: sat.name,
              altitude: sAlt,
              type: sat.type || "Debris",
              status: isOnline
            };
          });

        // 4. Set the final 4-element array
        setActiveSatellites([...otherThree, currentHoveredEntry]);

        // Also update the hovered satellite state itself
        setHoveredSatellite(prev => ({ ...prev, altitude: hoverAltitude }));

      } catch (err) {
        console.error("Orbit calculation error:", err);
      }
    }
  }, [hoveredSatellite.name, activeDebris]); // Runs when you hover or data loads
  useEffect(() => {
    const loadData = async () => {
      const freshData = await getLatestSatellite();
      if (freshData.length > 0) {
        setActiveDebris(freshData);
      }
    };
    loadData();
  }, []);
  const handleSearch = async (query: string) => {
    const lowerQuery = query.toLowerCase().trim();
    const satMatch = activeDebris.find(s => s.name.toLowerCase() === lowerQuery);

    if (satMatch) {
      setTargetSatelliteName(satMatch.name); // Updates this...
      setTargetCoords(null);
      return;
    }

    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const data = await res.json();
    if (data.length > 0) {
      setTargetCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }); // Updates this...
      setTargetSatelliteName("");
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          setUserName(
            snap.exists()
              ? (snap.data().displayName || snap.data().name || user.displayName || "User")
              : (user.displayName || "User")
          );
        } catch (err) {
          setUserName("User");
        }
      } else {
        setUserName(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Update satellite from URL parameters
  useEffect(() => {
    const name = searchParams.get("name")
    const tle1 = searchParams.get("tle1")
    const tle2 = searchParams.get("tle2")

    if (name && tle1 && tle2) {
      setHoveredSatellite((prev) => ({
        ...prev,
        name,
        designation: name,
        line1: tle1,
        line2: tle2,
      }))
    } else if (satelliteData) {
      // Fallback to props if no URL params
      setHoveredSatellite((prev) => ({
        ...prev,
        name: satelliteData.name || prev.name,
        designation: satelliteData.designation || prev.designation,
        altitude: satelliteData.altitude || prev.altitude,
        orbitType: satelliteData.orbitType || prev.orbitType,
        velocity: satelliteData.velocity || prev.velocity,
        nextPass: satelliteData.nextPass || prev.nextPass,
        heading: satelliteData.heading || prev.heading,
        line1: satelliteData.line1 || prev.line1,
        line2: satelliteData.line2 || prev.line2,
        telemetry: satelliteData.telemetry || prev.telemetry,
      }))
    }
  }, [searchParams, satelliteData])

  // Update altitude from TLE data
  useEffect(() => {
    if (hoveredSatellite.line1 && hoveredSatellite.line2) {
      try {
        const satrec = satellite.twoline2satrec(
          hoveredSatellite.line1,
          hoveredSatellite.line2
        );

        const now = new Date();
        const pv = satellite.propagate(satrec, now);

        if (!pv || !pv.position) return;

        const gmst = satellite.gstime(now);
        const geo = satellite.eciToGeodetic(pv.position as satellite.EciVec3<number>, gmst);

        const altitudeValue = Math.round(geo.height * 100) / 100;

        // 1. Update the hovered satellite's own state
        setHoveredSatellite((prev) => ({
          ...prev,
          altitude: altitudeValue,
        }));

        // 2. Push this specific satellite into the display list
        setActiveSatellites((prev: SatelliteDisplay[]) => {
          // We take the first 7 (4 base + 3 dynamic) and then add/update the 8th slot
          const baseAndDynamic = prev.slice(0, 7);

          const currentHoveredEntry: SatelliteDisplay = {
            name: hoveredSatellite.name,
            altitude: altitudeValue,
            type: (hoveredSatellite as any).type || "Selected",
            status: "Online",
          };

          return [...baseAndDynamic, currentHoveredEntry];
        });

      } catch (err) {
        console.error("TLE error:", err);
      }
    }
  }, [hoveredSatellite.line1, hoveredSatellite.line2]);

  useEffect(() => {
    setLoading(true)
    const interval = setInterval(() => {
      setSignal((prev) => smoothRandom(prev, 20, 100, 0.1));
      setBattery((prev) => smoothRandom(prev, 10, 100, 0.005));
      setDataRate((prev) => smoothRandom(prev, 10, 100, 0.5));
    }, 1000);
    setLoading(false)
    return () => clearInterval(interval);
  }, []);


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
  const handleCopyTLE = () => {
    const tleText = `${hoveredSatellite.name}
                    ${hoveredSatellite.line1}
                    ${hoveredSatellite.line2}`
    console.log(hoveredSatellite.line1)
    navigator.clipboard.writeText(tleText)
  }
  return (
    <div className={cn(finalTheme === "dark" && "dark")}>
      <AnimatePresence>
        {loading && <SatelliteLoader />}
      </AnimatePresence>
      {!loading && (
        <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden transition-colors duration-300">
          {showToast && (
            <div className="fixed flex items-center gap-2 top-6 right-4 md:right-[180px] z-[9999] bg-primary text-primary-foreground px-7 py-2 rounded-lg shadow-lg text-sm animate-fade-in-out">
              <CheckCircle className="w-4 h-4" /> <span>Copied Successfully</span>
            </div>
          )}

          {/* Header */}
          <header className="flex flex-wrap md:flex-nowrap items-center justify-between px-4 py-2 gap-3 bg-card border-b border-border shadow-sm">
            <div className="flex items-center gap-2">
              <motion.div whileHover="hover" variants={{ hover: { scale: 1.05 } }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center dark:border-white gap-2 transition-all duration-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:shadow-md"
                >
                  <motion.span
                    variants={{ hover: { x: -5 } }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </motion.span>
                  Back
                </Button>
              </motion.div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInstrumentPanel(true)}
                className="flex items-center dark:border-white border-white gap-2 transition-all duration-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:shadow-md flex-shrink-0"
              >
                ☰ Panel
              </Button>
            </div>

            <div className="flex items-center gap-3 flex-1 sm:flex-none min-w-max">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Satellite className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="font-bold text-foreground">CubeSatellite</span>
                <span className="hidden sm:inline text-muted-foreground ml-2 text-sm">Live Map</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end w-full md:w-auto">
              <div className="relative w-full sm:w-auto flex-1 sm:flex-none ">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search satellites, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                  className="pl-10 w-full bg-muted/50 border-border focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <motion.div whileHover={{ scale: 1.04 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const isActive = activeBtn === "projection"
                    setActiveBtn(isActive ? null : "projection")
                    followFnRef.current?.(!isActive)
                  }}
                  className={cn(
                    "w-full justify-start gap-2 transition-all duration-200 dark:border-white",

                    activeBtn === "settings"
                      ? `
        bg-orange-500 text-white border-orange-500 hover:bg-orange-600

        dark:bg-orange-500 dark:text-white dark:border-orange-500
        dark:hover:bg-orange-600
      `
                      : `
        hover:bg-orange-500 hover:text-white hover:border-orange-500

        dark:hover:bg-orange-500 dark:hover:text-white dark:hover:border-orange-500
      `
                  )}
                >
                  Track
                </Button>
              </motion.div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border flex-shrink-0">
                <FaUserCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {userName}
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="shrink-0 transition-all duration-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:scale-105"
              >
                {finalTheme === "dark" ? (
                  <Sun className="h-4 w-4 transition-all" />
                ) : (
                  <Moon className="h-4 w-4 transition-all" />
                )}
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden ">

            {/* Left Panel - Instrument Panel */}
            <AnimatePresence>
              {showInstrumentPanel && (
                <motion.aside
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-card border-r border-border p-4 z-50 overflow-y-auto [&::-webkit-scrollbar]:hidden shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-lg">Instruments</h2>
                    <button onClick={() => setShowInstrumentPanel(false)} className="text-muted-foreground hover:text-foreground hover:text-orange-500 transition-colors">✕</button>
                  </div>

                  <InstrumentPanel
                    smoothMotion={smoothMotion}
                    setSmoothMotion={setSmoothMotion}
                    speed={speed}
                    setSpeed={setSpeed}
                    showConstellation={showConstellation}
                    setShowConstellation={setShowConstellation}
                    showSatPoints={showSatPoints}
                    setShowSatPoints={setShowSatPoints}
                    mapType={mapType}
                    setMapType={setMapType}
                    showDebris={showDebris}
                    setShowDebris={setShowDebris}
                  />
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Center - Map View */}
            <main className="flex-1 relative flex flex-col min-h-[50vh] lg:min-h-0 bg-muted/20">
              {showInstrumentPanel && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={() => setShowInstrumentPanel(false)} />
              )}

              <div className="relative flex-1 z-0 isolate">
                <div className=" object-cover w-full h-[60vh] md:h-full">
                  <MapComponent
                    isPlaying={isPlaying}
                    speed={speed}
                    smoothMotion={smoothMotion}
                    onCenterReady={(fn) => { centerFnRef.current = fn }}
                    onFollowReady={(fn) => { followFnRef.current = fn }}
                    showConstellation={showConstellation}
                    onSatelliteHover={(satData) => {
                      setHoveredSatellite((prev) => ({
                        ...prev,
                        ...satData
                      }))
                    }}
                    showSatellites={showSatellites}
                    showSatPoints={showSatPoints}
                    mapType={mapType}
                    showSatellite={showSatellite}
                    targetCoords={targetCoords}
                    targetSatelliteName={targetSatelliteName}
                    satelliteList={activeDebris}
                    simTime={simTime}
                    showDebris={showDebris}
                    debrisList={debrisList}
                  />
                </div>

                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-[9990]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveBtn(activeBtn === "center" ? null : "center")
                      centerFnRef.current?.()
                    }}
                    className={cn(
                      "justify-start gap-2 transition-all duration-200 backdrop-blur-md rounded-xl shadow-lg",
                      activeBtn === "center"
                        ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                        : "bg-background/60 border-border text-foreground hover:bg-orange-500 hover:text-white hover:border-orange-500"
                    )}
                  >
                    <LocateFixed className="h-4 w-4" />
                    <span className="hidden sm:inline">Center</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveBtn(activeBtn === "showsatellites" ? null : "showsatellites")
                      setShowSatellite(prev => !prev)
                    }}
                    className={cn(
                      "justify-start gap-2 transition-all duration-200 backdrop-blur-md rounded-xl shadow-lg",
                      activeBtn === "showsatellites"
                        ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                        : "bg-background/60 border-border text-foreground hover:bg-orange-500 hover:text-white hover:border-orange-500"
                    )}
                  >
                    <Satellite className="h-4 w-4" />
                    <span className="hidden sm:inline">All Satellite</span>
                  </Button>
                </div>
              </div>

              {/* Bottom Info Panel */}
              <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex flex-col md:flex-row gap-4 z-20">
                <div className="pointer-events-auto bg-card/90 backdrop-blur-md border border-border rounded-xl p-4 w-full md:w-64 shadow-lg">
                  <h3 className="font-semibold text-foreground mb-2">Legend</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-muted-foreground">Active Asset</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="text-muted-foreground">Loss of Signal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-orange-500" />
                      <span className="text-muted-foreground">LOS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 sm:w-8 h-2 bg-gradient-to-r from-blue-900 to-indigo-900 rounded" />
                      <span className="text-muted-foreground truncate">
                        Night terminator
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Satellites */}
                <div className="pointer-events-auto bg-card/90 backdrop-blur-md border border-border rounded-xl p-4 flex-1 shadow-lg overflow-hidden">
                  <h3 className="font-semibold text-foreground mb-2">
                    Active Satellites
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto max-h-30">
                    {Array.from(new Map(activeSatellites.map(sat => [sat.name, sat])).values()).map((sat) => (
                      <div key={sat.name} className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border border-border/50">
                        <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                          <Satellite className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {sat.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {sat.altitude} · {sat.type}
                          </p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              sat.status === "Online"
                                ? "text-green-500"
                                : "text-destructive"
                            )}
                          >
                            {sat.status}
                          </span>
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full mt-1",
                              sat.status === "Online"
                                ? "bg-green-500"
                                : "bg-destructive"
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </main>

            {/* Right Panel - Satellite Info */}
            <aside className="w-full lg:w-80 p-4 border-t lg:border-t-0 lg:border-l border-border bg-card overflow-y-auto shadow-inner">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Hovered Satellite
                  </p>
                  <h2 className="text-2xl font-black text-primary mt-1">
                    {hoveredSatellite.name} ({hoveredSatellite.designation})
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {hoveredSatellite.orbitType} · {hoveredSatellite.altitude}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border shadow-sm">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Orbital Altitude</p>
                  <p className="text-2xl font-mono font-bold text-foreground">{unit == "km" ? hoveredSatellite.altitude : Math.round(hoveredSatellite.altitude * 0.62 * 100) / 100}{unit == "km" ? " km" : " Mile"}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    Faux LED Readout
                  </p>
                  {[
                    { label: "Velocity", value: hoveredSatellite.velocity },
                    { label: "Next Pass", value: hoveredSatellite.nextPass },
                    { label: "Heading", value: hoveredSatellite.heading },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center gap-2 border-b border-border/50 pb-2"
                    >
                      <span className="text-sm text-muted-foreground flex-shrink-0">
                        {item.label}
                      </span>
                      <span className="text-sm font-medium text-foreground text-right truncate">
                        {item.label == "Velocity" ? unit == "km" ? item.value : 4.47 : item.value}{unit == "km" ? "km/h" : "miles/h"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Telemetry Snapshot
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-lg bg-muted/50 border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase">Signal</p>
                      <p className="text-sm font-bold text-foreground">-{signal.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">dB</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50 border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase">Battery</p>
                      <p className="text-sm font-bold text-foreground">{battery.toFixed(2)}%</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50 border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase">Data Rate</p>
                      <p className="text-sm font-bold text-foreground">{dataRate.toFixed(2)} </p>
                      <p className="text-xs text-muted-foreground">Mbps</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 w-full shadow-sm">
                  <h3 className="font-semibold text-foreground mb-3">
                    Quick Actions
                  </h3>

                  <div className="flex flex-col gap-2">

                    {/* Playback Button */}
                    <motion.div whileHover={{ scale: 1.03 }}>
                      <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        variant="outline"
                        className={cn(
                          "w-full justify-start gap-2 transition-all duration-200",
                          isPlaying
                            ? `bg-orange-500 text-white border-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:text-white dark:border-orange-500 dark:hover:bg-orange-600` : `hover:bg-orange-500 hover:text-white hover:border-orange-500 dark:hover:bg-orange-500 dark:hover:text-white dark:hover:border-orange-500`
                        )}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        {isPlaying ? "Stop" : "Start"} Playback
                      </Button>
                    </motion.div>

                    {/* Copy TLE Button */}
                    <motion.div whileHover={{ scale: 1.03 }}>
                      <Button
                        onClick={() => {
                          setActiveBtn("download")
                          handleCopyTLE()
                          setShowToast(true)

                          if (timeoutRef.current) clearTimeout(timeoutRef.current)

                          timeoutRef.current = setTimeout(() => {
                            setActiveBtn(null)
                            setShowToast(false)
                          }, 1200)
                        }}
                        variant="outline"
                        className={cn(
                          "w-full justify-start gap-2 transition-all duration-200 dark:border-white",

                          activeBtn === "download"
                            ? `
        bg-orange-500 text-white border-orange-500 hover:bg-orange-600

        dark:bg-orange-500 dark:text-white dark:border-orange-500
        dark:hover:bg-orange-600
      `
                            : `
        hover:bg-orange-500 hover:text-white hover:border-orange-500

        dark:hover:bg-orange-500 dark:hover:text-white dark:hover:border-orange-500
      `
                        )}
                      >
                        <CopyIcon className="h-4 w-4" />
                        <span className="truncate">
                          {showToast ? "Copied" : "Copy"} TLE data
                        </span>
                      </Button>
                    </motion.div>

                    {/* Settings Button */}
                    <motion.div whileHover={{ scale: 1.03 }}>
                      <Button
                        onClick={() => {
                          setActiveBtn("settings")
                          setTimeout(() => {
                            router.push("/settings")
                          }, 200)
                        }}
                        variant="outline"
                        className={cn(
                          "w-full justify-start gap-2 transition-all duration-200 dark:border-white",

                          activeBtn === "settings"
                            ? `
        bg-orange-500 text-white border-orange-500 hover:bg-orange-600

        dark:bg-orange-500 dark:text-white dark:border-orange-500
        dark:hover:bg-orange-600
      `
                            : `
        hover:bg-orange-500 hover:text-white hover:border-orange-500

        dark:hover:bg-orange-500 dark:hover:text-white dark:hover:border-orange-500
      `
                        )}
                      >
                        <Settings className="h-4 w-4" />
                        Calibration
                      </Button>
                    </motion.div>

                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Bottom Timeline */}
          <footer className="p-4 border-t border-border bg-card shadow-lg z-30">
            <Timeline
              variant={finalTheme === "dark" ? "dark" : "light"}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              speed={speed}
              setSpeed={setSpeed}
              simTime={simTime}
              setSimTime={setSimTime}
            />
          </footer>
        </div>
      )}
    </div>
  )
}