import * as React from "react"
import { cn } from "@/lib/utils"

interface TestimonialProps extends React.HTMLAttributes<HTMLDivElement> {
  avatar: string
  name: string
  role: string
  quote: string
  logo?: string
  company?: string
  className?: string
}

const Testimonial = React.forwardRef<HTMLDivElement, TestimonialProps>(
  ({ avatar, name, role, quote, logo, company, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "card-clean card-clean-hover p-8",
          className
        )}
        {...props}
      >
        <div className="mb-6">
          <svg
            className="h-8 w-8 text-primary"
            fill="currentColor"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>
        </div>
        
        <blockquote className="mb-6 text-lg leading-relaxed text-balance">
          "{quote}"
        </blockquote>
        
        <div className="flex items-center gap-4">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={avatar}
            alt={name}
          />
          <div className="flex-1">
            <div className="font-semibold">{name}</div>
            <div className="text-sm text-muted-foreground">{role}</div>
            {company && logo && (
              <img
                className="mt-2 h-6 w-auto object-contain"
                src={logo}
                alt={company}
              />
            )}
          </div>
        </div>
      </div>
    )
  }
)
Testimonial.displayName = "Testimonial"

export { Testimonial }
