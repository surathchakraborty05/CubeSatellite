'use client';

import React, { useMemo, useState, useCallback, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapViewState } from "@deck.gl/core";

// ── Types ────────────────────────────────────────────────────────────────────
interface TemperaturePoint {
  position: [number, number];
  weight: number;
}

// ── Noise helpers (module level — never re-created) ──────────────────────────
function pseudoNoise(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.3) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = pseudoNoise(ix,     iy,     seed);
  const b = pseudoNoise(ix + 1, iy,     seed);
  const c = pseudoNoise(ix,     iy + 1, seed);
  const d = pseudoNoise(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (d - b + a - c) * ux * uy;
}

function fbm(x: number, y: number, seed: number, octaves = 4): number {
  let value = 0, amplitude = 0.5, frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency, seed + i);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

function generateGlobalTemperatureData(): TemperaturePoint[] {
  const points: TemperaturePoint[] = [];
  const latSteps = 90, lngSteps = 180;
  for (let li = 0; li <= latSteps; li++) {
    const lat = -90 + (li / latSteps) * 180;
    for (let lo = 0; lo <= lngSteps; lo++) {
      const lng = -180 + (lo / lngSteps) * 360;
      const latRad = (lat * Math.PI) / 180;
      const latBase = Math.pow(Math.cos(latRad), 1.3);
      const seasonalShift = 0.12 * Math.cos(latRad - 0.35);
      const contEffect = 0.08 * Math.sin((lng * Math.PI) / 60) * Math.cos(latRad * 2);
      const nx = (lng + 180) / 360, ny = (lat + 90) / 180;
      const noise = fbm(nx * 6, ny * 6, 42, 4);
      const noiseContrib = 0.18 * (noise - 0.5);
      const upwelling = -0.06 * Math.max(0, Math.cos(((lng + 90) * Math.PI) / 50)) * Math.exp(-Math.abs(lat) / 15);
      let weight = latBase + seasonalShift + contEffect + noiseContrib + upwelling;
      weight = Math.max(0, Math.min(1, weight));
      points.push({ position: [lng, lat], weight });
    }
  }
  return points;
}

// ── Constants (module level) ─────────────────────────────────────────────────
const WEATHER_COLOR_RANGE: [number, number, number, number][] = [
  [0, 0, 180, 255],
  [0, 200, 240, 255],
  [0, 220, 100, 255],
  [255, 240, 0, 255],
  [255, 140, 0, 255],
  [220, 0, 0, 255],
];

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 20,
  zoom: 1.8,
  pitch: 0,
  bearing: 0,
};

// ── Legend (module level — not inside any other component) ───────────────────
const Legend: React.FC = () => {
  const stops = [
    { label: "< −20°C", color: "rgb(0,0,180)" },
    { label: "−5°C",    color: "rgb(0,200,240)" },
    { label: "15°C",    color: "rgb(0,220,100)" },
    { label: "25°C",    color: "rgb(255,240,0)" },
    { label: "35°C",    color: "rgb(255,140,0)" },
    { label: "> 45°C",  color: "rgb(220,0,0)" },
  ];
  return (
    <div style={{
      position: "absolute", bottom: 24, left: 24,
      background: "rgba(8,8,18,0.82)", backdropFilter: "blur(8px)",
      borderRadius: 10, padding: "12px 16px", color: "#e0e0e0",
      fontFamily: "'Courier New', monospace", fontSize: 12,
      boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      border: "1px solid rgba(255,255,255,0.08)", minWidth: 140,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 8, letterSpacing: 1, fontSize: 11, color: "#aaa", textTransform: "uppercase" }}>
        Temperature
      </div>
      <div style={{ height: 10, borderRadius: 5, marginBottom: 6,
        background: "linear-gradient(to right, rgb(0,0,180), rgb(0,200,240), rgb(0,220,100), rgb(255,240,0), rgb(255,140,0), rgb(220,0,0))",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888" }}>
        <span>Cold</span><span>Hot</span>
      </div>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
        {stops.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#ccc" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Inner DeckGL component ───────────────────────────────────────────────────
const HeatmapInner: React.FC = () => {
  const [tooltipInfo, setTooltipInfo] = useState<{ x: number; y: number; weight: number } | null>(null);
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);

  const data = useMemo<TemperaturePoint[]>(() => generateGlobalTemperatureData(), []);

  const weightToCelsius = (w: number) => Math.round(-30 + w * 75);

  const layers = useMemo(() => [
    new HeatmapLayer<TemperaturePoint>({
      id: "global-temperature-heatmap",
      data,
      getPosition: (d) => d.position,
      getWeight: (d) => Math.pow(d.weight, 1.6),
      radiusPixels: Math.max(15, viewState.zoom * 12),
      intensity: 1 + viewState.zoom * 0.2,
      threshold: 0.03,
      colorRange: WEATHER_COLOR_RANGE,
      aggregation: "SUM",
      pickable: false,
    }),
  ], [data, viewState.zoom]);

  const handleHover = useCallback(
    (info: { x: number; y: number; object?: TemperaturePoint }) => {
      setTooltipInfo(info.object ? { x: info.x, y: info.y, weight: info.object.weight } : null);
    }, []
  );

  return (
    <div className="relative w-full h-full overflow-hidden">
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState }: any) => setViewState(viewState)}
        controller={{ dragRotate: false }}
        layers={layers}
        useDevicePixels={false}
        onHover={handleHover as any}
        style={{ position: "absolute", inset: "0" }}
        parameters={{ depthTest: false } as any}
      >
        <Map
          reuseMaps
          mapStyle={MAP_STYLE}
          attributionControl={false}
          minZoom={1.5}
          maxZoom={6}
          style={{ width: "100%", height: "100%" }}
        />
      </DeckGL>
      <Legend />
      {tooltipInfo && (
        <div style={{
          position: "absolute", left: tooltipInfo.x + 12, top: tooltipInfo.y + 12,
          background: "rgba(10,10,20,0.85)", color: "#fff",
          padding: "6px 10px", borderRadius: 6, fontSize: 13,
          pointerEvents: "none", fontFamily: "monospace",
        }}>
          ~{weightToCelsius(tooltipInfo.weight)}°C
        </div>
      )}
    </div>
  );
};

// ── Outer shell — waits for browser/WebGL to be ready ───────────────────────
const HeatmapView: React.FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setReady(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!ready) return <div style={{ width: '100%', height: '100%', background: '#000' }} />;
  return <HeatmapInner />;
};

export default HeatmapView;