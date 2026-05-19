"use client"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

interface ToggleSwitchProps {
  label: string
  description?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

export function ToggleSwitch({
  label,
  description,
  checked = false,
  onCheckedChange,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}
