import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-gray-950 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
          {
            "bg-blue-600 text-white hover:bg-blue-500": variant === "default",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
            "border border-gray-700 bg-transparent text-gray-100 hover:bg-gray-800 hover:border-gray-600": variant === "outline",
            "bg-gray-800 text-gray-100 hover:bg-gray-700": variant === "secondary",
            "text-gray-300 hover:bg-gray-800 hover:text-gray-100": variant === "ghost",
            "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300": variant === "link",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }