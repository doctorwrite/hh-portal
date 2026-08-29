// components/interactive/PhilosophyWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ValueItem {
  id: string
  title: string
  icon: string
  description: string
  color: string
}

const PhilosophyWidget: React.FC = () => {
  const [activeValue, setActiveValue] = useState<string>('quality')
  const [isPlaying, setIsPlaying] = useState(false)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const stats = [
    { label: 'Лет опыта', value: 10, suffix: '+' },
    { label: 'Записанных треков', value: 500, suffix: '+' },
    { label: 'Артистов', value: 50, suffix: '+' },
    { label: 'Рейтинг', value: 4.9, suffix: '/5' },
  ]

  const values: ValueItem[] = [
    {
      id: 'quality',
      title: 'Качество',
      icon: '🎯',
      description: 'Мы не сдаём трек, пока он не звучит идеально. Мы перфекционисты. Каждая нота, каждый переход — всё должно быть на высшем уровне.',
      color: '#f5c542',
    },
    {
      id: 'trust',
      title: 'Доверие',
      icon: '🤝',
      description: 'Мы создаём безопасное пространство, где артист может быть собой. Никакого осуждения — только поддержка. Мы здесь, чтобы помочь, а не критиковать.',
      color: '#4a9eff',
    },
    {
      id: 'emotions',
      title: 'Эмоции',
      icon: '❤️',
      description: 'Техника — это инструмент для передачи эмоций. Если трек не цепляет — мы не добились цели. Мы ищем душу в каждой записи.',
      color: '#ff6b6b',
    },
    {
      id: 'development',
      title: 'Развитие',
      icon: '🚀',
      description: 'Мы учимся каждый день. Новые техники, новое оборудование, новые подходы. Музыка не стоит на месте — и мы тоже.',
      color: '#50c878',
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
    ctx.fillText('💡 Наша философия в цифрах', margin, 2)

    // === Статистика ===
    const statW = (graphW - 20) / stats.length
    const statY = graphY + 12

    for (let i = 0; i < stats.length; i++) {
      const s = stats[i]
      const x = graphX + 4 + i * (statW + 5)
      const w = statW

      // Карточка
      ctx.fillStyle = 'rgba(255,255,255,0.03)'
      ctx.beginPath()
      ctx.roundRect(x, statY, w, 36, 4)
      ctx.fill()

      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.roundRect(x, statY, w, 36, 4)
      ctx.stroke()

      // Число
      ctx.fillStyle = '#f5c542'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      const displayValue = isPlaying ? s.value : 0
      ctx.fillText(`${Math.floor(displayValue)}${s.suffix}`, x + w / 2, statY + 30)

      // Подпись
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '5px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(s.label, x + w / 2, statY + 34)
    }

    // === Ценности ===
    const valY = statY + 44
    const valH = graphH - (valY - graphY) - 8
    const valW = (graphW - 15) / 2
    const valGap = 5

    for (let i = 0; i < values.length; i++) {
      const v = values[i]
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = graphX + col * (valW + valGap)
      const y = valY + row * (valH / 2 + valGap)
      const w = valW
      const h = valH / 2 - valGap / 2

      const isActive = activeValue === v.id

      // Фон карточки
      ctx.fillStyle = isActive ? `${v.color}15` : 'rgba(255,255,255,0.02)'
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 6)
      ctx.fill()

      // Рамка
      ctx.strokeStyle = isActive ? v.color : 'rgba(255,255,255,0.04)'
      ctx.lineWidth = isActive ? 1.5 : 0.5
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 6)
      ctx.stroke()

      // Иконка
      ctx.fillStyle = isActive ? v.color : 'rgba(255,255,255,0.2)'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(v.icon, x + w / 2, y + 4)

      // Название
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.4)'
      ctx.font = 'bold 8px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(v.title, x + w / 2, y + 24)

      // Описание (только для активного)
      if (isActive) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.font = '4px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        const words = v.description.split(' ')
        let lines: string[] = []
        let currentLine = ''
        for (const word of words) {
          if ((currentLine + ' ' + word).length > 22) {
            lines.push(currentLine)
            currentLine = word
          } else {
            currentLine += (currentLine ? ' ' : '') + word
          }
        }
        if (currentLine) lines.push(currentLine)
        const lineHeight = 8
        const startY = y + 34 + (h - 34 - lines.length * lineHeight) / 2
        for (let li = 0; li < lines.length; li++) {
          ctx.fillText(lines[li], x + w / 2, startY + li * lineHeight)
        }
      }
    }

    // === Индикатор ===
    const infoY = valY + (valH / 2 + valGap) * 2 + 4
    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 4)
    ctx.fill()

    const activeValueObj = values.find(v => v.id === activeValue)
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      activeValueObj
        ? `${activeValueObj.icon} ${activeValueObj.title} — ${activeValueObj.description}`
        : '💡 Кликните по ценности, чтобы узнать подробнее',
      graphX + graphW / 2,
      infoY + 7
    )

  }, [activeValue, isPlaying])

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ===== АНИМАЦИЯ ЦИФР =====
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
      canvas.height = Math.min(280, w * 0.35)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ =====
  useEffect(() => {
    renderWidget()
  }, [activeValue, renderWidget])

  // ===== ОБРАБОТЧИКИ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getValueAt = (x: number, y: number): string | null => {
      const W = canvas.width
      const H = canvas.height

      const margin = 12
      const graphX = margin
      const graphY = 20
      const graphW = W - margin * 2
      const graphH = H - 30

      const statY = graphY + 12
      const valY = statY + 44
      const valH = graphH - (valY - graphY) - 8
      const valW = (graphW - 15) / 2
      const valGap = 5

      for (let i = 0; i < values.length; i++) {
        const col = i % 2
        const row = Math.floor(i / 2)
        const vx = graphX + col * (valW + valGap)
        const vy = valY + row * (valH / 2 + valGap)
        const vw = valW
        const vh = valH / 2 - valGap / 2

        if (x >= vx && x <= vx + vw && y >= vy && y <= vy + vh) {
          return values[i].id
        }
      }
      return null
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * canvas.width
      const y = (e.clientY - rect.top) / rect.height * canvas.height

      const id = getValueAt(x, y)
      if (id && id !== activeValue) {
        setActiveValue(id)
      }
    }

    canvas.addEventListener('click', handleClick)
    canvas.style.cursor = 'pointer'

    return () => canvas.removeEventListener('click', handleClick)
  }, [activeValue])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setActiveValue('quality')
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Philosophy
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
        <div style={{
          position: 'absolute',
          bottom: '4px',
          right: '8px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '0.35rem',
          color: '#888'
        }}>
          🖱️ Клик по ценности — подробности
        </div>
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
        💡 Наши ценности и достижения в цифрах
      </div>
    </div>
  )
}

export default PhilosophyWidget