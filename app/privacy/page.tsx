"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import {
    Shield, Globe, Eye, Database, Lock, Info,
    ShieldCheck, FileText, ChevronRight
} from "lucide-react"
const sections = [
    {
        title: "Data Collection",
        icon: <Eye className="text-blue-400" size={20} />,
        content: "We collect orbital telemetry, TLE search history, and approximate location data to provide accurate satellite positioning relative to your ground station."
    },
    {
        title: "Security Protocols",
        icon: <Lock className="text-emerald-400" size={20} />,
        content: "All transmissions between your terminal and AtlasForge are encrypted using AES-256 standards. We do not store raw coordinate data longer than necessary for the active session."
    },
    {
        title: "Third Party Links",
        icon: <Globe className="text-purple-400" size={20} />,
        content: "Our tracking system integrates with external TLE providers (like Celestrak). Please review their respective privacy protocols when accessing external orbital data."
    }
]
export default function PrivacyPage() {
    const [settings, setSettings] = useState({
        location: true,
        telemetry: true,
        analytics: false,
        personalizedAds: false,
    })

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    const legalSections = [
        {
            id: "01",
            title: "Introduction",
            content: " Welcome to AtlasForge. We respect your privacy and are committed to protecting your personal data. This policy outlines our practices regarding the collection, use, and safeguarding of information transmitted through our satellite tracking platform."
        },
        {
            id: "02",
            title: "Information We Collect",
            content: "All transmissions between your terminal and AtlasForge are encrypted using AES-256 standards. We do not store raw coordinate data longer than necessary."
        },
        {
            id: "03",
            title: "Your Rights",
            content: "You have the right to access, correct, or delete your personal information. Since much of our data is session-based, clearing your browser cache will remove most locally stored preferences."
        }
    ]

    return (
        <div className="relative min-h-screen text-slate-200 overflow-hidden bg-[#020617] selection:bg-blue-500/30">

            {/* 🌌 Background Architecture */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa"
                    alt="Earth from space"
                    className="w-full h-full object-cover opacity-30 scale-110"
                />
                <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent h-[20%] w-full animate-[scan_8s_linear_infinite]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">

                {/* --- Header Section --- */}
                <header className="mb-12 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <Lock size={14} className="text-blue-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Security Protocol v2.1</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                        Privacy <span className="text-blue-500">Command</span> Center
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Configure your orbital footprint and review the legal framework governing AtlasForge telemetry.
                    </p>
                </header>

                {/* --- Interactive Settings Card --- */}
                <section className="mb-16">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Shield size={16} /> Live Configuration
                    </h2>
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000" />
                        <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-8 space-y-8">
                                {/* Setting Rows */}
                                {[
                                    { id: "location", icon: <Globe className="text-blue-400" />, title: "Precise Geo-Positioning", desc: "Sync ground-station data based on current coordinates." },
                                    { id: "telemetry", icon: <Database className="text-orange-400" />, title: "Orbital Telemetry", desc: "Share anonymous diagnostic packets for debris mapping." },
                                    { id: "analytics", icon: <ShieldCheck className="text-purple-400" />, title: "Usage Insights", desc: "Allow behavior mapping to optimize dashboard performance." }
                                ].map((item, idx) => (
                                    <div key={item.id}>
                                        <div className="flex items-start justify-between gap-6">
                                            <div className="flex gap-4">
                                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 h-fit">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                                                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={settings[item.id as keyof typeof settings]}
                                                onCheckedChange={() => toggle(item.id as keyof typeof settings)}
                                            />
                                        </div>
                                        {idx < 2 && <div className="h-px mt-8 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />}
                                    </div>
                                ))}
                            </div>
                            <div className="bg-blue-500/5 p-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Info size={16} className="text-blue-400" />
                                    <p className="text-xs text-slate-500 italic">Settings are cached locally until "Save" is deployed.</p>
                                </div>
                                <button className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg active:scale-95">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="border-b border-slate-800 pb-12 mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <ShieldCheck className="text-blue-400" size={28} />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 font-mono">
                        <span className="flex items-center gap-2">
                            <FileText size={14} /> VERSION 2.1.0
                        </span>
                        <span className="flex items-center gap-2">
                            <ChevronRight size={14} /> LAST REVISED: April 13, 2026
                        </span>
                    </div>
                </section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {sections.map((s, i) => (
                        <div key={i} className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl hover:bg-slate-800/40 transition-colors">
                            <div className="mb-4">{s.icon}</div>
                            <h3 className="text-white font-bold mb-2">{s.title}</h3>
                            <p className="text-xs leading-relaxed text-slate-400">{s.content}</p>
                        </div>
                    ))}
                </div>
                {/* --- Legal Ledger Section --- */}
                <section className="space-y-8">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <FileText size={16} /> Full Disclosure Ledger
                    </h2>

                    <div className="bg-black/20 border border-slate-800 rounded-2xl p-8 md:p-12 space-y-12 backdrop-blur-sm">
                        {legalSections.map((section) => (
                            section.id === "02" ? (
                                <div key={section.id} className="group">
                                    <div className="mb-4 flex items-center gap-4">
                                        <span className="text-xs font-mono text-blue-500 px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">02</span>
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">Information We Collect</h3>
                                    </div>

                                    <ul className="list-disc pl-16 mt-3 space-y-2 text-left marker:text-blue-400">
                                        <li><strong className="text-slate-200">Technical Data:</strong> IP address, browser type, and time zone settings.</li>
                                        <li><strong className="text-slate-200">Orbital Queries:</strong> Satellites tracked.</li>
                                        <li><strong className="text-slate-200">Cookies:</strong> UI preferences.</li>
                                    </ul>
                                </div>
                            ) : (
                                <div key={section.id} className="group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-xs font-mono text-blue-500 px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
                                            {section.id}
                                        </span>
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {section.title}
                                        </h3>
                                    </div>

                                    <p className="text-slate-400 leading-relaxed pl-12">
                                        {section.content}
                                    </p>
                                </div>
                            )
                        ))}

                        <div className="pt-8 border-t border-slate-800 flex flex-wrap gap-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><ChevronRight size={10} /> AES-256 Encrypted</span>
                            <span className="flex items-center gap-1"><ChevronRight size={10} /> GDPR Compliant</span>
                            <span className="flex items-center gap-1"><ChevronRight size={10} /> TLS 1.3 Active</span>
                        </div>
                    </div>
                </section>

                {/* --- Footer Meta --- */}
                <footer className="mt-20 py-10 border-t border-slate-900 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-slate-600 font-mono">
                        &copy; 2026 ATLASFORGE SYSTEMS // AGARTALA HQ // 23.8315° N
                    </p>
                    <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        <a href="/docs" className="hover:text-blue-500 transition-colors">Terms</a>
                        <a href="/support" className="hover:text-blue-500 transition-colors">Support</a>
                        <a href="/contact" className="hover:text-blue-500 transition-colors">Compliance</a>
                    </div>
                </footer>
            </div>

            <style jsx global>{`
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(500%); }
        }
      `}</style>
        </div>
    )
}