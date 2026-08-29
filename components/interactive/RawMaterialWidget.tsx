// components/interactive/RawMaterialWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Stage {
  id: string
  name: string
  icon: string
  description: string
  color: string
  progress: number
}

const RawMaterialWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeStage, setActiveStage] = useState<string>('input')
  const [isPlaying, setIsPlaying] = useState(false)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const stages: Stage[] = [
    {
      id: 'input',
      name: 'Входящий материал',
      icon: '📦',
      description: 'Текст, запись на телефон, идея — минимальный набор.',
      color: '#ff6b6b',
      progress: 0,
    },
    {
      id: 'planning',
      name: 'Анализ и планирование',
      icon: '📋',
      description: 'Обсуждение, разбор материала, план работы.',
      color: '#f5c542',
      progress: 20,
    },
    {
      id: 'arrangement',
      name: 'Аранжировка и бит',
      icon: '🎹',
      description: 'Создание бита, гармонии, ударных, атмосферы.',
      color: '#4a9eff',
      progress: 40,
    },
    {
      id: 'recording',
      name: 'Запись вокала',
      icon: '🎤',
      description: 'Профессиональная запись, композитинг, обработка.',
      color: '#50c878',
      progress: 60,
    },
    {
      id: 'mixing',
      name: 'Сведение',
      icon: '🎛️',
      description: 'Баланс, EQ, компрессия, эффекты, пространство.',
      color: '#da70d6',
      progress: 80,
    },
    {
      id: 'mastering',
      name: 'Мастеринг',
      icon: '🎧',
      description: 'Громкость, плотность, подготовка к релизу.',
      color: '#ff8c42',
      progress: 100,
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
    ctx.fillText('🎛️ Трансформация "сырого" материала', margin, 2)

    // === Прогресс-бар ===
    const progressY = graphY + 4
    const progressH = 6

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.beginPath()
    ctx.roundRect(graphX, progressY, graphW, progressH, 3)
    ctx.fill()

    const activeStageData = stages.find(s => s.id === activeStage)
    const progress = activeStageData ? activeStageData.progress : 0

    const grad = ctx.createLinearGradient(graphX, 0, graphX + graphW, 0)
    grad.addColorStop(0, '#ff6b6b')
    grad.addColorStop(0.3, '#f5c542')
    grad.addColorStop(0.6, '#50c878')
    grad.addColorStop(1, '#4a9eff')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(graphX, progressY, (progress / 100) * graphW, progressH, 3)
    ctx.fill()

    // === Шаги ===
    const stepY = progressY + progressH + 10
    const stepH = 32
    const stepGap = 4
    const stepW = (graphW - (stages.length - 1) * stepGap) / stages.length

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i]
      const x = graphX + i * (stepW + stepGap)
      const y = stepY
      const w = stepW
      const h = stepH

      const isActive = activeStage === stage.id
      const isDone = stage.progress <= (activeStageData ? activeStageData.progress : 0)

      // Фон карточки
      ctx.fillStyle = isActive ? `${stage.color}15` : 'rgba(255,255,255,0.02)'
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 4)
      ctx.fill()

      // Рамка
      ctx.strokeStyle = isActive ? stage.color : (isDone ? stage.color : 'rgba(255,255,255,0.04)')
      ctx.lineWidth = isActive ? 1.5 : 0.5
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 4)
      ctx.stroke()

      // Иконка
      ctx.fillStyle = isActive ? stage.color : (isDone ? stage.color : 'rgba(255,255,255,0.2)')
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(stage.icon, x + w / 2, y + 2)

      // Название
      ctx.fillStyle = isActive ? '#fff' : (isDone ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)')
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(stage.name, x + w / 2, y + 14)

      // Прогресс
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.fillRect(x + 4, y + h - 4, w - 8, 2)
      ctx.fillStyle = stage.color
      ctx.fillRect(x + 4, y + h - 4, (stage.progress / 100) * (w - 8), 2)
    }

    // === Информация ===
    const infoY = stepY + stepH + 8
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 20, 4)
    ctx.fill()

    if (activeStageData) {
      ctx.fillStyle = activeStageData.color
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(activeStageData.icon, graphX + 18, infoY + 10)

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 6px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(activeStageData.name, graphX + 34, infoY + 6)

      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(activeStageData.description, graphX + 34, infoY + 16)

      // Прогресс в процентах
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${activeStageData.progress}%`, graphX + graphW - 4, infoY + 10)
    }

  }, [activeStage])

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
  }, [activeStage, renderWidget])

  // ===== ОБРАБОТЧИКИ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getStageAt = (x: number, y: number): string | null => {
      const W = canvas.width
      const H = canvas.height

      const margin = 12
      const graphX = margin
      const graphY = 20
      const graphW = W - margin * 2

      const progressY = graphY + 4
      const progressH = 6
      const stepY = progressY + progressH + 10
      const stepH = 32
      const stepGap = 4
      const stepW = (graphW - (stages.length - 1) * stepGap) / stages.length

      for (let i = 0; i < stages.length; i++) {
        const sx = graphX + i * (stepW + stepGap)
        const sy = stepY
        const sw = stepW
        const sh = stepH

        if (x >= sx && x <= sx + sw && y >= sy && y <= sy + sh) {
          return stages[i].id
        }
      }
      return null
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * canvas.width
      const y = (e.clientY - rect.top) / rect.height * canvas.height

      const id = getStageAt(x, y)
      if (id && id !== activeStage) {
        setActiveStage(id)
      }
    }

    canvas.addEventListener('click', handleClick)
    canvas.style.cursor = 'pointer'

    return () => canvas.removeEventListener('click', handleClick)
  }, [activeStage])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setActiveStage('input')
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Raw to Ready
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
        🎛️ Как мы превращаем "сырой" материал в готовый трек
      </div>
    </div>
  )
}

export default RawMaterialWidget