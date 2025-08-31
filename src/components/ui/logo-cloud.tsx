import * as React from "react"
import { cn } from "@/lib/utils"

interface LogoCloudProps extends React.HTMLAttributes<HTMLDivElement> {
  logos: Array<{
    name: string
    logo: string
    href?: string
  }>
  className?: string
}

const LogoCloud = React.forwardRef<HTMLDivElement, LogoCloudProps>(
  ({ logos, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-12 sm:max-w-xl sm:grid-cols-3 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-4",
          className
        )}
        {...props}
      >
        {logos.map((logo) => {
          const LogoComponent = logo.href ? "a" : "div"
          
          return (
            <LogoComponent
              key={logo.name}
              href={logo.href}
              className={cn(
                "col-span-1 flex justify-center grayscale hover:grayscale-0 transition-all duration-300",
                logo.href && "cursor-pointer"
              )}
            >
              <img
                className="h-12 w-auto object-contain"
                src={logo.logo}
                alt={logo.name}
              />
            </LogoComponent>
          )
        })}
      </div>
    )
  }
)
LogoCloud.displayName = "LogoCloud"

export { LogoCloud }
