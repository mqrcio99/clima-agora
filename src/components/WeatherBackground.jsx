import { useEffect, useRef } from 'react'

const PARTICLE_LIMIT = 180

function createParticle(width, height, kind, index) {
  const depth = Math.random()
  if (kind === 'snow') {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.8 + Math.random() * 3.5 * depth,
      speed: 0.25 + Math.random() * 1.1,
      drift: 0.3 + Math.random() * 1.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.025,
      index,
    }
  }

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    length: 5 + Math.random() * 16,
    speed: 7 + Math.random() * 14,
    drift: -0.3 + Math.random() * 0.6,
    opacity: 0.2 + Math.random() * 0.45,
    index,
  }
}

export function WeatherBackground({ condition }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return undefined
    }

    const context = canvas.getContext('2d')

    if (!context) {
      return undefined
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTVDevice =
      window.innerWidth >= 1920 ||
      /Tizen|webOS|PlayStation|Xbox|Nintendo|Android TV|SMART-TV|TV/i.test(
        navigator.userAgent || '',
      )
    let frameId = 0
    let particles = []
    let width = 0
    let height = 0
    let lastTime = performance.now()
    let paused = false

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      const area = width * height
      const baseLimit = isTVDevice ? 12 : 20
      const count = Math.min(PARTICLE_LIMIT, Math.max(baseLimit, Math.floor(area / 12000)))
      particles = Array.from({ length: count }, (_, index) =>
        createParticle(
          width,
          height,
          condition === 'snow' || condition === 'cold' ? 'snow' : 'rain',
          index,
        ),
      )
    }

    const draw = time => {
      const elapsed = Math.min(time - lastTime, 32)
      lastTime = time
      context.clearRect(0, 0, width, height)

      if (reducedMotion || paused) {
        return
      }

      if (condition === 'rain' || condition === 'storm') {
        particles.forEach(particle => {
          particle.y += (particle.speed * elapsed) / 16
          particle.x += (particle.drift * elapsed) / 16
          if (particle.y > height + 30 || particle.x < -30 || particle.x > width + 30) {
            Object.assign(particle, createParticle(width, height, 'rain', particle.index))
          }
          context.beginPath()
          context.moveTo(particle.x, particle.y)
          context.lineTo(particle.x - particle.drift * 5, particle.y + particle.length)
          context.strokeStyle = `rgba(190, 220, 255, ${particle.opacity})`
          context.lineWidth = 1
          context.stroke()
        })
      } else if (condition === 'snow' || condition === 'cold') {
        particles.forEach(particle => {
          particle.y += (particle.speed * elapsed) / 16
          particle.x += (Math.sin(time / 650 + particle.index) * particle.drift * elapsed) / 16
          particle.rotation += particle.rotationSpeed * elapsed
          if (particle.y > height + 10) {
            particle.y = -10
            particle.x = Math.random() * width
          }
          context.save()
          context.translate(particle.x, particle.y)
          context.rotate(particle.rotation)
          context.beginPath()
          context.arc(0, 0, particle.radius, 0, Math.PI * 2)
          context.fillStyle = 'rgba(255, 255, 255, 0.9)'
          context.fill()
          context.restore()
        })
      }

      frameId = requestAnimationFrame(draw)
    }

    const handleVisibility = () => {
      paused = document.hidden
      if (!paused && !reducedMotion) {
        frameId = requestAnimationFrame(draw)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', handleVisibility)
    frameId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [condition])

  return <canvas ref={canvasRef} className="weather-background" aria-hidden="true" />
}
