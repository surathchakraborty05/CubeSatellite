"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronUp, Satellite, Globe, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

interface Layer {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

interface InstrumentPanelProps {
  className?: string
  smoothMotion: boolean
  setSmoothMotion: (val: boolean) => void
  speed: number
  setSpeed: React.Dispatch<React.SetStateAction<number>>
  showConstellation: boolean
  setShowConstellation: (val: boolean) => void
  showSatPoints: boolean
  setShowSatPoints: (val: boolean) => void
  mapType: string
  setMapType: (val: string) => void
  showDebris: boolean
  setShowDebris: (val: boolean) => void
}

export function InstrumentPanel({
  className,
  smoothMotion,
  setSmoothMotion,
  speed,
  setSpeed,
  showConstellation,
  setShowConstellation,
  showSatPoints,
  setShowSatPoints,
  mapType,
  setMapType,
  showDebris,
  setShowDebris


}: InstrumentPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: "satellites",
      name: "Satellites",
      description: "Show individual spacecraft",
      icon: <Satellite className="h-4 w-4" />,
      enabled: true,
    },
    {
      id: "constellations",
      name: "Constellations",
      description: "Grouped constellation overlays",
      icon: <Globe className="h-4 w-4" />,
      enabled: true,
    },
    {
      id: "debris",
      name: "Debris",
      description: "Track catalogued debris",
      icon: <Trash2 className="h-4 w-4" />,
      enabled: false,
    },
  ])

  // const [projection, setProjection] = useState("equirectangular")
  const [mapBrightness, setMapBrightness] = useState([65])
  // const [smoothMotion, setSmoothMotion] = useState(true)

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, enabled: !layer.enabled } : layer
      )
    )
  }

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg overflow-y-auto [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border overflow-y-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center dark:bg-[oklch(0.25_0.03_220)]">
            <svg
              className="w-4 h-4 text-muted-foreground dark:text-[oklch(0.65_0.03_200)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>
          <span className="font-medium text-foreground">
            Instrument Panel
          </span>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-6">
          {/* Layers Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">
                Layers
              </span>
              <span className="text-xs text-muted-foreground">
                Select overlays
              </span>
            </div>

            <div className="space-y-2">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-primary">
                      {layer.icon}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {layer.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {layer.description}
                      </p>
                    </div>
                  </div>

                  <Switch
                    checked={
                      layer.id === "constellations"
                        ? showConstellation
                        : layer.id === "satellites"
                          ? showSatPoints
                          : layer.id === "debris"
                            ? showDebris
                            : layer.enabled
                    }
                    onCheckedChange={(val) => {
                      if (layer.id === "constellations") {
                        setShowConstellation(val)
                      } else if (layer.id === "satellites") {
                        setShowSatPoints(val)
                      } else if (layer.id === "debris") {
                        setShowDebris(val)
                      } else {
                        toggleLayer(layer.id)
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Playback & Projection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">
                Playback & Projection
              </span>
              <span className="text-xs text-muted-foreground">
                Control temporal flow
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Playback Speed
                </p>
                <Slider
                  value={[speed]}
                  onValueChange={(val) => setSpeed(val[0])}
                  min={0.25}
                  max={8}
                  step={0.25}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.25x</span>
                  <span>{speed}x</span>
                  <span>8x</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Projection
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["Default", "Topo", "Satellite", "Night"].map(
                    (proj) => (
                      <button
                        key={proj}
                        onClick={() => setMapType(proj.toLowerCase())}
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-medium transition-colors",
                          mapType === proj.toLowerCase()
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        )}
                      >
                        {proj}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Instrument Controls */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">
                Instrument Controls
              </span>
              <span className="text-xs text-muted-foreground">
                Tactile knobs
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[oklch(0.25_0.03_220)] flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-[oklch(0.65_0.15_190)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Map Brightness
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Knob position: {mapBrightness[0]}%
                    </p>
                  </div>
                </div>
                <span className="text-sm text-foreground">
                  {mapBrightness[0]}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[oklch(0.25_0.03_220)] flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-[oklch(0.65_0.18_45)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Smooth Motion
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Interpolation: {smoothMotion ? "On" : "Off"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={smoothMotion}
                  onCheckedChange={setSmoothMotion}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-[oklch(0.5_0.03_200)]">
            Instrument Panel Firmware v2.14
            <br />
            We Shall be Adding More Features in later Versions
          </p>
        </div>
      )}
    </div>
  )
}
