import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from "./context/ThemeContext"
import { DistanceUnitProvider } from './context/DistanceUnitContext'
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: 'CubeSatellite - Satellite Tracking & Mission Dashboard',
  description: 'Professional satellite tracking, mission analytics, and orbital visualization platform for mission analysts and satellite operators.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-light.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/satellite.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
  className={`${geist.className} ${geistMono.variable} antialiased`}
>
        <ThemeProvider>
          <DistanceUnitProvider>
            {children}
          </DistanceUnitProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
