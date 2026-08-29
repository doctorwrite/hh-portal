// components/interactive/MasteringTimerWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface TimerStep {
  id: string
  name: string
  duration: number
  icon: string
  color: string
  progress: number
}

const MasteringTimerWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const steps: TimerStep[] = [
    { id: 'analyze', name: 'Анализ микса', duration: 10, icon: '🔍', color: '#4a9eff', progress: 0 },
    { id: 'eq', name: 'Эквализация', duration: 15, icon: '🎛️', color: '#f5c542', progress: 0 },
    { id: 'comp', name: 'Компрессия', duration: 20, icon: '📊', color: '#50c878', progress: 0 },
    { id: 'limit', name: 'Лимитирование', duration: 25, icon: '📈', color: '#ff6b6b', progress: 0 },
    { id: 'export', name: 'Проверка и экспорт', duration: 30, icon: '💾', color: '#da70d6', progress: 0 },
  ]

  const totalDuration = steps.reduce((acc, s) => acc + s.duration, 0)

  // ===== РЕНДЕРИНГ =====
  const renderWidget = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    const margin = 12
    const graphX = margin
    const graphY = 20
    const graphW = W - margin * 2
    const graphH = H - 30

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('⏱️ Срочный мастеринг — 2 часа', margin, 2)

    // === Общий прогресс ===
    const progressY = graphY + 2
    const progressH = 8
    const totalProgress = Math.min(100, (time / totalDuration) * 100)

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.beginPath()
    ctx.roundRect(graphX, progressY, graphW, progressH, 4)
    ctx.fill()

    const grad = ctx.createLinearGradient(graphX, 0, graphX + graphW, 0)
    grad.addColorStop(0, '#4a9eff')
    grad.addColorStop(0.3, '#f5c542')
    grad.addColorStop(0.6, '#50c878')
    grad.addColorStop(1, '#ff6b6b')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(graphX, progressY, (totalProgress / 100) * graphW, progressH, 4)
    ctx.fill()

    // === Шаги ===
    const stepY = progressY + progressH + 10
    const stepH = 28
    const stepGap = 4
    const stepsPerRow = 5
    const stepW = (graphW - (stepsPerRow - 1) * stepGap) / stepsPerRow

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const x = graphX + i * (stepW + stepGap)
      const y = stepY
      const w = stepW
      const h = stepH

      const isActive = i === currentStep
      const isDone = time >= steps.slice(0, i + 1).reduce((acc, s) => acc + s.duration, 0) - steps[i].duration

      // Фон карточки
      ctx.fillStyle = isActive ? `${step.color}15` : 'rgba(255,255,255,0.02)'
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 4)
      ctx.fill()

      // Рамка
      ctx.strokeStyle = isActive ? step.color : (isDone ? step.color : 'rgba(255,255,255,0.04)')
      ctx.lineWidth = isActive ? 1.5 : 0.5
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 4)
      ctx.stroke()

      // Иконка
      ctx.fillStyle = isActive ? step.color : (isDone ? step.color : 'rgba(255,255,255,0.2)')
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(step.icon, x + w / 2, y + 2)

      // Название
      ctx.fillStyle = isActive ? '#fff' : (isDone ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)')
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(step.name, x + w / 2, y + 14)

      // Время
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.font = '3px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(`${step.duration} мин`, x + w / 2, y + h - 2)

      // Индикатор завершения (галочка)
      if (isDone && !isActive) {
        ctx.fillStyle = step.color
        ctx.font = '6px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText('✓', x + w / 2, y + 1)
      }
    }

    // === Время ===
    const timeY = stepY + stepH + 8
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    const totalMins = Math.floor(totalDuration / 60)

    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')} / ${totalMins}:00`, graphX + graphW / 2, timeY + 6)

    // === Информация ===
    const infoY = timeY + 18
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 4)
    ctx.fill()

    const activeStep = steps[currentStep]
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      activeStep
        ? `${activeStep.icon} ${activeStep.name} — ${Math.round(activeStep.duration)} мин`
        : '⏱️ Мастеринг завершён!',
      graphX + graphW / 2,
      infoY + 7
    )

  }, [time, currentStep])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    let lastTime = 0

    const loop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp
      const dt = (timestamp - lastTime) / 1000
      lastTime = timestamp

      timeRef.current += dt
      const newTime = Math.min(totalDuration, timeRef.current)
      setTime(newTime)

      // Определяем текущий шаг
      let accumulated = 0
      let stepIndex = 0
      for (let i = 0; i < steps.length; i++) {
        accumulated += steps[i].duration
        if (newTime <= accumulated) {
          stepIndex = i
          break
        }
        if (i === steps.length - 1) stepIndex = steps.length - 1
      }
      setCurrentStep(stepIndex)

      renderWidget()

      if (newTime < totalDuration) {
        frameId = requestAnimationFrame(loop)
      } else {
        setIsPlaying(false)
      }
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, renderWidget])

  // ===== РЕСАЙЗ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      const w = Math.max(200, rect.width - 12)
      canvas.width = w
      canvas.height = Math.min(200, w * 0.25)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ =====
  useEffect(() => {
    renderWidget()
  }, [time, currentStep, renderWidget])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setTime(0)
    setCurrentStep(0)
    timeRef.current = 0
    setIsPlaying(false)
  }, [])

  return (
    <div style={{
      background: 'rgba(0,0,0,0.5)',
      borderRadius: '16px',
      padding: '16px 20px 20px',
      margin: '16px 0',
      border: '1px solid rgba(255,255,255,0.06)',
      maxWidth: '900px',
      marginLeft: 'auto',
      marginRight: 'auto',
      userSelect: 'none'
    }}>
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', letterSpacing: '1px' }}>
          <span style={{ color: '#f5c542' }}>HH</span>Records · Mastering Timer
        </span>
        <span style={{ fontSize: '0.5rem', color: isPlaying ? '#50c878' : '#444' }}>
          {isPlaying ? '●  Running' : '●  Stopped'}
        </span>
      </div>

      {/* Канвас */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        padding: '4px',
        border: '1px solid rgba(255,255,255,0.03)',
        marginBottom: '12px',
        position: 'relative'
      }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }}
        />
      </div>

      {/* Кнопки */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => setIsPlaying(true)}
          disabled={isPlaying || time >= totalDuration}
          style={{
            padding: '4px 16px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.55rem',
            border: 'none',
            cursor: isPlaying || time >= totalDuration ? 'default' : 'pointer',
            background: isPlaying || time >= totalDuration ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728)',
            color: isPlaying || time >= totalDuration ? '#555' : '#000',
            fontFamily: 'inherit',
            opacity: isPlaying || time >= totalDuration ? 0.5 : 1
          }}
        >
          {time >= totalDuration ? '✅ Готово' : '▶ Запустить мастеринг'}
        </button>
        <button
          onClick={resetAll}
          style={{
            padding: '4px 16px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.55rem',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.03)',
            color: '#888',
            fontFamily: 'inherit'
          }}
        >
          ⟳ Сброс
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.4rem', color: '#555', padding: '4px 0' }}>
        ⏱️ 2 часа — мастеринг срочного заказа
      </div>
    </div>
  )
}

export default MasteringTimerWidget