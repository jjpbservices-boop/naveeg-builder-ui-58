import * as React from "react"
import { cn } from "@/lib/utils"
import { Copy, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  language?: string
  children: string
  className?: string
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ title, language, children, className, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false)

    const copyToClipboard = async () => {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "card-clean overflow-hidden",
          className
        )}
        {...props}
      >
        {(title || language) && (
          <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2">
              {title && (
                <span className="text-sm font-medium">{title}</span>
              )}
              {language && (
                <Badge variant="neutral" className="text-xs">
                  {language}
                </Badge>
              )}
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>
        )}
        
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm leading-relaxed font-mono">
            {children}
          </code>
        </pre>
      </div>
    )
  }
)
CodeBlock.displayName = "CodeBlock"

export { CodeBlock }
