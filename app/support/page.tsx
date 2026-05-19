"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  LifeBuoy,
  MessageSquare,
  Terminal,
  FileText,
  ExternalLink,
  Send,
  Clock,
  CheckCircle2,
  ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div className="relative min-h-screen text-slate-200 bg-[#020617] overflow-hidden font-sans">
      <AnimatePresence>
        <div className="fixed  top-4 left-10 z-50">
          <motion.div whileHover="hover" variants={{ hover: { scale: 1.05 } }}>
            <button
              onClick={() => {
                console.log("Back Clicked")
                if (window.history.length > 1) {
                  router.back()
                } else {
                  router.push("/")
                }
              }}
              className="w-20 h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(79,70,229,0.2)] active:scale-[0.98] hover:shadow-md"
            >
              <motion.span
                variants={{ hover: { x: -5 } }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center pointer-events-auto"
              >
                <ArrowLeft className="w-4 h-4 items-center" />
              </motion.span>
              Back
            </button>
          </motion.div></div></AnimatePresence>
      {/* 🌌 Background Architecture */}
      <div className="absolute inset-0 z-0">
        {/* Deep Space Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black" />

        {/* Cyber Grid Texture */}
        <div className="absolute inset-0 opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,white,transparent)] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Floating Nebula Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">

        {/* --- Header Section --- */}
        <header className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <LifeBuoy size={14} className="text-indigo-400 animate-spin-slow" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-indigo-400">Command Support</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6">
            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">assist your mission?</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            From API troubleshooting to orbital mechanics inquiries, our flight directors are standing by.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* --- Left Column: Fast Channels --- */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Quick Resolution Channels</h3>

            {[
              {
                icon: <Terminal className="text-emerald-400" />,
                title: "Technical Documentation",
                desc: "Explore our deep-dive guides on TLE integration.",
                link: "/docs"
              },
              {
                icon: <MessageSquare className="text-blue-400" />,
                title: "Community Discord",
                desc: "Real-time chat with 2,000+ satellite engineers.",
                link: "#"
              },
              {
                icon: <FileText className="text-purple-400" />,
                title: "API Status",
                desc: "Check live system uptime and latency reports.",
                link: "#"
              }
            ].map((channel, i) => (
              <div
                key={i}
                className="group p-6 bg-slate-900/40 border border-white/5 rounded-2xl hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex gap-4">
                  <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                    {channel.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{channel.title}</h4>
                    <p className="text-sm text-slate-500">{channel.desc}</p>
                  </div>
                </div>
                <ExternalLink size={18} className="text-slate-600 group-hover:text-white transition-colors" />
              </div>
            ))}

            {/* Response Time Indicator */}
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center gap-3">
              <Clock size={16} className="text-indigo-400" />
              <p className="text-xs text-indigo-300/80 font-mono">Current Response Latency: ~14 minutes</p>
            </div>
          </div>

          {/* --- Right Column: Support Form --- */}
          <div className="lg:col-span-7">
            <div className="relative bg-slate-900/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              {submitted ? (
                <div className="py-20 text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Transmission Received</h3>
                  <p className="text-slate-400">We've logged your ticket. Check your uplink for updates.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Callsign (Name)</label>
                      <input
                        required
                        className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Ground Control"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Uplink Address (Email)</label>
                      <input
                        required
                        type="email"
                        className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="user@atlasforge.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Subject</label>
                    <select className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer">
                      <option>Technical Issue</option>
                      <option>Account Access</option>
                      <option>Feature Request</option>
                      <option>Billing / Credits</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message Detail</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                      placeholder="Describe the anomaly..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(79,70,229,0.2)] active:scale-[0.98]"
                  >
                    <Send size={18} />
                    Deploy Ticket
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* --- Footer Note --- */}
        <div className="mt-20 text-center text-slate-600 border-t border-slate-900 pt-10">
          <p className="text-xs font-mono uppercase tracking-[0.3em]">
            System Version: 2.04 // Location: Low Earth Orbit // Status: Active
          </p>
        </div>
      </div>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}