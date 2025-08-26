import { useHeroAnimation } from '@/hooks/useHeroAnimation'

interface HeroAnimationProps {
  className?: string
}

export const HeroAnimation = ({ className = '' }: HeroAnimationProps) => {
  const canvasId = 'hero-dots'
  useHeroAnimation(canvasId)

  return (
    <canvas
      id={canvasId}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}