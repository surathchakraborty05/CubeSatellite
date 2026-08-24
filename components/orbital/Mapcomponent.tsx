"use client"
import { renderToString } from "react-dom/server"
import { Satellite } from "lucide-react"
import { useEffect, useRef, useState, useMemo } from "react"
import L from "leaflet"
import * as satellite from "satellite.js"
import "leaflet.marker.slideto"
import { SATELLITE_DATA } from '@/data/satellitedata';

type Props = {
  isPlaying: boolean
  speed: number
  smoothMotion: boolean
  showConstellation: boolean
  showSatPoints: boolean
  onCenterReady?: (fn: () => void) => void
  onFollowReady?: (fn: (state: boolean) => void) => void
  onSatelliteHover?: (satData: any) => void
  showSatellites: boolean
  mapType: string
  showSatellite: boolean
  showDebris: boolean
  targetCoords: { lat: number, lng: number } | null;
  targetSatelliteName?: string;
  satelliteList: any[];
  debrisList: any[];
  simTime: number;
}
type CollisionAlert = {
  object1: string;
  object2: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  closestDistanceKm: number;
  timeToClosestApproachSec: number;
};
function formatTime(sec: number) {
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;

  return `${mins}m ${secs}s`;
}
function getThreatLevel(distanceKm: number) {
  if (distanceKm < 1) return "CRITICAL";
  if (distanceKm < 5) return "HIGH";
  if (distanceKm < 20) return "MEDIUM";
  return "LOW";
}
const TICK_MS = 100 // fixed real-time interval (ms)
// const generateGlobalDebris = (count: number) => {
//   return Array.from({ length: count }, (_, i) => {
//     const satId = (50000 + i).toString().padStart(5, '0');

//     // 1. SCATTER LOGIC
//     // Randomize the tilt (Equator to Poles)
//     const inc = (Math.random() * 180).toFixed(4).padStart(8, ' ');
//     // Randomize the "Longitude" of the orbit plane
//     const raan = (Math.random() * 360).toFixed(4).padStart(8, ' ');
//     // Randomize the position of the object ALONG that orbit
//     const ma = (Math.random() * 360).toFixed(4).padStart(8, ' ');

//     // 2. REALISM PARAMETERS
//     const ecc = "0001234"; // Near-circular
//     const motion = (14.0 + Math.random() * 1.5).toFixed(8).padStart(11, ' ');
//     const epoch = "26096.50000000"; // Current 2026 date

//     return {
//       name: `DEB-GLOBAL-${i.toString().padStart(3, '0')}`,
//       line1: `1 ${satId}U 26001A   ${epoch}  .00000123  00000-0  10000-3 0  999${i % 10}`,
//       line2: `2 ${satId} ${inc} ${raan} ${ecc} 000.0000 ${ma} ${motion}00001`
//     };
//   });
// };

