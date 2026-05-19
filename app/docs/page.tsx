"use client";

import React, { useState, useEffect } from 'react';
import {
    Search, Copy, Check, Satellite, Key, BookOpen,
    Layers, Zap, Globe, Cpu, HelpCircle, Layout, Menu, X, Moon, Sun,ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from '../context/ThemeContext';
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
export default function OrbitalDocs() {
    const [isDarkMode, setIsDarkMode] = useState<"light" | "dark" | null>(null);
    const { globalTheme } = useTheme()
    const finalTheme = isDarkMode ?? globalTheme
    const [activeSection, setActiveSection] = useState('getting-started');
    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const found = navigation.find(item =>
            item.label.toLowerCase().includes(query.toLowerCase())
        );
        if (found) {
            setActiveSection(found.id);
        }
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsSidebarOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);
    useEffect(() => {
        if (finalTheme === "dark") {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }, [finalTheme])
    const toggleTheme = () => {
        setIsDarkMode(prev => {
            if (prev === null) {
                // first time override → opposite of global
                return globalTheme === "dark" ? "light" : "dark"
            }
            return prev === "dark" ? "light" : "dark"
        })
    }
    const navigation = [
        { id: 'getting-started', label: '🚀 Getting Started', icon: <BookOpen size={18} /> },
        { id: 'authentication', label: '🔐 Authentication', icon: <Key size={18} /> },
        { id: 'api-reference', label: '📡 API Reference', icon: <Cpu size={18} /> },
        { id: 'features', label: '⚙️ Features', icon: <Zap size={18} /> },
        { id: 'dashboard', label: '📊 Dashboard Guide', icon: <Layout size={18} /> },
        { id: 'concepts', label: '🧠 Concepts', icon: <Globe size={18} /> },
        { id: 'faqs', label: '❓ FAQs', icon: <HelpCircle size={18} /> },
    ];

    const theme = {
        bg: finalTheme == "dark" ? "bg-[#020617]" : "bg-slate-50",
        textMain: finalTheme == "dark" ? "text-slate-100" : "text-slate-900",
        textMuted: finalTheme == "dark" ? "text-slate-400" : "text-slate-600",
        card: finalTheme == "dark" ? "bg-slate-900/60 border-slate-800 shadow-black/40" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50",
        innerCard: finalTheme == "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200",
        sidebar: finalTheme == "dark" ? "bg-[#020617]/95 border-slate-800" : "bg-white/95 border-slate-200"
    };

    return (
        <div className={`flex min-h-screen transition-colors duration-300 ${theme.bg} ${theme.textMain}`}>

            {/* --- MOBILE NAVIGATION BAR --- */}
            <div className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 lg:hidden backdrop-blur-md border-b ${finalTheme == "dark" ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"}`}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Satellite className="text-white" size={18} />
                    </div>
                    <span className="font-black text-lg">CubeSatellite</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={toggleTheme} className={`p-2 rounded-lg ${finalTheme == "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
                        {isDarkMode == "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                   
                    <button onClick={() => setIsSidebarOpen(true)} className={`p-2 rounded-lg ${finalTheme == "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* --- DESKTOP CONTROLS --- */}
            <div className="hidden lg:block fixed top-4 left-2 z-[60]">
             <motion.div whileHover="hover" variants={{ hover: { scale: 1.05 } }}>
                        <Button
                            variant={'outline'}
                            onClick={() => router.back()}
                            className={`items-center w-20 rounded-xl shadow-xl transition-all active:scale-95 ${finalTheme == "dark" ? "dark:bg-slate-800 text-white dark:hover:text-white " : "bg-white text-slate-900 border border-slate-200"}`}
                        >
                            <motion.span
                                variants={{ hover: { x: -5 } }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="flex items-center"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </motion.span>
                            Back
                        </Button>
                    </motion.div></div>
            <div className="hidden lg:block fixed top-4 left-25 z-[60]">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={`p-3 rounded-xl shadow-xl transition-all active:scale-95 ${finalTheme == "dark" ? "bg-slate-800 text-white" : "bg-white text-slate-900 border border-slate-200"}`}
                >
                    <Menu size={20} />
                </button>
            </div>

            <button
                onClick={toggleTheme}
                className={`hidden lg:flex fixed top-6 right-6 z-[100] px-4 py-2 rounded-xl shadow-xl transition-all items-center gap-3 active:scale-95 font-bold ${finalTheme == "dark" ? "bg-blue-600 text-white" : "bg-slate-900 text-white"}`}
            >
                {finalTheme == "dark" ? <Sun size={18} /> : <Moon size={18} />}
                <span>{finalTheme == "dark" ? "Light" : "Dark"} Mode</span>
            </button>

            {/* --- SIDEBAR & OVERLAY --- */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140]"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className={`fixed inset-y-0 left-0 z-[150] w-[85%] sm:w-72 backdrop-blur-xl border-r p-6 shadow-2xl ${theme.sidebar}`}
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <Satellite className="text-white" size={22} />
                                    </div>
                                    <span className="text-xl font-black tracking-tight">CubeSatellite</span>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-2">
                                    <X size={24} />
                                </button>
                            </div>
                            <nav className="space-y-1">
                                {navigation.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveSection(item.id);
                                            setIsSidebarOpen(false);
                                            document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                                        }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                            ${activeSection === item.id ? "bg-blue-600 text-white" : `${theme.textMuted} hover:bg-blue-500/10`}`}
                                    >
                                        {item.icon} {item.label}
                                    </a>
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 w-full overflow-x-hidden">
                <div className="max-w-4xl mx-auto px-5 sm:px-10 py-24 lg:py-8">

                    {/* HERO SECTION */}
                    <section className="mb-16 pt-10 sm:pt-20">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl sm:text-6xl font-black mb-4 tracking-tighter"
                        >
                            Documentation
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className={`text-lg sm:text-xl mb-8 ${theme.textMuted}`}
                        >
                            Build and scale with <span className="text-blue-500 font-bold">CubeSatellite</span>.
                        </motion.p>
                        <div className="relative w-full max-w-2xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search docs..."
                                className={`w-full border rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-sm sm:text-base ${finalTheme == "dark" ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </section>

                    <div className="space-y-16 sm:space-y-24 pb-32">

                        {/* GETTING STARTED */}
                        <section id="getting-started" className={`scroll-mt-24 rounded-3xl p-6 sm:p-8 border ${theme.card}`}>
                            <h2 className="text-2xl sm:text-3xl font-black mb-4">🚀 Getting Started</h2>
                            <p className={`mb-8 text-base sm:text-lg ${theme.textMuted}`}>AtlasForge is a satellite tracking engine providing real-time TLE propagation.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[{ s: "1", t: "Sign Up", d: "Account setup" }, { s: "2", t: "API Key", d: "Generate Key" }, { s: "3", t: "Fetch", d: "Start tracking" }].map((item) => (
                                    <div key={item.s} className={`p-5 rounded-2xl border ${theme.innerCard}`}>
                                        <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mb-3">{item.s}</span>
                                        <h4 className="font-bold text-sm mb-1">{item.t}</h4>
                                        <p className="text-xs opacity-70">{item.d}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* AUTHENTICATION */}
                        <section id="authentication" className={`scroll-mt-24 rounded-3xl p-6 sm:p-8 border ${theme.card}`}>
                            <h2 className="text-2xl sm:text-3xl font-black mb-4">🔐 Authentication</h2>
                            <div className="relative group rounded-2xl overflow-hidden border border-slate-800">
                                <button
                                    onClick={() => copyToClipboard(`Authorization: Bearer KEY`)}
                                    className="absolute right-3 top-3 p-2 bg-slate-800 text-white rounded-lg"
                                >
                                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                </button>
                                <pre className="bg-[#0f172a] p-6 sm:p-8 font-mono text-[11px] sm:text-sm overflow-x-auto">
                                    <code className="text-emerald-400 whitespace-nowrap">"Authorization: Bearer YOUR_API_KEY"</code>
                                </pre>
                            </div>
                        </section>
                        {/* API REFERENCE */}
                        <section id="api-reference" className={`scroll-mt-24 rounded-3xl p-6 sm:p-8 border ${theme.card}`}>
                            <h2 className={`text-2xl sm:text-3xl font-black mb-6 ${finalTheme == "dark" ? "text-white" : "text-slate-900"}`}>📡 API Reference</h2>
                            <div className={`rounded-2xl border overflow-hidden ${theme.innerCard}`}>
                                <div className={`p-4 flex flex-wrap items-center gap-3 ${finalTheme == "dark" ? "bg-slate-800/50" : "bg-slate-200/50"}`}>
                                    <span className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-black rounded shrink-0">GET</span>
                                    <code className="text-xs sm:text-sm font-bold break-all">/v1/satellites/{"{id}"}</code>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <pre className="bg-[#0f172a] p-4 rounded-xl text-slate-300 text-[11px] sm:text-xs font-mono overflow-x-auto custom-scrollbar">
                                        {`{\n  "id": 25544,\n  "name": "ISS",\n  "latitude": 51.5074,\n  "longitude": -0.1278\n}`}
                                    </pre>
                                </div>
                            </div>
                        </section>
                        {/* FEATURES */}
                        <section id="features" className={`scroll-mt-24 rounded-3xl p-6 sm:p-8 border ${theme.card}`}>
                            <h2 className="text-2xl sm:text-3xl font-black mb-6">⚙️ Features</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { title: "Real-time Tracking", desc: "Track satellites live with precision using the latest TLE data." },
                                    { title: "Debris Detection", desc: "Monitor space debris and potential collision risks in orbit." },
                                    { title: "Heatmaps", desc: "Visualize satellite density and coverage across the globe." },
                                    { title: "Fast API", desc: "Blazing fast response times with our edge-optimized network." }
                                ].map((f, i) => (
                                    <div key={i} className={`p-5 rounded-2xl border ${theme.innerCard}`}>
                                        <h4 className="font-bold text-sm mb-2">{f.title}</h4>
                                        <p className={`text-xs ${theme.textMuted}`}>{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                        {/* DASHBOARD GUIDE */}
                        <section id="dashboard" className={`scroll-mt-24 rounded-3xl p-6 sm:p-8 border ${theme.card}`}>
                            <h2 className={`text-2xl sm:text-3xl font-black mb-6 ${finalTheme == "dark" ? "text-white" : "text-slate-900"}`}>📊 Dashboard Guide</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex gap-4 p-3 sm:p-4 rounded-xl hover:bg-blue-500/5 transition-colors">
                                        <div className="p-2 bg-blue-500/10 rounded h-fit shrink-0">
                                            <Layers size={20} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm sm:text-base">Layer Control</h4>
                                            <p className={`text-xs sm:text-sm leading-relaxed ${theme.textMuted}`}>
                                                Toggle Heatmaps, orbital paths, and ground stations.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-3 sm:p-4 rounded-xl hover:bg-blue-500/5 transition-colors">
                                        <div className="p-2 bg-blue-500/10 rounded h-fit shrink-0">
                                            <Search size={20} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm sm:text-base">ID Filtering</h4>
                                            <p className={`text-xs sm:text-sm leading-relaxed ${theme.textMuted}`}>
                                                Quickly locate specific assets using NORAD ID or Name.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`rounded-2xl border border-dashed p-10 flex flex-col items-center justify-center min-h-[160px] ${finalTheme == "dark" ? "bg-slate-800/30 border-slate-700" : "bg-slate-100 border-slate-300"}`}>
                                    <Layout size={32} className="text-blue-500 mb-3 opacity-40" />
                                    <p className="text-[10px] sm:text-xs italic opacity-50 text-center max-w-[180px]">
                                        Interactive dashboard preview coming soon
                                    </p>
                                </div>
                            </div>
                        </section>
                        {/*concepts*/}
                        <section id="concepts" className={`scroll-mt-32 rounded-3xl p-8 border ${theme.card}`}>
                            <h2 className={`text-3xl font-black mb-6 ${finalTheme == "dark" ? "text-white" : "text-slate-900"}`}>🧠 Concepts</h2>
                            <div className="bg-blue-600/5 border-l-4 border-blue-600 p-6 rounded-r-xl">
                                <h4 className="font-bold mb-2 flex items-center gap-2">
                                    <Zap size={16} className="text-blue-500" /> SGP4 Propagation
                                </h4>
                                <p className={`text-sm italic leading-relaxed ${theme.textMuted}`}>
                                    SGP4 (Simplified General Perturbations-4) is the industry standard model used for calculating the position and velocity of Earth-orbiting satellites relative to the Earth-centered inertial coordinate system.
                                </p>
                            </div>
                        </section>

                        {/* FAQS */}
                        <section id="faqs" className={`scroll-mt-24 rounded-3xl p-6 sm:p-8 border ${theme.card}`}>
                            <h2 className="text-2xl sm:text-3xl font-black mb-6">❓ FAQs</h2>
                            <div className="space-y-3">
                                {[
                                    { q: "How accurate is the tracking data?", a: "We use high-precision SGP4 models updated every 2 hours with fresh TLE data from NORAD." },
                                    { q: "Is there a free tier for developers?", a: "Yes, our 'Voyager' plan is free for up to 1,000 requests per day." },
                                    { q: "Can I track historical debris data?", a: "Absolutely. Our archive covers major orbital events and debris clouds from the last decade." }
                                ].map((item, i) => (
                                    <div key={i} className={`p-4 rounded-xl border ${theme.innerCard}`}>
                                        <h4 className="font-bold text-sm">{item.q}</h4>
                                        <p className={`text-xs mt-2 ${theme.textMuted}`}>{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}