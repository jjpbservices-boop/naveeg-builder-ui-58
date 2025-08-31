import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface FeatureItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon
  title: string
  body: string
  className?: string
}

const FeatureItem = React.forwardRef<HTMLDivElement, FeatureItemProps>(
  ({ icon: Icon, title, body, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group text-center",
          className
        )}
        {...props}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="mb-4 text-xl font-semibold text-balance">
          {title}
        </h3>
        <p className="text-muted-foreground text-balance leading-relaxed">
          {body}
        </p>
      </div>
    )
  }
)
FeatureItem.displayName = "FeatureItem"

export { FeatureItem }
