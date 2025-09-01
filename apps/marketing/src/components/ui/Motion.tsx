'use client'

import { motion, Variants } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

interface MotionProps {
  children: ReactNode
  className?: string
}

interface FadeInProps extends MotionProps {
  delay?: number
  y?: number
}

interface StaggerProps extends MotionProps {
  staggerDelay?: number
}

interface HoverLiftProps extends MotionProps {
  className?: string
}

// Check for reduced motion preference - deterministic to avoid hydration issues
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Only check after component mounts to avoid SSR mismatch
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)

      const mediaQueryChangeHandler = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches)
      }

      mediaQuery.addEventListener('change', mediaQueryChangeHandler)
      return () => mediaQuery.removeEventListener('change', mediaQueryChangeHandler)
    }
  }, [])

  return prefersReducedMotion
}

// Fade in animation
export function FadeIn({ children, className = '', delay = 0, y = 12 }: FadeInProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  )
}

// Stagger animation for groups
export function Stagger({ children, className = '', staggerDelay = 0.1 }: StaggerProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children
      }
    </motion.div>
  )
}

// Hover lift animation
export function HoverLift({ children, className = '' }: HoverLiftProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      whileHover={{ y: -4 }}
      whileTap={{ y: -1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
