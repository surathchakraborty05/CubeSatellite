"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Footer, Navbar } from "@/components/orbital"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useTheme } from "../context/ThemeContext"
import { useDistanceUnit } from "../context/DistanceUnitContext";
import {
  Satellite,
  User,
  Download,
  Upload,
  Key,
  AlertTriangle,
  Trash2,
  Menu,
  X,
  Moon,
  Sun
} from "lucide-react"
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation"

const testFirebase = async () => {
  await addDoc(collection(db, "test"), {
    msg: "Firebase working 🚀",
    time: new Date()
  });
};

const navItems = [
  { href: "/", label: "Landing / Dashboard" },
  { href: "/map-viewer", label: "Live Map Viewer" },
  { href: "/satellite-details", label: "Satellite Details" },
  { href: "/timeline", label: "Orbit Timeline & Playback", active: false },
  { href: "/settings", label: "Settings & Appearance", active: true },
  { href: "/login", label: "Login", active: true }
]

const themePaletteColors = [
  { name: "Blue", color: "oklch(0.55 0.15 250)" },
  { name: "Teal", color: "oklch(0.55 0.15 190)" },
  { name: "Orange", color: "oklch(0.65 0.18 45)" },
  { name: "Green", color: "oklch(0.55 0.18 145)" },
  { name: "Neutral", color: "oklch(0.5 0.02 250)" },
]

const controlSkins = [
  { name: "Metal", style: "bg-gradient-to-b from-gray-300 to-gray-400" },
  { name: "Plastic", style: "bg-gray-200" },
  { name: "Wood", style: "bg-gradient-to-b from-amber-200 to-amber-400" },
]

