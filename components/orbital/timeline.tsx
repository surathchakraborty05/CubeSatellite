"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface TimelineProps {
  variant?: "light" | "dark"
  currentTime?: string
  totalDuration?: string
  className?: string
  isPlaying: boolean
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
  speed: number
  setSpeed: React.Dispatch<React.SetStateAction<number>>
  simTime: number;
  setSimTime: React.Dispatch<React.SetStateAction<number>>;
}

function fmt2(n: number) { return String(n).padStart(2, "0") }
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${fmt2(d.getMonth() + 1)}-${fmt2(d.getDate())} ` +
    `${fmt2(d.getHours())}:${fmt2(d.getMinutes())}:${fmt2(d.getSeconds())}`
}

export function Timeline({
  variant,
  className,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  simTime,
  setSimTime
}: TimelineProps) {
  const isDark = variant === "dark"
  const [wallClock, setWallClock] = useState("")

  const handleSkipBack = () => {
    setSimTime((prev) => prev - 10000);
  };

  const handleSkipForward = () => {
    setSimTime((prev) => prev + 10000);
  };

  useEffect(() => {
    const TICK_MS = 200
    const id = setInterval(() => {
      const now = new Date()
      setWallClock(fmtDate(now))
    }, TICK_MS)

    return () => clearInterval(id)
  }, [])

  function formatSpeed(speed: number) {
    const minutes = Math.floor(speed)
    const seconds = Math.round((speed % 1) * 100)
    const mm = String(minutes).padStart(2, "0")
    const ss = String(seconds).padStart(2, "0")
    return `00:${mm}:${ss}`
  }

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-center gap-4 p-4 lg:p-3 rounded-xl lg:rounded-lg transition-all",
        isDark
          ? "bg-[oklch(0.12_0.02_220)] border border-[oklch(0.28_0.03_220)]"
          : "bg-background border border-border shadow-sm",
        className
      )}
    >
      {/* Top Row: Playback & Time Display */}
      <div className="flex items-center justify-between w-full lg:w-auto gap-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipBack}
            className={cn(
              "h-8 w-8",
              isDark ? "hover:bg-[oklch(0.22_0.025_220)]" : "hover:bg-muted"
            )}
          >
            <SkipBack className={cn("h-4 w-4", isDark ? "text-[oklch(0.92_0.02_200)]" : "text-foreground")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying(prev => !prev)}
            className={cn(
              "h-10 w-10",
              isDark ? "hover:bg-[oklch(0.22_0.025_220)]" : "hover:bg-muted"
            )}
          >
            {isPlaying ? (
              <Pause className={cn("h-5 w-5", isDark ? "text-[oklch(0.92_0.02_200)]" : "text-foreground")} />
            ) : (
              <Play className={cn("h-5 w-5", isDark ? "text-[oklch(0.92_0.02_200)]" : "text-foreground")} />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipForward}
            className={cn(
              "h-8 w-8",
              isDark ? "hover:bg-[oklch(0.22_0.025_220)]" : "hover:bg-muted"
            )}
          >
            <SkipForward className={cn("h-4 w-4", isDark ? "text-[oklch(0.92_0.02_200)]" : "text-foreground")} />
          </Button>
        </div>

        {/* Current Time Display */}
        <div
          className={cn(
            "text-xs sm:text-sm font-mono whitespace-nowrap px-3 py-1.5 rounded-md lg:bg-transparent",
            isDark 
              ? "text-[oklch(0.92_0.02_200)] bg-black/20" 
              : "text-foreground bg-muted/50"
          )}
        >
          <span className="opacity-50 lg:hidden mr-2">SIM:</span>
          {fmtDate(new Date(simTime))}
        </div>
      </div>

      {/* Middle Row: Timeline Slider */}
      <div className="w-full flex-1 flex items-center gap-3 px-1">
        <span
          className={cn(
            "text-[10px] sm:text-xs uppercase tracking-wider font-bold",
            isDark ? "text-[oklch(0.65_0.03_200)]" : "text-muted-foreground"
          )}
        >
          Live
        </span>
        <Slider
          value={[speed]}
          onValueChange={(val) => setSpeed(val[0])}
          min={0.5}
          max={5}
          step={0.5}
          className="flex-1 cursor-pointer"
        />
        <span
          className={cn(
            "text-[10px] sm:text-sm font-mono min-w-[60px] text-right",
            isDark ? "text-[oklch(0.65_0.03_200)]" : "text-muted-foreground"
          )}
        >
          +{formatSpeed(speed)}
        </span>
      </div>

      {/* Bottom Row: Speed Control */}
      <div className={cn(
        "flex items-center justify-between lg:justify-end w-full lg:w-auto gap-3 pt-2 lg:pt-0 border-t lg:border-none",
        isDark ? "border-white/5" : "border-border/50"
      )}>
        <span
          className={cn(
            "text-[10px] sm:text-sm lg:hidden",
            isDark ? "text-[oklch(0.65_0.03_200)]" : "text-muted-foreground"
          )}
        >
          Propagation Speed
        </span>
        <div className="flex items-center gap-2">
           <span
            className={cn(
              "text-sm hidden lg:block",
              isDark ? "text-[oklch(0.65_0.03_200)]" : "text-muted-foreground"
            )}
          >
            Speed
          </span>
          <Button
            onClick={() => setSpeed(prev => (prev >= 5 ? 1 : prev + 0.5))}
            variant="outline"
            size="sm"
            className={cn(
              "font-mono h-8 lg:h-9",
              isDark 
                ? "border-[oklch(0.28_0.03_220)] bg-transparent text-[oklch(0.92_0.02_200)] hover:bg-[oklch(0.22_0.025_220)] hover:text-[oklch(0.92_0.02_200)]"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
          >
            {speed.toFixed(1)}x
          </Button>
        </div>
      </div>
    </div>
  )
}