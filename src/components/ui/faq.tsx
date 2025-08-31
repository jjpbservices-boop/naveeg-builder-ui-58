import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps extends React.HTMLAttributes<HTMLDivElement> {
  items: FAQItem[]
  className?: string
}

const FAQ = React.forwardRef<HTMLDivElement, FAQProps>(
  ({ items, className, ...props }, ref) => {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null)

    const toggleItem = (index: number) => {
      setOpenIndex(openIndex === index ? null : index)
    }

    return (
      <div
        ref={ref}
        className={cn("space-y-4", className)}
        {...props}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="card-clean overflow-hidden"
          >
            <button
              className="flex w-full items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors duration-200"
              onClick={() => toggleItem(index)}
              aria-expanded={openIndex === index}
            >
              <h3 className="font-semibold text-lg">{item.question}</h3>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform duration-200",
                  openIndex === index && "rotate-180"
                )}
              />
            </button>
            
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                openIndex === index ? "max-h-96" : "max-h-0"
              )}
            >
              <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
)
FAQ.displayName = "FAQ"

export { FAQ }
export type { FAQItem }
