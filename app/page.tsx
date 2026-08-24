"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe, Satellite, Activity, Shield, Cpu, Compass,
  Search, RefreshCw, BarChart2, Radio, Server, Play,
  Map, Terminal, Users, CheckCircle, HelpCircle,
  ChevronDown, ChevronRight, ArrowRight, Star, Clock,
  Layers, Database, Sliders, ShieldCheck, Zap, Download
} from 'lucide-react';

// --- Helper: Animated Counter ---
function AnimatedCounter({ target, suffix = '', duration = 1500 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentValue = Math.floor(progress * (target - startValue) + startValue);
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={elementRef} className="font-mono relative group">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// --- Animated Earth Orbit Visualization (NASA/SpaceX Style) ---
// DO NOT CHANGE THIS COMPONENT AS PER INSTRUCTIONS
function OrbitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [trackingActive, setTrackingActive] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = canvas.parentElement?.clientWidth || 600;
    let height = canvas.height = canvas.parentElement?.clientHeight || 500;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 600;
      height = canvas.height = canvas.parentElement?.clientHeight || 500;
    };
    window.addEventListener('resize', handleResize);

    // Simulation variables
    let angleX = 0.45; // Tilted orbit angle
    let angleY = 0;    // Earth rotation angle
    let radarSweepAngle = 0;

    // Orbit coordinates and metadata for realistic satellite markers
    const satellites = [
      { name: 'ISS (ZARYA)', rx: 170, ry: 50, speed: 0.007, color: '#06b6d4', angle: 0, alt: '418 km', vel: '7.66 km/s' },
      { name: 'STARLINK-4112', rx: 220, ry: 75, speed: 0.011, color: '#3b82f6', angle: 1.6, alt: '550 km', vel: '7.59 km/s' },
      { name: 'CUBESAT-OV1', rx: 130, ry: 40, speed: 0.015, color: '#10b981', angle: 3.2, alt: '380 km', vel: '7.68 km/s' },
      { name: 'METEOR-M2', rx: 260, ry: 95, speed: 0.005, color: '#f59e0b', angle: 4.8, alt: '825 km', vel: '7.44 km/s' },
    ];

    const groundStations = [
      { name: 'Svalbard SG-1', lat: 78, lon: 15 },
      { name: 'McMurdo US-1', lat: -77, lon: 166 },
      { name: 'Kourou ESA-2', lat: 5, lon: -52 },
      { name: 'NASA Wallops', lat: 37, lon: -75 },
    ];

    // Starfield particles background
    const stars: { x: number; y: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2,
        alpha: Math.random() * 0.8 + 0.2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const globeRadius = Math.min(width, height) * 0.23;

      // Update rotation variables
      angleY += 0.0025 * rotationSpeed;
      radarSweepAngle += 0.012;

      // Draw dynamic starfield background
      stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * (0.5 + Math.sin(Date.now() * 0.001 + star.x) * 0.2)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw background space telemetry grid (NASA Style)
      if (showGrid) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 45) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, height);
          ctx.stroke();
        }
        for (let j = 0; j < height; j += 45) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(width, j);
          ctx.stroke();
        }

        // Draw radial radar rings
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.03)';
        for (let r = 100; r < Math.max(width, height); r += 100) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw radar sweep line
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.max(width, height) * Math.cos(radarSweepAngle),
          centerY + Math.max(width, height) * Math.sin(radarSweepAngle)
        );
        ctx.stroke();
      }

      // Draw atmospheric glow behind the earth globe
      ctx.shadowBlur = 45;
      ctx.shadowColor = 'rgba(6, 182, 212, 0.25)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.02)';
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadows

      // Draw Day/Night Terminator Arc (shade the right hemisphere slightly)
      const termGrad = ctx.createLinearGradient(centerX - globeRadius, centerY, centerX + globeRadius, centerY);
      termGrad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      termGrad.addColorStop(0.5, 'rgba(10, 15, 30, 0.65)');
      termGrad.addColorStop(1, 'rgba(2, 4, 8, 0.95)');

      // Draw Sphere Shape (Base Earth)
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.fillStyle = termGrad;
      ctx.fill();

      // Draw Latitude Lines (horizontal)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      const latCount = 8;
      for (let i = 1; i < latCount; i++) {
        const yOffset = globeRadius * Math.sin((i / latCount) * Math.PI - Math.PI / 2);
        const ringRadius = globeRadius * Math.cos((i / latCount) * Math.PI - Math.PI / 2);
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + yOffset, ringRadius, ringRadius * Math.sin(angleX), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Longitude Lines (vertical spinning)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
      const lonCount = 12;
      for (let i = 0; i < lonCount; i++) {
        const lonAngle = angleY + (i / lonCount) * Math.PI * 2;
        const visibleWidth = globeRadius * Math.sin(lonAngle);
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, Math.abs(visibleWidth), globeRadius, angleX, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Outer Atmosphere Boundary Ring
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Ground Stations Projected on Rotating Surface
      groundStations.forEach(station => {
        const radLat = (station.lat * Math.PI) / 180;
        const radLon = (station.lon * Math.PI) / 180 + angleY;

        const x = centerX + globeRadius * Math.cos(radLat) * Math.sin(radLon);
        const y = centerY - globeRadius * Math.sin(radLat) + (globeRadius * 0.12 * Math.sin(radLat) * Math.cos(angleX));

        const facingFront = Math.cos(radLon) >= 0;

        if (facingFront) {
          // Green dot for active station
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();

          // Blinking receiver beacon rings
          const beaconSize = (Date.now() / 150) % 10;
          ctx.strokeStyle = `rgba(16, 185, 129, ${1 - beaconSize / 10})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 3 + beaconSize, 0, Math.PI * 2);
          ctx.stroke();

          // Text marker
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '7px monospace';
          ctx.fillText(station.name, x + 8, y + 2.5);
        }
      });

      // Draw Satellite Orbits & Telemetry Particles
      satellites.forEach(sat => {
        // Track orbital path ellipse
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, sat.rx, sat.ry, angleX, 0, Math.PI * 2);
        ctx.stroke();

        // Calculate location on the ellipse path
        sat.angle += sat.speed;
        const satX = centerX + sat.rx * Math.cos(sat.angle) * Math.cos(angleX) - sat.ry * Math.sin(sat.angle) * Math.sin(angleX);
        const satY = centerY + sat.rx * Math.cos(sat.angle) * Math.sin(angleX) + sat.ry * Math.sin(sat.angle) * Math.cos(angleX);

        // Ground track projection line (simulating lock-on)
        if (trackingActive) {
          ctx.strokeStyle = `${sat.color}1e`;
          ctx.setLineDash([2, 5]);
          ctx.beginPath();
          ctx.moveTo(satX, satY);
          ctx.lineTo(centerX, centerY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw animated orbital path trail fading backwards
        for (let i = 1; i < 10; i++) {
          const trailAngle = sat.angle - i * 0.03;
          const tx = centerX + sat.rx * Math.cos(trailAngle) * Math.cos(angleX) - sat.ry * Math.sin(trailAngle) * Math.sin(angleX);
          const ty = centerY + sat.rx * Math.cos(trailAngle) * Math.sin(angleX) + sat.ry * Math.sin(trailAngle) * Math.cos(angleX);

          ctx.fillStyle = `${sat.color}${Math.floor((1 - i / 10) * 180).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(tx, ty, 3.5 - i * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Selected active satellite glows intensely
        ctx.shadowBlur = 15;
        ctx.shadowColor = sat.color;
        ctx.fillStyle = sat.color;
        ctx.beginPath();
        ctx.arc(satX, satY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset

        // Satellite Info Tag
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText(sat.name, satX + 10, satY - 2);

        if (sat.name === 'ISS (ZARYA)') {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.85)';
          ctx.font = '7px monospace';
          ctx.fillText(`ALT: ${sat.alt} | V: ${sat.vel}`, satX + 10, satY + 6);
        }
      });

      // Corner Telemetry HUD items
      ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.font = '8px monospace';
      ctx.fillText('REF FRAME: GCRS (WGS84)', 20, 30);
      ctx.fillText('PROP_ENGINE: SGP4 MULTITHREAD', 20, 42);
      ctx.fillText(`EPOCH UTC: ${new Date().toISOString().substring(11, 23)}`, width - 210, 30);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [showGrid, rotationSpeed, trackingActive]);

  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-zinc-950/70 rounded-2xl border border-cyan-500/20 overflow-hidden flex flex-col justify-between p-5 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.1)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">LIVE SGP4 VISUALIZER DECK</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 text-[8px] font-mono border rounded uppercase tracking-wider transition-all ${showGrid ? 'border-cyan-500/80 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'border-white/10 text-zinc-500 hover:text-cyan-300'
              }`}
          >
            HUD GRID: {showGrid ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setTrackingActive(!trackingActive)}
            className={`px-2.5 py-1 text-[8px] font-mono border rounded uppercase tracking-wider transition-all ${trackingActive ? 'border-emerald-500/80 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'border-white/10 text-zinc-500 hover:text-emerald-300'
              }`}
          >
            UPLINK_TRACK: {trackingActive ? 'ACTIVE' : 'STANDBY'}
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen" />

      <div className="flex justify-between items-end z-10 mt-auto">
        <div className="flex flex-col gap-1.5">
          <span className="text-[8px] font-mono text-cyan-500/70 uppercase tracking-widest">ROTATIONAL SPEED</span>
          <div className="flex gap-1.5">
            {[0.5, 1, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => setRotationSpeed(speed)}
                className={`px-2 py-0.5 text-[8px] font-mono border rounded transition-all ${rotationSpeed === speed ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
                  }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
        <div className="text-right font-mono text-[9px] text-zinc-500">
          <div className="tracking-widest">CONSTELLATIONS: ACTIVE</div>
          <div className="text-emerald-400 font-bold uppercase tracking-widest drop-shadow-[0_0_5px_rgba(16,185,129,0.8)] animate-pulse">SECURE_LINK: ONLINE</div>
        </div>
      </div>
    </div>
  );
}

