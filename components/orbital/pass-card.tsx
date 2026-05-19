import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Bookmark } from 'lucide-react'
interface PassCardProps {
  satelliteName: string
  tle1: string
  tle2: string
  date: string
  startTime: string
  endTime: string
  elevation?: number
  azimuth?: number
  confidence?: "High" | "Medium" | "Low"
  location?: string
  eta?: { minutes: number; seconds: number }
  imageUrl?: string
  variant?: "light" | "dark" | "compact"
  onJumpTo?: () => void
  onAddMarker?: () => void
}

export function PassCard({
  satelliteName,
  tle1,
  tle2,
  date,
  startTime,
  endTime,
  elevation,
  azimuth,
  confidence,
  location,
  eta,
  imageUrl,
  variant,
  onJumpTo,
  onAddMarker,
}: PassCardProps) {
  const isDark = variant === "dark"
  const isCompact = variant === "light"
  const [markers, setMarkers] = useState<string[]>([])
  useEffect(() => {
    const saved = localStorage.getItem("markers")
    if (saved) {
      setMarkers(JSON.parse(saved))
    }
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
  const confidenceColors = {
    High: "bg-[oklch(0.6_0.18_145)]/20 text-[oklch(0.5_0.18_145)]",
    Medium: "bg-[oklch(0.65_0.18_45)]/20 text-[oklch(0.55_0.18_45)]",
    Low: "bg-[oklch(0.55_0.22_25)]/20 text-[oklch(0.45_0.22_25)]",
  }
  const router = useRouter();
  const handleJump = () => {
    const params = new URLSearchParams({
      name: satelliteName,
      tle1: tle1,
      tle2: tle2,
    });

    router.push(`/map-viewer?${params.toString()}`);
  };


  return (
    <div className="py-3 px-4 bg-card border border-border rounded-lg space-y-2 ">

      {/* TOP ROW */}
      <div className="flex items-center justify-between relative">
        <h4 className="font-medium text-foreground">
          {satelliteName?.trim() ? satelliteName : "Unknown Satellite"}
        </h4>
        {markers.includes(satelliteName) && (
          <div className="absolute -bottom-20 -right-2 z-50">
            <Bookmark className="h-7 w-7 text-black-500 " size={35} />
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* ACTIVE */}
          <span className="px-2 py-1 bg-lavish-blue/5 text-lavish-blue text-[10px] font-bold uppercase rounded-full">
            Active
          </span>

          {/* GLOW */}
          {elevation && (
            <div
              className={cn(
                "px-2 py-1 text-[10px] font-bold rounded-full",
                elevation > 60
                  ? "bg-blue-500/20 text-blue-400 shadow-[0_0_10px_#3b82f6]"
                  : elevation > 30
                    ? "bg-green-500/20 text-green-400 shadow-[0_0_8px_#22c55e]"
                    : "bg-gray-500/20 text-gray-400 shadow-[0_0_8px_#22c55e]"
              )}
            >
              {elevation > 30
                ? "Excellent"
                : elevation > 0
                  ? "Good"
                  : "Low"}
            </div>
          )}
        </div>
      </div>

      {/* LOCATION */}
      <p className="text-sm text-muted-foreground">
        {location} — Elevation {elevation}°
      </p>

      {/* ETA */}
      {eta && (
        <div className="flex items-center gap-1 text-sm">
          <span className="px-2 py-1 bg-muted rounded font-mono">
            {String(eta.minutes).padStart(2, "0")}
          </span>
          <span>:</span>
          <span className="px-2 py-1 bg-muted rounded font-mono">
            {String(eta.seconds).padStart(2, "0")}
          </span>
          <span className="text-muted-foreground ml-1">m ETA</span>
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex gap-2 pt-2">
        {onJumpTo && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleJump}
            className={cn(
              "font-medium transition-all duration-200",
              "text-foreground border-border bg-transparent",
              "hover:bg-accent hover:text-accent-foreground",
              "dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white",
              "transition-all duration-200"
            )}
          >
            Jump To
          </Button>
        )}
        {onAddMarker && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleMarker(satelliteName)}
            className={cn(
              "flex-1 sm:flex-none h-8 text-xs transition-all duration-200",
              "text-foreground border-border bg-transparent",
              "hover:bg-muted hover:text-foreground",
              "dark:hover:text-white dark:hover:bg-orange-500 dark:border-white dark:hover:text-white",
              markers.includes(satelliteName) &&
              "bg-orange-500 dark:bg-orange-500 text-primary-foreground border-primary dark:text-white "
            )}
          >
            {markers.includes(satelliteName) ? "Remove Marker" : "Add Marker"}
          </Button>
        )}
      </div>

    </div>
  )

  //   if (isDark) {
  //   return (
  //     <div
  //       className={cn(
  //         "rounded-lg border p-4",
  //         isDark
  //           ? "bg-[oklch(0.18_0.025_220)] border-[oklch(0.28_0.03_220)]"
  //           : "bg-card border-border"
  //       )}
  //     >
  //       <div className="flex items-start gap-3">
  //         {imageUrl && (
  //           <div
  //             className={cn(
  //               "w-12 h-12 rounded-full overflow-hidden flex-shrink-0",
  //               isDark ? "bg-[oklch(0.25_0.03_220)]" : "bg-muted"
  //             )}
  //           >
  //             <img
  //               src={imageUrl}
  //               alt={satelliteName}
  //               className="w-full h-full object-cover"
  //             />
  //           </div>
  //         )}
  //         <div className="flex-1 min-w-0">
  //           <div className="flex items-start justify-between">
  //             <div>
  //               <h4
  //                 className={cn(
  //                   "font-medium",
  //                   isDark ? "text-[oklch(0.92_0.02_200)]" : "text-foreground"
  //                 )}
  //               >
  //                 {date} · {startTime} — {endTime}
  //               </h4>
  //               <p
  //                 className={cn(
  //                   "text-sm",
  //                   isDark
  //                     ? "text-[oklch(0.65_0.03_200)]"
  //                     : "text-muted-foreground"
  //                 )}
  //               >
  //                 Peak{" "}
  //                 <span className={isDark ? "text-[oklch(0.65_0.15_190)]" : "text-primary"}>
  //                   {startTime}
  //                 </span>{" "}
  //                 UTC · Elevation {elevation}° · Azimuth {azimuth}°
  //               </p>
  //             </div>
  //             {confidence && (
  //               <Badge
  //                 variant="secondary"
  //                 className={cn("text-xs", confidenceColors[confidence])}
  //               >
  //                 Conf. {confidence}
  //               </Badge>
  //             )}
  //           </div>
  //         </div>
  //       </div>

  //       {true && (
  //         <div
  //           className={cn(
  //             "mt-3 pt-3 border-t flex gap-2",
  //             isDark ? "border-[oklch(0.28_0.03_220)]" : "border-border"
  //           )}
  //         >
  //           {onJumpTo && (
  //             <Button
  //               variant="outline"
  //               size="sm"
  //               onClick={handleJump}
  //               className={cn(
  //                 isDark &&
  //                 "border-[oklch(0.28_0.03_220)] bg-transparent hover:bg-[oklch(0.22_0.025_220)]"
  //               )}
  //             >
  //               Jump To2
  //             </Button>
  //           )}
  //           {onAddMarker && (
  //             <Button
  //               variant="outline"
  //               size="sm"
  //               onClick={onAddMarker}
  //               className={cn(
  //                 isDark &&
  //                 "border-[oklch(0.28_0.03_220)] bg-transparent hover:bg-[oklch(0.22_0.025_220)]"
  //               )}
  //             >
  //               Add Marker
  //             </Button>
  //           )}
  //         </div>
  //       )}
  //       <div className="flex items-center justify-between w-full">

  //         {/* LEFT SIDE */}
  //         <span className="px-3 py-1 bg-lavish-blue/5 text-lavish-blue text-[10px] font-bold uppercase tracking-wider rounded-full">
  //           Active
  //         </span>

  //         {/* RIGHT SIDE GLOW */}
  //         {elevation && (
  //           <div
  //             className={cn(
  //               "px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all",
  //               elevation > 60
  //                 ? "bg-blue-500/20 text-blue-400 shadow-[0_0_10px_#3b82f6]"
  //                 : elevation > 30
  //                   ? "bg-green-500/20 text-green-400 shadow-[0_0_8px_#22c55e]"
  //                   : "bg-gray-500/20 text-gray-400 shadow-[0_0_8px_#22c55e]"
  //             )}
  //           >
  //             {elevation > 60
  //               ? "Excellent 🚀"
  //               : elevation > 30
  //                 ? "Good "
  //                 : "Low"}
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   )
  // }
}
