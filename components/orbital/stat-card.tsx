import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  variant?: "default" | "primary" | "accent" | "muted"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StatCard({
  label,
  value,
  unit,
  variant = "default",
  size = "md",
  className,
}: StatCardProps) {
  const variantStyles = {
    default: "bg-card border-border",
    primary: "bg-primary/10 border-primary/20",
    accent: "bg-[oklch(0.65_0.18_45)]/10 border-[oklch(0.65_0.18_45)]/20",
    muted: "bg-muted border-border",
  }

  const sizeStyles = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  }

  const valueSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }

  return (
    <div
      className={cn(
        "rounded-lg border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-bold",
            valueSizes[size],
            variant === "primary" && "text-primary",
            variant === "accent" && "text-[oklch(0.65_0.18_45)]"
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  )
}