// const expandedSatellites = generateGlobalDebris(1);
const SatelliteData = SATELLITE_DATA
const MapComponent = ({
  isPlaying,
  speed,
  smoothMotion,
  onCenterReady,
  onFollowReady,
  onSatelliteHover,
  showConstellation,
  showSatPoints,
  showSatellites,
  mapType,
  showSatellite,
  showDebris,
  targetCoords,
  targetSatelliteName,
  satelliteList,
  debrisList,
  simTime,
}: Props) => {
  const collisionStartRef = useRef<number>(Date.now());
  const SatelliteMarkersRef = useRef<L.CircleMarker[]>([])
  const followRef = useRef(false)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const satrecRef = useRef<any>(null)
  const satrecsRef = useRef<any[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)
  const showConstellationRef = useRef(showConstellation)
  const wasVisibleRef = useRef(true)
  const tileLayersRef = useRef<any>({})
  const isPlayingRef = useRef(isPlaying)
  const speedRef = useRef(speed)
  const smoothMotionRef = useRef(smoothMotion)
  const simTimeRef = useRef<number>(Date.now())
  const showSatellitesRef = useRef(showSatellites)
  const satMarkersRef = useRef<L.Marker[]>([])
  const showSatPointsRef = useRef(showSatPoints)
  const [isMapReady, setIsMapReady] = useState(false)
  // const expandedSatellites = generateGlobalDebris(1);
  // const combinedSatellite =  [...satelliteList, ...expandedSatellites];
  const showSatelliteRef = useRef(showSatellite);
  const debrisSatrecsRef = useRef<any[]>([])
  const debrisMarkersRef = useRef<L.CircleMarker[]>([])
  const SatelliteSatrecsRef = useRef<any[]>([]);
  const showDebrisRef = useRef(showDebris);
  const [collisionAlerts, setCollisionAlerts] = useState<CollisionAlert[]>([]);
  const collisionMapRef = useRef<Map<string, CollisionAlert>>(new Map());
  const markerAlertsRef = useRef<Map<string, string>>(new Map());
  const satIcon = L.divIcon({
    html: renderToString(
      <Satellite size={30} color="#031713" />
    ),
    className: "custom-sat-icon",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
  const updatePositions = () => {
    // USE THE PROP instead of new Date()
    const currentTime = new Date(simTime);
    const gmst = satellite.gstime(currentTime);

    SatelliteSatrecsRef.current.forEach((satrec, index) => {
      const positionAndVelocity = satellite.propagate(satrec, currentTime);

      if (positionAndVelocity && positionAndVelocity.position) {
        // ... calculate lat/lng and update marker position
      }
    });
  };

  // Ensure your useEffect that drives the map depends on [simTime]
  useEffect(() => {
    updatePositions();
  }, [simTime]);
  useEffect(() => {
    showSatellitesRef.current = showSatellites
  }, [showSatellites])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { smoothMotionRef.current = smoothMotion }, [smoothMotion])
  useEffect(() => {
    showConstellationRef.current = showConstellation
  }, [showConstellation])
  useEffect(() => {
    showSatPointsRef.current = showSatPoints
  }, [showSatPoints])
  useEffect(() => {
    showSatelliteRef.current = showSatellite
  }, [showSatellite])
  useEffect(() => {
    showDebrisRef.current = showDebris;
  }, [showDebris]);
  // MapComponent.tsx - Inside the component
  useEffect(() => {
    if (!mapRef.current) return;

    // CASE A: User searched for a Satellite
    if (targetSatelliteName) {
      const targetSat = SatelliteData.find(
        (s) => s.name.toLowerCase() === targetSatelliteName.toLowerCase()
      );

      if (targetSat) {
        const satrec = satellite.twoline2satrec(targetSat.line1, targetSat.line2);
        const simDate = new Date(simTimeRef.current);
        const pv = satellite.propagate(satrec, simDate);

        if (pv && pv.position) {
          const gmst = satellite.gstime(simDate);
          const geo = satellite.eciToGeodetic(pv.position as any, gmst);
          const lat = satellite.degreesLat(geo.latitude);
          const lng = satellite.degreesLong(geo.longitude);

          mapRef.current.flyTo([lat, lng], mapType === 'night' ? 8 : 10, { animate: true, duration: 2 });
        }
        return; // Exit so it doesn't run the location logic
      }
    }

    // CASE B: User searched for a Place (targetCoords is present)
    if (targetCoords) {
      const safeZoom = mapType === 'night' ? 8 : 12;
      mapRef.current.flyTo([targetCoords.lat, targetCoords.lng], safeZoom, {
        animate: true,
        duration: 2
      });
    }
  }, [targetSatelliteName, targetCoords, mapType]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPlayingRef.current) return
      if (!satrecRef.current || !markerRef.current) return

      // Advance simulated time by (real elapsed * speed)
      simTimeRef.current += TICK_MS * speedRef.current

      const simDate = new Date(simTimeRef.current)
      const pv = satellite.propagate(satrecRef.current, simDate)

      if (!pv || !pv.position) return

      const gmst = satellite.gstime(simDate)
      const geo = satellite.eciToGeodetic(pv.position as satellite.EciVec3<number>, gmst)

      const lat = satellite.degreesLat(geo.latitude)
      const lng = satellite.degreesLong(geo.longitude)
      const positions: [number, number][] = []

      satrecsRef.current.forEach((satrec) => {
        const pv = satellite.propagate(satrec, simDate)
        if (!pv || !pv.position) return

        const gmst = satellite.gstime(simDate)
        const geo = satellite.eciToGeodetic(
          pv.position as satellite.EciVec3<number>,
          gmst
        )

        const lat = satellite.degreesLat(geo.latitude)
        const lng = satellite.degreesLong(geo.longitude)

        positions.push([lat, lng])
      })
      if (mapRef.current) {
        if (showSatelliteRef.current) {
          // Helper function to find a matching alert for a given satellite name
          const findAlertForSat = (satName: string): CollisionAlert | undefined => {
            if (!satName) return undefined;
            const cleanName = satName.trim().toLowerCase();
            let matchedAlert: CollisionAlert | undefined;

            collisionMapRef.current.forEach((val, key) => {
              const cleanKey = key.trim().toLowerCase();
              // Match exact string OR partial string (e.g. "NOAA" matches "NOAA 19")
              if (
                cleanKey === cleanName ||
                cleanKey.includes(cleanName) ||
                cleanName.includes(cleanKey)
              ) {
                matchedAlert = val;
              }
            });

            return matchedAlert;
          };

          // Helper function to generate HTML content for the tooltip
          const getTooltipHTML = (satName: string, satType: string, alert?: CollisionAlert) => {


            return `
              <div style="padding:4px">
                <strong>${satName}</strong><br/>
                Type: ${satType || "Satellite"}<br/>
                ${alert
                ? `
                      <hr/>
                      <span style="color:red; font-weight:bold">
                        ⚠ ${alert.risk} THREAT
                      </span><br/>
                      <strong>Threat:</strong>
      ${
        alert.object1 === satName
          ? alert.object2
          : alert.object1
      }
      <br/>

                      Closest Approach: ${formatTime(alert.timeToClosestApproachSec)}<br/>
                      Distance: ${alert.closestDistanceKm.toFixed(2)} km
                    `
                : "No threats"
              }
              </div>
            `;
          };

          // --- CREATE MARKERS (Run once when empty) ---
          if (SatelliteMarkersRef.current.length === 0) {
            SatelliteMarkersRef.current = SatelliteSatrecsRef.current.map((satrec, index) => {
              const pv = satellite.propagate(satrec, simDate);
              if (!pv || !pv.position) return null;

              const gmst = satellite.gstime(simDate);
              const geo = satellite.eciToGeodetic(pv.position as any, gmst);
              const lat = satellite.degreesLat(geo.latitude);
              const lng = satellite.degreesLong(geo.longitude);

              const satInfo = satelliteList[index];
              const alert = satInfo ? findAlertForSat(satInfo.name) : undefined;
              console.log("SAT NAME", satInfo?.name);
              console.log("ALERT FOUND", alert);
              const isDanger = alert && (alert.risk === "HIGH" || alert.risk === "CRITICAL");

              const marker = L.circleMarker([lat, lng], {
                radius: isDanger ? 8 : 3,
                color: isDanger ? "#ff0000" : "red",
                fillOpacity: 0.9,
                interactive: true,
                className: "satellite-animate satellite-interactive-dot",
              }).addTo(mapRef.current!);

              if (satInfo) {
                const alertStateKey = alert
                  ? `${alert.risk}-${alert.closestDistanceKm.toFixed(2)}-${alert.timeToClosestApproachSec}`
                  : "NO_THREAT";
                markerAlertsRef.current.set(satInfo.name, alertStateKey);

                marker.bindTooltip(getTooltipHTML(satInfo.name, satInfo.type, alert), {
                  permanent: false,
                  direction: "top",
                  sticky: false,
                  opacity: 0.95,
                  className: "satellite-hover-tooltip",
                });
              }

              return marker;
            }).filter(Boolean) as L.CircleMarker[];

          } else {
            // --- UPDATE MARKERS (Run on every tick) ---
            SatelliteMarkersRef.current.forEach((marker, index) => {
              const satrec = SatelliteSatrecsRef.current[index];
              const satInfo = satelliteList[index];

              const pv = satellite.propagate(satrec, simDate);
              if (!pv || !pv.position) return;

              const gmst = satellite.gstime(simDate);
              const geo = satellite.eciToGeodetic(pv.position as any, gmst);
              const lat = satellite.degreesLat(geo.latitude);
              const lng = satellite.degreesLong(geo.longitude);

              marker.setLatLng([lat, lng]);

              if (satInfo) {
                const alert = findAlertForSat(satInfo.name);
                const alertStateKey = alert
                  ? `${alert.risk}-${alert.closestDistanceKm.toFixed(2)}-${alert.timeToClosestApproachSec}`
                  : "NO_THREAT";

                const prevAlertState = markerAlertsRef.current.get(satInfo.name);

                // Update style and tooltip content only when the alert status changes
                if (prevAlertState !== alertStateKey) {
                  markerAlertsRef.current.set(satInfo.name, alertStateKey);

                  const isDanger = alert && (alert.risk === "HIGH" || alert.risk === "CRITICAL");

                  marker.setStyle({
                    radius: isDanger ? 8 : 3,
                    color: isDanger ? "#ff0000" : "red",
                  });

                  const tooltip = marker.getTooltip();
                  if (tooltip) {
                    tooltip.setContent(getTooltipHTML(satInfo.name, satInfo.type, alert));
                  }
                }
              }
            });
          }
        } else {
          // REMOVE when OFF
          SatelliteMarkersRef.current.forEach(m => m.remove());
          SatelliteMarkersRef.current = [];
          markerAlertsRef.current.clear();
        }
      }
      // ================= DEBRIS =================
      // Inside your main setInterval loop in MapComponent.tsx
      // ================= DEBRIS =================
      if (mapRef.current) {
        // Use the REF here instead of the prop
        if (showDebrisRef.current) {

          // ❗ ALWAYS RESET if mismatch
          if (debrisMarkersRef.current.length !== debrisSatrecsRef.current.length) {
            debrisMarkersRef.current.forEach(m => m.remove());
            debrisMarkersRef.current = [];

            debrisMarkersRef.current = debrisSatrecsRef.current.map((satrec) => {
              const pv = satellite.propagate(satrec, simDate);
              if (!pv || !pv.position) return null;

              const gmst = satellite.gstime(simDate);
              const geo = satellite.eciToGeodetic(pv.position as any, gmst);
              const lat = satellite.degreesLat(geo.latitude);
              const lng = satellite.degreesLong(geo.longitude);

              if (isNaN(lat) || isNaN(lng)) return null;

              return L.circleMarker([lat, lng], {
                radius: 2,
                color: "#eab308", // Tailwind yellow-500
                fillOpacity: 0.8,
              }).addTo(mapRef.current!);
            }).filter(Boolean) as L.CircleMarker[];

          } else {
            // ✅ UPDATE positions
            debrisMarkersRef.current.forEach((marker, i) => {
              const satrec = debrisSatrecsRef.current[i];
              const pv = satellite.propagate(satrec, simDate);
              if (!pv || !pv.position) return;

              const gmst = satellite.gstime(simDate);
              const geo = satellite.eciToGeodetic(pv.position as any, gmst);
              const lat = satellite.degreesLat(geo.latitude);
              const lng = satellite.degreesLong(geo.longitude);

              if (!isNaN(lat) && !isNaN(lng)) {
                marker.setLatLng([lat, lng]);
              }
            });
          }
        }
        else {
          // 🔴 REMOVE markers if showDebrisRef.current is false
          if (debrisMarkersRef.current.length > 0) {
            debrisMarkersRef.current.forEach(m => m.remove());
            debrisMarkersRef.current = [];
          }
        }

      }
      if (mapRef.current) {
        if (satMarkersRef.current.length === 0) {
          const hardcodedSats = [
            { name: "NOAA", type: "Weather Satellite" },
            { name: "HST", type: "Space Telescope" }
          ];

          satMarkersRef.current = positions
            .map(([lat, lng], index) => {
              if (index === 0) return null // skip main

              const m = L.marker([lat, lng], {
                icon: satIcon,
              });

              // Match the index offset (index 1 maps to hardcodedSats[0], index 2 to hardcodedSats[1])
              const satInfo = hardcodedSats[index - 1];
              if (satInfo) {
                let alert: CollisionAlert | undefined;
                const cleanName = satInfo.name.trim().toLowerCase();

                collisionMapRef.current.forEach((val, key) => {
                  const cleanKey = key.trim().toLowerCase();
                  if (cleanKey === cleanName || cleanKey.includes(cleanName) || cleanName.includes(cleanKey)) {
                    alert = val;
                  }
                });

                const tooltipContent = `
                    <div style="font-family: sans-serif; padding: 2px;">
                      <strong>${satInfo.name}</strong><br/>
                      <span style="font-size: 11px; color: #666;">Type: ${satInfo.type}</span>
                      ${alert ? `
                        <hr style="margin: 4px 0; border-color: #555;"/>
                        <span style="color:red; font-weight:bold">
                          ⚠ ${alert.risk} THREAT
                        </span><br/>
                        Closest Approach: ${formatTime(alert.timeToClosestApproachSec)}<br/>
                        Distance: ${alert.closestDistanceKm.toFixed(2)} km
                      ` : `<br/><span style="font-size: 10px; color: #888;">No threats</span>`}
                    </div>
                  `;
                m.bindTooltip(tooltipContent, {
                  permanent: false,
                  direction: 'top',
                  opacity: 0.95,
                  className: 'satellite-hover-tooltip'
                });
              }

              return m;
            })
            .filter((m): m is L.Marker => m !== null)

          // 👇 ADD ONLY IF ENABLED
          if (showSatPointsRef.current) {
            satMarkersRef.current.forEach((m) => m.addTo(mapRef.current!))
          }
        } else {
          // ✅ UPDATE positions only
          positions.forEach((pos, i) => {
            if (i === 0) return
            satMarkersRef.current[i - 1]?.setLatLng(pos)
          })
        }

      }

      if (mapRef.current) {
        const isVisible = showConstellationRef.current

        // 🔴 TURN OFF → remove ONLY ONCE
        if (!isVisible && wasVisibleRef.current) {
          if (polylineRef.current) {
            polylineRef.current.remove()
            polylineRef.current = null
          }
          wasVisibleRef.current = false
        }

        // 🟢 TURN ON → draw/update
        if (isVisible) {
          if (positions.length > 1) {
            if (!polylineRef.current) {
              polylineRef.current = L.polyline(positions, {
                color: "#18bf8a",
                weight: 3,
                dashArray: "6, 10",
                className: "animated-line",
              }).addTo(mapRef.current)
            } else {
              polylineRef.current.setLatLngs(positions)
            }
          }
          wasVisibleRef.current = true
        }
      }

      const markerAny = markerRef.current as any

      if (smoothMotionRef.current && markerAny?.slideTo) {
        markerAny.slideTo([lat, lng], { duration: TICK_MS * 0.9 })
      } else {
        markerRef.current?.setLatLng([lat, lng])
      }

      if (followRef.current && mapRef.current) {
        mapRef.current.setView([lat, lng], mapRef.current.getZoom(), {
          animate: smoothMotionRef.current,
        })
      }
    }, TICK_MS)

    return () => clearInterval(interval)
  }, [showDebris])
  // MapComponent.tsx
