import { cn } from "@/lib/utils"

interface TelemetryGaugeProps {
  label: string
  value: string | number
  unit?: string
  updatedAt?: string
  variant?: "light" | "dark"
  icon?: React.ReactNode
}

export function TelemetryGauge({
  label,
  value,
  unit,
  updatedAt,
  variant = "light",
  icon,
}: TelemetryGaugeProps) {
  const isDark = variant === "dark"

  return (
    <div
      className={cn(
        "rounded-lg border p-4 text-center",
        isDark
          ? "bg-[oklch(0.18_0.025_220)] border-[oklch(0.28_0.03_220)]"
          : "bg-card border-border"
      )}
    >
      {icon && (
        <div
          className={cn(
            "mx-auto mb-2 w-16 h-16 flex items-center justify-center",
            isDark ? "text-[oklch(0.65_0.15_190)]" : "text-primary"
          )}
        >
          {icon}
        </div>
      )}
      <p
        className={cn(
          "text-sm mb-1",
          isDark ? "text-[oklch(0.65_0.03_200)]" : "text-muted-foreground"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "text-xl font-bold",
          isDark ? "text-[oklch(0.92_0.02_200)]" : "text-foreground"
        )}
      >
        {value}
        {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
      </p>
      {updatedAt && (
        <p
          className={cn(
            "text-xs mt-1",
            isDark ? "text-[oklch(0.5_0.03_200)]" : "text-muted-foreground/70"
          )}
        >
          Updated {updatedAt}
        </p>
      )}
    </div>
  )
}
