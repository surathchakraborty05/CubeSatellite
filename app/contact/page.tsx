"use client"

import React from 'react'
import { 
  Radio, 
  Mail, 
  MapPin, 
  Phone, 
  Twitter, 
  Github, 
  Linkedin, 
  Navigation, 
  SignalHigh
} from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-300 overflow-hidden font-sans">
      
      {/* 📡 Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617] to-black" />
        
        {/* Radar Pulse Animation - Scaled for mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[800px] sm:h-[800px] border border-blue-500/10 rounded-full animate-[ping_10s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] sm:w-[400px] sm:h-[400px] border border-blue-500/5 rounded-full" />
        
        {/* Digital Grid */}
        <div className="absolute inset-0 opacity-[0.1] bg-[size:20px_20px] sm:bg-[size:30px_30px] bg-[linear-gradient(to_right,#4f4f4f_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f_1px,transparent_1px)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        
        {/* --- Header --- */}
        <div className="max-w-3xl mb-12 sm:mb-20">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="text-blue-500 animate-pulse" size={18} />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.4em] text-blue-500">Signal established</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6">
            Establish <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Communication</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
            Need to discuss a partnership, report a satellite anomaly, or simply transmit a greeting? Our comms array is active 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-start">
          
          {/* --- Left: Contact Cards --- */}
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Card: Email */}
              <div className="group p-5 sm:p-6 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Mail className="text-blue-400 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-white font-bold mb-1 text-sm sm:text-base">Direct Uplink</h4>
                <p className="text-xs sm:text-sm text-slate-500 break-all">comms@atlasforge.space</p>
              </div>

              {/* Card: HQ */}
              <div className="group p-5 sm:p-6 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <MapPin className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-white font-bold mb-1 text-sm sm:text-base">Base Coordinates</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 font-mono italic">23.8315° N, 91.2722° E</p>
              </div>

            </div>

            {/* Signal Frequency / Socials Section */}
            <div className="p-6 sm:p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl relative overflow-hidden">
               <div className="flex items-center justify-between mb-6 sm:mb-8">
                 <div>
                   <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                     <SignalHigh size={18} className="text-blue-500" /> Signal Frequencies
                   </h3>
                   <p className="text-[10px] sm:text-xs text-slate-500">Follow for real-time orbital alerts</p>
                 </div>
               </div>
               
               <div className="flex gap-3 sm:gap-4">
                 {[
                   { icon: <Twitter size={18} />, label: "Twitter" },
                   { icon: <Github size={18} />, label: "Github" },
                   { icon: <Linkedin size={18} />, label: "LinkedIn" }
                 ].map((social, i) => (
                   <button key={i} className="flex-1 py-3 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-slate-400 hover:text-white transition-all">
                     {social.icon}
                   </button>
                 ))}
               </div>
            </div>

            {/* Interactive Map Placeholder */}
            <div className="relative aspect-video bg-slate-900 rounded-3xl border border-white/5 overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1')] bg-cover opacity-20 grayscale" />
               <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay" />
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                 <div className="w-10 h-10 rounded-full bg-blue-500 animate-ping opacity-20 absolute" />
                 <Navigation className="text-blue-500 mb-2 animate-bounce" size={28} />
                 <p className="text-[10px] font-mono text-blue-400/80 tracking-[0.2em] uppercase">Targeting HQ Coordinates...</p>
               </div>
            </div>
          </div>

          {/* --- Right: Transmission Form --- */}
          <div className="relative group order-1 lg:order-2">
            <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/20 to-transparent rounded-[2rem] blur-xl opacity-50 transition-opacity group-hover:opacity-100" />
            
            <div className="relative bg-[#0a101f] border border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-2xl">
              <div className="flex items-center gap-4 mb-8 sm:mb-10">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-[9px] sm:text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em] sm:tracking-[0.5em] whitespace-nowrap">Transmission Form</span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <form className="space-y-5 sm:space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identity</label>
                  <input 
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-slate-700" 
                    placeholder="Enter your name or callsign"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Frequency (Email)</label>
                  <input 
                    type="email"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-slate-700" 
                    placeholder="your@uplink.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Burst Detail (Message)</label>
                  <textarea 
                    rows={5}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-700" 
                    placeholder="Describe your transmission..."
                  />
                </div>

                <button className="group relative w-full py-4 sm:py-5 bg-blue-600 rounded-xl overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] active:scale-[0.98]">
                   <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                   <span className="relative text-white font-black uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-3">
                     Broadcast Message
                     <Navigation size={16} className="rotate-45" />
                   </span>
                </button>
              </form>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
                 <div className="flex gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                   <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse [animation-delay:0.2s]" />
                   <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse [animation-delay:0.4s]" />
                 </div>
                 <span className="text-[8px] sm:text-[9px] font-mono text-slate-700 uppercase tracking-tighter">Secure Link: AES-256 Encrypted</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}