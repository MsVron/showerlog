import Link from "next/link"
import { WaterButton } from "@/components/ui/water-button"
import { Header } from "@/components/ui/header"

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <div className="py-20">
          <div className="w-32 h-32 mx-auto mb-8 water-drop bg-gradient-to-br from-blue-300 to-cyan-300 opacity-50"></div>
          <h1 className="pixel-font text-4xl text-blue-800 mb-4">404</h1>
          <h2 className="pixel-font text-2xl text-blue-700 mb-4">Page Not Found</h2>
          <p className="text-blue-600 mb-8">Looks like this thought drifted away. Let's get you back on track!</p>
          <Link href="/">
            <WaterButton size="lg">Return Home</WaterButton>
          </Link>
        </div>
      </main>
    </div>
  )
}
