import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface SatelliteCardProps {
  name: string
  noradId?: string
  status?: "Operational" | "Degraded" | "Offline"
  altitude?: number
  orbitType?: string
  launchDate?: string
  imageUrl?: string
  className?: string
  variant?: "light" | "dark"
}

export function SatelliteCard({
  name,
  noradId,
  status = "Operational",
  altitude,
  orbitType,
  launchDate,
  imageUrl,
  className,
  variant = "light",
}: SatelliteCardProps) {
  const isDark = variant === "dark"

  const statusColors = {
    Operational: "bg-[oklch(0.6_0.18_145)] text-white",
    Degraded: "bg-[oklch(0.65_0.18_45)] text-white",
    Offline: "bg-[oklch(0.55_0.22_25)] text-white",
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        isDark
          ? "bg-[oklch(0.18_0.025_220)] border-[oklch(0.28_0.03_220)]"
          : "bg-card border-border",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {imageUrl && (
            <div
              className={cn(
                "w-10 h-10 rounded-full overflow-hidden flex-shrink-0",
                isDark ? "bg-[oklch(0.25_0.03_220)]" : "bg-muted"
              )}
            >
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <h3
              className={cn(
                "font-semibold",
                isDark ? "text-[oklch(0.92_0.02_200)]" : "text-foreground"
              )}
            >
              {name}
            </h3>
            {noradId && (
              <p
                className={cn(
                  "text-sm",
                  isDark
                    ? "text-[oklch(0.65_0.03_200)]"
                    : "text-muted-foreground"
                )}
              >
                NORAD {noradId}
              </p>
            )}
          </div>
        </div>
        <Badge className={cn("text-xs", statusColors[status])}>{status}</Badge>
      </div>

      {(altitude || orbitType || launchDate) && (
        <div
          className={cn(
            "mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-sm",
            isDark ? "border-[oklch(0.28_0.03_220)]" : "border-border"
          )}
        >
          {altitude && (
            <div>
              <span
                className={cn(
                  "text-xs",
                  isDark
                    ? "text-[oklch(0.65_0.03_200)]"
                    : "text-muted-foreground"
                )}
              >
                Altitude
              </span>
              <p
                className={cn(
                  "font-medium",
                  isDark ? "text-[oklch(0.92_0.02_200)]" : "text-foreground"
                )}
              >
                {altitude} km
              </p>
            </div>
          )}
          {orbitType && (
            <div>
              <span
                className={cn(
                  "text-xs",
                  isDark
                    ? "text-[oklch(0.65_0.03_200)]"
                    : "text-muted-foreground"
                )}
              >
                Orbit Type
              </span>
              <p
                className={cn(
                  "font-medium",
                  isDark ? "text-[oklch(0.92_0.02_200)]" : "text-foreground"
                )}
              >
                {orbitType}
              </p>
            </div>
          )}
          {launchDate && (
            <div className="col-span-2">
              <span
                className={cn(
                  "text-xs",
                  isDark
                    ? "text-[oklch(0.65_0.03_200)]"
                    : "text-muted-foreground"
                )}
              >
                Launch Date
              </span>
              <p
                className={cn(
                  "font-medium",
                  isDark ? "text-[oklch(0.92_0.02_200)]" : "text-foreground"
                )}
              >
                {launchDate}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
