import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string
  delta?: {
    value: string
    isPositive: boolean
  }
  className?: string
}

const Metric = React.forwardRef<HTMLDivElement, MetricProps>(
  ({ label, value, delta, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "text-center",
          className
        )}
        {...props}
      >
        <div className="text-2xl font-bold mb-2">
          {value}
        </div>
        
        <div className="text-sm text-muted-foreground mb-3">
          {label}
        </div>
        
        {delta && (
          <div className={cn(
            "flex items-center justify-center gap-1 text-sm font-medium",
            delta.isPositive ? "text-success" : "text-danger"
          )}>
            {delta.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {delta.value}
          </div>
        )}
      </div>
    )
  }
)
Metric.displayName = "Metric"

export { Metric }
