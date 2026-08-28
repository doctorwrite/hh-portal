// components/interactive/TrackingWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface TrackingParams {
  gain: number
  distance: number
  roomSize: number
  micType: 'condenser' | 'dynamic' | 'ribbon'
  popFilter: boolean
}

const TrackingWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<TrackingParams>({
    gain: 50,
    distance: 50,
    roomSize: 50,
    micType: 'condenser',
    popFilter: true
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [signalLevel, setSignalLevel] = useState(0)
  const [isClipping, setIsClipping] = useState(false)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const micTypes = [
    { id: 'condenser', label: 'Конденсаторный', color: '#4a9eff', desc: 'Детальный, воздушный' },
    { id: 'dynamic', label: 'Динамический', color: '#f5c542', desc: 'Плотный, тёплый' },
    { id: 'ribbon', label: 'Ленточный', color: '#ff6b6b', desc: 'Мягкий, винтажный' },
  ]

  // ===== СИМУЛЯЦИЯ =====
  const simulate = useCallback(() => {
    // Симуляция уровня сигнала
    const base = 0.2 + 0.3 * Math.sin(timeRef.current * 0.3) + 0.2 * Math.sin(timeRef.current * 0.7)
    const gainFactor = params.gain / 50
    const distanceFactor = 1 - (params.distance / 100) * 0.5
    const roomFactor = 1 + (params.roomSize / 100) * 0.3
    const micFactor = params.micType === 'condenser' ? 1.3 : (params.micType === 'dynamic' ? 0.8 : 0.6)
    const popFilterFactor = params.popFilter ? 0.9 : 1.0

    let level = base * gainFactor * distanceFactor * micFactor * roomFactor * popFilterFactor
    level = Math.min(1.2, Math.max(0, level))

    setSignalLevel(level)
    setIsClipping(level > 1.0)
  }, [params])

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
    const graphW = W - margin * 2
    const graphH = 110
    const graphX = margin
    const graphY = 24

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === 1. Визуализация сигнала ===
    const centerY = graphY + graphH / 2
    const maxAmp = 50 * (params.gain / 50) * 0.8
    const steps = 300
    const isClip = signalLevel > 1.0
    const clipLevel = Math.min(1.2, signalLevel)

    // Генерация волны
    const pts: { x: number; y: number; clipped: boolean }[] = []
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      let val = Math.sin(t) * 0.4
      val += Math.sin(t * 2 + 0.3) * 0.15
      val += Math.sin(t * 3 + 0.7) * 0.05

      // Применяем уровень
      val *= clipLevel

      // Клиппинг
      let clipped = false
      if (val > 0.9) {
        val = 0.9
        clipped = true
      } else if (val < -0.9) {
        val = -0.9
        clipped = true
      }

      const y = centerY - val * maxAmp
      pts.push({ x, y, clipped })
    }

    // Рисуем волну
    ctx.beginPath()
    ctx.strokeStyle = isClip ? '#ff6b6b' : '#4a9eff'
    ctx.lineWidth = 2.5
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) ctx.moveTo(pts[i].x, pts[i].y)
      else ctx.lineTo(pts[i].x, pts[i].y)
    }
    ctx.stroke()

    // Клиппинг (красный)
    if (isClip) {
      // Зона клиппинга
      ctx.fillStyle = 'rgba(255,107,107,0.06)'
      ctx.fillRect(graphX, centerY - 0.9 * maxAmp, graphW, 1.8 * maxAmp)
      ctx.fillStyle = 'rgba(255,0,0,0.08)'
      ctx.fillRect(graphX, centerY - 0.9 * maxAmp, graphW, 1.8 * maxAmp)
    }

    // === 2. Микрофон ===
    const micX = 140
    const micY = graphY + graphH + 30
    const micSize = 28

    // Корпус микрофона
    ctx.fillStyle = isClip ? 'rgba(255,80,80,0.2)' : 'rgba(255,255,255,0.05)'
    ctx.beginPath()
    ctx.arc(micX, micY, micSize, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = isClip ? '#ff6b6b' : 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(micX, micY, micSize, 0, Math.PI * 2)
    ctx.stroke()

    // Название микрофона
    const micLabel = micTypes.find(m => m.id === params.micType)?.label || 'Микрофон'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(micLabel, micX, micY - micSize - 4)

    // Поп-фильтр
    if (params.popFilter) {
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.beginPath()
      ctx.arc(micX - 45, micY + 5, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.arc(micX - 45, micY + 5, 18, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('PF', micX - 45, micY + 5)
    }

    // === 3. Уровень сигнала (VU-метр) ===
    const meterX = graphX + graphW - 16
    const meterW = 10
    const meterH = graphH
    const meterY = graphY

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(meterX, meterY, meterW, meterH)

    const levelPercent = Math.min(1, signalLevel)
    const grad = ctx.createLinearGradient(0, meterY + meterH, 0, meterY)
    grad.addColorStop(0, '#50c878')
    grad.addColorStop(0.6, '#f5c542')
    grad.addColorStop(0.85, '#ff6b6b')
    grad.addColorStop(1, '#ff0000')
    ctx.fillStyle = grad
    ctx.fillRect(meterX, meterY + meterH - levelPercent * meterH, meterW, levelPercent * meterH)

    // Клип (красный)
    if (isClip) {
      ctx.fillStyle = 'rgba(255,0,0,0.3)'
      ctx.fillRect(meterX, meterY, meterW, 4)
    }

    // Метки
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('0', meterX + meterW + 4, meterY)
    ctx.fillText('-6', meterX + meterW + 4, meterY + meterH * 0.5)
    ctx.fillText('-20', meterX + meterW + 4, meterY + meterH * 0.8)

    // Значение уровня
    ctx.fillStyle = isClip ? '#ff6b6b' : '#50c878'
    ctx.font = 'bold 6px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${Math.round(levelPercent * 100)}%`, meterX - 4, meterY + meterH)

    // === 4. Статус ===
    const statusY = graphY + graphH + 8
    const statusText = isClip
      ? '⚠️ ПЕРЕГРУЗКА! Уменьшите gain или отодвиньте микрофон.'
      : (levelPercent > 0.7
        ? '✅ Отличный уровень!'
        : (levelPercent > 0.4
          ? '👍 Хороший уровень, можно добавить gain.'
          : '⬆️ Слишком тихо. Увеличьте gain.'))

    ctx.fillStyle = isClip ? 'rgba(255,80,80,0.08)' : 'rgba(80,200,120,0.06)'
    ctx.beginPath()
    ctx.roundRect(graphX, statusY, graphW, 14, 4)
    ctx.fill()

    ctx.fillStyle = isClip ? '#ff6b6b' : '#50c878'
    ctx.font = '5px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(statusText, graphX + graphW / 2, statusY + 7)

    // === 5. Информация о микрофоне ===
    const infoY = statusY + 18
    const micInfo = micTypes.find(m => m.id === params.micType)
    const distCm = Math.round(10 + (params.distance / 100) * 30)

    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`🎙️ ${micInfo?.label || ''} • ${distCm} см • ${params.popFilter ? '✅ Поп-фильтр' : '❌ Без поп-фильтра'}`, graphX, infoY)

  }, [params, signalLevel])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    const loop = () => {
      timeRef.current += 0.02
      simulate()
      renderWidget()
      frameId = requestAnimationFrame(loop)
    }
    
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, simulate, renderWidget])

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

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof TrackingParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setParams({
      gain: 50,
      distance: 50,
      roomSize: 50,
      micType: 'condenser',
      popFilter: true
    })
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Tracking Simulator
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
        {isClipping && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(255,80,80,0.15)',
            border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '0.5rem',
            color: '#ff6b6b',
            fontWeight: 700,
            animation: 'pulse 0.8s ease-in-out infinite'
          }}>
            ⚠️ ПЕРЕГРУЗКА
          </div>
        )}
      </div>

      {/* Выбор микрофона */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {micTypes.map(mic => (
          <button
            key={mic.id}
            onClick={() => updateParam('micType', mic.id)}
            style={{
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '0.5rem',
              fontWeight: 600,
              border: params.micType === mic.id ? `2px solid ${mic.color}` : '1px solid rgba(255,255,255,0.06)',
              background: params.micType === mic.id ? `${mic.color}20` : 'rgba(255,255,255,0.03)',
              color: params.micType === mic.id ? mic.color : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit'
            }}
          >
            {mic.label}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Gain</span>
            <span style={{ fontSize: '0.55rem', color: '#f5c542' }}>{params.gain}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.gain}
            onChange={(e) => updateParam('gain', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Distance</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>
              {Math.round(10 + (params.distance / 100) * 30)} см
            </span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Room Size</span>
            <span style={{ fontSize: '0.55rem', color: '#50c878' }}>{params.roomSize}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.roomSize}
            onChange={(e) => updateParam('roomSize', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Pop Filter</span>
            <span style={{ fontSize: '0.55rem', color: params.popFilter ? '#50c878' : '#888' }}>
              {params.popFilter ? 'ON' : 'OFF'}
            </span>
          </div>
          <button
            onClick={() => updateParam('popFilter', !params.popFilter)}
            style={{
              width: '100%',
              padding: '4px 0',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: params.popFilter ? 'rgba(80,200,120,0.15)' : 'rgba(255,255,255,0.03)',
              color: params.popFilter ? '#50c878' : '#888',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.5rem',
              fontWeight: 600,
              transition: 'all 0.3s'
            }}
          >
            {params.popFilter ? '🟢 ON' : '⚪ OFF'}
          </button>
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
        🎙️ Настройте параметры записи и следите за уровнем сигнала
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default TrackingWidget