// components/interactive/EditingWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface EditingParams {
  quantization: number
  pitchCorrection: number
  crossfade: number
  compingLevel: number
}

interface Take {
  id: number
  name: string
  color: string
  segments: { start: number; end: number; quality: 'good' | 'medium' | 'bad' }[]
}

const EditingWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<EditingParams>({
    quantization: 50,
    pitchCorrection: 30,
    crossfade: 15,
    compingLevel: 50
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedTake, setSelectedTake] = useState<number | null>(null)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const takes: Take[] = [
    {
      id: 1,
      name: 'Дубль 1',
      color: '#4a9eff',
      segments: [
        { start: 0, end: 20, quality: 'good' },
        { start: 20, end: 40, quality: 'medium' },
        { start: 40, end: 60, quality: 'good' },
        { start: 60, end: 80, quality: 'bad' },
      ]
    },
    {
      id: 2,
      name: 'Дубль 2',
      color: '#f5c542',
      segments: [
        { start: 0, end: 20, quality: 'medium' },
        { start: 20, end: 40, quality: 'good' },
        { start: 40, end: 60, quality: 'bad' },
        { start: 60, end: 80, quality: 'good' },
      ]
    },
    {
      id: 3,
      name: 'Дубль 3',
      color: '#50c878',
      segments: [
        { start: 0, end: 20, quality: 'bad' },
        { start: 20, end: 40, quality: 'good' },
        { start: 40, end: 60, quality: 'good' },
        { start: 60, end: 80, quality: 'medium' },
      ]
    },
    {
      id: 4,
      name: 'Дубль 4',
      color: '#da70d6',
      segments: [
        { start: 0, end: 20, quality: 'good' },
        { start: 20, end: 40, quality: 'bad' },
        { start: 40, end: 60, quality: 'medium' },
        { start: 60, end: 80, quality: 'good' },
      ]
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

    const margin = 16
    const takeH = 28
    const takeGap = 4
    const totalTakeH = takeH + takeGap
    const graphW = W - margin * 2 - 60
    const graphX = margin + 56
    const graphY = 20

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('🎚️ Композитинг — выберите лучшие фрагменты', margin, 2)

    // === Дорожки с дублями ===
    for (let t = 0; t < takes.length; t++) {
      const take = takes[t]
      const y = graphY + t * totalTakeH
      const isSelected = selectedTake === take.id

      // Название дубля
      ctx.fillStyle = isSelected ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'
      ctx.font = '5px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(take.name, graphX - 8, y + takeH / 2)

      // Фон дорожки
      ctx.fillStyle = isSelected ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)'
      ctx.beginPath()
      ctx.roundRect(graphX, y, graphW, takeH, 2)
      ctx.fill()

      // Сегменты
      for (const seg of take.segments) {
        const segX = graphX + (seg.start / 100) * graphW
        const segW = ((seg.end - seg.start) / 100) * graphW
        const colors = {
          good: 'rgba(80,200,120,0.3)',
          medium: 'rgba(245,197,66,0.2)',
          bad: 'rgba(255,80,80,0.15)'
        }
        ctx.fillStyle = colors[seg.quality]
        ctx.fillRect(segX, y + 2, segW, takeH - 4)

        // Обводка
        ctx.strokeStyle = isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'
        ctx.lineWidth = 0.5
        ctx.strokeRect(segX, y + 2, segW, takeH - 4)

        // Отметка качества
        const qualityText = seg.quality === 'good' ? '⭐' : (seg.quality === 'medium' ? '●' : '○')
        ctx.fillStyle = seg.quality === 'good' ? '#50c878' : (seg.quality === 'medium' ? '#f5c542' : '#ff6b6b')
        ctx.font = '6px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(qualityText, segX + segW / 2, y + takeH / 2)
      }

      // Кнопка выбора
      ctx.fillStyle = isSelected ? 'rgba(245,197,66,0.15)' : 'rgba(255,255,255,0.03)'
      ctx.beginPath()
      ctx.roundRect(graphX + graphW + 4, y, 16, takeH, 2)
      ctx.fill()
      ctx.fillStyle = isSelected ? '#f5c542' : 'rgba(255,255,255,0.15)'
      ctx.font = '5px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(isSelected ? '✓' : '+', graphX + graphW + 12, y + takeH / 2)
    }

    // === Композит (результат) ===
    const compY = graphY + takes.length * totalTakeH + 4
    const compH = 28

    ctx.fillStyle = 'rgba(245,197,66,0.05)'
    ctx.beginPath()
    ctx.roundRect(graphX, compY, graphW, compH, 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(245,197,66,0.1)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.roundRect(graphX, compY, graphW, compH, 2)
    ctx.stroke()

    // Композит — собираем лучшие фрагменты
    const compSegments = [
      { start: 0, end: 20, take: 'Дубль 1', color: '#4a9eff' },
      { start: 20, end: 40, take: 'Дубль 2', color: '#f5c542' },
      { start: 40, end: 60, take: 'Дубль 3', color: '#50c878' },
      { start: 60, end: 80, take: 'Дубль 4', color: '#da70d6' },
    ]

    for (const seg of compSegments) {
      const segX = graphX + (seg.start / 100) * graphW
      const segW = ((seg.end - seg.start) / 100) * graphW
      ctx.fillStyle = `${seg.color}30`
      ctx.fillRect(segX, compY + 2, segW, compH - 4)

      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '5px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(seg.take, segX + segW / 2, compY + compH / 2)
    }

    // Подпись композита
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '5px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText('КОМПОЗИТ', graphX - 8, compY + compH / 2)

    // === Информация ===
    const infoY = compY + compH + 12
    const infoText = `Квантование: ${params.quantization}% • Pitch: ${params.pitchCorrection}% • Кроссфейд: ${params.crossfade}мс`

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(infoText, graphX + graphW / 2, infoY + 7)

  }, [selectedTake, params])

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

  // ===== ПРИ ИЗМЕНЕНИИ ПАРАМЕТРОВ =====
  useEffect(() => {
    renderWidget()
  }, [params, renderWidget])

  // ===== ОБРАБОТЧИК КЛИКОВ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * canvas.width
      const y = (e.clientY - rect.top) / rect.height * canvas.height

      const W = canvas.width
      const H = canvas.height

      const margin = 16
      const takeH = 28
      const takeGap = 4
      const totalTakeH = takeH + takeGap
      const graphW = W - margin * 2 - 60
      const graphX = margin + 56
      const graphY = 20

      // Проверяем клик на кнопки выбора дублей
      for (let t = 0; t < takes.length; t++) {
        const takeY = graphY + t * totalTakeH
        const btnX = graphX + graphW + 4
        const btnY = takeY
        const btnW = 16
        const btnH = takeH

        if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
          setSelectedTake(selectedTake === takes[t].id ? null : takes[t].id)
          return
        }
      }
    }

    canvas.addEventListener('click', handleClick)
    canvas.style.cursor = 'pointer'

    return () => canvas.removeEventListener('click', handleClick)
  }, [selectedTake, takes])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof EditingParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setParams({
      quantization: 50,
      pitchCorrection: 30,
      crossfade: 15,
      compingLevel: 50
    })
    setSelectedTake(null)
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Comping Simulator
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
        {selectedTake !== null && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(245,197,66,0.1)',
            border: '1px solid rgba(245,197,66,0.2)',
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '0.5rem',
            color: '#f5c542'
          }}>
            Выбран: Дубль {selectedTake}
          </div>
        )}
      </div>

      {/* Информация о дублях */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px',
        padding: '4px 8px',
        background: 'rgba(0,0,0,0.15)',
        borderRadius: '4px'
      }}>
        <span style={{ fontSize: '0.4rem', color: '#666' }}>
          ⭐ = Отличный фрагмент
        </span>
        <span style={{ fontSize: '0.4rem', color: '#666' }}>
          ● = Средний
        </span>
        <span style={{ fontSize: '0.4rem', color: '#666' }}>
          ○ = Плохой
        </span>
        <span style={{ fontSize: '0.4rem', color: '#888' }}>
          Нажмите <strong style={{ color: '#f5c542' }}>+</strong> чтобы выбрать дубль
        </span>
      </div>

      {/* Параметры */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '6px',
        marginBottom: '10px'
      }}>
        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Quantization</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>{params.quantization}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.quantization}
            onChange={(e) => updateParam('quantization', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #4a9eff, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Pitch Correction</span>
            <span style={{ fontSize: '0.55rem', color: '#50c878' }}>{params.pitchCorrection}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.pitchCorrection}
            onChange={(e) => updateParam('pitchCorrection', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #50c878, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Crossfade</span>
            <span style={{ fontSize: '0.55rem', color: '#f5c542' }}>{params.crossfade} мс</span>
          </div>
          <input
            type="range" min="0" max="50" step="1"
            value={params.crossfade}
            onChange={(e) => updateParam('crossfade', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #f5c542, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      {/* Кнопки */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
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
          {isPlaying ? '⏸ Пауза' : '▶ Запустить симуляцию'}
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

      <div style={{ textAlign: 'center', fontSize: '0.45rem', color: '#555', padding: '4px 0' }}>
        ✂️ Симуляция композитинга — выберите лучшие фрагменты из разных дублей
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default EditingWidget