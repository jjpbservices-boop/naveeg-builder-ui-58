import { useEffect, useCallback } from 'react'

export const useHeroAnimation = (canvasId: string) => {
  const waitForReadyCanvas = useCallback((retryCount = 0): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
      
      if (!canvas) {
        if (retryCount < 10) {
          console.log(`Canvas not found, retry ${retryCount + 1}/10`)
          setTimeout(() => {
            waitForReadyCanvas(retryCount + 1).then(resolve).catch(reject)
          }, 50 * (retryCount + 1))
        } else {
          reject(new Error(`Canvas with id "${canvasId}" not found after 10 retries`))
        }
        return
      }

      const parent = canvas.parentElement
      if (!parent) {
        if (retryCount < 10) {
          console.log(`Canvas parent not found, retry ${retryCount + 1}/10`)
          setTimeout(() => {
            waitForReadyCanvas(retryCount + 1).then(resolve).catch(reject)
          }, 50 * (retryCount + 1))
        } else {
          reject(new Error('Canvas parent element not found after 10 retries'))
        }
        return
      }

      // Check if parent has proper dimensions
      const rect = parent.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        if (retryCount < 10) {
          console.log(`Parent has zero dimensions (${rect.width}x${rect.height}), retry ${retryCount + 1}/10`)
          setTimeout(() => {
            waitForReadyCanvas(retryCount + 1).then(resolve).catch(reject)
          }, 50 * (retryCount + 1))
        } else {
          reject(new Error('Canvas parent has zero dimensions after 10 retries'))
        }
        return
      }

      console.log(`Canvas ready with parent dimensions: ${rect.width}x${rect.height}`)
      resolve(canvas)
    })
  }, [canvasId])

  const initHeroAnimation = useCallback(async () => {
    try {
      const canvas = await waitForReadyCanvas()
      console.log('Hero animation initializing on canvas:', canvasId)
      
      const ctx = canvas.getContext('2d', { alpha: true })
      if (!ctx) {
        console.warn('Unable to get 2d context from canvas')
        return
      }

    // ---- Tunables ----
    const SPACING = 20
    const DOT_MIN = 0.9
    const DOT_MAX = 1.8
    const BASE_ALPHA = 0.18
    const TWINKLE_AMP = 0.26
    const FPS = 30
    // -------------------

    const css = getComputedStyle(document.documentElement)

    // Get brand hex color first, then fallback to brand orange
    let primaryHex = css.getPropertyValue('--brand-hex').trim()
    
    // If no brand-hex found, use fallback
    if (!primaryHex) {
      primaryHex = '#FF4A1C'
    }
    
    // Ensure it starts with #
    if (!primaryHex.startsWith('#')) {
      primaryHex = '#FF4A1C'
    }

    // Utils
    const clamp01 = (n: number) => Math.max(0, Math.min(1, n))
    const hexToRgb = (hex: string) => {
      const h = hex.replace('#', '')
      const b = h.length === 3 ? h.split('').map(c => c + c).join('') : h
      return { r: parseInt(b.slice(0, 2), 16), g: parseInt(b.slice(2, 4), 16), b: parseInt(b.slice(4, 6), 16) }
    }
    const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
      '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')

    // Linear mix two colors by t in [0,1]
    const mix = (aHex: string, bHex: string, t: number) => {
      const a = hexToRgb(aHex), b = hexToRgb(bHex)
      const r = Math.round(a.r + (b.r - a.r) * clamp01(t))
      const g = Math.round(a.g + (b.g - a.g) * clamp01(t))
      const bl = Math.round(a.b + (b.b - a.b) * clamp01(t))
      return rgbToHex({ r, g, b: bl })
    }

    const hexToRGBA = (hex: string, a: number) => {
      const { r, g, b } = hexToRgb(hex)
      return `rgba(${r},${g},${b},${a})`
    }

    // Derive warm shades from primary
    const primary700 = mix(primaryHex, '#000000', 0.35) // darker
    const primary600 = mix(primaryHex, '#000000', 0.24)
    const primary400 = mix(primaryHex, '#FFFFFF', 0.28) // lighter
    const primary300 = mix(primaryHex, '#FFFFFF', 0.45)

    // Subtle golden accent from primary
    const amberSoft = mix(primaryHex, '#FFD39A', 0.55)

    type Dot = { x: number; y: number; r: number; phase: number; speed: number; base: number; amp: number }
    let dots: Dot[] = []
    let w = 0, h = 0, last = 0, raf = 0, gPhase = 0

    function resize() {
      const parent = canvas.parentElement as HTMLElement | null
      if (!parent) {
        console.warn('Canvas parent element not found')
        return
      }
      console.log('Canvas resizing - parent dimensions:', parent.getBoundingClientRect())
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
      const rect = parent.getBoundingClientRect()
      w = Math.max(1, rect.width | 0)
      h = Math.max(1, rect.height | 0)

      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      canvas.width = (w * dpr) | 0
      canvas.height = (h * dpr) | 0
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      buildGrid()
    }

    function buildGrid() {
      const margin = SPACING
      const cols = Math.ceil((w + margin * 2) / SPACING)
      const rows = Math.ceil((h + margin * 2) / SPACING)
      dots = []
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const gx = -margin + x * SPACING + (y % 2 ? SPACING / 2 : 0)
          const gy = -margin + y * SPACING
          dots.push({
            x: gx,
            y: gy,
            r: DOT_MIN + Math.random() * (DOT_MAX - DOT_MIN),
            phase: Math.random() * Math.PI * 2,
            speed: 0.012 + Math.random() * 0.018,
            base: BASE_ALPHA * (0.85 + Math.random() * 0.3),
            amp: TWINKLE_AMP * (0.6 + Math.random() * 0.8),
          })
        }
      }
    }

    function drawGradients() {
      // top-left deep primary glow
      let g = ctx.createRadialGradient(w * 0.15, h * 0.15, 0, w * 0.15, h * 0.15, Math.hypot(w, h) * 0.35)
      g.addColorStop(0, hexToRGBA(primary700, 0.35))
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // top-right lighter warm glow
      g = ctx.createRadialGradient(w * 0.85, h * 0.18, 0, w * 0.85, h * 0.18, Math.hypot(w, h) * 0.35)
      g.addColorStop(0, hexToRGBA(primary400, 0.28))
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // bottom center subtle amber mix
      g = ctx.createRadialGradient(w * 0.5, h * 0.95, 0, w * 0.5, h * 0.95, Math.hypot(w, h) * 0.25)
      g.addColorStop(0, hexToRGBA(primary600, 0.18))
      g.addColorStop(0.6, hexToRGBA(amberSoft, 0.08))
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }

    function step(ts: number) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const interval = 1000 / FPS
      if (ts - last < interval) { raf = requestAnimationFrame(step); return }
      last = ts

      if (!reduce) gPhase += 0.06

      ctx.clearRect(0, 0, w, h)
      drawGradients()

      for (const d of dots) {
        if (!reduce) d.phase += d.speed
        const a = Math.max(0, Math.min(1, d.base + Math.sin(d.phase + gPhase) * d.amp))
        ctx.fillStyle = `rgba(255,255,255,${a})` // crisp twinkle
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(step)
    }

    const ro = new ResizeObserver(resize)
    const parent = canvas.parentElement
    if (parent) {
      ro.observe(parent)
    } else {
      console.warn('Canvas parent element not found for ResizeObserver')
    }

    // Initial setup with delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      resize()
      raf = requestAnimationFrame(step)
    }, 100)

      return () => { 
        ro.disconnect()
        cancelAnimationFrame(raf)
        clearTimeout(timeoutId)
      }
    } catch (error) {
      console.error('Failed to initialize hero animation:', error)
      return () => {} // Return empty cleanup function
    }
  }, [canvasId, waitForReadyCanvas])

  useEffect(() => {
    let cleanup: (() => void) | undefined

    const init = async () => {
      try {
        cleanup = await initHeroAnimation()
      } catch (error) {
        console.error('Animation initialization failed:', error)
      }
    }

    // Use requestAnimationFrame to ensure DOM is ready
    const frameId = requestAnimationFrame(() => {
      init()
    })

    return () => {
      cancelAnimationFrame(frameId)
      if (cleanup) cleanup()
    }
  }, [initHeroAnimation])
}