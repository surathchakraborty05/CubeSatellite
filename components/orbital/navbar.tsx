"use client"
import { useEffect, useState } from "react";
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Satellite, Settings, User, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface NavbarProps {
  variant?: "light" | "dark"
  user?: {
    name: string
    role?: string
  }
}

// Restored original labels
const navItems = [
  { href: "/", label: "Landing / Dashboard" },
  { href: "/map-viewer", label: "Live Map Viewer" },
  { href: "/satellite-details", label: "Satellite Details" },
  { href: "/timeline", label: "Orbit Timeline & Playback" },
  { href: "/settings", label: "Settings & Appearance" },
]

export function Navbar({ variant = "light" }: NavbarProps) {
  const [userName, setUserName] = useState<string | null>(null);
  const pathname = usePathname()
  const isDark = variant === "dark"
  const auth = getAuth(app);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error: any) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          setUserName(
            snap.exists()
              ? (snap.data().displayName || snap.data().name || user.displayName || "User")
              : (user.displayName || "User")
          );
        } catch (err) {
          setUserName("User");
        }
      } else {
        setUserName(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <header
      className={cn(
        "flex items-center justify-between px-4 py-2 border-b relative z-40", // Added z-40 to header
        isDark
          ? "bg-[oklch(0.12_0.02_220)] border-[oklch(0.28_0.03_220)] text-[oklch(0.92_0.02_200)]"
          : "bg-card border-border text-card-foreground"
      )}
    >
      <div className="flex items-center gap-2 md:gap-6">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className={cn(
                "z-[9999] w-[300px] p-0 border-r backdrop-blur-xl", // p-0 to control padding manually
                isDark
                  ? "bg-[oklch(0.12_0.02_220)]/90 border-[oklch(0.28_0.03_220)] text-white"
                  : "bg-white/90 border-border text-foreground"
              )}
            >
              {/* Sidebar Header/Branding */}
              <div className="p-6 border-b border-border/50">
                <SheetTitle className={cn(
                  "flex items-center gap-3 text-xl font-bold tracking-tight",
                  isDark && "text-white"
                )}>
                  <div className={cn("p-1.5 rounded-lg", isDark ? "bg-[oklch(0.65_0.15_190)]" : "bg-primary")}>
                    <Satellite className="h-5 w-5 text-primary-foreground" />
                  </div>
                  CubeSatellite
                </SheetTitle>
              </div>

              <nav className="flex flex-col gap-1 p-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? isDark
                            ? "bg-[oklch(0.65_0.15_190)]/10 text-[oklch(0.65_0.15_190)]"
                            : "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {/* Active Accent Bar */}
                      {isActive && (
                        <span className="absolute left-0 w-1 h-6 bg-current rounded-r-full" />
                      )}

                      <span className={cn(
                        "transition-transform duration-200",
                        isActive ? "translate-x-1" : "group-hover:translate-x-1"
                      )}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              {/* Optional: Sidebar Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border/50 bg-muted/20">
                <p className="text-xs text-muted-foreground">© 2026 CubeSatellite Pro</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg", isDark ? "bg-[oklch(0.65_0.15_190)]" : "bg-primary")}>
            <Satellite className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg hidden sm:block">CubeSatellite</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2 p-1 bg-muted/30 rounded-full border border-border/50 backdrop-blur-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
                  isActive
                    ? isDark
                      ? "bg-[oklch(0.65_0.15_190)] text-[oklch(0.12_0.02_220)] shadow-[0_0_15px_rgba(0,180,216,0.3)]"
                      : "bg-primary text-primary-foreground shadow-md"
                    : isDark
                      ? "text-[oklch(0.75_0.03_200)] hover:text-white hover:bg-white/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
                {/* Optional: Subtle dot indicator for active state */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-60" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {userName && (
          <div className="flex items-center gap-2">
            <span className={cn("text-sm hidden xl:block", isDark ? "text-[oklch(0.65_0.03_200)]" : "text-muted-foreground")}>
              Logged in as <span className={cn("font-medium", isDark ? "text-[oklch(0.65_0.18_45)]" : "text-primary")}>{userName}</span>
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn("flex items-center gap-1 p-1 rounded-full", isDark ? "hover:bg-[oklch(0.22_0.025_220)]" : "hover:bg-muted")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isDark ? "bg-[oklch(0.25_0.03_220)]" : "bg-muted")}>
                    <User className="h-4 w-4" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[10000]">
                <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <Link href="/settings" className={cn("p-2 rounded-md", isDark ? "hover:bg-[oklch(0.22_0.025_220)]" : "hover:bg-muted")}>
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </header>
  )
}