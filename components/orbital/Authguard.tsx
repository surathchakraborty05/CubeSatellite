"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion"
import {
  Satellite
} from "lucide-react"

const STATUSES = [
  "Establishing Satellite Link...",
  "Synchronizing Ephemeris Data...",
  "Calculating Orbital Vectors...",
  "Triangulating Signal...",
  "Uplink Established.",
]
const SatelliteLoader = () => {
  const [statusIdx, setStatusIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStatusIdx(i => (i + 1) % STATUSES.length), 600)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.25,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* ── Radar ── */}
        <div style={{ position: "relative", width: 240, height: 240, marginBottom: 48 }}>

          {/* SVG rings */}
          <svg
            width="240" height="240"
            viewBox="0 0 240 240"
            style={{ position: "absolute", inset: 0 }}
          >
            {[110, 84, 58, 32].map((r, i) => (
              <circle
                key={i}
                cx="120" cy="120" r={r}
                fill="none"
                stroke="#10b981"
                strokeOpacity={0.45}
                strokeWidth="1"
              />
            ))}
            <line x1="120" y1="10" x2="120" y2="230" stroke="#10b981" strokeOpacity={0.2} strokeWidth="0.5" />
            <line x1="10" y1="120" x2="230" y2="120" stroke="#10b981" strokeOpacity={0.2} strokeWidth="0.5" />
          </svg>

          {/* Rotating sweep */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(16,185,129,0.55) 25%, transparent 55%)",
            }}
          />

          {/* Centre dot */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 12, height: 12,
            borderRadius: "50%",
            backgroundColor: "#34d399",
            boxShadow: "0 0 16px 4px #10b981",
          }} />

          {/* Blips */}
          {[
            { top: "22%", left: "35%", delay: 0.3 },
            { top: "65%", left: "70%", delay: 1.1 },
            { top: "40%", left: "78%", delay: 0.7 },
          ].map((b, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.4, 0.8] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: b.delay }}
              style={{
                position: "absolute",
                top: b.top, left: b.left,
                width: 7, height: 7,
                borderRadius: "50%",
                backgroundColor: "#34d399",
                boxShadow: "0 0 8px #10b981",
              }}
            />
          ))}
        </div>

        {/* Text */}
        <div style={{ textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, justifyContent: "center" }}
          >
            <Satellite style={{ color: "#10b981", width: 22, height: 22 }} />
            <h1 style={{
              color: "#fff",
              fontFamily: "monospace",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: 0,
            }}>
              Orbital Tracker
            </h1>
          </motion.div>

          {/* Status line */}
          <div style={{ height: 18 }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={statusIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                style={{
                  color: "rgba(52,211,153,0.75)",
                  fontFamily: "monospace",
                  fontSize: 10,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {STATUSES[statusIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: 40,
          width: 180,
          height: 3,
          backgroundColor: "#18181b",
          borderRadius: 99,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            style={{ height: "100%", backgroundColor: "#10b981", borderRadius: 99 }}
          />
        </div>
      </div>
    </motion.div>
  )
}
export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <SatelliteLoader />
    );
  }

  return <>{children}</>;
}