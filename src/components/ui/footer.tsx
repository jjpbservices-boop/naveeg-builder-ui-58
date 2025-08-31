import * as React from "react"
import { cn } from "@/lib/utils"

interface FooterColumn {
  title: string
  links: Array<{
    name: string
    href: string
  }>
}

interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  logo: React.ReactNode
  description: string
  columns: FooterColumn[]
  socialLinks?: Array<{
    name: string
    href: string
    icon: React.ReactNode
  }>
  className?: string
}

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ logo, description, columns, socialLinks, className, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          "border-t border-border/50 bg-muted/30",
          className
        )}
        {...props}
      >
        <div className="container-clean py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Company Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                {logo}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {description}
              </p>
              {socialLinks && (
                <div className="flex items-center gap-4 mt-6">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Columns */}
            {columns.map((column, index) => (
              <div key={index}>
                <h3 className="font-semibold text-foreground mb-4">
                  {column.title}
                </h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Legal */}
          <div className="pt-8 border-t border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>© 2024 Naveeg. All rights reserved.</span>
                <div className="flex items-center gap-4">
                  <a href="/privacy" className="hover:text-foreground transition-colors duration-200">
                    Privacy
                  </a>
                  <a href="/terms" className="hover:text-foreground transition-colors duration-200">
                    Terms
                  </a>
                  <a href="/cookies" className="hover:text-foreground transition-colors duration-200">
                    Cookies
                  </a>
                </div>
              </div>
              
              <div className="text-xs">
                Built with ❤️ for business owners
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }
)
Footer.displayName = "Footer"

export { Footer }
export type { FooterColumn }
