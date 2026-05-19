"use client"

import { cn } from "@/lib/utils"
import { MapPin, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MapPlaceholderProps {
  variant?: "light" | "dark" | "globe"
  className?: string
  showControls?: boolean
  groundStation?: {
    name: string
    lat: string
    lon: string
  }
  onOpenViewer?: () => void
  onCenter?: () => void
}

export function MapPlaceholder({
  variant = "light",
  className,
  showControls = false,
  groundStation,
  onOpenViewer,
  onCenter,
}: MapPlaceholderProps) {
  const isDark = variant === "dark"
  const isGlobe = variant === "globe"

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden",
        isDark
          ? "bg-[oklch(0.12_0.02_220)]"
          : isGlobe
            ? "bg-[oklch(0.15_0.03_220)]"
            : "bg-muted",
        className
      )}
    >
      {/* Map Image */}
      <div className="w-full h-full relative">
        <img
          src={
            isGlobe
              ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-TsYc11XSnHMq1rtNv01rnOWfimQR5m.png"
              : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qPNlD1iIpSPmsr1ZRw0Z22wdBoIx4K.png"
          }
          alt="World Map"
          className="w-full h-full object-cover"
        />

        {/* Satellite markers would go here */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Satellite path visualization placeholder */}
        </div>
      </div>

      {/* Ground Station Info */}
      {groundStation && (
        <div
          className={cn(
            "absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg",
            isDark
              ? "bg-[oklch(0.18_0.025_220)]/90 text-[oklch(0.92_0.02_200)]"
              : "bg-card/90 text-foreground"
          )}
        >
          <MapPin className="h-4 w-4 text-[oklch(0.55_0.15_250)]" />
          <div>
            <p className="font-medium text-sm">
              Ground Station: {groundStation.name}
            </p>
            <p
              className={cn(
                "text-xs",
                isDark
                  ? "text-[oklch(0.65_0.03_200)]"
                  : "text-muted-foreground"
              )}
            >
              Lat {groundStation.lat} · Lon {groundStation.lon}
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          {onOpenViewer && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenViewer}
              className={cn(
                isDark &&
                  "border-[oklch(0.28_0.03_220)] bg-[oklch(0.18_0.025_220)]/90 hover:bg-[oklch(0.22_0.025_220)]"
              )}
            >
              Open Viewer
            </Button>
          )}
          {onCenter && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCenter}
              className={cn(
                isDark &&
                  "border-[oklch(0.28_0.03_220)] bg-[oklch(0.18_0.025_220)]/90 hover:bg-[oklch(0.22_0.025_220)]"
              )}
            >
              Center
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
