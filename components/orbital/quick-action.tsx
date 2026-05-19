import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface QuickActionProps {
  label: string
  icon?: LucideIcon
  variant?: "primary" | "secondary" | "outline"
  theme?: "light" | "dark"
  onClick?: () => void
  className?: string
}

export function QuickAction({
  label,
  icon: Icon,
  variant = "secondary",
  theme = "light",
  onClick,
  className,
}: QuickActionProps) {
  const isDark = theme === "dark"

  const variantStyles = {
    primary: isDark
      ? "bg-[oklch(0.65_0.15_190)] text-[oklch(0.12_0.02_220)] hover:bg-[oklch(0.7_0.15_190)]"
      : "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: isDark
      ? "bg-[oklch(0.25_0.03_220)] text-[oklch(0.92_0.02_200)] hover:bg-[oklch(0.3_0.03_220)]"
      : "bg-muted text-muted-foreground hover:bg-muted/80",
    outline: isDark
      ? "border border-[oklch(0.28_0.03_220)] bg-transparent text-[oklch(0.92_0.02_200)] hover:bg-[oklch(0.22_0.025_220)]"
      : "border border-border bg-transparent text-foreground hover:bg-muted",
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors",
        variantStyles[variant],
        className
      )}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {label}
    </button>
  )
}
