// components/interactive/PhaseWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface PhaseParams {
  phaseShift: number
  gain: number
  invertPhase: boolean
}

const PhaseWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<PhaseParams>({
    phaseShift: 0,
    gain: 80,
    invertPhase: false
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentShift, setCurrentShift] = useState(0)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  // ===== РЕНДЕРИНГ =====
  const renderWidget = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    const shift = currentShift
    const amp = 0.8 * (params.gain / 100)
    const isInverted = params.invertPhase

    const margin = 16
    const graphW = W - margin * 2
    const graphH = 120
    const graphX = margin
    const graphY = 28

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Визуализация двух волн ===
    const steps = 400
    const centerY = graphY + graphH / 2
    const maxAmp = amp * (graphH / 2 - 8)

    // Волна 1 (синяя)
    const wave1: { x: number; y: number }[] = []
    // Волна 2 (оранжевая) со сдвигом
    const wave2: { x: number; y: number }[] = []
    // Результат сложения (жёлтая)
    const sum: { x: number; y: number }[] = []

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW

      // Основной сигнал (синус)
      let val1 = Math.sin(t) * 0.5
      val1 += Math.sin(t * 2 + 0.3) * 0.15
      val1 += Math.sin(t * 3 + 0.7) * 0.05

      // Вторая волна со сдвигом
      const phaseRad = (shift / 180) * Math.PI
      let val2 = Math.sin(t + phaseRad) * 0.5
      val2 += Math.sin(t * 2 + 0.3 + phaseRad) * 0.15
      val2 += Math.sin(t * 3 + 0.7 + phaseRad) * 0.05

      // Инверсия
      if (isInverted) {
        val2 = -val2
      }

      const y1 = centerY - val1 * maxAmp
      const y2 = centerY - val2 * maxAmp
      const ySum = centerY - (val1 + val2) * maxAmp

      wave1.push({ x, y: y1 })
      wave2.push({ x, y: y2 })
      sum.push({ x, y: ySum })
    }

    // === Рисуем волну 1 (синяя) ===
    ctx.beginPath()
    for (let i = 0; i < wave1.length; i++) {
      if (i === 0) ctx.moveTo(wave1[i].x, wave1[i].y)
      else ctx.lineTo(wave1[i].x, wave1[i].y)
    }
    ctx.strokeStyle = 'rgba(74,158,255,0.4)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // === Рисуем волну 2 (оранжевая) ===
    ctx.beginPath()
    for (let i = 0; i < wave2.length; i++) {
      if (i === 0) ctx.moveTo(wave2[i].x, wave2[i].y)
      else ctx.lineTo(wave2[i].x, wave2[i].y)
    }
    ctx.strokeStyle = isInverted ? 'rgba(255,107,107,0.4)' : 'rgba(255,140,66,0.4)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // === Рисуем результат сложения (жёлтая) ===
    ctx.beginPath()
    for (let i = 0; i < sum.length; i++) {
      if (i === 0) ctx.moveTo(sum[i].x, sum[i].y)
      else ctx.lineTo(sum[i].x, sum[i].y)
    }
    ctx.strokeStyle = '#f5c542'
    ctx.lineWidth = 2.5
    ctx.shadowColor = 'rgba(245,197,66,0.3)'
    ctx.shadowBlur = 6
    ctx.stroke()
    ctx.shadowBlur = 0

    // === Заливка результата ===
    ctx.beginPath()
    ctx.moveTo(sum[0].x, graphY + graphH)
    for (let i = 0; i < sum.length; i++) {
      ctx.lineTo(sum[i].x, sum[i].y)
    }
    ctx.lineTo(sum[sum.length - 1].x, graphY + graphH)
    ctx.closePath()
    const isConstructive = Math.abs(shift) < 60 || Math.abs(shift) > 300
    ctx.fillStyle = isConstructive 
      ? 'rgba(80,200,120,0.06)' 
      : 'rgba(255,107,107,0.06)'
    ctx.fill()

    // === Сетка ===
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const x = graphX + (i / 4) * graphW
      ctx.beginPath()
      ctx.moveTo(x, graphY)
      ctx.lineTo(x, graphY + graphH)
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.beginPath()
    ctx.moveTo(graphX, centerY)
    ctx.lineTo(graphX + graphW, centerY)
    ctx.stroke()

    // === Легенда ===
    const legendY = graphY + graphH + 12
    const legendItems = [
      { label: 'Волна 1', color: 'rgba(74,158,255,0.6)' },
      { label: 'Волна 2', color: isInverted ? 'rgba(255,107,107,0.6)' : 'rgba(255,140,66,0.6)' },
      { label: 'Результат', color: '#f5c542' },
    ]

    let legendX = graphX
    for (const item of legendItems) {
      ctx.fillStyle = item.color
      ctx.fillRect(legendX, legendY, 10, 3)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '5px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(item.label, legendX + 14, legendY + 2)
      legendX += 70 + (item.label.length * 6)
    }

    // === Информация о сдвиге ===
    const infoY = legendY + 14
    const effectiveShift = isInverted ? 180 + shift : shift
    const isInPhase = Math.abs(effectiveShift % 360) < 10 || Math.abs(effectiveShift % 360) > 350
    const isOutOfPhase = Math.abs(effectiveShift % 360 - 180) < 10

    ctx.fillStyle = isInPhase ? 'rgba(80,200,120,0.1)' : (isOutOfPhase ? 'rgba(255,107,107,0.1)' : 'rgba(245,197,66,0.06)')
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 20, 4)
    ctx.fill()

    let statusText = isInPhase 
      ? '✅ Совпадение фаз — звук усиливается' 
      : (isOutOfPhase 
        ? '⚠️ Противофаза — звук ослабляется' 
        : `🔄 Сдвиг фазы ${effectiveShift.toFixed(0)}° — частичное ослабление`)

    if (isInverted) {
      statusText += ' (инверсия включена)'
    }

    ctx.fillStyle = isInPhase ? '#50c878' : (isOutOfPhase ? '#ff6b6b' : '#f5c542')
    ctx.font = 'bold 6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(statusText, graphX + 8, infoY + 10)

    // === Коррелометр ===
    const meterY = infoY + 26
    const meterW = graphW
    const meterH = 8

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.beginPath()
    ctx.roundRect(graphX, meterY, meterW, meterH, 4)
    ctx.fill()

    // Вычисляем корреляцию (эмуляция)
    const correlation = isInPhase ? 0.7 + Math.random() * 0.2 : (isOutOfPhase ? -0.7 + Math.random() * 0.2 : 0.2 + Math.random() * 0.3)
    const corrClamped = Math.max(-1, Math.min(1, correlation))

    // Градиент для коррелометра
    const grad = ctx.createLinearGradient(graphX, 0, graphX + meterW, 0)
    grad.addColorStop(0, '#ff6b6b')
    grad.addColorStop(0.3, '#f5c542')
    grad.addColorStop(0.5, '#50c878')
    grad.addColorStop(0.7, '#f5c542')
    grad.addColorStop(1, '#ff6b6b')
    ctx.fillStyle = grad

    const centerX = graphX + meterW / 2
    const corrX = graphX + (corrClamped + 1) / 2 * meterW
    ctx.beginPath()
    ctx.roundRect(Math.min(corrX, centerX), meterY, Math.abs(corrX - centerX), meterH, 2)
    ctx.fill()

    // Маркер центра
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fillRect(centerX - 0.5, meterY - 2, 1, meterH + 4)

    // Маркер корреляции
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(corrX, meterY + meterH / 2, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Подписи коррелометра
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('-1', graphX, meterY + meterH + 2)
    ctx.textAlign = 'center'
    ctx.fillText('0', centerX, meterY + meterH + 2)
    ctx.textAlign = 'right'
    ctx.fillText('+1', graphX + meterW, meterY + meterH + 2)

    // Значение корреляции
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '5px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`Корреляция: ${corrClamped.toFixed(2)}`, centerX, meterY - 2)

    // === Подписи ===
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText('Фаза', W - 10, H - 4)

  }, [currentShift, params])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    const loop = () => {
      timeRef.current += 0.02
      // Плавно меняем сдвиг для демонстрации
      const shift = 45 * Math.sin(timeRef.current * 0.3) + 45 * Math.sin(timeRef.current * 0.07)
      setCurrentShift(Math.round(shift))
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
      canvas.height = Math.min(240, w * 0.28)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ ПАРАМЕТРОВ =====
  useEffect(() => {
    renderWidget()
  }, [currentShift, params, renderWidget])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof PhaseParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ИЗМЕНЕНИЕ СДВИГА =====
  const setShift = useCallback((shift: number) => {
    setCurrentShift(shift)
  }, [])

  // ===== ИНВЕРСИЯ =====
  const toggleInvert = useCallback(() => {
    updateParam('invertPhase', !params.invertPhase)
  }, [params.invertPhase, updateParam])

  // ===== ПРЕСЕТЫ =====
  const presets = [
    { label: '0° (совпадение)', value: 0 },
    { label: '90°', value: 90 },
    { label: '180° (противофаза)', value: 180 },
    { label: '270°', value: 270 },
    { label: '360° (совпадение)', value: 360 },
  ]

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setCurrentShift(0)
    setParams({
      phaseShift: 0,
      gain: 80,
      invertPhase: false
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Phase Visualizer
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
        {Math.abs(currentShift % 360 - 180) < 10 && (
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
            fontWeight: 700
          }}>
            ⚠️ ПРОТИВОФАЗА
          </div>
        )}
        {Math.abs(currentShift % 360) < 10 && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(80,200,120,0.15)',
            border: '1px solid rgba(80,200,120,0.3)',
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '0.5rem',
            color: '#50c878',
            fontWeight: 700
          }}>
            ✅ СОВПАДЕНИЕ ФАЗ
          </div>
        )}
      </div>

      {/* Выбор сдвига */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {presets.map(p => (
          <button
            key={p.value}
            onClick={() => setShift(p.value)}
            style={{
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '0.5rem',
              fontWeight: 600,
              border: currentShift === p.value ? '2px solid rgba(245,197,66,0.4)' : '1px solid rgba(255,255,255,0.06)',
              background: currentShift === p.value ? 'rgba(245,197,66,0.1)' : 'rgba(255,255,255,0.03)',
              color: currentShift === p.value ? '#f5c542' : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Ползунок сдвига */}
      <div style={{
        padding: '6px 8px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.4rem', color: '#666' }}>Сдвиг фазы</span>
          <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>{currentShift}°</span>
        </div>
        <input
          type="range" min="0" max="360" step="1"
          value={currentShift}
          onChange={(e) => setShift(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '2px',
            appearance: 'none',
            background: 'linear-gradient(to right, #4a9eff, #f5c542, #ff6b6b)',
            cursor: 'pointer'
          }}
        />
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
            type="range" min="10" max="100" step="1"
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Инверсия</span>
            <span style={{ fontSize: '0.55rem', color: params.invertPhase ? '#ff6b6b' : '#888' }}>
              {params.invertPhase ? 'ON' : 'OFF'}
            </span>
          </div>
          <button
            onClick={toggleInvert}
            style={{
              width: '100%',
              padding: '4px 0',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: params.invertPhase ? 'rgba(255,80,80,0.15)' : 'rgba(255,255,255,0.03)',
              color: params.invertPhase ? '#ff6b6b' : '#888',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.5rem',
              fontWeight: 600,
              transition: 'all 0.3s'
            }}
          >
            {params.invertPhase ? '🔴 ON' : '⚪ OFF'}
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
        📊 Визуализация сложения двух волн с регулируемым фазовым сдвигом
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default PhaseWidget