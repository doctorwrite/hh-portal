// components/interactive/MonitorsWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface MonitorParams {
  distance: number
  angle: number
  position: number
  room: number
}

const MonitorsWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<MonitorParams>({
    distance: 30,
    angle: 30,
    position: 0,
    room: 1
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const timeRef = useRef(0)

  const roomNames = ['Small', 'Medium', 'Large']

  // ===== РЕНДЕРИНГ СТУДИИ =====
  const renderStudio = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Параметры
    const margin = 30
    const dist = (params.distance / 150) * (W - margin * 2)
    const angle = params.angle * Math.PI / 180
    const posOffset = (params.position / 30) * 200
    const roomScale = 1 + params.room * 0.15

    // Центр
    const cx = W / 2 + posOffset
    const cy = H / 2 + 20

    // === Комната ===
    ctx.fillStyle = 'rgba(255,255,255,0.02)'
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    ctx.fillRect(margin, margin, W - margin * 2, H - margin * 2)
    ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2)

    // === Мониторы ===
    const leftX = cx - dist * Math.cos(angle) * roomScale
    const leftY = cy - dist * Math.sin(angle) * roomScale
    const rightX = cx + dist * Math.cos(angle) * roomScale
    const rightY = cy - dist * Math.sin(angle) * roomScale

    const monitorSize = 18 + roomScale * 4

    // Золотой треугольник
    ctx.beginPath()
    ctx.moveTo(leftX, leftY)
    ctx.lineTo(cx, cy)
    ctx.lineTo(rightX, rightY)
    ctx.closePath()
    ctx.strokeStyle = 'rgba(80,200,120,0.15)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // Линии от мониторов к слушателю
    ctx.beginPath()
    ctx.moveTo(leftX, leftY)
    ctx.lineTo(cx, cy)
    ctx.strokeStyle = 'rgba(245,197,66,0.08)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(rightX, rightY)
    ctx.lineTo(cx, cy)
    ctx.stroke()

    // Левый монитор
    const gradL = ctx.createRadialGradient(leftX, leftY, 0, leftX, leftY, monitorSize)
    gradL.addColorStop(0, 'rgba(245,197,66,0.3)')
    gradL.addColorStop(0.7, 'rgba(245,197,66,0.15)')
    gradL.addColorStop(1, 'rgba(245,197,66,0)')
    ctx.fillStyle = gradL
    ctx.beginPath()
    ctx.arc(leftX, leftY, monitorSize * 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#f5c542'
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(leftX, leftY, monitorSize, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Направление (конус)
    ctx.fillStyle = 'rgba(245,197,66,0.05)'
    ctx.beginPath()
    ctx.moveTo(leftX, leftY)
    const dirAngleL = angle
    ctx.arc(leftX, leftY, monitorSize * 2.5, -dirAngleL - 0.6, -dirAngleL + 0.6)
    ctx.fill()

    // Правый монитор
    const gradR = ctx.createRadialGradient(rightX, rightY, 0, rightX, rightY, monitorSize)
    gradR.addColorStop(0, 'rgba(245,197,66,0.3)')
    gradR.addColorStop(0.7, 'rgba(245,197,66,0.15)')
    gradR.addColorStop(1, 'rgba(245,197,66,0)')
    ctx.fillStyle = gradR
    ctx.beginPath()
    ctx.arc(rightX, rightY, monitorSize * 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#f5c542'
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(rightX, rightY, monitorSize, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = 'rgba(245,197,66,0.05)'
    ctx.beginPath()
    ctx.moveTo(rightX, rightY)
    const dirAngleR = -angle
    ctx.arc(rightX, rightY, monitorSize * 2.5, -dirAngleR - 0.6, -dirAngleR + 0.6)
    ctx.fill()

    // === Слушатель ===
    const listenerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20)
    listenerGrad.addColorStop(0, 'rgba(74,158,255,0.8)')
    listenerGrad.addColorStop(0.5, 'rgba(74,158,255,0.4)')
    listenerGrad.addColorStop(1, 'rgba(74,158,255,0)')
    ctx.fillStyle = listenerGrad
    ctx.beginPath()
    ctx.arc(cx, cy, 20, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#4a9eff'
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cy, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Иконка слушателя
    ctx.fillStyle = '#fff'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🧑‍💻', cx, cy)

    // === Подписи ===
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText('LEFT', leftX, leftY - monitorSize - 6)
    ctx.fillText('RIGHT', rightX, rightY - monitorSize - 6)

    ctx.textBaseline = 'top'
    ctx.fillStyle = 'rgba(74,158,255,0.3)'
    ctx.fillText('LISTENER', cx, cy + 14)

    // === Расстояния ===
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.font = '8px sans-serif'
    ctx.textBaseline = 'bottom'
    ctx.fillText(params.distance + 'cm', (leftX + cx) / 2, (leftY + cy) / 2 - 4)

    // === Название пресета ===
    const isIdeal = params.distance >= 25 && params.distance <= 35 &&
                   params.angle >= 25 && params.angle <= 35 &&
                   Math.abs(params.position) < 5

    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.font = '10px sans-serif'
    ctx.textBaseline = 'top'
    ctx.textAlign = 'right'
    ctx.fillText(isIdeal ? '⭐ IDEAL' :
                params.distance < 15 ? '⚠ NEAR WALL' :
                params.angle > 40 ? '↗ WIDE' : '● SETUP', W - 10, 10)

    // === Размер комнаты ===
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.textAlign = 'left'
    ctx.fillText('Room: ' + roomNames[params.room], 10, 10)

    // === Подсказка для перетаскивания ===
    if (!isDragging) {
      ctx.fillStyle = 'rgba(255,255,255,0.03)'
      ctx.font = '8px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText('🖱️ Перетащите слушателя', W / 2, H - 6)
    }
  }, [params, isDragging, roomNames])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРОВ =====
  const updateParam = useCallback((key: keyof MonitorParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ПРЕСЕТЫ =====
  const presets: Record<string, MonitorParams> = {
    ideal: { distance: 30, angle: 30, position: 0, room: 1 },
    wall: { distance: 5, angle: 25, position: 0, room: 1 },
    wide: { distance: 30, angle: 50, position: 0, room: 1 },
    small: { distance: 20, angle: 30, position: 0, room: 0 }
  }

  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) setParams(preset)
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setParams({
      distance: 30,
      angle: 30,
      position: 0,
      room: 1
    })
  }, [])

  // ===== DRAG =====
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const W = e.currentTarget.width
    const H = e.currentTarget.height
    const cx = W / 2 + (params.position / 30) * 200
    const cy = H / 2 + 20
    const dist2 = Math.sqrt((x * W - cx) ** 2 + (y * H - cy) ** 2)

    if (dist2 < 50) {
      setIsDragging(true)
      e.currentTarget.style.cursor = 'grabbing'
    }
  }, [params.position])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) {
      // Обновляем курсор
      const rect = e.currentTarget.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const W = e.currentTarget.width
      const H = e.currentTarget.height
      const cx = W / 2 + (params.position / 30) * 200
      const cy = H / 2 + 20
      const dist2 = Math.sqrt((x * W - cx) ** 2 + (y * H - cy) ** 2)
      e.currentTarget.style.cursor = dist2 < 50 ? 'grab' : 'default'
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const W = e.currentTarget.width
    const cx = W / 2
    const offset = (x * W - cx) / 200 * 30
    const newPos = Math.max(-30, Math.min(30, offset))
    updateParam('position', Math.round(newPos))
  }, [isDragging, params.position, updateParam])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default'
    }
  }, [])

  // ===== TOUCH =====
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (touch.clientX - rect.left) / rect.width
    const y = (touch.clientY - rect.top) / rect.height
    const W = e.currentTarget.width
    const H = e.currentTarget.height
    const cx = W / 2 + (params.position / 30) * 200
    const cy = H / 2 + 20
    const dist2 = Math.sqrt((x * W - cx) ** 2 + (y * H - cy) ** 2)

    if (dist2 < 50) {
      setIsDragging(true)
      e.preventDefault()
    }
  }, [params.position])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    e.preventDefault()
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (touch.clientX - rect.left) / rect.width
    const W = e.currentTarget.width
    const cx = W / 2
    const offset = (x * W - cx) / 200 * 30
    const newPos = Math.max(-30, Math.min(30, offset))
    updateParam('position', Math.round(newPos))
  }, [isDragging, updateParam])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // ===== RESIZE =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      const w = rect.width - 12
      canvas.style.width = w + 'px'
      canvas.width = Math.max(200, w)
      canvas.height = Math.min(280, w * 0.35)
      renderStudio()
    }
  }, [renderStudio])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    const loop = () => {
      timeRef.current += 0.01
      renderStudio()
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, renderStudio])

  // ===== ИНИЦИАЛИЗАЦИЯ =====
  useEffect(() => {
    renderStudio()
  }, [renderStudio])

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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Studio Simulator
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
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {/* Типы */}
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
              padding: '4px 14px',
              borderRadius: '50px',
              fontSize: '0.55rem',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.03)',
              color: '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit',
              textTransform: 'capitalize'
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

      {/* Параметры */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '6px',
        marginBottom: '10px'
      }}>
        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Distance to wall</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>{params.distance} cm</span>
          </div>
          <input
            type="range" min="5" max="100" step="1"
            value={params.distance}
            onChange={(e) => updateParam('distance', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Monitor angle</span>
            <span style={{ fontSize: '0.55rem', color: '#f5c542' }}>{params.angle}°</span>
          </div>
          <input
            type="range" min="10" max="60" step="1"
            value={params.angle}
            onChange={(e) => updateParam('angle', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #f5c542, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Listener position</span>
            <span style={{ fontSize: '0.55rem', color: '#50c878' }}>{params.position > 0 ? '+' : ''}{params.position}%</span>
          </div>
          <input
            type="range" min="-30" max="30" step="1"
            value={params.position}
            onChange={(e) => updateParam('position', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Room size</span>
            <span style={{ fontSize: '0.55rem', color: '#da70d6' }}>{roomNames[params.room]}</span>
          </div>
          <input
            type="range" min="0" max="2" step="1"
            value={params.room}
            onChange={(e) => updateParam('room', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #da70d6, rgba(255,255,255,0.07))',
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
          {isPlaying ? '⏸ Пауза' : '▶ Play'}
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
        🔊 Перетащите слушателя или настройте параметры для идеального размещения
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default MonitorsWidget