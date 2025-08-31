import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CTAProps extends React.HTMLAttributes<HTMLDivElement> {
  headline: string
  subcopy: string
  primaryButton: {
    text: string
    href: string
    loading?: boolean
  }
  secondaryLink?: {
    text: string
    href: string
  }
  className?: string
}

const CTA = React.forwardRef<HTMLDivElement, CTAProps>(
  ({ headline, subcopy, primaryButton, secondaryLink, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "text-center",
          className
        )}
        {...props}
      >
        <h2 className="heading-display text-display-3 mb-6 text-balance">
          {headline}
        </h2>
        
        <p className="text-lead mb-8 max-w-2xl mx-auto text-balance">
          {subcopy}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            loading={primaryButton.loading}
          >
            <a href={primaryButton.href}>
              {primaryButton.text}
            </a>
          </Button>
          
          {secondaryLink && (
            <Button
              asChild
              variant="ghost"
              size="lg"
            >
              <a href={secondaryLink.href}>
                {secondaryLink.text}
              </a>
            </Button>
          )}
        </div>
      </div>
    )
  }
)
CTA.displayName = "CTA"

export { CTA }
