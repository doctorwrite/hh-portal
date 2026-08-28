// components/interactive/AutomationWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

type AutomationParam = 'volume' | 'pan' | 'filter' | 'reverb'

interface AutomationPoint {
  x: number
  y: number
  selected?: boolean
}

const AutomationWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedParam, setSelectedParam] = useState<AutomationParam>('volume')
  const [points, setPoints] = useState<AutomationPoint[]>([
    { x: 0, y: 50 },
    { x: 25, y: 30 },
    { x: 50, y: 70 },
    { x: 75, y: 40 },
    { x: 100, y: 60 },
  ])
  const [isPlaying, setIsPlaying] = useState(false)
  const [playhead, setPlayhead] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const paramLabels: Record<AutomationParam, { label: string; unit: string; min: number; max: number; color: string }> = {
    volume: { label: 'Громкость', unit: 'dB', min: -12, max: 6, color: '#f5c542' },
    pan: { label: 'Панорама', unit: '%', min: -100, max: 100, color: '#4a9eff' },
    filter: { label: 'Фильтр', unit: 'Hz', min: 20, max: 20000, color: '#50c878' },
    reverb: { label: 'Реверберация', unit: '%', min: 0, max: 100, color: '#da70d6' },
  }

  // ===== ВЫЧИСЛЕНИЕ ЗНАЧЕНИЯ В ТОЧКЕ =====
  const getValueAt = useCallback((x: number): number => {
    if (points.length === 0) return 50
    if (x <= points[0].x) return points[0].y
    if (x >= points[points.length - 1].x) return points[points.length - 1].y

    for (let i = 0; i < points.length - 1; i++) {
      if (x >= points[i].x && x <= points[i + 1].x) {
        const t = (x - points[i].x) / (points[i + 1].x - points[i].x)
        // Плавная интерполяция (кривая Безье)
        const smooth = t * t * (3 - 2 * t)
        return points[i].y + (points[i + 1].y - points[i].y) * smooth
      }
    }
    return 50
  }, [points])

  // ===== ПОЛУЧЕНИЕ ЗНАЧЕНИЯ =====
  const getParamValue = useCallback((x: number): number => {
    const raw = getValueAt(x)
    const param = paramLabels[selectedParam]
    return param.min + (raw / 100) * (param.max - param.min)
  }, [getValueAt, selectedParam])

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
    const graphX = margin
    const graphY = 28
    const graphW = W - margin * 2
    const graphH = 130

    const param = paramLabels[selectedParam]

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('🤖 Автоматизация', margin, 2)

    // === Сетка ===
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const x = graphX + (i / 4) * graphW
      ctx.beginPath()
      ctx.moveTo(x, graphY)
      ctx.lineTo(x, graphY + graphH)
      ctx.stroke()
    }
    for (let i = 0; i <= 4; i++) {
      const y = graphY + (i / 4) * graphH
      ctx.beginPath()
      ctx.moveTo(graphX, y)
      ctx.lineTo(graphX + graphW, y)
      ctx.stroke()
    }

    // === Фон кривой ===
    ctx.fillStyle = `${param.color}08`
    ctx.beginPath()
    ctx.moveTo(graphX, graphY + graphH)
    for (let i = 0; i <= 100; i++) {
      const x = graphX + (i / 100) * graphW
      const val = getValueAt(i)
      const y = graphY + graphH - (val / 100) * graphH
      ctx.lineTo(x, y)
    }
    ctx.lineTo(graphX + graphW, graphY + graphH)
    ctx.closePath()
    ctx.fill()

    // === Кривая автоматизации ===
    ctx.beginPath()
    for (let i = 0; i <= 100; i++) {
      const x = graphX + (i / 100) * graphW
      const val = getValueAt(i)
      const y = graphY + graphH - (val / 100) * graphH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = param.color
    ctx.lineWidth = 2.5
    ctx.shadowColor = `${param.color}40`
    ctx.shadowBlur = 8
    ctx.stroke()
    ctx.shadowBlur = 0

    // === Точки ===
    for (let i = 0; i < points.length; i++) {
      const p = points[i]
      const x = graphX + (p.x / 100) * graphW
      const y = graphY + graphH - (p.y / 100) * graphH
      const isSelected = p.selected || false

      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 8 : 6, 0, Math.PI * 2)
      ctx.fillStyle = isSelected ? '#fff' : param.color
      ctx.fill()
      ctx.strokeStyle = isSelected ? param.color : 'rgba(255,255,255,0.2)'
      ctx.lineWidth = isSelected ? 2 : 1
      ctx.stroke()

      // Номер точки
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(`${i + 1}`, x, y - 10)
    }

    // === Playhead ===
    const phX = graphX + (playhead / 100) * graphW
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(phX - 1, graphY, 2, graphH)
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath()
    ctx.arc(phX, graphY + graphH / 2, 4, 0, Math.PI * 2)
    ctx.fill()

    // === Текущее значение ===
    const currentVal = getParamValue(playhead)
    const valText = selectedParam === 'volume' ? `${currentVal > 0 ? '+' : ''}${currentVal.toFixed(1)} ${param.unit}`
      : selectedParam === 'filter' ? `${currentVal >= 1000 ? (currentVal/1000).toFixed(1) + 'k' : Math.round(currentVal)} ${param.unit}`
      : `${Math.round(currentVal)} ${param.unit}`

    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${param.label}: ${valText}`, graphX + graphW - 4, graphY - 4)

    // === Подписи ===
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`${param.min}${param.unit}`, graphX, graphY + graphH + 2)
    ctx.textAlign = 'right'
    ctx.fillText(`${param.max}${param.unit}`, graphX + graphW, graphY + graphH + 2)

  }, [points, selectedParam, playhead, getValueAt, getParamValue])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    const loop = () => {
      timeRef.current += 0.2
      setPlayhead((timeRef.current * 2) % 100)
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
      canvas.height = Math.min(200, w * 0.22)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ОБРАБОТЧИКИ МЫШИ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getPointIndex = (e: MouseEvent): number | null => {
      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height

      const graphX = 16
      const graphY = 28
      const graphW = canvas.width - 32
      const graphH = 130

      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i]
        const px = graphX + (p.x / 100) * graphW
        const py = graphY + graphH - (p.y / 100) * graphH
        const dist = Math.hypot(x - px, y - py)
        if (dist < 20) return i
      }
      return null
    }

    const handleMouseDown = (e: MouseEvent) => {
      const idx = getPointIndex(e)
      if (idx !== null) {
        setDragIndex(idx)
        setIsDragging(true)
        setPoints(prev => prev.map((p, i) => ({ ...p, selected: i === idx })))
        return
      }

      // Добавление новой точки
      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height

      const graphX = 16
      const graphY = 28
      const graphW = canvas.width - 32
      const graphH = 130

      if (x >= graphX && x <= graphX + graphW && y >= graphY && y <= graphY + graphH) {
        const px = ((x - graphX) / graphW) * 100
        const py = 100 - ((y - graphY) / graphH) * 100
        const newPoints = [...points, { x: Math.max(0, Math.min(100, px)), y: Math.max(0, Math.min(100, py)) }]
          .sort((a, b) => a.x - b.x)
        setPoints(newPoints)
        setPoints(prev => prev.map(p => ({ ...p, selected: false })))
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || dragIndex === null) return

      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height

      const graphX = 16
      const graphY = 28
      const graphW = canvas.width - 32
      const graphH = 130

      if (x >= graphX && x <= graphX + graphW && y >= graphY && y <= graphY + graphH) {
        const px = ((x - graphX) / graphW) * 100
        const py = 100 - ((y - graphY) / graphH) * 100
        setPoints(prev => prev.map((p, i) =>
          i === dragIndex ? { ...p, x: Math.max(0, Math.min(100, px)), y: Math.max(0, Math.min(100, py)) } : p
        ))
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setDragIndex(null)
    }

    const handleDoubleClick = (e: MouseEvent) => {
      const idx = getPointIndex(e)
      if (idx !== null && points.length > 2) {
        setPoints(prev => prev.filter((_, i) => i !== idx))
      }
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    canvas.addEventListener('dblclick', handleDoubleClick)

    canvas.style.cursor = 'pointer'

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('dblclick', handleDoubleClick)
    }
  }, [points, isDragging, dragIndex])

  // ===== ИЗМЕНЕНИЕ ПАРАМЕТРА =====
  const setParam = useCallback((param: AutomationParam) => {
    setSelectedParam(param)
    // Сброс точек для нового параметра
    const defaultPoints = [
      { x: 0, y: 50 },
      { x: 25, y: 30 },
      { x: 50, y: 70 },
      { x: 75, y: 40 },
      { x: 100, y: 60 },
    ]
    setPoints(defaultPoints.map((p, i) => ({ ...p, selected: i === 0 })))
    setPlayhead(0)
    timeRef.current = 0
  }, [])

  // ===== ПРЕСЕТЫ =====
  const presets: Record<string, AutomationPoint[]> = {
    'Fade In': [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 100 },
    ],
    'Fade Out': [
      { x: 0, y: 100 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
    ],
    'Припев (подъём)': [
      { x: 0, y: 50 },
      { x: 40, y: 50 },
      { x: 50, y: 80 },
      { x: 75, y: 80 },
      { x: 85, y: 50 },
      { x: 100, y: 50 },
    ],
    'Фильтр (открытие)': [
      { x: 0, y: 10 },
      { x: 30, y: 30 },
      { x: 60, y: 70 },
      { x: 100, y: 100 },
    ],
    'Расширение панорамы': [
      { x: 0, y: 30 },
      { x: 40, y: 30 },
      { x: 50, y: 70 },
      { x: 75, y: 70 },
      { x: 85, y: 30 },
      { x: 100, y: 30 },
    ],
    'Реверберация (финал)': [
      { x: 0, y: 20 },
      { x: 70, y: 20 },
      { x: 90, y: 60 },
      { x: 100, y: 100 },
    ],
  }

  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) {
      setPoints(preset.map(p => ({ ...p, selected: false })))
    }
  }, [])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setPoints([
      { x: 0, y: 50 },
      { x: 25, y: 30 },
      { x: 50, y: 70 },
      { x: 75, y: 40 },
      { x: 100, y: 60 },
    ])
    setPlayhead(0)
    timeRef.current = 0
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Automation
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
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '0.35rem',
          color: '#888'
        }}>
          🖱️ Клик — добавить точку · Перетащить — редактировать · Двойной клик — удалить
        </div>
      </div>

      {/* Выбор параметра */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {(Object.keys(paramLabels) as AutomationParam[]).map(key => {
          const info = paramLabels[key]
          return (
            <button
              key={key}
              onClick={() => setParam(key)}
              style={{
                padding: '4px 12px',
                borderRadius: '50px',
                fontSize: '0.5rem',
                fontWeight: 600,
                border: selectedParam === key ? `2px solid ${info.color}` : '1px solid rgba(255,255,255,0.06)',
                background: selectedParam === key ? `${info.color}20` : 'rgba(255,255,255,0.03)',
                color: selectedParam === key ? info.color : '#888',
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontFamily: 'inherit'
              }}
            >
              {info.label}
            </button>
          )
        })}
      </div>

      {/* Пресеты */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {Object.keys(presets).map(name => (
          <button
            key={name}
            onClick={() => loadPreset(name)}
            style={{
              padding: '4px 10px',
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

      <div style={{ textAlign: 'center', fontSize: '0.45rem', color: '#555', padding: '4px 0' }}>
        🤖 Рисуйте автоматизацию — добавляйте движение и динамику в микс
      </div>
    </div>
  )
}

export default AutomationWidget