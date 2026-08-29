// components/interactive/GearWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface GearItem {
  id: string
  name: string
  icon: string
  description: string
  color: string
  active: boolean
}

const GearWidget: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('mic')
  const [isPlaying, setIsPlaying] = useState(false)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const gearItems: GearItem[] = [
    {
      id: 'mic',
      name: 'Neumann TLM 103',
      icon: '🎙️',
      description: 'Конденсаторный микрофон премиум-класса. Универсальный, детальный, честный. Записывает голос таким, какой он есть.',
      color: '#f5c542',
      active: true,
    },
    {
      id: 'interface',
      name: 'UA Apollo Twin Solo',
      icon: '🎚️',
      description: 'Аудиоинтерфейс премиум-класса. Class-A предусилители, DSP-процессор, 24/192 кГц. Сердце студии.',
      color: '#4a9eff',
      active: true,
    },
    {
      id: 'monitors',
      name: 'Focal Solo6 Be',
      icon: '🔊',
      description: 'Студийные мониторы ближнего поля. Бериллиевый твитер, 6.5" вуфер. Слышно правду о миксе.',
      color: '#50c878',
      active: true,
    },
    {
      id: 'headphones',
      name: 'Студийные наушники',
      icon: '🎧',
      description: 'Beyerdynamic DT 770 Pro (закрытые), Audio-Technica ATH-M50x, Sennheiser HD 600 (открытые).',
      color: '#da70d6',
      active: true,
    },
    {
      id: 'acoustics',
      name: 'Акустика помещения',
      icon: '📐',
      description: 'Звукопоглощающие панели, бас-ловушки, диффузоры. Слышим звук без окраски комнаты.',
      color: '#ff8c42',
      active: true,
    },
    {
      id: 'software',
      name: 'Программное обеспечение',
      icon: '💻',
      description: 'Ableton Live, Logic Pro, FabFilter, iZotope, Soundtoys, Valhalla. Профессиональный набор для работы.',
      color: '#c77dff',
      active: true,
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
    ctx.fillText('⚙️ Наше оборудование', margin, 2)

    // === Карточки ===
    const cols = 3
    const rows = 2
    const cardW = (graphW - (cols - 1) * 6) / cols
    const cardH = (graphH - 16 - (rows - 1) * 6) / rows
    const cardGap = 6

    for (let i = 0; i < gearItems.length; i++) {
      const item = gearItems[i]
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = graphX + col * (cardW + cardGap)
      const y = graphY + 10 + row * (cardH + cardGap)
      const w = cardW
      const h = cardH

      const isActive = activeId === item.id

      // Фон карточки
      ctx.fillStyle = isActive ? `${item.color}15` : 'rgba(255,255,255,0.02)'
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 6)
      ctx.fill()

      // Рамка
      ctx.strokeStyle = isActive ? item.color : 'rgba(255,255,255,0.04)'
      ctx.lineWidth = isActive ? 1.5 : 0.5
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 6)
      ctx.stroke()

      // Иконка
      ctx.fillStyle = isActive ? item.color : 'rgba(255,255,255,0.2)'
      ctx.font = '20px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(item.icon, x + w / 2, y + 4)

      // Название
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.4)'
      ctx.font = 'bold 7px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(item.name, x + w / 2, y + 28)

      // Описание (только для активного)
      if (isActive) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.font = '4px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        const words = item.description.split(' ')
        let lines: string[] = []
        let currentLine = ''
        for (const word of words) {
          if ((currentLine + ' ' + word).length > 20) {
            lines.push(currentLine)
            currentLine = word
          } else {
            currentLine += (currentLine ? ' ' : '') + word
          }
        }
        if (currentLine) lines.push(currentLine)
        const lineHeight = 7
        const startY = y + 38 + (h - 38 - lines.length * lineHeight) / 2
        for (let li = 0; li < lines.length; li++) {
          ctx.fillText(lines[li], x + w / 2, startY + li * lineHeight)
        }
      }

      // Индикатор активности
      if (isActive) {
        ctx.fillStyle = item.color
        ctx.fillRect(x + w / 2 - 10, y + h - 6, 20, 2)
      }
    }

    // === Информация ===
    const infoY = graphY + graphH - 2
    const activeItem = gearItems.find(i => i.id === activeId)
    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 4)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      activeItem
        ? `${activeItem.icon} ${activeItem.name} — ${activeItem.description}`
        : '🖱️ Кликните по оборудованию, чтобы узнать подробнее',
      graphX + graphW / 2,
      infoY + 7
    )

  }, [activeId])

  const canvasRef = useRef<HTMLCanvasElement>(null)

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
      canvas.height = Math.min(280, w * 0.35)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ =====
  useEffect(() => {
    renderWidget()
  }, [activeId, renderWidget])

  // ===== ОБРАБОТЧИКИ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getItemAt = (x: number, y: number): string | null => {
      const W = canvas.width
      const H = canvas.height

      const margin = 12
      const graphX = margin
      const graphY = 20
      const graphW = W - margin * 2
      const graphH = H - 30

      const cols = 3
      const rows = 2
      const cardW = (graphW - (cols - 1) * 6) / cols
      const cardH = (graphH - 16 - (rows - 1) * 6) / rows
      const cardGap = 6

      for (let i = 0; i < gearItems.length; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        const cx = graphX + col * (cardW + cardGap)
        const cy = graphY + 10 + row * (cardH + cardGap)
        const cw = cardW
        const ch = cardH

        if (x >= cx && x <= cx + cw && y >= cy && y <= cy + ch) {
          return gearItems[i].id
        }
      }
      return null
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * canvas.width
      const y = (e.clientY - rect.top) / rect.height * canvas.height

      const id = getItemAt(x, y)
      if (id && id !== activeId) {
        setActiveId(id)
      }
    }

    canvas.addEventListener('click', handleClick)
    canvas.style.cursor = 'pointer'

    return () => canvas.removeEventListener('click', handleClick)
  }, [activeId])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setActiveId('mic')
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Gear
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
          🖱️ Клик по оборудованию — подробности
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
        ⚙️ Всё оборудование студии HHRecords в одном месте
      </div>
    </div>
  )
}

export default GearWidget