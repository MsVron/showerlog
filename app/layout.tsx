import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shower Thoughts - Capture Your Creative Moments",
  description: "Transform your random thoughts into actionable tasks with our gentle, water-inspired productivity app.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100`}>
        <div className="min-h-screen relative overflow-hidden">
          {/* Background bubbles */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-10 left-10 w-4 h-4 bg-blue-200/30 rounded-full animate-bounce"
              style={{ animationDelay: "0s", animationDuration: "3s" }}
            ></div>
            <div
              className="absolute top-32 right-20 w-6 h-6 bg-cyan-200/20 rounded-full animate-bounce"
              style={{ animationDelay: "1s", animationDuration: "4s" }}
            ></div>
            <div
              className="absolute bottom-20 left-1/4 w-3 h-3 bg-blue-300/25 rounded-full animate-bounce"
              style={{ animationDelay: "2s", animationDuration: "5s" }}
            ></div>
            <div
              className="absolute top-1/2 right-10 w-5 h-5 bg-cyan-300/20 rounded-full animate-bounce"
              style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}
            ></div>
          </div>
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  )
}
