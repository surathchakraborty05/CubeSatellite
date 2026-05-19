"use client"
import { useEffect, useRef } from "react"
import * as satellite from "satellite.js"

type Props = {
  tleLine1: string
  tleLine2: string
  currentTime: Date        // ← controlled from parent
  onMapReady?: (map: any) => void  // ← expose map instance for centering
}

const MapComponenttimeline = ({ tleLine1, tleLine2, currentTime, onMapReady }: Props) => {
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const satrec = useRef<any>(null)

  // ── Init map once ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link")
      link.id = "leaflet-css"
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }

    const L = require("leaflet")
    const container = containerRef.current
    if (!container) return

    const map = L.map(container, { center: [20, 0], zoom: 2 })
    mapRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map)

    const satelliteIcon = L.icon({
      iconUrl: "/satellite.png",
      iconSize: [90, 70],
      iconAnchor: [45, 35],
    })

    const marker = L.marker([20, 0], { icon: satelliteIcon }).addTo(map)
    markerRef.current = marker

    satrec.current = satellite.twoline2satrec(tleLine1, tleLine2)

    let destroyed = false
    const sizeTimer = setTimeout(() => {
      if (!destroyed) map.invalidateSize()
    }, 100)

    const onResize = () => { if (!destroyed) map.invalidateSize() }
    window.addEventListener("resize", onResize)

    onMapReady?.(map)

    return () => {
      destroyed = true
      clearTimeout(sizeTimer)
      window.removeEventListener("resize", onResize)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update marker whenever currentTime changes ─────────────────────────────
  useEffect(() => {
    if (!markerRef.current || !satrec.current) return

    const pv = satellite.propagate(satrec.current, currentTime)
    if (!pv?.position) return

    const gmst = satellite.gstime(currentTime)
    const geo = satellite.eciToGeodetic(pv.position as satellite.EciVec3<number>, gmst)
    const lat = satellite.degreesLat(geo.latitude)
    const lng = satellite.degreesLong(geo.longitude)

    markerRef.current.setLatLng([lat, lng])
  }, [currentTime])

  return <div ref={containerRef} className="w-full h-full" />
}

export default MapComponenttimeline