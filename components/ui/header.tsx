import Link from "next/link"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="w-full p-4 flex justify-between items-center relative z-10">
      <Link href="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 water-drop bg-gradient-to-br from-blue-400 to-cyan-300"></div>
        <span className="pixel-font text-xl text-blue-800">Shower Thoughts</span>
      </Link>
      <Button variant="ghost" size="icon" asChild className="hover:bg-blue-100/50 transition-colors">
        <a href="https://github.com/MsVron/showerthoughts/" target="_blank" rel="noopener noreferrer">
          <Github className="h-5 w-5 text-blue-700" />
        </a>
      </Button>
    </header>
  )
}
