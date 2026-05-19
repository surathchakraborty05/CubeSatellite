"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FcGoogle } from "react-icons/fc";
import {
  Box,
  Shield,
  Zap,
  Code2,
  BarChart3,
  Activity,
  Github,
  Chrome,
  Globe,
  ChevronDown,
  Mail,
  Lock,
  User,
  EyeClosed,
  Eye
} from 'lucide-react';
import { useRouter } from "next/navigation";
interface AuthPageProps {
  onLogin: () => void;
}
const handleLogin = () => {
  console.log("User logged in");
};
const AuthPage = ({ onLogin }: { onLogin: () => void }) => {
  const router = useRouter();
  const auth = getAuth(app);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const provider = new GoogleAuthProvider();
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      console.log("Google User:", result.user);
      router.push("/");

    } catch (error: any) {
      console.error(error.message);
      setToast({ message: error.message, type: "error" })
      setTimeout(() => setToast(null), 3000)
    }
  };
  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, []);
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
      {/* Background Image with Blur */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
      ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
          >
            {toast.message}
          </div>
        </div>
      )}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 "
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Glassmorphism Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-7xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[850px]"
      >
        {/* Left Side - Info & Illustration */}
        <div className="flex-1 p-8 md:p-12 flex flex-col border-b md:border-b-0 md:border-r border-white/10 bg-white/5">
          {/* Top Nav */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Box className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CubeSatellite</span>
            </div>
            <div className="hidden lg:flex items-center gap-8 text-white/70 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">Product</a>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col">
            {isLogin ? (
              <>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight"
                >
                  Welcome back to <br />
                  <span className="text-blue-400">CubeSatellite</span>
                </motion.h1>

                <p className="text-white/60 text-lg max-w-md mb-12 leading-relaxed">
                  Manage, collaborate, and ship faster. Securely store your data, streamline user management, and optimize operations — all in one place.
                </p>
              </>
            ) : (
              <>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight"
                >
                  Create your account <br />
                  <span className="text-blue-400">CubeSatellite</span>
                </motion.h1>

                <p className="text-white/60 text-lg max-w-md mb-12 leading-relaxed">
                  Join us and start managing everything in one powerful platform.
                </p>
              </>
            )}

            {/* Illustration */}
            <div className="relative mb-12 group">
              <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="https://images-assets.nasa.gov/image/jsc2021e064215_alt/jsc2021e064215_alt~large.jpg"
                alt="Infrastructure"
                className="rounded-3xl shadow-2xl border border-white/10 relative z-10 w-full object-cover h-64 md:h-80"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-8">
              {[
                { icon: Shield, title: "Enterprise-grade security", desc: "Industry leading protection..." },
                { icon: Code2, title: "Dev-first tools", desc: "Command-line interfaces..." }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl hover:bg-white/20 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-500/50 flex items-center justify-center mb-4">
                    <feature.icon className="text-black-400/90" size={22} />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">{feature.title}</h3>
                  <p className="text-white/40 text-xs">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/50 flex items-center justify-center">
                  <BarChart3 className="text-orange-400" size={20} />
                </div>
                <div>
                  <p className="text-white/90 font-bold text-sm">Active Projects</p>
                  <p className="text-white/50 text-xs">+1.5M endpoints updated weekly</p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Activity className="text-emerald-400/90" size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white/90 font-bold text-sm">Uptime</p>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-white/50 text-xs">99.99% average over 12 months</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col bg-white/5">

          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Box className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">AtlasForge</span>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <button className="flex items-center gap-1 text-white/70 text-sm font-medium hover:text-white transition-colors">
                <Globe size={16} />
                <span>EN</span>
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
                Contact Sales
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
            {/* Login/Signup Toggle */}
            <div className="flex items-baseline gap-6 mb-8">
              <button
                onClick={() => {
                  console.log("Login clicked");
                  setIsLogin(true);
                }}
                className={`text-3xl font-bold transition-all ${isLogin ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  console.log("Sign Up clicked");
                  setIsLogin(false);
                }}
                className={`text-3xl font-bold transition-all ${!isLogin ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
              >
                Sign up
              </button>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-1 mb-8">
              <button className="flex items-center justify-center gap-3 bg-[#24292e] hover:bg-[#2c3238] border border-white/10 text-white py-3 rounded-xl font-medium transition-all" onClick={handleGoogleLogin}>
                <FcGoogle size={25} />
                <span>
                  Sign in with{" "}
                  <span className="text-[20px]">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </span>
                </span>
              </button>
              {/* <button className="flex items-center justify-center gap-3 bg-[#24292e] hover:bg-[#2c3238] text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-black/20">
                <Github size={20} />
                <span>Continue with GitHub</span>
              </button> */}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Or use your email</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

            {/* Auth Form */}
            <form className="space-y-6 mb-12" onSubmit={async (e) => {
              e.preventDefault();

              try {

                if (!isLogin) {
                  if (password !== confirmPassword) {
                    setToast({ message: "Password do not match", type: "error" })
                    setTimeout(() => setToast(null), 3000)
                    return; // stop here
                  }

                  if (password.length < 6) {
                    setToast({ message: "Password should be at least 6 characters", type: "success" })
                    setTimeout(() => setToast(null), 3000)
                    return;
                  }
                }

                if (isLogin) {

                  const userCred = await signInWithEmailAndPassword(auth, email, password);
                  console.log("Logged in:", userCred.user);

                  onLogin?.();
                } else {
                  // 🆕 SIGNUP
                  const userCred = await createUserWithEmailAndPassword(auth, email, password);
                  await setDoc(doc(db, "users", userCred.user.uid), {
                    name: name,
                    email: email,
                    uid: userCred.user.uid,
                    createdAt: new Date()
                  });
                  console.log("User created:", userCred.user);

                  onLogin?.();
                }
                router.push("/");

              } catch (error: any) {
                console.error(error.message);
                setToast({ message: error.message, type: "error" })
                setTimeout(() => setToast(null), 3000)

              }
            }}>
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-bold ml-1">Full name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black/90" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Doe Jonathan"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-white/60 text-sm font-bold ml-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/90 group-focus-within:text-neon-magenta transition-colors" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@yourcompany.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-white/60 text-sm font-bold">Password</label>
                  {isLogin && <a href="#" className="text-white/40 text-xs hover:text-white transition-colors">Forgot password?</a>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/90 group-focus-within:text-neon-magenta transition-colors " size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/90 hover:text-white"
                  >
                    {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center gap-2 ml-1">
                  <input type="checkbox" id="remember" className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500/50" />
                  <label htmlFor="remember" className="text-white/40 text-sm">Remember me</label>
                </div>
              )}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-white/60 text-sm font-bold ml-1">Confirm</label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/90" size={18} />

                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="********"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />


                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/90 hover:text-white"
                    >
                      {showConfirm ? <EyeClosed size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98]"
              >
                {isLogin ? 'Login to AtlasForge' : 'Create Account'}
              </button>
            </form>

            <p className="text-white/40 text-sm ml-auto">
              Need help? <a href="#" className="text-white hover:underline">Contact us</a>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Floating Particles/Elements for extra depth */}
      <div className="fixed top-1/4 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-1/4 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
    </div>
  );
};
export default AuthPage;