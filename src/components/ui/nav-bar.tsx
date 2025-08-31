import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu, X } from "lucide-react"

interface NavBarProps extends React.HTMLAttributes<HTMLElement> {
  logo: React.ReactNode
  navigation: Array<{
    name: string
    href: string
  }>
  cta?: {
    text: string
    href: string
  }
  className?: string
}

const NavBar = React.forwardRef<HTMLElement, NavBarProps>(
  ({ logo, navigation, cta, className, ...props }, ref) => {
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const [isDark, setIsDark] = React.useState(false)

    React.useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10)
      }

      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    React.useEffect(() => {
      const isDarkMode = document.documentElement.classList.contains('dark')
      setIsDark(isDarkMode)
    }, [])

    const toggleTheme = () => {
      const newTheme = isDark ? 'light' : 'dark'
      setIsDark(newTheme === 'dark')
      
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    return (
      <nav
        ref={ref}
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled 
            ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm" 
            : "bg-transparent",
          className
        )}
        {...props}
      >
        <div className="container-clean">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              {logo}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 p-0"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* CTA Button */}
              {cta && (
                <Button asChild>
                  <a href={cta.href}>{cta.text}</a>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-9 w-9 p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
              <div className="py-4 space-y-4">
                {/* Mobile Navigation */}
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors duration-200 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                
                {/* Mobile CTA */}
                {cta && (
                  <div className="px-4 pt-4 border-t border-border/50">
                    <Button asChild className="w-full">
                      <a href={cta.href} onClick={() => setIsMobileMenuOpen(false)}>
                        {cta.text}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    )
  }
)
NavBar.displayName = "NavBar"

export { NavBar }
