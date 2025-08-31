import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  eyebrow?: string
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  containerClassName?: string
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ eyebrow, title, description, children, className, containerClassName, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn("section-clean", className)}
        {...props}
      >
        <div className={cn("container-clean", containerClassName)}>
          {(eyebrow || title || description) && (
            <div className="mx-auto max-w-3xl text-center mb-16">
              {eyebrow && (
                <Badge variant="accent" className="mb-4">
                  {eyebrow}
                </Badge>
              )}
              <h2 className="heading-display text-display-3 mb-6 text-balance">
                {title}
              </h2>
              {description && (
                <p className="text-lead text-balance">
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </section>
    )
  }
)
Section.displayName = "Section"

export { Section }
