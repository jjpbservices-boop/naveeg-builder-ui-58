import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThemeToggleProps extends React.ComponentProps<typeof Button> {}

const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ className, ...props }, ref) => {
    const [isDark, setIsDark] = React.useState(false)

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
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={className}
        {...props}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }
)
ThemeToggle.displayName = "ThemeToggle"

export { ThemeToggle }
