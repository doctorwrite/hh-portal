// components/interactive/LUFSWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface LUFSParams {
  targetLUFS: number
  showTruePeak: boolean
  gain: number
}

interface LUFSData {
  integrated: number
  shortTerm: number
  momentary: number
  truePeak: number
  lra: number
}

const LUFSWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<LUFSParams>({
    targetLUFS: -14,
    showTruePeak: true,
    gain: 80
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [lufsData, setLufsData] = useState<LUFSData>({
    integrated: -18,
    shortTerm: -16,
    momentary: -12,
    truePeak: -2.5,
    lra: 8
  })
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)
  const dataRef = useRef<LUFSData>({
    integrated: -18,
    shortTerm: -16,
    momentary: -12,
    truePeak: -2.5,
    lra: 8
  })

  const platforms = [
    { name: 'Spotify', target: -14, color: '#1DB954' },
    { name: 'Apple Music', target: -16, color: '#FC3C44' },
    { name: 'YouTube', target: -14, color: '#FF0000' },
    { name: 'Яндекс.Музыка', target: -14, color: '#FFCC00' },
    { name: 'Tidal', target: -14, color: '#000000' },
    { name: 'Клуб / Радио', target: -9, color: '#FF6B6B' },
  ]

  // ===== СИМУЛЯЦИЯ LUFS =====
  const simulateLUFS = useCallback((time: number) => {
    // Создаём реалистичную симуляцию громкости с изменениями
    const base = -16
    const variation = 4 * Math.sin(time * 0.3)
    const momentary = base + variation + 2 * Math.sin(time * 0.7)
    const shortTerm = base + variation * 0.7 + 1.5 * Math.sin(time * 0.2)
    
    // Integrated медленно приближается к целевому значению
    const target = params.targetLUFS
    const integrated = dataRef.current.integrated + (target - dataRef.current.integrated) * 0.003
    
    // True Peak (между -3 и -0.5)
    const truePeak = -2 + Math.sin(time * 0.5) * 1.2 + Math.random() * 0.3
    
    // LRA (между 4 и 14)
    const lra = 6 + 4 * Math.sin(time * 0.05) + 2
    
    return {
      integrated: Math.max(-30, Math.min(-5, integrated)),
      shortTerm: Math.max(-30, Math.min(-5, shortTerm)),
      momentary: Math.max(-30, Math.min(-5, momentary)),
      truePeak: Math.max(-5, Math.min(-0.3, truePeak)),
      lra: Math.max(3, Math.min(16, lra))
    }
  }, [params.targetLUFS])

  // ===== РЕНДЕРИНГ =====
  const renderWidget = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    const data = dataRef.current
    const target = params.targetLUFS
    const isOnTarget = data.integrated > target - 0.5 && data.integrated < target + 0.5

    // === 1. Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === 2. Шкала LUFS ===
    const lufsMin = -30
    const lufsMax = -5
    const scaleX = 60
    const scaleY = 30
    const scaleWidth = W - scaleX - 20
    const scaleHeight = 12

    // Шкала
    const grad = ctx.createLinearGradient(scaleX, 0, scaleX + scaleWidth, 0)
    grad.addColorStop(0, '#4a9eff')
    grad.addColorStop(0.5, '#50c878')
    grad.addColorStop(0.8, '#f5c542')
    grad.addColorStop(1, '#ff6b6b')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(scaleX, scaleY, scaleWidth, scaleHeight, 4)
    ctx.fill()

    // Метки на шкале
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (let lufs = -30; lufs <= -5; lufs += 5) {
      const x = scaleX + ((lufs - lufsMin) / (lufsMax - lufsMin)) * scaleWidth
      ctx.fillText(lufs.toString(), x, scaleY + scaleHeight + 2)
    }

    // Целевое значение (маркер)
    const targetX = scaleX + ((target - lufsMin) / (lufsMax - lufsMin)) * scaleWidth
    ctx.fillStyle = '#f5c542'
    ctx.font = 'bold 7px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText('▼ ЦЕЛЬ', targetX, scaleY - 2)
    ctx.fillStyle = 'rgba(245,197,66,0.2)'
    ctx.fillRect(targetX - 1, scaleY, 2, scaleHeight)

    // Текущее значение Integrated
    const currentX = scaleX + ((data.integrated - lufsMin) / (lufsMax - lufsMin)) * scaleWidth
    const isInRange = data.integrated >= target - 1 && data.integrated <= target + 1
    
    ctx.fillStyle = isInRange ? '#50c878' : (data.integrated < target ? '#4a9eff' : '#ff6b6b')
    ctx.beginPath()
    ctx.arc(currentX, scaleY + scaleHeight / 2, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 8px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${data.integrated.toFixed(1)} LUFS`, currentX, scaleY - 6)

    // === 3. Показатели ===
    const metrics = [
      { label: 'Integrated LUFS', value: data.integrated, color: isOnTarget ? '#50c878' : '#f5c542' },
      { label: 'Short-term LUFS', value: data.shortTerm, color: '#4a9eff' },
      { label: 'Momentary LUFS', value: data.momentary, color: '#da70d6' },
      { label: 'True Peak', value: data.truePeak, color: '#ff6b6b', unit: ' dBTP' },
      { label: 'Loudness Range (LRA)', value: data.lra, color: '#ff8c42', unit: ' LU' },
    ]

    const metricsY = scaleY + scaleHeight + 30
    const metricHeight = 22
    const metricGap = 4

    for (let i = 0; i < metrics.length; i++) {
      const m = metrics[i]
      const y = metricsY + i * (metricHeight + metricGap)
      const valueText = m.unit ? `${m.value.toFixed(1)}${m.unit}` : `${m.value.toFixed(1)} LUFS`

      // Фон
      ctx.fillStyle = 'rgba(255,255,255,0.03)'
      ctx.beginPath()
      ctx.roundRect(scaleX, y, scaleWidth, metricHeight, 3)
      ctx.fill()

      // Метка
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '7px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(m.label, scaleX + 6, y + metricHeight / 2)

      // Значение
      ctx.fillStyle = m.color
      ctx.font = 'bold 8px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(valueText, scaleX + scaleWidth - 6, y + metricHeight / 2)

      // Маленький индикатор
      const indicatorWidth = 40
      const indicatorX = scaleX + scaleWidth - indicatorWidth - 60
      const barWidth = indicatorWidth - 4
      let percent = 0
      if (i === 0) {
        // Integrated LUFS — относительно цели
        const range = 10
        const offset = m.value - target
        percent = 50 + (offset / range) * 50
        percent = Math.max(0, Math.min(100, percent))
      } else if (i === 1 || i === 2) {
        // Short-term / Momentary — относительно Integrated
        const base = metrics[0].value
        const diff = m.value - base
        percent = 50 + diff * 10
        percent = Math.max(0, Math.min(100, percent))
      } else if (i === 3) {
        // True Peak — относительно -1 dBTP
        percent = 100 - ((m.value + 1) / 4) * 100
        percent = Math.max(0, Math.min(100, percent))
      } else {
        // LRA
        percent = (m.value / 16) * 100
        percent = Math.min(100, percent)
      }
      
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.beginPath()
      ctx.roundRect(indicatorX, y + 3, indicatorWidth - 2, metricHeight - 6, 2)
      ctx.fill()
      
      ctx.fillStyle = m.color
      ctx.fillRect(indicatorX + 2, y + 4, Math.max(2, (indicatorWidth - 6) * (percent / 100)), metricHeight - 8)
    }

    // === 4. Статус ===
    const statusY = metricsY + metrics.length * (metricHeight + metricGap) + 10
    const statusText = isOnTarget 
      ? '✅ Отличный уровень! Трек готов к стримингам.'
      : (data.integrated < target 
          ? `📈 Трек тише цели на ${(target - data.integrated).toFixed(1)} LUFS. Добавьте громкость.`
          : `📉 Трек громче цели на ${(data.integrated - target).toFixed(1)} LUFS. Уменьшите громкость.`)

    ctx.fillStyle = isOnTarget ? 'rgba(80,200,120,0.1)' : 'rgba(245,197,66,0.08)'
    ctx.beginPath()
    ctx.roundRect(scaleX, statusY, scaleWidth, 20, 4)
    ctx.fill()

    ctx.fillStyle = isOnTarget ? '#50c878' : '#f5c542'
    ctx.font = '7px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(statusText, scaleX + scaleWidth / 2, statusY + 10)

    // === 5. Выбранная платформа ===
    const platform = platforms.find(p => p.target === target) || platforms[0]
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`Цель: ${platform.name} (${target} LUFS)`, W - 10, H - 6)

    // === 6. Индикатор "нормализация" ===
    if (Math.abs(data.integrated - target) > 1) {
      const penalty = data.integrated - target
      ctx.fillStyle = 'rgba(255,107,107,0.08)'
      ctx.beginPath()
      ctx.roundRect(W - 120, 8, 110, 18, 4)
      ctx.fill()
      ctx.fillStyle = '#ff6b6b'
      ctx.font = '6px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`🔊 Loudness Penalty: ${penalty > 0 ? '-' : '+'}${Math.abs(penalty).toFixed(1)} dB`, W - 65, 17)
    }

  }, [params.targetLUFS])

  // ===== ОБНОВЛЕНИЕ ДАННЫХ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    const loop = () => {
      timeRef.current += 0.02
      const newData = simulateLUFS(timeRef.current)
      dataRef.current = newData
      setLufsData(newData)
      renderWidget()
      frameId = requestAnimationFrame(loop)
    }
    
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, simulateLUFS, renderWidget])

  // ===== РЕСАЙЗ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      const w = Math.max(200, rect.width - 12)
      canvas.width = w
      canvas.height = Math.min(320, w * 0.4)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ ПАРАМЕТРОВ =====
  useEffect(() => {
    renderWidget()
  }, [params.targetLUFS, renderWidget])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof LUFSParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ВЫБОР ПЛАТФОРМЫ =====
  const selectPlatform = useCallback((target: number) => {
    updateParam('targetLUFS', target)
  }, [updateParam])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setParams({
      targetLUFS: -14,
      showTruePeak: true,
      gain: 80
    })
    dataRef.current = {
      integrated: -18,
      shortTerm: -16,
      momentary: -12,
      truePeak: -2.5,
      lra: 8
    }
    setLufsData(dataRef.current)
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · LUFS Meter
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

      {/* Выбор платформы */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {platforms.map(p => (
          <button
            key={p.name}
            onClick={() => selectPlatform(p.target)}
            style={{
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '0.5rem',
              fontWeight: 600,
              border: params.targetLUFS === p.target ? `2px solid ${p.color}` : '1px solid rgba(255,255,255,0.06)',
              background: params.targetLUFS === p.target ? `${p.color}20` : 'rgba(255,255,255,0.03)',
              color: params.targetLUFS === p.target ? p.color : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit'
            }}
          >
            {p.name}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Simulation Gain</span>
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>True Peak</span>
            <span style={{ fontSize: '0.55rem', color: params.showTruePeak ? '#50c878' : '#888' }}>
              {params.showTruePeak ? 'ON' : 'OFF'}
            </span>
          </div>
          <button
            onClick={() => updateParam('showTruePeak', !params.showTruePeak)}
            style={{
              width: '100%',
              padding: '4px 0',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: params.showTruePeak ? 'rgba(80,200,120,0.15)' : 'rgba(255,255,255,0.03)',
              color: params.showTruePeak ? '#50c878' : '#888',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.5rem',
              fontWeight: 600,
              transition: 'all 0.3s'
            }}
          >
            {params.showTruePeak ? '🟢 ON' : '⚪ OFF'}
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
        📊 Симуляция Integrated, Short-term, Momentary LUFS и True Peak в реальном времени
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default LUFSWidget