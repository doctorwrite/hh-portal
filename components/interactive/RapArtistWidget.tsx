// components/interactive/RapArtistWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Step {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

const RapArtistWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeStep, setActiveStep] = useState<string>('meeting')
  const [isPlaying, setIsPlaying] = useState(false)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const steps: Step[] = [
    {
      id: 'meeting',
      name: 'Знакомство',
      icon: '🤝',
      description: 'Обсуждение идеи, выбор бита, подготовка к записи.',
      color: '#4a9eff',
    },
    {
      id: 'preparation',
      name: 'Подготовка',
      icon: '📝',
      description: 'Разбор текста, читка, привыкание к биту.',
      color: '#f5c542',
    },
    {
      id: 'recording',
      name: 'Запись вокала',
      icon: '🎤',
      description: '4 дубля, комфортная атмосфера, композитинг.',
      color: '#50c878',
    },
    {
      id: 'mixing',
      name: 'Сведение',
      icon: '🎛️',
      description: 'EQ, компрессия, сатурация, эффекты.',
      color: '#da70d6',
    },
    {
      id: 'mastering',
      name: 'Мастеринг',
      icon: '🎧',
      description: 'Громкость, плотность, подготовка к релизу.',
      color: '#ff6b6b',
    },
    {
      id: 'release',
      name: 'Релиз',
      icon: '🚀',
      description: 'Трек вышел, артист доволен, слушатели в восторге.',
      color: '#ff8c42',
    },
  ]

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
    ctx.fillText('🎵 Путь артиста в студии', margin, 2)

    // === Шаги ===
    const stepW = (graphW - (steps.length - 1) * 4) / steps.length
    const stepH = 36
    const stepY = graphY + 6

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const x = graphX + i * (stepW + 4)
      const y = stepY
      const w = stepW
      const h = stepH

      const isActive = activeStep === step.id

      // Линия соединения (между шагами)
      if (i < steps.length - 1) {
        const lineX = x + w
        const lineY = y + h / 2
        ctx.fillStyle = isActive ? step.color : 'rgba(255,255,255,0.05)'
        ctx.fillRect(lineX, lineY - 1, 4, 2)
      }

      // Фон карточки
      ctx.fillStyle = isActive ? `${step.color}15` : 'rgba(255,255,255,0.02)'
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 4)
      ctx.fill()

      // Рамка
      ctx.strokeStyle = isActive ? step.color : 'rgba(255,255,255,0.04)'
      ctx.lineWidth = isActive ? 1.5 : 0.5
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 4)
      ctx.stroke()

      // Иконка
      ctx.fillStyle = isActive ? step.color : 'rgba(255,255,255,0.2)'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(step.icon, x + w / 2, y + 2)

      // Название
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.3)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(step.name, x + w / 2, y + 14)

      // Индикатор активности
      if (isActive) {
        ctx.fillStyle = step.color
        ctx.fillRect(x + w / 2 - 10, y + h - 3, 20, 2)
      }
    }

    // === Информация ===
    const infoY = stepY + stepH + 8
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 24, 4)
    ctx.fill()

    const activeStepData = steps.find(s => s.id === activeStep)
    if (activeStepData) {
      // Иконка
      ctx.fillStyle = activeStepData.color
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(activeStepData.icon, graphX + 20, infoY + 12)

      // Название
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 6px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(activeStepData.name, graphX + 36, infoY + 6)

      // Описание
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(activeStepData.description, graphX + 36, infoY + 16)
    }

    // === Индикатор ===
    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    ctx.fillRect(0, H - 10, W, 10)
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.font = '3px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🖱️ Клик по этапу — подробности', W / 2, H - 5)

  }, [activeStep])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    const loop = () => {
      timeRef.current += 0.02
      renderWidget()
      frameId = requestAnimationFrame(loop)
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
  }, [activeStep, renderWidget])

  // ===== ОБРАБОТЧИКИ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getStepAt = (x: number, y: number): string | null => {
      const W = canvas.width
      const H = canvas.height

      const margin = 12
      const graphX = margin
      const graphY = 26
      const graphW = W - margin * 2
      const stepW = (graphW - (steps.length - 1) * 4) / steps.length
      const stepH = 36

      for (let i = 0; i < steps.length; i++) {
        const sx = graphX + i * (stepW + 4)
        const sy = graphY
        const sw = stepW
        const sh = stepH

        if (x >= sx && x <= sx + sw && y >= sy && y <= sy + sh) {
          return steps[i].id
        }
      }
      return null
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * canvas.width
      const y = (e.clientY - rect.top) / rect.height * canvas.height

      const id = getStepAt(x, y)
      if (id && id !== activeStep) {
        setActiveStep(id)
      }
    }

    canvas.addEventListener('click', handleClick)
    canvas.style.cursor = 'pointer'

    return () => canvas.removeEventListener('click', handleClick)
  }, [activeStep])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setActiveStep('meeting')
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Artist Journey
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
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '4px 16px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.55rem',
            border: 'none',
            cursor: 'pointer',
            background: isPlaying ? 'rgba(255,80,80,0.15)' : 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728)',
            color: isPlaying ? '#ff5050' : '#000',
            fontFamily: 'inherit'
          }}
        >
          {isPlaying ? '⏸ Пауза' : '▶ Запустить анимацию'}
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
        🎵 Путь артиста: от знакомства до релиза
      </div>
    </div>
  )
}

export default RapArtistWidget