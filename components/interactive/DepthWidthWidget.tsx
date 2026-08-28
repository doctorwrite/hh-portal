// components/interactive/DepthWidthWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Instrument {
  id: number
  name: string
  color: string
  x: number // -100..100 (ширина, L/R)
  y: number // -100..100 (глубина, Back/Front)
  size: number
}

const DepthWidthWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [instruments, setInstruments] = useState<Instrument[]>([
    { id: 1, name: 'Вокал', color: '#f5c542', x: 0, y: 90, size: 12 },
    { id: 2, name: 'Бас', color: '#ff6b6b', x: 0, y: 70, size: 8 },
    { id: 3, name: 'Бочка', color: '#4a9eff', x: 0, y: 60, size: 8 },
    { id: 4, name: 'Снэр', color: '#50c878', x: 10, y: 50, size: 7 },
    { id: 5, name: 'Гитара L', color: '#da70d6', x: -60, y: 30, size: 7 },
    { id: 6, name: 'Гитара R', color: '#da70d6', x: 60, y: 30, size: 7 },
    { id: 7, name: 'Синтезатор', color: '#ff8c42', x: 30, y: -40, size: 6 },
    { id: 8, name: 'Пэд', color: '#c77dff', x: 0, y: -60, size: 6 },
    { id: 9, name: 'Оверхэды L', color: '#00d4ff', x: -80, y: -20, size: 5 },
    { id: 10, name: 'Оверхэды R', color: '#00d4ff', x: 80, y: -20, size: 5 },
  ])
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [dragId, setDragId] = useState<number | null>(null)
  const [correlation, setCorrelation] = useState(0.7)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const presets: Record<string, Instrument[]> = {
    'Поп': [
      { id: 1, name: 'Вокал', color: '#f5c542', x: 0, y: 90, size: 12 },
      { id: 2, name: 'Бас', color: '#ff6b6b', x: 0, y: 70, size: 8 },
      { id: 3, name: 'Бочка', color: '#4a9eff', x: 0, y: 60, size: 8 },
      { id: 4, name: 'Снэр', color: '#50c878', x: 10, y: 50, size: 7 },
      { id: 5, name: 'Гитара L', color: '#da70d6', x: -50, y: 30, size: 7 },
      { id: 6, name: 'Гитара R', color: '#da70d6', x: 50, y: 30, size: 7 },
      { id: 7, name: 'Синтезатор', color: '#ff8c42', x: 20, y: -20, size: 6 },
      { id: 8, name: 'Пэд', color: '#c77dff', x: 0, y: -50, size: 6 },
      { id: 9, name: 'Оверхэды L', color: '#00d4ff', x: -70, y: -10, size: 5 },
      { id: 10, name: 'Оверхэды R', color: '#00d4ff', x: 70, y: -10, size: 5 },
    ],
    'Рок': [
      { id: 1, name: 'Вокал', color: '#f5c542', x: 0, y: 85, size: 10 },
      { id: 2, name: 'Бас', color: '#ff6b6b', x: 0, y: 65, size: 9 },
      { id: 3, name: 'Бочка', color: '#4a9eff', x: 0, y: 55, size: 9 },
      { id: 4, name: 'Снэр', color: '#50c878', x: 5, y: 45, size: 8 },
      { id: 5, name: 'Гитара L', color: '#da70d6', x: -55, y: 40, size: 8 },
      { id: 6, name: 'Гитара R', color: '#da70d6', x: 55, y: 40, size: 8 },
      { id: 7, name: 'Синтезатор', color: '#ff8c42', x: 30, y: 0, size: 6 },
      { id: 8, name: 'Пэд', color: '#c77dff', x: 0, y: -40, size: 5 },
      { id: 9, name: 'Оверхэды L', color: '#00d4ff', x: -65, y: -15, size: 5 },
      { id: 10, name: 'Оверхэды R', color: '#00d4ff', x: 65, y: -15, size: 5 },
    ],
    'Электроника': [
      { id: 1, name: 'Вокал', color: '#f5c542', x: 0, y: 80, size: 11 },
      { id: 2, name: 'Бас', color: '#ff6b6b', x: 0, y: 60, size: 9 },
      { id: 3, name: 'Бочка', color: '#4a9eff', x: 0, y: 50, size: 9 },
      { id: 4, name: 'Снэр', color: '#50c878', x: 5, y: 40, size: 7 },
      { id: 5, name: 'Синт L', color: '#da70d6', x: -65, y: 30, size: 7 },
      { id: 6, name: 'Синт R', color: '#da70d6', x: 65, y: 30, size: 7 },
      { id: 7, name: 'Арпеджио', color: '#ff8c42', x: 40, y: -20, size: 6 },
      { id: 8, name: 'Пэд', color: '#c77dff', x: 0, y: -60, size: 7 },
      { id: 9, name: 'FX L', color: '#00d4ff', x: -85, y: 10, size: 4 },
      { id: 10, name: 'FX R', color: '#00d4ff', x: 85, y: 10, size: 4 },
    ],
    'Рэп/Хип-хоп': [
      { id: 1, name: 'Вокал', color: '#f5c542', x: 0, y: 95, size: 13 },
      { id: 2, name: 'Бас', color: '#ff6b6b', x: 0, y: 75, size: 9 },
      { id: 3, name: 'Бочка', color: '#4a9eff', x: 0, y: 65, size: 9 },
      { id: 4, name: 'Снэр', color: '#50c878', x: 5, y: 55, size: 8 },
      { id: 5, name: 'Бэк L', color: '#da70d6', x: -45, y: 60, size: 6 },
      { id: 6, name: 'Бэк R', color: '#da70d6', x: 45, y: 60, size: 6 },
      { id: 7, name: 'Синтезатор', color: '#ff8c42', x: 20, y: -20, size: 6 },
      { id: 8, name: 'Пэд', color: '#c77dff', x: 0, y: -40, size: 5 },
    ],
  }

  // ===== РАСЧЁТ КОРРЕЛЯЦИИ =====
  const calculateCorrelation = useCallback(() => {
    // Симуляция корреляции на основе ширины
    const widthSum = instruments.reduce((sum, inst) => sum + Math.abs(inst.x), 0)
    const avgWidth = widthSum / instruments.length
    // Чем шире, тем ниже корреляция (но не ниже 0.3)
    const corr = Math.max(0.3, Math.min(0.9, 0.9 - avgWidth * 0.004))
    setCorrelation(corr)
  }, [instruments])

  // ===== РЕНДЕРИНГ =====
  const renderWidget = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    const margin = 16
    const size = Math.min(W, H) - margin * 2
    const centerX = W / 2
    const centerY = H / 2
    const radius = size / 2 - 10

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('🌐 3D-сцена микса (ширина × глубина)', margin, 2)

    // === Сцена ===
    // Круглая сцена
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.02)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Концентрические круги (глубина)
    for (let i = 0.25; i <= 1; i += 0.25) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * i, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'
      ctx.lineWidth = 0.5
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      const label = i === 1 ? 'Front' : i === 0.75 ? 'Mid-Front' : i === 0.5 ? 'Center' : i === 0.25 ? 'Mid-Back' : 'Back'
      ctx.fillText(label, centerX + radius * i + 4, centerY)
    }

    // Линия центра (L/R)
    ctx.beginPath()
    ctx.moveTo(centerX - radius, centerY)
    ctx.lineTo(centerX + radius, centerY)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Линия центра (Front/Back)
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - radius)
    ctx.lineTo(centerX, centerY + radius)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Подписи осей
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('L', centerX - radius + 8, centerY + 4)
    ctx.fillText('R', centerX + radius - 8, centerY + 4)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText('Front', centerX, centerY + radius + 6)
    ctx.fillText('Back', centerX, centerY - radius + 4)

    // === Инструменты ===
    for (const inst of instruments) {
      const x = centerX + (inst.x / 100) * radius * 0.9
      const y = centerY - (inst.y / 100) * radius * 0.9
      const isSelected = selectedId === inst.id

      // Тень
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 10

      // Круг
      const grad = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, inst.size + 4)
      grad.addColorStop(0, isSelected ? '#fff' : inst.color)
      grad.addColorStop(0.7, inst.color)
      grad.addColorStop(1, `${inst.color}40`)
      ctx.beginPath()
      ctx.arc(x, y, isSelected ? inst.size + 4 : inst.size, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      ctx.shadowBlur = 0

      // Обводка (если выбран)
      if (isSelected) {
        ctx.beginPath()
        ctx.arc(x, y, inst.size + 2, 0, Math.PI * 2)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Название
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(inst.name, x, y - inst.size - 2)
    }

    // === Коррелометр ===
    const corrX = margin
    const corrY = H - 18
    const corrW = W - margin * 2
    const corrH = 12

    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    ctx.beginPath()
    ctx.roundRect(corrX, corrY, corrW, corrH, 6)
    ctx.fill()

    const corrGrad = ctx.createLinearGradient(corrX, 0, corrX + corrW, 0)
    corrGrad.addColorStop(0, '#ff6b6b')
    corrGrad.addColorStop(0.3, '#f5c542')
    corrGrad.addColorStop(0.5, '#50c878')
    corrGrad.addColorStop(0.7, '#f5c542')
    corrGrad.addColorStop(1, '#ff6b6b')
    ctx.fillStyle = corrGrad

    const corrPos = (correlation + 1) / 2
    ctx.beginPath()
    ctx.roundRect(corrX + 2, corrY + 2, (corrW - 4) * corrPos, corrH - 4, 4)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(corrX + (corrW - 4) * corrPos + 2, corrY + corrH / 2, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '3px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('-1', corrX + 2, corrY + corrH + 2)
    ctx.textAlign = 'center'
    ctx.fillText('0', corrX + corrW / 2, corrY + corrH + 2)
    ctx.textAlign = 'right'
    ctx.fillText('+1', corrX + corrW - 2, corrY + corrH + 2)

    // Значение корреляции
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`Корреляция: ${correlation.toFixed(2)}`, corrX + corrW / 2, corrY - 2)

  }, [instruments, selectedId, correlation])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    const loop = () => {
      timeRef.current += 0.02
      // Плавно меняем корреляцию
      calculateCorrelation()
      renderWidget()
      frameId = requestAnimationFrame(loop)
    }
    
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, calculateCorrelation, renderWidget])

  // ===== РЕСАЙЗ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      const w = Math.max(200, rect.width - 12)
      canvas.width = w
      canvas.height = Math.min(240, w * 0.3)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ =====
  useEffect(() => {
    calculateCorrelation()
    renderWidget()
  }, [instruments, calculateCorrelation, renderWidget])

  // ===== ОБРАБОТЧИКИ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height

      const W = canvas.width
      const H = canvas.height
      const centerX = W / 2
      const centerY = H / 2
      const radius = Math.min(W, H) / 2 - 10 - 14

      for (const inst of instruments) {
        const ix = centerX + (inst.x / 100) * radius * 0.9
        const iy = centerY - (inst.y / 100) * radius * 0.9
        const dist = Math.hypot(x - ix, y - iy)
        if (dist < inst.size + 10) {
          setSelectedId(inst.id)
          setDragId(inst.id)
          return
        }
      }
      setSelectedId(null)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (dragId === null) return

      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height

      const W = canvas.width
      const H = canvas.height
      const centerX = W / 2
      const centerY = H / 2
      const radius = Math.min(W, H) / 2 - 10 - 14

      const newX = Math.max(-100, Math.min(100, ((x - centerX) / (radius * 0.9)) * 100))
      const newY = Math.max(-100, Math.min(100, (-(y - centerY) / (radius * 0.9)) * 100))

      setInstruments(prev =>
        prev.map(inst =>
          inst.id === dragId ? { ...inst, x: newX, y: newY } : inst
        )
      )
    }

    const handleMouseUp = () => {
      setDragId(null)
    }

    const handleDoubleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height

      const W = canvas.width
      const H = canvas.height
      const centerX = W / 2
      const centerY = H / 2
      const radius = Math.min(W, H) / 2 - 10 - 14

      for (const inst of instruments) {
        const ix = centerX + (inst.x / 100) * radius * 0.9
        const iy = centerY - (inst.y / 100) * radius * 0.9
        const dist = Math.hypot(x - ix, y - iy)
        if (dist < inst.size + 10) {
          setInstruments(prev =>
            prev.map(i =>
              i.id === inst.id ? { ...i, x: 0, y: 50 } : i
            )
          )
          return
        }
      }
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    canvas.addEventListener('dblclick', handleDoubleClick)

    canvas.style.cursor = dragId !== null ? 'grabbing' : 'grab'

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('dblclick', handleDoubleClick)
    }
  }, [instruments, dragId])

  // ===== ЗАГРУЗКА ПРЕСЕТА =====
  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) {
      setInstruments(preset.map((p, i) => ({ ...p, id: i + 1 })))
    }
  }, [])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setInstruments([
      { id: 1, name: 'Вокал', color: '#f5c542', x: 0, y: 90, size: 12 },
      { id: 2, name: 'Бас', color: '#ff6b6b', x: 0, y: 70, size: 8 },
      { id: 3, name: 'Бочка', color: '#4a9eff', x: 0, y: 60, size: 8 },
      { id: 4, name: 'Снэр', color: '#50c878', x: 10, y: 50, size: 7 },
      { id: 5, name: 'Гитара L', color: '#da70d6', x: -60, y: 30, size: 7 },
      { id: 6, name: 'Гитара R', color: '#da70d6', x: 60, y: 30, size: 7 },
      { id: 7, name: 'Синтезатор', color: '#ff8c42', x: 30, y: -40, size: 6 },
      { id: 8, name: 'Пэд', color: '#c77dff', x: 0, y: -60, size: 6 },
      { id: 9, name: 'Оверхэды L', color: '#00d4ff', x: -80, y: -20, size: 5 },
      { id: 10, name: 'Оверхэды R', color: '#00d4ff', x: 80, y: -20, size: 5 },
    ])
    setSelectedId(null)
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · 3D Mix Scene
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
          🖱️ Перетащите инструменты для изменения ширины и глубины
        </div>
      </div>

      {/* Пресеты */}
      <div style={{
        display: 'flex',
        gap: '4px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {Object.keys(presets).map(name => (
          <button
            key={name}
            onClick={() => loadPreset(name)}
            style={{
              padding: '3px 8px',
              borderRadius: '50px',
              fontSize: '0.4rem',
              fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.03)',
              color: '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.color = '#888'
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Легенда */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        <span style={{ fontSize: '0.35rem', color: '#666' }}>
          🟡 Вокал · 🔴 Бас · 🔵 Бочка · 🟢 Снэр
        </span>
        <span style={{ fontSize: '0.35rem', color: '#666' }}>
          🟣 Гитары · 🟠 Синты · 🟣 Пэды · 🔷 Оверхэды
        </span>
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
        🌐 Ширина (L/R) и Глубина (Front/Back) — создайте 3D-звук
      </div>
    </div>
  )
}

export default DepthWidthWidget