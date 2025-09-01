import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
  variant?: 'light' | 'dark'
}

export function Section({ children, className = '', variant = 'light' }: SectionProps) {
  const baseClasses = 'section-y'
  
  if (variant === 'dark') {
    return (
      <section className={`${baseClasses} bg-[#0b0d10] text-white ${className}`}>
        <div className="container-max">
          {children}
        </div>
      </section>
    )
  }
  
  return (
    <section className={`${baseClasses} bg-white ${className}`}>
      <div className="container-max">
        {children}
      </div>
    </section>
  )
}
