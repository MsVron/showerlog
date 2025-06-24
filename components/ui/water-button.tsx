import type React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface WaterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  children: React.ReactNode
}

export const WaterButton = forwardRef<HTMLButtonElement, WaterButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const baseClasses = "pixel-font transition-all duration-300 bubble-shadow hover:shadow-lg active:scale-95"

    const variantClasses = {
      primary: "bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white",
      secondary: "glass-effect text-blue-800 hover:bg-white/90",
      ghost: "text-blue-700 hover:bg-blue-100/50",
    }

    const sizeClasses = {
      sm: "px-4 py-2 text-sm rounded-lg",
      md: "px-6 py-3 text-base rounded-xl",
      lg: "px-8 py-4 text-lg rounded-2xl",
    }

    return (
      <Button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          isLoading && "opacity-70 cursor-not-allowed",
          className,
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </Button>
    )
  },
)

WaterButton.displayName = "WaterButton"