useEffect(() => {
  const timer = setInterval(() => {
    const remaining =
      Math.max(
        0,
        300 -
        Math.floor(
          (Date.now() - collisionStartRef.current) / 1000
        )
      );

    setCollisionAlerts([
      {
        object1: satelliteList[0]?.name ?? "",
        object2: satelliteList[1]?.name ?? "",
        risk: "CRITICAL",
        closestDistanceKm: 0.45,
        timeToClosestApproachSec: remaining,
      },
    ]);
  }, 1000);

  return () => clearInterval(timer);
}, [satelliteList]);
  // ADD this new dedicated effect to parse debris satrecs whenever debrisList changes
  useEffect(() => {
    if (!debrisList || debrisList.length === 0) return;

    debrisSatrecsRef.current = debrisList
      .map((d) => {
        try {
          return satellite.twoline2satrec(d.line1, d.line2);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // Clear existing markers so they get re-created with new satrecs
    debrisMarkersRef.current.forEach((m) => m.remove());
    debrisMarkersRef.current = [];

    console.log("Debris satrecs parsed:", debrisSatrecsRef.current.length);
  }, [debrisList]);
  useEffect(() => {
    // 1. Brain check: Is the map logic ready?
    if (!isMapReady || !mapRef.current) return;

    const map = mapRef.current;
    const layers = tileLayersRef.current;

    // 2. DOM check: Does the map actually have a container in the DOM?
    // This prevents the 'appendChild' of undefined error
    if (!map.getContainer()) return;

    if (!layers || Object.keys(layers).length === 0) return;

    const selectedLayer = layers[mapType] || layers.default;

    // Remove old layers
    Object.values(layers).forEach((layer: any) => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    // Add new layer
    if (selectedLayer) {
      selectedLayer.addTo(map);
    }

    if (mapType === 'night' && map.getZoom() > 8) {
      map.setZoom(8);
    }
  }, [mapType, isMapReady]);
  useEffect(() => {
    if (!mapRef.current) return

    if (!showSatPoints) {
      satMarkersRef.current.forEach((m) => m.remove())
    } else {
      satMarkersRef.current.forEach((m) => m.addTo(mapRef.current!))
    }
  }, [showSatPoints])
  useEffect(() => {
    console.log("USE EFFECT RUNNING");
    console.log("ALERT OBJECT1", collisionAlerts[0]?.object1);
    console.log("SATELLITE COUNT", satelliteList.length);
    console.log("FIRST SAT", satelliteList[0]?.name);
    const loadAlerts = async () => {
      const res = await fetch("/api/collision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          satellites: satelliteList,
          debris: debrisList,
        }),
      });

      const data = await res.json();

      const alerts: CollisionAlert[] = [
        {
          object1: satelliteList[0]?.name ?? "",
          object2: satelliteList[1]?.name ?? "",
          risk: "CRITICAL",
          closestDistanceKm: 0.45,
          timeToClosestApproachSec: 300,
        },
      ];

      console.log("ALERTS CREATED", alerts);

      setCollisionAlerts(alerts);

      console.log("SET COLLISION ALERTS CALLED");
      console.log("SAT0", satelliteList[0]?.name);
      console.log("SAT1", satelliteList[1]?.name);
      console.log("ALERTS", alerts);
      console.log("ALERTS", alerts);
    };
//     const loadAlerts = async () => {
//   if (satelliteList.length < 2) return;

//   const alerts: CollisionAlert[] = [
//     {
//       object1: satelliteList[0].name,
//       object2: satelliteList[1].name,
//       risk: "CRITICAL",
//       closestDistanceKm: 0.45,
//       timeToClosestApproachSec: 300,
//     },
//   ];

//   console.log("ALERTS CREATED", alerts);

//   setCollisionAlerts(alerts);
// };

    loadAlerts();


    const timer = setInterval(loadAlerts, 3000000);

    return () => clearInterval(timer);
  }, [satelliteList, debrisList]);
  const collisionMap = useMemo(() => {
    const map = new Map<string, CollisionAlert>();

    collisionAlerts.forEach((alert) => {
      map.set(alert.object1, alert);
      map.set(alert.object2, alert);
    });
    console.log("COLLISION MAP", [...map.keys()]);
    return map;
  }, [collisionAlerts]);
  useEffect(() => {
    collisionMapRef.current = collisionMap;
  }, [collisionMap]);
  // const alert = collisionMap.get(satInfo.name);

  // const isDanger =
  //   alert &&
  //   (alert.risk === "HIGH" ||
  //     alert.risk === "CRITICAL");
  // const marker = L.circleMarker([lat, lng], {
  //   radius: isDanger ? 8 : 3,
  //   color: isDanger ? "#ff0000" : "red",
  //   fillOpacity: 0.9,
  //   className: isDanger
  //     ? "collision-blink"
  //     : "satellite-animate",
  // });
  // marker.bindTooltip(`
  // <div style="padding:4px">
  //   <strong>${satInfo.name}</strong><br/>
  //   Type: ${satInfo.type}<br/>

  //   ${
  //     alert
  //       ? `
  //       <hr/>
  //       <span style="color:red">
  //         ⚠ ${alert.risk}
  //       </span><br/>
  //       Closest Approach:
  //       ${formatTime(
  //         alert.timeToClosestApproachSec
  //       )}<br/>
  //       Distance:
  //       ${alert.closestDistanceKm.toFixed(2)} km
  //       `
  //       : "No threats"
  //   }
  // </div>
  // `);
  useEffect(() => {
    const satellites = [
      {
        name: "ISS",
        line1: "1 25544U 98067A   24067.51782528  .00016717  00000+0  10270-3 0  9993",
        line2: "2 25544  51.6433  21.4473 0007417  51.8621  62.3224 15.50012345678901",
      },
      {
        name: "NOAA",
        line1: "1 28654U 05018A   24067.12345678  .00000023  00000+0  12345-4 0  9991",
        line2: "2 28654  99.1234 120.5678 0012345 200.1234 150.5678 14.12345678901234",
      },
      {
        name: "HST",
        line1: "1 20580U 90037B   24067.76543210  .00000567  00000+0  23456-4 0  9992",
        line2: "2 20580  28.4697  45.1234 0002345 100.1234 250.5678 15.12345678901234",
      },
    ]
    satrecsRef.current = satellites.map((sat) =>
      satellite.twoline2satrec(sat.line1, sat.line2)
    )

    SatelliteSatrecsRef.current = satelliteList.map(d =>
      satellite.twoline2satrec(d.line1, d.line2)
    );
    const existingMap = document.getElementById("map")
    if (existingMap && (existingMap as any)._leaflet_id) return

    const satelliteIcon = L.icon({
      iconUrl: "/satelitelogo.png",
      iconSize: [90, 70],
      iconAnchor: [20, 20],
    })

    const map = L.map("map", {
      center: [0, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: mapType === "night" ? 8 : 18,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 120,
    })
    mapRef.current = map
    setIsMapReady(true)
    const defaultLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")

    const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
    })

    const satelliteLayer = L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg',
      { maxZoom: 20 }
    )
    const nightLayer = L.tileLayer(
      'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}',
      {
        attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (ESDIS).',
        bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
        minZoom: 1,
        maxZoom: 8,
        format: 'jpg',
        time: '',
        tilematrixset: 'GoogleMapsCompatible_Level'
      } as any // Use 'as any' to prevent the TypeScript "known properties" error
    );
    tileLayersRef.current = {
      default: defaultLayer,
      topo: topoLayer,
      satellite: satelliteLayer,
      night: nightLayer,
    }

    // Default add
    defaultLayer.addTo(map)


    const marker = L.marker([20, 0], { icon: satelliteIcon }).addTo(map)
    markerRef.current = marker

    // Bind the hover window to the main satellite
    marker.bindTooltip(
      `<div style="font-family: sans-serif; padding: 2px;">
    <strong>ISS (Main)</strong><br/>
    <span style="font-size: 11px; color: #666;">Type: Space Station</span>
  </div>`,
      {
        permanent: false,
        direction: 'top',
        opacity: 0.95,
        className: 'satellite-hover-tooltip'
      }
    );

    const tleLine1 = "1 25544U 98067A   24067.51782528  .00016717  00000+0  10270-3 0  9993"
    const tleLine2 = "2 25544  51.6433  21.4473 0007417  51.8621  62.3224 15.50012345678901"
    satrecRef.current = satellite.twoline2satrec(tleLine1, tleLine2)

    // Sync sim time to real ISS position on load
    simTimeRef.current = Date.now()

    const handleCenter = () => {
      if (!mapRef.current || !markerRef.current) return;

      const latLng = markerRef.current.getLatLng();


      const defaultZoom = mapType === 'night' ? 4 : 2;

      mapRef.current.setView(latLng, defaultZoom, {
        animate: true,
        duration: 1.5,
      });
    };

    const handleFollow = (state: boolean) => {
      followRef.current = state
    }

    onCenterReady?.(handleCenter)
    onFollowReady?.(handleFollow)

    return () => { map.remove() }
  }, [debrisList])

  return <div id="map" className="w-full h-full" />
}

export default MapComponent
