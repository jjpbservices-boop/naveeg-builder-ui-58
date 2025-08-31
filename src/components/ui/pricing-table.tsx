import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  popular?: boolean
  cta: string
  href: string
}

interface PricingTableProps extends React.HTMLAttributes<HTMLDivElement> {
  tiers: PricingTier[]
  className?: string
}

const PricingTable = React.forwardRef<HTMLDivElement, PricingTableProps>(
  ({ tiers, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-8 lg:grid-cols-2 lg:gap-12",
          className
        )}
        {...props}
      >
        {tiers.map((tier, index) => (
          <div
            key={index}
            className={cn(
              "card-clean card-clean-hover relative p-8",
              tier.popular && "ring-2 ring-primary"
            )}
          >
            {tier.popular && (
              <Badge
                variant="default"
                className="absolute -top-3 left-1/2 -translate-x-1/2"
              >
                Most Popular
              </Badge>
            )}
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold mb-4">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground">/{tier.period}</span>
              </div>
              <p className="text-muted-foreground">{tier.description}</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              {tier.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button
              asChild
              className="w-full"
              variant={tier.popular ? "default" : "secondary"}
            >
              <a href={tier.href}>{tier.cta}</a>
            </Button>
          </div>
        ))}
      </div>
    )
  }
)
PricingTable.displayName = "PricingTable"

export { PricingTable }
export type { PricingTier }
