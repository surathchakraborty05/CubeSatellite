"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Shield, Edit3, X, Save, LogOut,
  Activity, Globe, Calendar, Satellite, Sun, Moon, Cpu
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp , setDoc} from 'firebase/firestore';
import { app, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function ProfilePage() {
  const auth = getAuth(app);
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();

  // State
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [uptime, setUptime] = useState('000:00:00');
  const [markers, setMarkers] = useState<string[]>([]);

  // Theme & Image Fallback State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [imgError, setImgError] = useState(false);

  // 1. Theme Sync with LocalStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // 2. Load Markers
  useEffect(() => {
    const saved = localStorage.getItem("markers");
    if (saved) setMarkers(JSON.parse(saved));
  }, []);

  // 3. Uptime Logic
  useEffect(() => {
    if (!user?.metadata.creationTime) return;
    const startTime = new Date(user.metadata.creationTime).getTime();
    const interval = setInterval(() => {
      const diff = Date.now() - startTime;
      const h = Math.floor(diff / 3600000).toString().padStart(3, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  // 4. Data Fetching & Auth Guard
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const docSnap = await getDoc(doc(db, `users/${user.uid}`));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          setEditName(data.displayName || data.name || '');
          setEditBio(data.bio || '');
        }
      } catch (err) {
        console.error("Link Error:", err);
      }
    };
    fetchProfile();
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

const handleSave = async () => {
  if (!user) return;
  setLoading(true);
  // setError("");

  try {
    const userDocRef = doc(db, "users", user.uid);
    
    // Using setDoc with merge: true handles both creation and updates
    await setDoc(userDocRef, {
      displayName: editName,
      bio: editBio,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setProfileData((prev: any) => ({
      ...prev,
      displayName: editName,
      bio: editBio
    }));
    
    setIsEditing(false);
  } catch (err: any) {
    console.error("Save failed:", err.code, err.message);
    // setError("Failed to sync data with Command Center.");
  } finally {
    setLoading(false);
  }
};
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
        <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-zinc-900'} px-4 py-24 relative overflow-hidden`}>
      {/* HUD Background Grid */}
      <div className={`absolute inset-0 pointer-events-none opacity-20 ${isDark ? 'invert-0' : 'invert'}`}
        style={{ backgroundImage: 'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-4xl mx-auto z-10 relative">
        {/* Header Metadata */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] opacity-50">
            <Cpu className="w-3 h-3" /> Grid_Link: Established
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-zinc-900/5 border-zinc-200 hover:bg-zinc-900/10'}`}
          >
            {isDark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Futuristic Profile Card */}
          <div className={`backdrop-blur-3xl border p-8 rounded-[2rem] transition-all duration-500 ${isDark ? 'bg-zinc-900/40 border-white/10 shadow-2xl shadow-emerald-500/5' : 'bg-white/80 border-zinc-200 shadow-xl shadow-zinc-200'}`}>
            <div className="flex flex-col md:flex-row items-center gap-8">

              {/* Profile Image with Error Handling */}
              <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r ${isDark ? 'from-emerald-500 to-cyan-500' : 'from-blue-500 to-emerald-500'} rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000`}></div>
                <div className={`w-32 h-32 rounded-full flex items-center justify-center border-2 relative overflow-hidden ${isDark ? 'bg-zinc-950 border-white/10' : 'bg-white border-zinc-200'}`}>
                  {user?.photoURL && !imgError ? (
                    <img
                      src={user.photoURL}
                      alt="Operator"
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-emerald-500">
                      <User className="w-12 h-12" />
                      <span className="text-[8px] font-mono font-bold mt-1 opacity-50 uppercase">Default_Avatar</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-grow text-center md:text-left space-y-2">
                {isEditing ? (
                  <div className="space-y-3">
                    <input

                      value={editName}

                      onChange={(e) => setEditName(e.target.value)}

                      className={`bg-transparent border-b-2 ${isDark ? 'border-emerald-500/50 text-white' : 'border-emerald-600/50 text-zinc-900'} text-2xl font-bold w-full focus:outline-none`}
                      placeholder="Operator Name"

                    />
                    <textarea

                      value={editBio}

                      onChange={(e) => setEditBio(e.target.value)}

                      className={`bg-white/5 border ${isDark ? 'border-white/10' : 'border-zinc-200'} rounded-xl p-3 text-sm w-full h-20 resize-none font-mono focus:outline-none`}

                      placeholder="Enter mission statement or bio..."

                    />

                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                      {profileData?.displayName || user?.displayName || 'UNKNOWN_OPERATOR'}
                    </h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-emerald-500 font-mono text-[9px] uppercase tracking-widest font-bold">
                        {profileData?.role || 'Orbital Specialist'}
                      </span>
                    </div>
                    <p className={`text-sm font-mono mt-4 max-w-lg italic ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {profileData?.bio || 'Waiting for mission parameters...'}
                    </p>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 w-full md:w-auto">
                {isEditing ? (
                  <div className="flex flex-col items-center gap-y-4">
                    <button

                      onClick={handleSave}

                      disabled={loading}

                      className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-widest transition-all"

                    >

                      <Save className="w-4 h-4" />

                      {loading ? 'Saving...' : 'Save Changes'}

                    </button>
                    <button

                      onClick={() => setIsEditing(false)}

                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-lg transition-all flex items-center gap-2 font-mono text-xs uppercase tracking-widest"

                    >

                      <X className="w-4 h-4" />

                      Cancel

                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-y-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`flex w-full items-center justify-center gap-2 border px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isDark
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white'
                        }`}
                    >
                      <Edit3 className="w-4 h-4" /> Modify_Ref
                    </button>

                    <button
                      onClick={handleLogout}
                      className={`flex w-full items-center justify-center gap-2 border px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isDark
                          ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-600 hover:text-white'
                        }`}
                    >
                      <LogOut className="w-4 h-4" /> Terminate
                    </button>
                  </div>

                )}

              </div>
            </div>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Uptime', val: uptime, icon: Activity, color: 'text-emerald-500' },
              { label: 'Telemetry', val: '1,248', icon: Globe, color: 'text-blue-500' },
              { label: 'Commission', val: user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A', icon: Calendar, color: 'text-purple-500' }
            ].map((stat, i) => (
              <div key={i} className={`p-6 rounded-3xl border backdrop-blur-md transition-all ${isDark ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-50">{stat.label}</span>
                </div>
                <div className="text-2xl font-mono font-bold tracking-tight">{stat.val}</div>
              </div>
            ))}
          </div>

          {/* Marked Targets */}
          {/* Stats Grid */}

          {/* Activity Log Placeholder */}
          <div className={`backdrop-blur-xl border p-8 rounded-2xl mt-8 transition-all duration-300 ${isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white/70 border-zinc-200'
            }`}>
            <h2 className={`text-sm font-bold font-mono uppercase tracking-widest mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Recent Mission Logs
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex items-center justify-between py-3 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                      <Globe className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold font-mono uppercase ${isDark ? 'text-white' : 'text-zinc-800'}`}>Satellite Acquisition: ISS-ZARYA</p>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">Telemetry Lock Established</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">2h ago</span>
                </div>
              ))}
            </div>
          </div>

          {/* MARKED SATELLITES */}
          <div className={`backdrop-blur-xl border p-8 rounded-2xl mt-8 transition-all duration-300 ${isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white/70 border-zinc-200'
            }`}>
            <h2 className={`text-sm font-bold font-mono uppercase tracking-widest mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Marked Satellites
            </h2>

            {markers.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono uppercase italic">No markers active in sector.</p>
            ) : (
              <div className="space-y-4">
                {markers.map((sat, i) => (
                  <div key={i} className={`flex items-center justify-between py-3 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center">
                        <Satellite className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold font-mono uppercase ${isDark ? 'text-white' : 'text-zinc-800'}`}>{sat}</p>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">Marker saved locally</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updated = markers.filter(m => m !== sat);
                        setMarkers(updated);
                        localStorage.setItem("markers", JSON.stringify(updated));
                      }}
                      className="text-[10px] font-mono text-red-500 hover:text-red-400 font-bold uppercase tracking-widest transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
}