import { useEffect, useRef } from 'react'

const PARTICLE_LIMIT = 180

function createLightning(x, y, height) {
  const points = []
  const segmentCount = 8
  const startY = Math.max(0, y - Math.min(height * 0.3, y + 80))
  const endY = Math.min(height, y + Math.min(height * 0.16, height - y))

  for (let index = 0; index <= segmentCount; index += 1) {
    const progress = index / segmentCount
    points.push({
      x: x + Math.sin(index * 2.4) * 24,
      y: startY + (endY - startY) * progress,
    })
  }

  return points
}

function drawSunEffect(context, effect, progress) {
  const fade = 1 - progress
  const radius = 8 + progress * 35

  context.save()
  context.translate(effect.x, effect.y)
  context.globalAlpha = fade
  context.shadowColor = '#ffd43b'
  context.shadowBlur = 28
  context.fillStyle = '#ffe36e'
  context.beginPath()
  context.arc(0, 0, 8 + progress * 5, 0, Math.PI * 2)
  context.fill()
  context.shadowBlur = 0
  context.strokeStyle = '#fff1a8'
  context.lineWidth = 2.5

  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2
    context.beginPath()
    context.moveTo(Math.cos(angle) * (radius + 5), Math.sin(angle) * (radius + 5))
    context.lineTo(Math.cos(angle) * (radius + 16), Math.sin(angle) * (radius + 16))
    context.stroke()
  }

  context.beginPath()
  context.arc(0, 0, radius + 24, 0, Math.PI * 2)
  context.stroke()
  context.restore()
}

function drawLightningEffect(context, effect, progress, width, height) {
  context.save()
  context.fillStyle = `rgba(226, 242, 255, ${(1 - progress) * 0.3})`
  context.fillRect(0, 0, width, height)
  context.globalAlpha = 1 - progress * 0.8
  context.lineJoin = 'round'
  context.lineCap = 'round'
  context.shadowColor = '#d9f3ff'
  context.shadowBlur = 24
  context.strokeStyle = '#f8fdff'
  context.lineWidth = 5
  context.beginPath()
  effect.points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x - effect.x, point.y - effect.y)
    } else {
      context.lineTo(point.x - effect.x, point.y - effect.y)
    }
  })
  context.stroke()
  context.shadowBlur = 0
  context.strokeStyle = '#8ed8ff'
  context.lineWidth = 2
  context.stroke()
  context.restore()
}

function drawIceEffect(context, effect, progress) {
  const growth = 1 - (1 - progress) ** 3
  const size = 38 * growth
  const fade = progress > 0.82 ? (1 - progress) / 0.18 : 1

  context.save()
  context.translate(effect.x, effect.y)
  context.rotate((1 - growth) * -0.35)
  context.globalAlpha = fade
  context.lineJoin = 'round'
  context.lineWidth = 2
  context.strokeStyle = '#f4fdff'

  context.beginPath()
  context.moveTo(0, -size)
  context.lineTo(size * 0.72, -size * 0.56)
  context.lineTo(0, -size * 0.12)
  context.lineTo(-size * 0.72, -size * 0.56)
  context.closePath()
  context.fillStyle = 'rgba(224, 249, 255, 0.92)'
  context.fill()
  context.stroke()

  context.beginPath()
  context.moveTo(-size * 0.72, -size * 0.56)
  context.lineTo(0, -size * 0.12)
  context.lineTo(0, size)
  context.lineTo(-size * 0.72, size * 0.42)
  context.closePath()
  context.fillStyle = 'rgba(128, 207, 238, 0.88)'
  context.fill()
  context.stroke()

  context.beginPath()
  context.moveTo(size * 0.72, -size * 0.56)
  context.lineTo(0, -size * 0.12)
  context.lineTo(0, size)
  context.lineTo(size * 0.72, size * 0.42)
  context.closePath()
  context.fillStyle = 'rgba(80, 165, 211, 0.9)'
  context.fill()
  context.stroke()

  context.restore()
}

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
    let effects = []
    const effectTimeouts = new Set()
    const app = canvas.closest('.app-clima')

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

      if (!reducedMotion && !paused && (condition === 'rain' || condition === 'storm')) {
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
      } else if (!reducedMotion && !paused && (condition === 'snow' || condition === 'cold')) {
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

      effects = effects.filter(effect => {
        const progress = reducedMotion
          ? 0.65
          : Math.min(1, (time - effect.startedAt) / effect.duration)

        if (effect.type === 'sun') {
          drawSunEffect(context, effect, progress)
        } else if (effect.type === 'lightning') {
          drawLightningEffect(context, effect, progress, width, height)
        } else {
          drawIceEffect(context, effect, progress)
        }

        return progress < 1
      })

      if (effects.length > 0) {
        canvas.dataset.effect = effects[effects.length - 1].type
      } else {
        delete canvas.dataset.effect
      }

      if (!reducedMotion && !paused) {
        frameId = requestAnimationFrame(draw)
      }
    }

    const handleBackgroundClick = event => {
      const target = event.target

      if (
        !(target instanceof Element) ||
        target.closest(
          'button, a, input, select, textarea, [role="button"], [contenteditable="true"], .cabecalho, .cartao-clima, .cartao-dia, .alert-banner',
        )
      ) {
        return
      }

      const effectType =
        condition === 'clear'
          ? 'sun'
          : condition === 'rain' || condition === 'storm'
            ? 'lightning'
            : condition === 'snow' || condition === 'cold'
              ? 'ice'
              : null

      if (!effectType) {
        return
      }

      const bounds = canvas.getBoundingClientRect()
      const effect = {
        type: effectType,
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        startedAt: performance.now(),
        duration: effectType === 'lightning' ? 620 : 1050,
      }

      if (effectType === 'lightning') {
        effect.points = createLightning(effect.x, effect.y, height)
      }

      effects = [...effects, effect].slice(-5)

      if (reducedMotion) {
        draw(performance.now())
        const timeout = window.setTimeout(() => {
          effectTimeouts.delete(timeout)
          effects = effects.filter(activeEffect => activeEffect !== effect)
          draw(performance.now())
        }, 500)
        effectTimeouts.add(timeout)
      }
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
    app?.addEventListener('click', handleBackgroundClick)
    frameId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameId)
      effectTimeouts.forEach(timeout => window.clearTimeout(timeout))
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
      app?.removeEventListener('click', handleBackgroundClick)
    }
  }, [condition])

  return <canvas ref={canvasRef} className="weather-background" aria-hidden="true" />
}