// --- Live Telemetry Feed Log Panel ---


export function EventLogFeed() {
  const [logs, setLogs] = useState([
    { id: 1, time: '00:05:12 UTC', type: 'PROPAGATION', message: 'SGP4 vector matrix refreshed', detail: 'Target: PROXIMA II', status: 'SUCCESS' },
    { id: 2, time: '00:04:45 UTC', type: 'WARNING', message: 'Debris proximity alert triggered', detail: 'Target: FENGYUN 1C DEB', status: 'WARNING' },
    { id: 3, time: '00:03:10 UTC', type: 'DATA_LINK', message: 'Deep space optic array payload received', detail: 'Target: Hubble', status: 'SUCCESS' },
    { id: 4, time: '00:01:22 UTC', type: 'AOS_LOCK', message: 'AOS Svalbard ground station confirmed', detail: 'Target: ISS', status: 'STABLE' },
    { id: 5, time: '00:00:05 UTC', type: 'SYSTEM', message: 'OrbitalVista command console initialized', detail: 'Operator terminal authenticated.', status: 'ONLINE' },
  ]);

  useEffect(() => {
    const satelliteData = [
      {
        name: "ISS",
        type: "TELEMETRY",
        msg: "Crew module life support nominal. Orbit maintained.",
        status: "SUCCESS"
      },
      {
        name: "Hubble",
        type: "DATA_LINK",
        msg: "Optic array payload downloaded successfully.",
        status: "SUCCESS"
      },
      {
        name: "NOAA-19",
        type: "WEATHER",
        msg: "AVHRR atmospheric imagery processing complete.",
        status: "SUCCESS"
      },
      {
        name: "FENGYUN 1C DEB",
        type: "WARNING",
        msg: "Conjunction threshold exceeded. Collision risk elevated.",
        status: "WARNING"
      },
      {
        name: "COSMOS 2251 DEB",
        type: "TRACKING",
        msg: "Radar cross-section updated. Trajectory stable.",
        status: "STABLE"
      },
      {
        name: "IRIDIUM 33 DEB",
        type: "TRACKING",
        msg: "Orbit decay matrix recalculated.",
        status: "STABLE"
      },
      {
        name: "STARLINK-1001",
        type: "BROADBAND",
        msg: "Ku-band broadband sync stabilized.",
        status: "ONLINE"
      },
      {
        name: "STARLINK-1002",
        type: "CROSSLINK",
        msg: "Laser communication crosslink established.",
        status: "ONLINE"
      },
      {
        name: "GPS BIIR-2",
        type: "NAV_SYNC",
        msg: "Atomic clock variance verified at < 10ns.",
        status: "STABLE"
      },
      {
        name: "PROXIMA II",
        type: "TLE_SYNC",
        msg: "SGP4 telemetry matrices refreshed.",
        status: "SUCCESS"
      }
    ];

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toISOString().substring(11, 19) + ' UTC';
      const event = satelliteData[Math.floor(Math.random() * satelliteData.length)];

      const detail = `Target: ${event.name} | Elevation: ${(Math.random() * 60 + 10).toFixed(1)}°`;

      const newLog = {
        id: Date.now(),
        time: timeStr,
        type: event.type,
        message: event.msg,
        detail: detail,
        status: event.status
      };

      setLogs(prev => [newLog, ...prev.slice(0, 4)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#020408]/90 border border-cyan-900/50 rounded-xl p-5 font-mono h-[380px] flex flex-col justify-between backdrop-blur-2xl shadow-[inset_0_0_20px_rgba(6,182,212,0.05)] relative overflow-hidden group">
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] mix-blend-overlay"></div>

      <div className="flex justify-between items-center pb-3.5 border-b border-cyan-500/20 mb-3 relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-cyan-400 drop-shadow-[0_0_3px_rgba(6,182,212,0.8)]" />
          <span className="text-[10px] font-bold text-cyan-100 uppercase tracking-widest">SYS_LOG :: TELEMETRY_DECK</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-cyan-500 animate-pulse">REC</span>
          <div className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto flex flex-col gap-2.5 relative z-10 custom-scrollbar">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              layout
              key={log.id}
              initial={{ opacity: 0, x: -10, filter: 'blur(5px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="p-3 bg-cyan-950/20 border-l-2 border-white/5 hover:border-cyan-400 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs relative overflow-hidden shrink-0"
            >
              <div className="absolute left-0 top-0 bottom-0 w-full bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>

              <div className="flex flex-col gap-1 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-cyan-500/60 font-bold">[{log.time}]</span>
                  <span className={`text-[8px] px-1.5 py-0.5 font-extrabold border ${log.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}>
                    {log.type}
                  </span>
                  <p className="text-zinc-200 font-semibold">{log.message}</p>
                </div>
                <span className="text-[10px] text-zinc-500">{log.detail}</span>
              </div>
              <div className="text-right hidden sm:block font-bold relative z-10">
                <span className={`text-[9px] drop-shadow-[0_0_2px_currentColor] ${log.status === 'WARNING' ? 'text-amber-400' :
                    log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-cyan-400'
                  }`}>
                  {log.status}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="text-[8px] text-cyan-600/50 text-center mt-3 uppercase border-t border-cyan-900/30 pt-2.5 flex justify-between relative z-10 shrink-0">
        <span>ENCRYPTION: AES-256</span>
        <span className="animate-pulse">END OF LOG_STREAM █</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  // Stats Counters
  const statsList = [
    { value: 25000, suffix: '+', desc: 'Satellites Tracked' },
    { value: 1400000, suffix: ' /DAY', desc: 'Orbit Calculations' },
    { value: 99.8, suffix: '%', desc: 'Tracking Accuracy', isFloat: true },
    { value: 24, suffix: '/7', desc: 'Active Monitoring' },
    { value: 100000, suffix: '+', desc: 'TLE Records Ingested' },
    { value: 500, suffix: '+', desc: 'Ground Stations' },
  ];

  // Core Capabilities feature array
  const capabilities = [
    {
      icon: <Satellite className="text-cyan-400 w-6 h-6 animate-pulse" />,
      title: 'Real-Time Tracking',
      desc: 'Calculate exact spacecraft positions in real time using Keplerian elements and SGP4 orbit algorithms.',
      telemetry: 'SGP4_PROPAGATION: OK'
    },
    {
      icon: <RefreshCw className="text-blue-400 w-6 h-6 animate-spin-slow" />,
      title: 'Live TLE Parsing',
      desc: 'Automatic downlinks parsing fresh Two-Line Elements directly from primary databases.',
      telemetry: 'AUTO_REFRESH: 6H_INTERVAL'
    },
    {
      icon: <Globe className="text-emerald-400 w-6 h-6" />,
      title: 'Global Map Viewer',
      desc: 'Visualize dynamic orbit ground-tracks, active footprint ranges, and terminator boundaries.',
      telemetry: 'PROJ_SYS: MERCATOR_WGS84'
    },
    {
      icon: <Cpu className="text-amber-400 w-6 h-6" />,
      title: 'Orbit Prediction',
      desc: 'Simulate next-pass trajectories and determine future state vectors dynamically.',
      telemetry: 'ACCURACY: <0.05% DRIFT'
    },
    {
      icon: <Compass className="text-cyan-400 w-6 h-6" />,
      title: 'Ground Nodes',
      desc: 'Configure custom ground terminals with elevation limits to compute exact AOS/LOS ranges.',
      telemetry: 'GRID_NODES: 512_SUPPORTED'
    },
    {
      icon: <Server className="text-indigo-400 w-6 h-6" />,
      title: 'Timeline Archive',
      desc: 'Analyze historic Keplerian element records to chart orbital decay and track old satellite paths.',
      telemetry: 'ARCHIVE_DECK: 10YR_TLE'
    }
  ];

  const faqs = [
    {
      q: 'WHAT IS ORBITALVISTA?',
      a: 'OrbitalVista is an advanced real-time satellite tracking and orbital simulation dashboard designed for aerospace enthusiasts, developers, and researchers. It utilizes mathematical orbital propagation (SGP4) to calculate precise satellite locations, footprints, pass windows, and telemetry parameters dynamically.'
    },
    {
      q: 'HOW DOES SATELLITE TRACKING WORK?',
      a: 'Tracking is computed using Two-Line Element (TLE) sets, which contain Keplerian orbital components. By applying SGP4 orbital propagation algorithms, OrbitalVista calculates exact longitude, latitude, altitude, and velocity variables for any given UTC timestamp.'
    },
    {
      q: 'WHAT IS TLE DATA?',
      a: 'A Two-Line Element set (TLE) is a standard data format used by NORAD and NASA to define the orbit of a space object. Fresh TLE values are essential to calculate precise positions, as atmospheric drag and gravity slowly alter orbital trajectories.'
    },
    {
      q: 'HOW FREQUENTLY IS TRACKING DATA UPDATED?',
      a: 'Orbital ephemeris data is automatically synchronized from primary astronomical sources (CelesTrak) multiple times a day to ensure sub-second accuracy on all real-time trajectories.'
    },
    {
      q: 'CAN I TRACK CUBESATS?',
      a: 'Yes! OrbitalVista catalog covers active university and scientific CubeSats. You can search by custom NORAD ID or browse orbital stations to track specific micro-spacecraft in real time.'
    },
    {
      q: 'CAN I MONITOR MULTIPLE SATELLITES?',
      a: 'Yes, OrbitalVista supports adding multiple satellite vectors to the unified radar tracking grid simultaneously. You can trace full constellations like Starlink or Iridium at the same time.'
    },
    {
      q: 'HOW ACCURATE ARE PREDICITIONS?',
      a: 'The SGP4 propagation library combined with fresh TLE updates yields highly reliable position values, usually accurate to within a few kilometers for several days surrounding the TLE generation epoch.'
    },
    {
      q: 'CAN I EXPORT ORBITAL DATA?',
      a: 'Yes, OrbitalVista enables full exports of computed orbital trajectories, look-angles, and AOS/LOS pass tables in standardized JSON, CSV, or Google Earth KML formats.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#030406] text-cyan-50 overflow-x-hidden font-sans relative selection:bg-cyan-500/30 selection:text-cyan-100">

      {/* CRT Scanline Overlay */}
      <div className="pointer-events-none fixed inset-0 z-[9999] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-40 mix-blend-overlay"></div>

      {/* Background Starfield and Ambient Glowing Clouds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[900px] pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'103.92304845413264\' viewBox=\'0 0 60 103.92304845413264\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0l30 17.32050807568877v34.64101615137754L30 69.28203230275508 0 51.96152422706631V17.32050807568877L30 0zM15 86.60254037844386l30 17.32050807568877v34.64101615137754l-30 17.32050807568877-30-17.32050807568877V103.92304845413263l30-17.32050807568877z\' fill=\'%2306b6d4\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundSize: '60px 103px' }} />
        <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-cyan-600/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute top-[400px] left-[5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[250px] right-[5%] w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[130px] mix-blend-screen" />
      </div>

      {/* --- Sticky Blur Navigation Bar --- */}
      <header className="sticky top-0 z-[1000] border-b border-cyan-500/20 bg-[#030406]/80 backdrop-blur-xl transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => typeof window !== 'undefined' && window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-black/50 rounded flex items-center justify-center border-l-2 border-r-2 border-cyan-500 group-hover:bg-cyan-950/40 transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
              <img
                src="/satelitelogo.png"
                alt="Satellite Tracker Logo"
                width={50}
                height={50}
                className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white uppercase tracking-[0.3em] font-mono drop-shadow-md">OrbitalVista</span>
              <span className="text-[7px] font-mono text-cyan-500 tracking-[0.2em]">NODE // ALPHA_CENTAURI</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-[10px] font-mono text-cyan-100/60 uppercase tracking-[0.2em]">
            <a href="#features" className="hover:text-cyan-400 hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] transition-all flex items-center gap-1"><span className="text-cyan-500 opacity-50">01.</span> Features</a>
            <a href="#mission-control" className="hover:text-cyan-400 hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] transition-all flex items-center gap-1"><span className="text-cyan-500 opacity-50">02.</span> Telemetry</a>
            <a href="#faq" className="hover:text-cyan-400 hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] transition-all flex items-center gap-1"><span className="text-cyan-500 opacity-50">03.</span> Database FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-500 hover:text-white transition-colors relative group"
            >
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              Init_Login
            </button>
            <button
              onClick={() => router.push('/login')}
              className="relative px-6 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-black bg-cyan-500 hover:bg-cyan-400 transition-all border border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] group overflow-hidden"
              style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
            >
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
              Console_Uplink
            </button>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-16 md:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
          >
            <div className=" inline-flex items-center gap-2 self-start bg-cyan-950/50 border-l-2 border-r-2 border-cyan-500 px-3 py-1 relative">
              <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,1)]"></span>
              </span>
              <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-[0.2em] font-semibold drop-shadow-[0_0_2px_rgba(6,182,212,0.8)]">
                SGP4_TELEMETRY_SYS :: ONLINE
              </span>
            </div>

            <h1 className=" text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-50 tracking-tighter leading-[1.3] uppercase font-mono drop-shadow-lg">
              Track Every Orbit.<br />
              <span className="relative">
                Monitor Mission.
                <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
              </span>
            </h1>

            <p className="text-cyan-100/60 text-xs md:text-sm leading-relaxed font-mono max-w-xl border-l border-cyan-500/30 pl-4 relative">
              <span className="absolute top-0 -left-[3px] w-1.5 h-1.5 bg-cyan-500"></span>
              <span className="absolute bottom-0 -left-[3px] w-1.5 h-1.5 bg-cyan-500"></span>
              Real-time satellite tracking, live TLE intelligence, orbital analytics, pass prediction, and mission visualization directly from a secure browser terminal.<span className="animate-pulse font-bold text-cyan-500">_</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-4 bg-cyan-500 text-black font-mono text-xs font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                Launch_Terminal
                <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-4 border-t border-b border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/30 text-white font-mono text-xs font-bold uppercase tracking-[0.2em] bg-white/5 transition-all flex items-center justify-center gap-3 relative group"
              >
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/50 group-hover:bg-cyan-400 transition-colors"></span>
                <span className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-500/50 group-hover:bg-cyan-400 transition-colors"></span>
                Scan_Network
                <Play size={12} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,1)]" />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border border-cyan-900/30 bg-black/40 p-4 relative overflow-hidden text-[10px] font-mono text-cyan-100/50 uppercase">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 blur-xl"></div>
              <div className="flex flex-col gap-1 z-10">
                <span className="text-[8px] tracking-[0.2em] text-cyan-600 font-bold">NODE_LINK</span>
                <span className="text-cyan-100 font-semibold drop-shadow-[0_0_2px_currentColor]">LEO_GROUND_DECK_A</span>
              </div>
              <div className="flex flex-col gap-1 z-10">
                <span className="text-[8px] tracking-[0.2em] text-cyan-600 font-bold">SGP4_STATE</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 drop-shadow-[0_0_3px_rgba(16,185,129,0.8)]">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-sm animate-pulse"></span>
                  NOMINAL (VERIFIED)
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-4 relative"
          >
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500 z-20"></div>
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500 z-20"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500 z-20"></div>
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500 z-20"></div>

            <div className="bg-[#020408]/80 border border-cyan-500/20 p-5 rounded backdrop-blur-2xl relative overflow-hidden shadow-[inset_0_0_30px_rgba(6,182,212,0.05)]">

              <div className="flex justify-between items-center border-b border-cyan-900/50 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-cyan-400 animate-pulse drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                  <span className="text-[10px] font-mono text-cyan-200 uppercase tracking-[0.2em] font-bold">REAL-TIME_ORBITAL_BEACON</span>
                </div>
                <span className="text-[9px] font-mono text-black font-bold bg-emerald-400 px-2 py-0.5 shadow-[0_0_10px_rgba(16,185,129,0.5)]">LIVE UPLINK</span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="flex flex-col gap-1 p-2 bg-black/60 border border-cyan-900/40 hover:border-cyan-500/50 transition-colors">
                  <span className="text-[8px] text-cyan-600 uppercase tracking-widest font-bold">TARGET_ID</span>
                  <span className="text-xs text-white font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,1)] animate-pulse"></span>
                    ISS (ZARYA)
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-2 bg-black/60 border border-cyan-900/40 hover:border-cyan-500/50 transition-colors">
                  <span className="text-[8px] text-cyan-600 uppercase tracking-widest font-bold">ALTITUDE</span>
                  <span className="text-xs text-cyan-400 font-bold drop-shadow-[0_0_3px_currentColor]">418.42 KM</span>
                </div>
                <div className="flex flex-col gap-1 p-2 bg-black/60 border border-cyan-900/40 hover:border-cyan-500/50 transition-colors">
                  <span className="text-[8px] text-cyan-600 uppercase tracking-widest font-bold">VELOCITY</span>
                  <span className="text-xs text-cyan-100 font-bold">7.66 KM/S</span>
                </div>
                <div className="flex flex-col gap-1 p-2 bg-black/60 border border-cyan-900/40 hover:border-cyan-500/50 transition-colors">
                  <span className="text-[8px] text-cyan-600 uppercase tracking-widest font-bold">ORBIT_CLASS</span>
                  <span className="text-xs text-cyan-100 font-bold">LEO (CIRCULAR)</span>
                </div>
                <div className="flex flex-col gap-1 p-2 bg-black/60 border border-cyan-900/40 hover:border-cyan-500/50 transition-colors">
                  <span className="text-[8px] text-cyan-600 uppercase tracking-widest font-bold">SIGNAL_DBM</span>
                  <span className="text-xs text-emerald-400 font-bold drop-shadow-[0_0_3px_currentColor]">-74.2 [EXCELLENT]</span>
                </div>
                <div className="flex flex-col gap-1 p-2 bg-black/60 border border-cyan-900/40 hover:border-cyan-500/50 transition-colors">
                  <span className="text-[8px] text-cyan-600 uppercase tracking-widest font-bold">SYS_STATUS</span>
                  <span className="text-xs text-emerald-400 font-bold animate-pulse flex items-center gap-1 drop-shadow-[0_0_3px_currentColor]">
                    [OK] NOMINAL
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-cyan-900/50 pt-3.5 flex justify-between items-center text-[9px] font-mono text-cyan-500/70 font-bold">
                <span>DOPPLER_ACCEL: COMPLY_OK</span>
                <span>AZIMUTH: 182.4°</span>
              </div>
            </div>

            <OrbitCanvas />
          </motion.div>

        </div>
      </section>

      {/* --- LIVE ORBITAL STATISTICS SECTION --- */}
      <section className="bg-[#020305]/95 border-y border-cyan-900/50 py-10 px-4 sm:px-6 lg:px-8 relative z-10 backdrop-blur-2xl">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/20">
          <div className="h-full w-1/4 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)] animate-[scan_3s_ease-in-out_infinite_alternate]"></div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
          {statsList.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4 bg-black/40 border-l border-r border-cyan-900/30 hover:bg-cyan-950/20 hover:border-cyan-500/50 transition-all group relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

              <span className="text-2xl lg:text-3xl font-extrabold text-cyan-400 font-mono tracking-tighter flex items-center justify-center drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-[9px] font-mono text-cyan-600 uppercase tracking-[0.15em] mt-2 block font-bold group-hover:text-cyan-300 transition-colors">
                {stat.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* --- CORE CAPABILITIES SECTION --- */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 scroll-mt-12">
        <div className="text-center flex flex-col items-center gap-4 mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-cyan-500/10 blur-[80px] pointer-events-none"></div>
          <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.4em] font-extrabold border-b border-cyan-500/30 pb-1">PREMIUM_MODULES</span>
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase font-mono tracking-tight text-white drop-shadow-md">
            Space-Grade Tracking Suite
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((item, i) => (
            <div
              key={i}
              className="bg-[#020305]/80 border border-cyan-900/40 p-6 flex flex-col justify-between gap-5 hover:border-cyan-400/60 hover:bg-cyan-950/20 transition-all duration-300 relative overflow-hidden group shadow-[inset_0_0_20px_rgba(6,182,212,0.02)]"
              style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/0 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-700" />

              <div className="flex flex-col gap-5 relative z-10">
                <div className="w-12 h-12 bg-black border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all transform group-hover:-translate-y-1 duration-300"
                  style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}>
                  {item.icon}
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-widest drop-shadow-sm flex items-center gap-2">
                    <span className="text-cyan-500 opacity-50 text-[10px]">0{i + 1}.</span>
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-cyan-100/60 font-mono leading-relaxed">{item.desc}</p>
                </div>
              </div>

              <div className="border-t border-cyan-900/50 pt-3 mt-2 flex items-center justify-between font-mono text-[9px] text-cyan-700 font-bold uppercase tracking-widest relative z-10 group-hover:text-cyan-500 transition-colors">
                <span>{item.telemetry}</span>
                <span className="text-emerald-500 drop-shadow-[0_0_2px_rgba(16,185,129,0.8)] animate-pulse">OK</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- INTERACTIVE CENTERPIECE SHOWCASE PREVIEW --- */}
      <section id="mission-control" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-cyan-900/30 scroll-mt-12 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)]">
        <div className="text-center flex flex-col items-center gap-4 mb-14">
          <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.4em] font-extrabold border-b border-emerald-500/30 pb-1">MISSION_COMMAND</span>
          <h2 className="text-3xl font-extrabold uppercase font-mono tracking-tight text-white drop-shadow-md">
            Active Operations Console
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div className="lg:col-span-2 h-full flex flex-col">
            <OrbitCanvas />
          </div>

          <div className="h-full flex flex-col">
            <EventLogFeed />
          </div>
        </div>
      </section>

      {/* --- CYBERPUNK FAQ SECTION --- */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10 border-t border-cyan-900/30 scroll-mt-12">
        <div className="text-center flex flex-col items-center gap-4 mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-cyan-500/5 blur-[80px] pointer-events-none"></div>
          <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.4em] font-extrabold border-b border-cyan-500/30 pb-1 flex items-center gap-2">
            <HelpCircle size={12} /> DATABANK_QUERY
          </span>
          <h2 className="text-3xl font-extrabold uppercase font-mono tracking-tight text-white drop-shadow-md">
            System Diagnostics & FAQ
          </h2>
        </div>

        <div className="flex flex-col gap-4 font-mono relative">
          <div className="absolute left-[11px] top-4 bottom-4 w-px bg-gradient-to-b from-cyan-500/50 via-cyan-800/30 to-transparent" />

          {faqs.map((faq, index) => {
            const isOpen = activeFAQ === index;
            return (
              <div
                key={index}
                className={`ml-8 relative bg-black/60 border ${isOpen ? 'border-cyan-400/60 shadow-[inset_0_0_20px_rgba(6,182,212,0.1),0_0_15px_rgba(6,182,212,0.2)]' : 'border-cyan-900/40 hover:border-cyan-500/40'} transition-all duration-300 backdrop-blur-sm`}
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 15px))' }}
              >
                <div className={`absolute -left-8 top-5 w-2 h-2 rounded-sm border ${isOpen ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,1)]' : 'bg-black border-cyan-700'}`}></div>
                <div className={`absolute -left-6 top-[23px] w-6 h-px ${isOpen ? 'bg-cyan-400' : 'bg-cyan-900'}`}></div>

                <button
                  onClick={() => setActiveFAQ(isOpen ? null : index)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center hover:bg-cyan-950/30 transition-colors group relative"
                >
                  <span className={`text-xs font-bold uppercase tracking-widest ${isOpen ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : 'text-cyan-50 group-hover:text-cyan-200'} transition-colors flex items-center gap-3`}>
                    <span className="text-cyan-700 text-[10px] opacity-70">Q_{index.toString().padStart(2, '0')}</span>
                    {faq.q}
                  </span>
                  <div className={`text-[10px] font-bold px-2 py-0.5 border ${isOpen ? 'border-cyan-400 text-cyan-400' : 'border-cyan-900 text-cyan-700'} group-hover:border-cyan-500 group-hover:text-cyan-400 transition-colors`}>
                    {isOpen ? '[-]' : '[+]'}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-cyan-500/20"
                    >
                      <div className="px-6 py-5 text-xs text-cyan-100/70 leading-relaxed bg-cyan-950/10 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-transparent"></div>
                        <p>{faq.a}<span className="inline-block w-1.5 h-3 ml-1 bg-cyan-500 animate-pulse align-middle"></span></p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- FINAL CTA SECTION --- */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <div className="bg-[#020305]/90 border border-cyan-500/30 p-10 md:p-14 text-center flex flex-col items-center gap-6 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)] backdrop-blur-xl"
          style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>

          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-cyan-500/20 pointer-events-none animate-[ping_3s_ease-in-out_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-cyan-500/10 pointer-events-none" />

          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em] font-extrabold z-10 bg-black/50 px-3 py-1 border border-cyan-500/30">ESTABLISH_UPLINK</span>
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase font-mono tracking-tighter text-white max-w-2xl leading-tight z-10 drop-shadow-lg">
            Ready to Explore Earth From Orbit?
          </h2>
          <p className="text-cyan-100/60 text-xs font-mono max-w-md leading-relaxed z-10">
            Access professional-grade satellite tracking and orbital intelligence. Authentication required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 z-10">
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-cyan-500 text-black font-mono text-xs font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] hover:bg-cyan-400 transition-all relative group overflow-hidden"
              style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              Init_Tracking_Console
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-cyan-900/50 py-12 px-4 sm:px-6 lg:px-8 bg-[#010203] relative z-10 text-xs font-mono text-cyan-700">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/satelitelogo.png"
                alt="Satellite Tracker Logo"
                width={50}
                height={50}
                className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              />
              <span className="text-sm font-bold text-white uppercase tracking-[0.3em]">OrbitalVista</span>
            </div>
            <p className="text-[10px] text-cyan-600/60 leading-relaxed uppercase pr-4">
              Professional high-fidelity tracking platform. Propagating low Earth orbit vectors live under strict SGP4 models.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-extrabold text-cyan-500 uppercase tracking-widest mb-1">OPERATIONS</span>
            <a href="#features" className="hover:text-cyan-300 transition-colors flex items-center gap-2 before:content-['>'] before:text-cyan-800">Features</a>
            <a href="#mission-control" className="hover:text-cyan-300 transition-colors flex items-center gap-2 before:content-['>'] before:text-cyan-800">Telemetry</a>
            <a href="#faq" className="hover:text-cyan-300 transition-colors flex items-center gap-2 before:content-['>'] before:text-cyan-800">Databank FAQ</a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-extrabold text-cyan-500 uppercase tracking-widest mb-1">RESOURCES</span>
            <span className="text-cyan-800 cursor-not-allowed flex items-center gap-2 before:content-['>'] before:opacity-50">Docs_Node [LOCKED]</span>
            <span className="text-cyan-800 cursor-not-allowed flex items-center gap-2 before:content-['>'] before:opacity-50">API_Key [LOCKED]</span>
            <span className="text-cyan-800 cursor-not-allowed flex items-center gap-2 before:content-['>'] before:opacity-50">Source_Git [LOCKED]</span>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-extrabold text-cyan-500 uppercase tracking-widest mb-1">SYSTEM_INFO</span>
            <span className="text-cyan-600/80">PROTOCOL: SGP4/SDP4</span>
            <span className="text-cyan-600/80">ENCRYPTION: AES-256</span>
            <span className="text-emerald-500/80">SYS_STATE: ONLINE</span>
            <span className="mt-4 text-[9px] opacity-50">© {new Date().getFullYear()} ORBITALVISTA.</span>
          </div>

        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}} />
    </div>
  );
}