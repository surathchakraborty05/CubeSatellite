"use client"
import { renderToString } from "react-dom/server"
import { Satellite } from "lucide-react"
import { useEffect, useRef, useState } from "react"
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

          // CREATE markers only once
          if (SatelliteMarkersRef.current.length === 0) {
            SatelliteMarkersRef.current = SatelliteSatrecsRef.current.map((satrec) => {

              const pv = satellite.propagate(satrec, simDate)
              if (!pv || !pv.position) return null

              const gmst = satellite.gstime(simDate)
              const geo = satellite.eciToGeodetic(pv.position as any, gmst)

              const lat = satellite.degreesLat(geo.latitude)
              const lng = satellite.degreesLong(geo.longitude)

              return L.circleMarker([lat, lng], {
                radius: 3,
                color: "red",
                fillOpacity: 0.7,
                className: "satellite-animate",
              }).addTo(mapRef.current!)
            }).filter(Boolean) as L.CircleMarker[]

          } else {
            // UPDATE positions
            SatelliteMarkersRef.current.forEach((marker, i) => {
              const satrec = SatelliteSatrecsRef.current[i]

              const pv = satellite.propagate(satrec, simDate)
              if (!pv || !pv.position) return

              const gmst = satellite.gstime(simDate)
              const geo = satellite.eciToGeodetic(pv.position as any, gmst)

              const lat = satellite.degreesLat(geo.latitude)
              const lng = satellite.degreesLong(geo.longitude)

              marker.setLatLng([lat, lng])
            })
          }

        } else {
          // REMOVE when OFF
          SatelliteMarkersRef.current.forEach(m => m.remove())
          SatelliteMarkersRef.current = []
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
        } else {
          // 🔴 REMOVE markers if showDebrisRef.current is false
          if (debrisMarkersRef.current.length > 0) {
            debrisMarkersRef.current.forEach(m => m.remove());
            debrisMarkersRef.current = [];
          }
        }
      }
      if (mapRef.current) {
        if (satMarkersRef.current.length === 0) {
          satMarkersRef.current = positions
            .map(([lat, lng], index) => {
              if (index === 0) return null // skip main

              return L.marker([lat, lng], {
                icon: satIcon,
              })
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
                color: "#17bf8a",
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
      iconUrl: "/satellite.png",
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
// "use client"
// import { useEffect, useRef, useState } from "react"
// import L from "leaflet"
// import * as satellite from "satellite.js"

// type Props = {
//   onCenterReady?: (fn: () => void) => void
//   onFollowReady?: (fn: (state: boolean) => void) => void
// }

// const MapComponent = ({ onCenterReady, onFollowReady }: Props) => {
//   const followRef = useRef(false)
//   const mapRef = useRef<L.Map | null>(null)
//   const markerRef = useRef<L.Marker | null>(null)

//   // ✅ TLE state
//   const [tle, setTle] = useState<{ line1: string; line2: string; name: string } | null>(null)

//   useEffect(() => {
//     const existingMap = document.getElementById("map")
//     if (existingMap && (existingMap as any)._leaflet_id) return

//     const satelliteIcon = L.icon({
//       iconUrl: "/satellite.png",
//       iconSize: [90, 70],
//       iconAnchor: [20, 20],
//     })

//     const map = L.map("map", {
//       center: [20, 0],
//       zoom: 3,
//     })
//     mapRef.current = map

//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map)

//     const marker = L.marker([20, 0], { icon: satelliteIcon }).addTo(map)
//     markerRef.current = marker

//     let satrec: satellite.SatRec | null = null
//     let interval: number

//     // ✅ Function to fetch TLE from API
//     const fetchTLE = async () => {
//       try {
//         const res = await fetch("https://tle.ivanstanojevic.me/api/tle/25544")
//         const data = await res.json()
//         const tleData = {
//           name: data.name,
//           line1: data.line1,
//           line2: data.line2,
//         }
//         setTle(tleData)

//         // Create satellite record
//         satrec = satellite.twoline2satrec(tleData.line1, tleData.line2)
//       } catch (err) {
//         console.error("Error fetching TLE:", err)
//       }
//     }

//     // ✅ Initial fetch
//     fetchTLE()

//     // ✅ Re-fetch every 2 hours (7200*1000 ms)
//     const tleInterval = setInterval(fetchTLE, 2 * 60 * 60 * 1000)

//     // ✅ Animation interval (marker movement)

//     interval = window.setInterval(() => {
//       if (!satrec || !markerRef.current) return

//       const now = new Date()
//       const pv = satellite.propagate(satrec, now)
//       if (!pv || !pv.position) return

//       const gmst = satellite.gstime(now)
//       const geo = satellite.eciToGeodetic(pv.position, gmst)

//       const lat = satellite.degreesLat(geo.latitude)
//       const lng = satellite.degreesLong(geo.longitude)

//       markerRef.current.setLatLng([lat, lng])

//       if (followRef.current && mapRef.current) {
//         mapRef.current.setView([lat, lng], mapRef.current.getZoom(), { animate: true })
//       }
//     }, 1000)

//     const handleCenter = () => {
//       if (!mapRef.current || !markerRef.current) return
//       mapRef.current.setView(markerRef.current.getLatLng(), mapRef.current.getZoom(), {
//         animate: true,
//         duration: 1.5,
//       })
//     }
//     const handleFollow = (state: boolean) => {
//       followRef.current = state
//     }

//     if (onCenterReady) onCenterReady(handleCenter)
//     if (onFollowReady) onFollowReady(handleFollow)

//     return () => {
//       clearInterval(interval)
//       clearInterval(tleInterval)
//       map.remove()
//     }
//   }, [])

//   return <div id="map" className="w-full h-full" />
// }

// export default MapComponent