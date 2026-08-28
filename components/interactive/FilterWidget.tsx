// components/interactive/FilterWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface FilterParams {
  type: 'hpf' | 'lpf' | 'bpf' | 'notch' | 'shelf'
  frequency: number
  slope: number
  resonance: number
  gain: number
}

const FilterWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<FilterParams>({
    type: 'hpf',
    frequency: 80,
    slope: 12,
    resonance: 1,
    gain: 0
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentType, setCurrentType] = useState<'hpf' | 'lpf' | 'bpf' | 'notch' | 'shelf'>('hpf')
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const filterTypes = [
    { id: 'hpf', label: 'HPF', desc: 'High-Pass' },
    { id: 'lpf', label: 'LPF', desc: 'Low-Pass' },
    { id: 'bpf', label: 'BPF', desc: 'Band-Pass' },
    { id: 'notch', label: 'Notch', desc: 'Режекторный' },
    { id: 'shelf', label: 'Shelf', desc: 'Полочный' },
  ]

  const slopes = [6, 12, 18, 24, 48]

  // ===== РАСЧЁТ ЧАСТОТНОЙ ХАРАКТЕРИСТИКИ =====
  const calcFilterResponse = useCallback((freq: number, type: string, fc: number, slope: number, resonance: number, gain: number) => {
    const ratio = freq / fc
    let response = 0

    switch(type) {
      case 'hpf': {
        const n = slope / 6
        const r = 1 / (1 + Math.pow(1 / ratio, 2 * n))
        response = 20 * Math.log10(Math.sqrt(r))
        // Резонанс
        if (resonance > 0) {
          const qBoost = Math.min(20, resonance * 8)
          const qWidth = Math.max(0.5, 2 / (resonance + 0.5))
          const qResponse = qBoost * Math.exp(-Math.pow(Math.log10(ratio) / qWidth, 2))
          response += qResponse
        }
        break
      }
      case 'lpf': {
        const n = slope / 6
        const r = 1 / (1 + Math.pow(ratio, 2 * n))
        response = 20 * Math.log10(Math.sqrt(r))
        if (resonance > 0) {
          const qBoost = Math.min(20, resonance * 8)
          const qWidth = Math.max(0.5, 2 / (resonance + 0.5))
          const qResponse = qBoost * Math.exp(-Math.pow(Math.log10(ratio) / qWidth, 2))
          response += qResponse
        }
        break
      }
      case 'bpf': {
        const q = 1 / (resonance + 0.5)
        const r = 1 / (1 + q * q * Math.pow(ratio - 1/ratio, 2))
        response = 20 * Math.log10(Math.sqrt(r))
        break
      }
      case 'notch': {
        const q = 1 / (resonance + 0.5)
        const r = 1 / (1 + Math.pow(ratio - 1/ratio, 2) / (4 * q * q))
        response = 20 * Math.log10(Math.sqrt(r))
        break
      }
      case 'shelf': {
        const n = slope / 6
        const shelfGain = gain
        const r = 1 / (1 + Math.pow(1/ratio, 2 * n))
        response = shelfGain * (1 - r)
        break
      }
      default: {
        response = 0
      }
    }
    return Math.max(-40, Math.min(20, response))
  }, [])

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
    const graphW = W - margin * 2 - 20
    const graphH = 120
    const graphX = margin + 16
    const graphY = 32

    const minFreq = 10
    const maxFreq = 22000
    const minDb = -40
    const maxDb = 20

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Сетка ===
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 0.5
    const gridFreqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]
    for (const f of gridFreqs) {
      const x = graphX + (Math.log10(f) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq)) * graphW
      ctx.beginPath()
      ctx.moveTo(x, graphY)
      ctx.lineTo(x, graphY + graphH)
      ctx.stroke()
    }
    for (let db = -30; db <= 15; db += 15) {
      const y = graphY + graphH - ((db - minDb) / (maxDb - minDb)) * graphH
      ctx.beginPath()
      ctx.moveTo(graphX, y)
      ctx.lineTo(graphX + graphW, y)
      ctx.stroke()
    }

    // === Оси ===
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(graphX, graphY)
    ctx.lineTo(graphX, graphY + graphH)
    ctx.lineTo(graphX + graphW, graphY + graphH)
    ctx.stroke()

    // === Метки ===
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '5px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (const f of gridFreqs) {
      const x = graphX + (Math.log10(f) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq)) * graphW
      ctx.fillText(f >= 1000 ? `${f/1000}k` : `${f}`, x, graphY + graphH + 2)
    }

    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let db = -30; db <= 15; db += 15) {
      const y = graphY + graphH - ((db - minDb) / (maxDb - minDb)) * graphH
      ctx.fillText(`${db}`, graphX - 4, y)
    }

    // === Нулевая линия ===
    const zeroY = graphY + graphH - ((0 - minDb) / (maxDb - minDb)) * graphH
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(graphX, zeroY)
    ctx.lineTo(graphX + graphW, zeroY)
    ctx.stroke()
    ctx.setLineDash([])

    // === Частотная характеристика ===
    const fc = params.frequency
    const type = params.type
    const slope = params.slope
    const resonance = params.resonance
    const gain = params.gain

    const pts: { x: number; y: number }[] = []
    const steps = 200

    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const freq = Math.pow(10, Math.log10(minFreq) + t * (Math.log10(maxFreq) - Math.log10(minFreq)))
      const response = calcFilterResponse(freq, type, fc, slope, resonance, gain)
      const x = graphX + t * graphW
      const y = graphY + graphH - ((Math.max(minDb, Math.min(maxDb, response)) - minDb) / (maxDb - minDb)) * graphH
      pts.push({ x, y })
    }

    // Заливка под кривой
    ctx.beginPath()
    ctx.moveTo(pts[0].x, graphY + graphH)
    for (const p of pts) {
      ctx.lineTo(p.x, p.y)
    }
    ctx.lineTo(pts[pts.length - 1].x, graphY + graphH)
    ctx.closePath()
    ctx.fillStyle = 'rgba(245,197,66,0.06)'
    ctx.fill()

    // Кривая
    ctx.beginPath()
    ctx.strokeStyle = '#f5c542'
    ctx.lineWidth = 2.5
    ctx.shadowColor = 'rgba(245,197,66,0.3)'
    ctx.shadowBlur = 6
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) ctx.moveTo(pts[i].x, pts[i].y)
      else ctx.lineTo(pts[i].x, pts[i].y)
    }
    ctx.stroke()
    ctx.shadowBlur = 0

    // Маркер частоты среза
    const fcX = graphX + (Math.log10(fc) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq)) * graphW
    const fcY = graphY + graphH - ((calcFilterResponse(fc, type, fc, slope, resonance, gain) - minDb) / (maxDb - minDb)) * graphH

    ctx.fillStyle = 'rgba(245,197,66,0.08)'
    ctx.fillRect(fcX - 1, graphY, 2, graphH)

    ctx.fillStyle = '#f5c542'
    ctx.font = 'bold 6px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    const freqText = fc >= 1000 ? `${(fc/1000).toFixed(0)}k` : `${fc}`
    ctx.fillText(`▼ ${freqText} Гц`, fcX, graphY - 2)

    // === Информация ===
    const infoY = graphY + graphH + 22
    const typeLabel = filterTypes.find(t => t.id === type)?.label || type.toUpperCase()
    const typeDesc = filterTypes.find(t => t.id === type)?.desc || ''

    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 22, 4)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '7px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${typeLabel} · ${slope} dB/oct · Q=${resonance.toFixed(1)}`, graphX + 8, infoY + 11)

    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.textAlign = 'right'
    ctx.fillText(typeDesc, graphX + graphW - 8, infoY + 11)

    // === Частота среза (вторая) ===
    const fcDisplay = params.frequency
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`Частота среза: ${fcDisplay >= 1000 ? (fcDisplay/1000).toFixed(1) + ' кГц' : fcDisplay + ' Гц'}`, 8, H - 4)

    // === Название фильтра ===
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(typeLabel, W - 12, H - 4)

  }, [params, calcFilterResponse])

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

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof FilterParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ИЗМЕНЕНИЕ ТИПА =====
  const setType = useCallback((type: 'hpf' | 'lpf' | 'bpf' | 'notch' | 'shelf') => {
    setCurrentType(type)
    setParams(prev => ({ ...prev, type }))
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setCurrentType('hpf')
    setParams({
      type: 'hpf',
      frequency: 80,
      slope: 12,
      resonance: 1,
      gain: 0
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Filter Visualizer
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

      {/* Выбор типа фильтра */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {filterTypes.map(f => (
          <button
            key={f.id}
            onClick={() => setType(f.id as any)}
            style={{
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '0.5rem',
              fontWeight: 600,
              border: currentType === f.id ? '2px solid rgba(245,197,66,0.4)' : '1px solid rgba(255,255,255,0.06)',
              background: currentType === f.id ? 'rgba(245,197,66,0.1)' : 'rgba(255,255,255,0.03)',
              color: currentType === f.id ? '#f5c542' : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit'
            }}
          >
            {f.label}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Cutoff</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>
              {params.frequency >= 1000 ? (params.frequency/1000).toFixed(0) + 'k' : params.frequency} Гц
            </span>
          </div>
          <input
            type="range" min="10" max="20000" step="1"
            value={params.frequency}
            onChange={(e) => updateParam('frequency', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Slope</span>
            <span style={{ fontSize: '0.55rem', color: '#50c878' }}>{params.slope} dB/oct</span>
          </div>
          <input
            type="range" min="6" max="48" step="6"
            value={params.slope}
            onChange={(e) => updateParam('slope', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Resonance (Q)</span>
            <span style={{ fontSize: '0.55rem', color: '#f5c542' }}>{params.resonance.toFixed(1)}</span>
          </div>
          <input
            type="range" min="0" max="10" step="0.1"
            value={params.resonance}
            onChange={(e) => updateParam('resonance', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #f5c542, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        {params.type === 'shelf' && (
          <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.4rem', color: '#666' }}>Shelf Gain</span>
              <span style={{ fontSize: '0.55rem', color: '#ff8c42' }}>{params.gain > 0 ? '+' : ''}{params.gain} dB</span>
            </div>
            <input
              type="range" min="-12" max="12" step="0.5"
              value={params.gain}
              onChange={(e) => updateParam('gain', parseFloat(e.target.value))}
              style={{
                width: '100%',
                height: '2px',
                appearance: 'none',
                background: 'linear-gradient(to right, #ff8c42, rgba(255,255,255,0.07))',
                cursor: 'pointer'
              }}
            />
          </div>
        )}
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
        📊 Визуализация частотной характеристики фильтра в реальном времени
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default FilterWidget