export default function SettingsPage() {
  const { unit, setUnit } = useDistanceUnit();
  const { globalTheme, setGlobalTheme } = useTheme();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [liveTLEUpdates, setLiveTLEUpdates] = useState(true);
  const [telemetryFeeds, setTelemetryFeeds] = useState(true);
  const [updateFrequency, setUpdateFrequency] = useState("60");
  const [mapTileProvider, setMapTileProvider] = useState("satellite");
  const [projectionUnits, setProjectionUnits] = useState("geographic");
  const [useKilometers, setUseKilometers] = useState(unit === "km");
  const [passAlerts, setPassAlerts] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [skeuomorphIntensity, setSkeuomorphIntensity] = useState("subtle");
  const [selectedTheme, setSelectedTheme] = useState(1);
  const [analogSounds, setAnalogSounds] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState("metal");
  const [privacyControls, setPrivacyControls] = useState(true);
  const [shareTelemetry, setShareTelemetry] = useState(false);
  const [allowDiagnostics, setAllowDiagnostics] = useState(true);
  const [keepLocalApiCopy, setKeepLocalApiCopy] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isgenactive, setgenactive] = useState("false");
  const [remaining, setRemaining] = useState(0);
  const [timeAgo, setTimeAgo] = useState("");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [isPreview, setIsPreview] = useState(false)
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const ONE_HOUR = 60 * 60 * 1000;

  const defaultSettings = {
    apiKey: "",
    isPreview: false,
    remaining: 0,
    timeAgo: "",
    mapTileProvider: "satellite",
    projectionUnits: "geographic",
    useKilometers: unit === "km",
    passAlerts: true,
    criticalAlerts: true,
    liveTLEUpdates: true,
    telemetryFeeds: true,
    selectedThemee: 0,
    setShareTelemetry:false,
    setAllowDiagnostics:true,
    setKeepLocalApiCopy:false,
  };
  const resetAllSettings = () => {
    setApiKey(defaultSettings.apiKey);
    setIsPreview(defaultSettings.isPreview);
    setRemaining(defaultSettings.remaining);
    setTimeAgo(defaultSettings.timeAgo);
    setMapTileProvider(defaultSettings.mapTileProvider);
    setProjectionUnits(defaultSettings.projectionUnits);
    setUseKilometers(defaultSettings.useKilometers);
    setPassAlerts(defaultSettings.passAlerts);
    setCriticalAlerts(defaultSettings.criticalAlerts);
    setLiveTLEUpdates(defaultSettings.liveTLEUpdates);
    setTelemetryFeeds(defaultSettings.telemetryFeeds);
    setSelectedTheme(defaultSettings.selectedThemee);
    setShareTelemetry(defaultSettings.setShareTelemetry);
    setAllowDiagnostics(defaultSettings.setAllowDiagnostics);
    setKeepLocalApiCopy(defaultSettings.setKeepLocalApiCopy);
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 100 * 1024) {
      setToast({ message: "File too large, Max 100KB", type: "error" });
      setTimeout(() => setToast(null), 3000)
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)

        if (!Array.isArray(data)) throw new Error()

        const isValid = data.every((sat: any) =>
          typeof sat.name === "string" &&
          typeof sat.line1 === "string" &&
          typeof sat.line2 === "string"
        )

        if (!isValid) throw new Error()

        setPreviewData(data)
        setIsPreview(true)

      } catch {
        setToast({ message: "Invalid JSON ", type: "error" })
        setTimeout(() => setToast(null), 3000)
      }
    }

    reader.readAsText(file)
  }
  function generateId(length = 12) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
  const handleRegen = () => {
    const newKey = generateId(12);
    setApiKey(newKey);
  };
  const handleConfirm = () => {
    const sat = previewData[0]

    const params = new URLSearchParams({
      name: sat.name,
      tle1: sat.line1,
      tle2: sat.line2,
    })

    router.push(`/map-viewer?${params.toString()}`)
  }
  const usePing = () => {
    const [ping, setping] = useState<number | null>(null);
    useEffect(() => {
      const measureping = async () => {
        const start = performance.now();
        try {
          await fetch("https://www.google.com", {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-store",
          });
          const end = performance.now();
          setping(Math.round(end - start));
        } catch {
          setping(null);
        }
      };
      measureping();
      const interval = setInterval(measureping, 10000);
      return () => clearInterval(interval);
    }, []);
    return ping;
  }
  const ping = usePing();
  // ✅ Step 1: read cache ONCE
  useEffect(() => {
    const cached = localStorage.getItem("space_debris_cache");
    if (!cached) return;

    try {
      const { timestamp } = JSON.parse(cached);
      setLastUpdated(timestamp);
    } catch (e) {
      console.error("Invalid cache");
    }
  }, []);

  // ✅ Step 2: update remaining every second
  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimer = () => {
      const now = Date.now();
      const remainingTime = ONE_HOUR - (now - lastUpdated);

      setRemaining(Math.max(0, remainingTime));
    };

    updateTimer(); // initial call

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);
  useEffect(() => {
    if (!lastUpdated) return;

    const interval = setInterval(() => {
      const diff = Date.now() - lastUpdated;

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      let value = "";

      if (hours > 0) value = `${hours}h ${minutes % 60}m ago`;
      else if (minutes > 0) value = `${minutes}m ${seconds % 60}s ago`;
      else value = `${seconds}s ago`;

      setTimeAgo(value);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);
  // ✅ Step 3: format
  const formatTime = (ms: number) => {
    if (ms <= 0) return "Refreshing...";

    const totalSec = Math.floor(ms / 1000);

    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    return `${hrs}h ${mins}m ${secs}s`;
  };


  // const [isDarkMode, setIsDarkMode] = useState(false);

  // useEffect(() => {
  //   const isDark = document.documentElement.classList.contains("dark");
  //   setIsDarkMode(isDark);
  // }, []);

  const togglepageTheme = () => {
    if (globalTheme === "dark") {
      setGlobalTheme("light")
    } else {
      setGlobalTheme("dark")
    }
  }
  const useinternetstatus = () => {
    const [isOnline, setIsOnline] = useState<boolean>(true);
    useEffect(() => {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

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
  const scrollto = () => {
    const pageheight = document.documentElement.scrollHeight;
    const target = pageheight * 0.5;
    window.scrollTo({
      top: target,
      behavior: "smooth",
    });
  };

  const [navItems, setNavItems] = useState([
    { href: "#", label: "General", active: false },
    { href: "#", label: "Accounts and Privacy", active: false },
  ]);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const percent = (scrollTop / scrollHeight) * 100;


      setNavItems((prev) =>
        prev.map((item, index) => {
          if (index === 0) {
            return { ...item, active: percent < 10 };
          }
          return item;
        })
      );
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const themePaletteColors = [
    { name: "Emerald", color: "#10b981" },
    { name: "Indigo", color: "#6366f1" },
    { name: "Rose", color: "#f43f5e" },
  ];
  const downloadSatelliteData = (key = "satellite_debris_cache") => {
    const cached = localStorage.getItem(key);
    if (!cached) {
      setToast({ message: "No Data Found to Download", type: "error" });
      setTimeout(() => setToast(null), 3000)
      return;
    }
    try {
      const parsed = JSON.parse(cached);
      const timestamp = parsed.timestamp;
      const data = parsed.data || parsed;
      const ONE_HOUR = 60 * 60 * 1000;
      const now = Date.now();
      if (!timestamp) {
        localStorage.removeItem(key);
        setToast({ message: "Invalid cache removed", type: "error" });
        setTimeout(() => setToast(null), 3000)
        return;
      }
      if (now - timestamp > ONE_HOUR) {
        setToast({ message: "Data Expired or Counld Not Get Data", type: "error" });
        setTimeout(() => setToast(null), 3000)
        localStorage.removeItem(key);
        console.log("Cleared Old Data");
        return;
      }
      const text = data.map((item: any, i: number) => {
        return `Satellite ${i + 1}
        Name: ${item.name}
        Type: ${item.type}
        Line1: ${item.line1}
        Line2: ${item.line2} `;
      }).join("/n");
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Satellite-Data-${Date.now()}.json`;
      setToast({ message: "Data Downloaded SuccesFully", type: "success" });
      setTimeout(() => setToast(null), 3000)
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.log("Export Failed: ", err);
      localStorage.removeItem(key);
    }
  }
  const controlSkins = [
    { name: "Metal", style: "bg-zinc-300" },
    { name: "Carbon", style: "bg-zinc-800" },
  ];


  const testFirebase = () => console.log("Firebase Test");

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-200">
      <Navbar user={{ name: "ortehp" }} />
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md transition-all">
          <div className="w-full max-w-2xl bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_0_50px_-12px_rgba(79,70,229,0.2)] ring-1 ring-inset ring-white/20">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Import <span className="text-indigo-600 dark:text-indigo-400">Config</span>
              </h2>
              <div className="h-1 w-12 bg-indigo-500 rounded-full" />
            </div>

            {/* STEP 1: Instructions */}
            {!isPreview && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    Upload JSON file
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Max: 100KB
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-sm italic">
                  "Upload TLE data of ONE Satellite only"
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <pre className="relative bg-slate-50 dark:bg-black/60 p-4 rounded-xl text-xs font-mono text-slate-600 dark:text-indigo-300 overflow-x-auto border border-slate-200 dark:border-white/5">
                    {`[
  {
    "name": "ISS",
    "line1": "1 ...",
    "line2": "2 ..."
  }
]`}
                  </pre>
                </div>

                {/* Upload Input */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 p-8 text-center hover:border-indigo-500 transition-colors">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Drop file here or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: Preview */}
            {isPreview && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-500 dark:text-indigo-400">
                  Telemetry Preview ({previewData.length} satellites)
                </h3>

                <div className="max-h-64 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {previewData.map((sat, i) => (
                    <div key={i} className="group relative p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 transition-all">
                      <p className="font-bold text-slate-900 dark:text-white mb-1">{sat.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate opacity-70 group-hover:opacity-100 transition-opacity">{sat.line1}</p>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate opacity-70 group-hover:opacity-100 transition-opacity">{sat.line2}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                className="flex-1 px-6 py-3 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={() => {
                  setIsModalOpen(false)
                  setIsPreview(false)
                }}
              >
                Abort
              </button>

              {isPreview && (
                <button
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0"
                  onClick={handleConfirm}
                >
                  Initialize Load
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col md:flex-row relative">
        <div className="md:hidden p-4 border-b border-border flex justify-between items-center bg-card">
          <span className="text-sm font-semibold text-foreground">Settings Menu</span>
          <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border p-4 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="space-y-6">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Quick Navigation</p>
              <nav className="space-y-1">
                <Button
                  key={navItems[0].label}
                  onClick={() => {
                    if (navItems[0].label === "Accounts and Privacy") {
                      scrollto()
                    }
                  }}
                  className={cn(
                    "w-full block px-3 py-2 rounded-lg text-sm transition-all duration-200 border",

                    // DEFAULT STATE
                    "text-foreground border-border bg-transparent",

                    // HOVER (CONSISTENT ORANGE BOTH MODES)
                    "hover:bg-orange-500 hover:text-white hover:border-[oklch(0.65_0.15_190)]",

                    // ACTIVE STATE
                    navItems[0].active &&
                    "bg-orange-500 text-white border-[oklch(0.55_0.15_250)]"
                  )}
                >
                  {navItems[0].label}
                </Button>
                <Button
                  key={navItems[1].label}
                  onClick={() => {
                    if (navItems[1].label === "Accounts and Privacy") {
                      scrollto()
                    }
                  }}
                  className={cn(
                    "w-full block px-3 py-2 rounded-lg text-sm transition-all duration-200 border",

                    // DEFAULT STATE
                    "text-foreground border-border bg-transparent",

                    // HOVER (CONSISTENT ORANGE BOTH MODES)
                    "hover:bg-orange-500 hover:text-white hover:border-[oklch(0.65_0.15_190)]",

                    // ACTIVE STATE
                    navItems[1].active &&
                    "bg-[oklch(0.55_0.15_250)] text-white border-[oklch(0.55_0.15_250)]"
                  )}
                >
                  {navItems[1].label}
                </Button>
              </nav>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">System Status</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sat Feed</span>
                  {isOnline ? <span className="text-green-500 font-semibold">Online</span> : <span className="text-red-500 font-semibold">Offline</span>}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Latency</span>
                  <span className="text-foreground">{ping ? "~" + ping + "ms" : "Offline"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Sync in</span>
                  <span className="text-foreground"> {formatTime(remaining)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Shortcuts</p>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 mb-2 dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white" onClick={() => setIsModalOpen(true)}>
                <Upload className="h-4 w-4" />
                Import Config
              </Button>
              <Button size="sm" className="w-full justify-start gap-2 bg-[oklch(0.55_0.15_250)] hover:bg-[oklch(0.5_0.15_250)] text-white" onClick={() => { downloadSatelliteData() }}>
                <Download className="h-4 w-4" />
                Export Settings
              </Button>
            </div>
          </div>
        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-card border border-border rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Data & Updates</h2>
                <span className="text-xs text-muted-foreground">Updated: {timeAgo}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Manage live sources, sync cadence and map providers
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">Live TLE Updates</p>
                    <p className="text-xs text-muted-foreground">Stream real-time element nightly updates</p>
                  </div>
                  <Switch checked={liveTLEUpdates} onCheckedChange={setLiveTLEUpdates} className="dark:hover:text-white dark:hover:bg-blue-500 dark:border-white dark:hover:text-white" />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">Telemetry Feeds</p>
                    <p className="text-xs text-muted-foreground">High-frequency sensor streams</p>
                  </div>
                  <Switch checked={telemetryFeeds} onCheckedChange={setTelemetryFeeds} className="dark:hover:text-white dark:hover:bg-blue-500 dark:border-white dark:hover:text-white" />
                </div>

                <div>
                  <div className="flex items-center justify-between w-full">
                    <p className="font-medium text-foreground">
                      Update Frequency
                    </p>

                    <div
                      className={`flex items-center justify-center px-4 py-2 rounded-xl shadow-md transition-all active:scale-95
    ${globalTheme === "dark"
                          ? "bg-slate-800 text-white hover:bg-slate-700"
                          : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-100"
                        }`}
                    >
                      <span className="text-sm font-medium">1 Hour</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground mb-2">How often CubeSatellite checks for new data</p>
                    {/* <Input
                      type="number"
                      value={updateFrequency}
                      onChange={(e) => setUpdateFrequency(e.target.value)}
                      className="w-20"
                    /> */}

                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="font-medium text-foreground mb-2">Map Tile Provider</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="mapTile"
                            checked={mapTileProvider === "satellite"}
                            onChange={() => setMapTileProvider("satellite")}
                            className="text-primary"
                          />
                          <span className="text-sm text-foreground">Satellite Imagery</span>
                        </label>
                        <p className="text-xs text-[oklch(0.55_0.15_250)] ml-5">Highest true color imagery</p>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="mapTile"
                            checked={mapTileProvider === "elevation"}
                            onChange={() => setMapTileProvider("elevation")}
                          />
                          <span className="text-sm text-foreground">Elevation Data</span>
                        </label>
                        <p className="text-xs text-muted-foreground ml-5">Includes contour overlay tiles</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-foreground mb-2">Projection & Units</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={projectionUnits === "geographic"}
                            onChange={() => setProjectionUnits("geographic")}
                          />
                          <span className="text-sm text-[oklch(0.55_0.15_250)]">Geographic (lat/long)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={projectionUnits === "mercator"}
                            onChange={() => setProjectionUnits("mercator")}
                          />
                          <span className="text-sm text-foreground">Web Mercator</span>
                        </label>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={useKilometers}
                              onChange={() => setUseKilometers(!useKilometers)}
                              onClick={() => setUnit("km")}
                            />
                            <span className="text-sm text-foreground">Km</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!useKilometers}
                              onChange={() => setUseKilometers(!useKilometers)}
                              onClick={() => setUnit("mile")}
                            />
                            <span className="text-sm text-foreground">Miles</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">Notification</p>
                    <span className="text-xs text-[oklch(0.55_0.15_250)] cursor-pointer">Manage</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-foreground">Pass Alerts</p>
                        <p className="text-xs text-muted-foreground">Receive alerts for visible passes</p>
                      </div>
                      <Switch checked={passAlerts} onCheckedChange={setPassAlerts} className="dark:hover:text-white dark:hover:bg-blue-500 dark:border-white dark:hover:text-white" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-[oklch(0.65_0.18_45)]">Critical System Alerts</p>
                        <p className="text-xs text-muted-foreground">Only critical notifications</p>
                      </div>
                      <Switch checked={criticalAlerts} onCheckedChange={setCriticalAlerts} className="dark:hover:text-white dark:hover:bg-blue-500 dark:border-white dark:hover:text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                <span className="text-xs text-muted-foreground">Preview {isPreview?"enabled":"disabled"}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Adjust skeuomorphism intensity, skins and sounds</p>

              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">Theme Mode</p>
                    <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
                  </div>
                  <Button variant="outline" size="sm" className="dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white" onClick={togglepageTheme}>
                    {globalTheme === "dark" ? <Sun className="h-4 w-4 dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white" /> : <Moon className="h-4 w-4 dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white" />}
                    {globalTheme === "dark" ? <p className="dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white">Light Mode</p> : <p className="dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white">Dark Mode</p>}
                  </Button>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-2">Theme Palette Wheel</p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className={`w-20 h-20 shrink-0 rounded-full bg-gradient-to-br from-amber-200 via-orange-300 to-amber-400 flex items-center justify-center shadow-inner`}>
                      <div
                        className="w-12 h-12 rounded-full from-gray-600 to-gray-800"
                        style={{ backgroundColor: themePaletteColors[selectedTheme].color }}
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-sm text-foreground mb-2">
                        Selected: <span className="text-[oklch(0.55_0.15_250)]">{themePaletteColors[selectedTheme].name}</span>
                      </p>
                      <div className="flex justify-center sm:justify-start gap-2">
                        {themePaletteColors.map((theme, index) => (
                          <button
                            key={theme.name}
                            onClick={() => setSelectedTheme(index)}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 transition-all",
                              selectedTheme === index ? "border-foreground scale-110" : "border-transparent"
                            )}
                            style={{ backgroundColor: theme.color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Account & Privacy</h2>
                <span className="text-xs text-[oklch(0.6_0.18_145)]">2FA: Enabled</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="font-medium text-[oklch(0.65_0.18_45)] mb-2">Privacy Controls</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-[oklch(0.65_0.18_45)]">Share Telemetry Data</p>
                          <p className="text-xs text-muted-foreground">Allow anonymized research data</p>
                        </div>
                        <Switch checked={shareTelemetry} onCheckedChange={setShareTelemetry} className="dark:hover:text-white dark:hover:bg-blue-500 dark:border-white dark:hover:text-white" />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-[oklch(0.65_0.18_45)]">Allow Diagnostics</p>
                          <p className="text-xs text-muted-foreground">Send periodic reports</p>
                        </div>
                        <Switch checked={allowDiagnostics} onCheckedChange={setAllowDiagnostics} className="dark:hover:text-white dark:hover:bg-blue-500 dark:border-white dark:hover:text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="font-medium text-[oklch(0.65_0.18_45)] mb-2">API Key Management</p>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="h-4 w-4 text-[oklch(0.55_0.15_250)]" />
                        <span className="text-sm font-medium text-foreground">CubeSatellite</span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <Input
                          type="text"
                          value={apiKey || "Click Regen to generate"}
                          readOnly
                          className="text-xs dark:hover:text-white dark:hover:border-white dark:hover:text-white"
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="flex-1 bg-[oklch(0.55_0.15_250)] text-white border-0 dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white" onClick={handleRegen}>Regen</Button>
                          <Button variant="outline" size="sm" className="flex-1 bg-[oklch(0.55_0.15_250)] text-white border-0 dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white" onClick={() => setApiKey("")} >Revoke</Button>
                        </div>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={keepLocalApiCopy}
                        onChange={() => setKeepLocalApiCopy(!keepLocalApiCopy)}
                      />
                      <span className="text-sm text-foreground">Keep local encrypted copy</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="font-medium text-[oklch(0.65_0.18_45)] mb-2">Import / Export Preferences</p>
                    <Button className="w-full sm:w-auto bg-[oklch(0.55_0.15_250)] hover:bg-[oklch(0.5_0.15_250)] text-white">
                      Export Settings
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-[oklch(0.55_0.22_25)]">Reset to Factory</p>
                        <p className="text-xs text-muted-foreground mb-3">Restores default settings. Irreversible.</p>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className={`dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white ${isPreview?"dark:bg-orange-500 bg-orange-500":"bg-white dark:bg-black "}`} onClick={()=>setIsPreview(!isPreview)}>Preview</Button>
                          <Button size="sm" className="bg-[oklch(0.55_0.22_25)] hover:bg-[oklch(0.5_0.22_25)] text-white" onClick={resetAllSettings}>
                            Reset to Factory
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="bg-card border-t border-border py-8 px-4 md:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-1 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <Satellite className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">CubeSatellite</span>
              </div>
              <p className="text-xs text-muted-foreground">Version 2.8.1 • © 2026 SkyLabs</p>
              <p className="text-xs text-[oklch(0.55_0.15_250)] mt-1">ExampleCubeSatellite@gmail.com</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-3">Resources</p>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="/docs" className="text-[oklch(0.55_0.15_250)] hover:underline">Documentation</Link>
                <Link href="/docs" className="text-[oklch(0.55_0.15_250)] hover:underline">API Reference</Link>
                <Link href="/docs" className="text-[oklch(0.55_0.15_250)] hover:underline">Forum</Link>
              </nav>
            </div>
            <div>
              <p className="font-medium text-foreground mb-3">Legal</p>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="/privacy" className="text-[oklch(0.55_0.15_250)] hover:underline">Privacy Policy</Link>
                <Link href="/privacy" className="text-[oklch(0.55_0.15_250)] hover:underline">Terms</Link>
                <Link href="/support" className="text-[oklch(0.55_0.15_250)] hover:underline">Support</Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}