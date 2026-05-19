import Link from "next/link"
import { Satellite } from "lucide-react"


interface FooterProps {
  variant?: "light" | "dark"
}


export function Footer({ variant = "light" }: FooterProps) {
  const isDark = variant === "dark"
  

  return (
    <footer
      className={
        isDark
          ? "bg-[oklch(0.12_0.02_220)] border-t border-[oklch(0.28_0.03_220)] text-[oklch(0.65_0.03_200)]"
          : "bg-card border-t border-border text-muted-foreground"
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={
                isDark ? "text-[oklch(0.65_0.15_190)]" : "text-primary"
              }
            >
              <Satellite className="h-5 w-5" />
            </div>
            <div>
              <span className="font-semibold">CubeSatellite</span>
              <p className="text-xs">
                © 2026 CubeSatellite Inc. All rights reserved. Built for mission
                analysts and satellite operators.
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-6 text-sm">
            <Link
              href="/docs"
              className="hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/support"
              className="hover:text-foreground transition-colors"
            >
              Support
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
