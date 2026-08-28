// components/interactive/VocalEQWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface EQBand {
  freq: number
  gain: number
  q: number
}

interface VocalEQParams {
  type: 'male' | 'female' | 'child'
  hpf: number
  bands: EQBand[]
}

const VocalEQWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<VocalEQParams>({
    type: 'male',
    hpf: 80,
    bands: [
      { freq: 250, gain: -3, q: 1.2 },
      { freq: 1000, gain: -2, q: 1.0 },
      { freq: 3500, gain: 4, q: 1.2 },
      { freq: 10000, gain: 2, q: 0.6 },
    ]
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)
  const [selectedBand, setSelectedBand] = useState<number | null>(null)

  const presets: Record<string, { hpf: number; bands: EQBand[] }> = {
    'Мужской (бас)': {
      hpf: 80,
      bands: [
        { freq: 200, gain: 2, q: 1.0 },
        { freq: 350, gain: -3, q: 1.2 },
        { freq: 2500, gain: 3, q: 1.0 },
        { freq: 10000, gain: 2, q: 0.6 },
      ]
    },
    'Мужской (тенор)': {
      hpf: 100,
      bands: [
        { freq: 300, gain: -3, q: 1.2 },
        { freq: 1000, gain: -2, q: 1.0 },
        { freq: 4000, gain: 4, q: 1.2 },
        { freq: 12000, gain: 2, q: 0.6 },
      ]
    },
    'Женский (сопрано)': {
      hpf: 120,
      bands: [
        { freq: 250, gain: -3, q: 1.2 },
        { freq: 800, gain: -2, q: 1.0 },
        { freq: 4000, gain: 4, q: 1.2 },
        { freq: 12000, gain: 3, q: 0.6 },
      ]
    },
    'Женский (контральто)': {
      hpf: 100,
      bands: [
        { freq: 200, gain: 2, q: 1.0 },
        { freq: 300, gain: -3, q: 1.2 },
        { freq: 3500, gain: 3, q: 1.0 },
        { freq: 10000, gain: 2, q: 0.6 },
      ]
    },
    'Детский': {
      hpf: 120,
      bands: [
        { freq: 350, gain: -3, q: 1.2 },
        { freq: 1000, gain: -1, q: 1.0 },
        { freq: 4000, gain: 4, q: 1.2 },
        { freq: 12000, gain: 3, q: 0.6 },
      ]
    },
  }

  // ===== РАСЧЁТ ЧАСТОТНОЙ ХАРАКТЕРИСТИКИ =====
  const calcResponse = useCallback((freq: number): number => {
    let response = 0

    // HPF
    const hpfFreq = params.hpf
    if (freq < hpfFreq) {
      const ratio = freq / hpfFreq
      const n = 2 // 12 dB/oct
      const r = 1 / (1 + Math.pow(1 / ratio, 2 * n))
      response += 20 * Math.log10(Math.sqrt(r))
    }

    // Полосы
    for (const band of params.bands) {
      const f = band.freq
      const g = band.gain
      const q = band.q

      const ratio = freq / f
      const a = Math.pow(10, g / 40)
      const w = ratio - 1 / ratio
      const h = w * w * q * q
      const peakGain = 20 * Math.log10((1 + h) / (1 + h / (a * a)))
      response += peakGain
    }

    return Math.max(-30, Math.min(20, response))
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

    const margin = 12
    const graphX = margin
    const graphY = 20
    const graphW = W - margin * 2
    const graphH = H - 50

    const minFreq = 20
    const maxFreq = 20000
    const minDb = -20
    const maxDb = 15

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    const typeLabels = { male: 'Мужской', female: 'Женский', child: 'Детский' }
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`🎛️ EQ для вокала — ${typeLabels[params.type]} голос`, margin, 2)

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
    for (let db = -15; db <= 10; db += 5) {
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

    // === Нулевая линия ===
    const zeroY = graphY + graphH - ((0 - minDb) / (maxDb - minDb)) * graphH
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(graphX, zeroY)
    ctx.lineTo(graphX + graphW, zeroY)
    ctx.stroke()
    ctx.setLineDash([])

    // === Метки ===
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (const f of gridFreqs) {
      const x = graphX + (Math.log10(f) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq)) * graphW
      ctx.fillText(f >= 1000 ? `${f/1000}k` : `${f}`, x, graphY + graphH + 2)
    }
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let db = -15; db <= 10; db += 5) {
      const y = graphY + graphH - ((db - minDb) / (maxDb - minDb)) * graphH
      ctx.fillText(`${db}`, graphX - 4, y)
    }

    // === Кривая ===
    const steps = 300
    const pts: { x: number; y: number }[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const freq = Math.pow(10, Math.log10(minFreq) + t * (Math.log10(maxFreq) - Math.log10(minFreq)))
      const response = calcResponse(freq)
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

    // === Точки ===
    for (let i = 0; i < params.bands.length; i++) {
      const band = params.bands[i]
      const t = (Math.log10(band.freq) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq))
      const x = graphX + t * graphW
      const response = calcResponse(band.freq)
      const y = graphY + graphH - ((Math.max(minDb, Math.min(maxDb, response)) - minDb) / (maxDb - minDb)) * graphH

      const isSelected = selectedBand === i
      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 8 : 6, 0, Math.PI * 2)
      ctx.fillStyle = isSelected ? '#fff' : '#f5c542'
      ctx.fill()
      ctx.strokeStyle = isSelected ? '#f5c542' : 'rgba(255,255,255,0.3)'
      ctx.lineWidth = isSelected ? 2 : 1
      ctx.stroke()

      // Номер полосы
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(`${i+1}`, x, y - 10)
    }

    // === Информация ===
    const infoY = graphY + graphH + 18
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 4)
    ctx.fill()

    const hpfText = `HPF: ${params.hpf} Гц`
    const bandsText = params.bands.map((b, i) => `${i+1}: ${b.freq >= 1000 ? (b.freq/1000).toFixed(0)+'k' : b.freq} Гц ${b.gain > 0 ? '+' : ''}${b.gain} дБ`).join('  ')

    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${hpfText}  |  ${bandsText}`, graphX + graphW / 2, infoY + 7)

  }, [params, selectedBand, calcResponse])

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

  // ===== ПРИ ИЗМЕНЕНИИ =====
  useEffect(() => {
    renderWidget()
  }, [params, selectedBand, renderWidget])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateBand = useCallback((index: number, updates: Partial<EQBand>) => {
    setParams(prev => ({
      ...prev,
      bands: prev.bands.map((b, i) => i === index ? { ...b, ...updates } : b)
    }))
  }, [])

  const updateHpf = useCallback((value: number) => {
    setParams(prev => ({ ...prev, hpf: value }))
  }, [])

  const setType = useCallback((type: 'male' | 'female' | 'child') => {
    setParams(prev => ({ ...prev, type }))
  }, [])

  // ===== ЗАГРУЗКА ПРЕСЕТА =====
  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) {
      const type = name.includes('Мужской') ? 'male' : name.includes('Женский') ? 'female' : 'child'
      setParams({
        type: type as any,
        hpf: preset.hpf,
        bands: preset.bands,
      })
      setSelectedBand(null)
    }
  }, [])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setParams({
      type: 'male',
      hpf: 80,
      bands: [
        { freq: 250, gain: -3, q: 1.2 },
        { freq: 1000, gain: -2, q: 1.0 },
        { freq: 3500, gain: 4, q: 1.2 },
        { freq: 10000, gain: 2, q: 0.6 },
      ]
    })
    setSelectedBand(null)
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Vocal EQ
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

      {/* Тип голоса */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        <button
          onClick={() => setType('male')}
          style={{
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '0.5rem',
            fontWeight: 600,
            border: params.type === 'male' ? '2px solid rgba(245,197,66,0.4)' : '1px solid rgba(255,255,255,0.06)',
            background: params.type === 'male' ? 'rgba(245,197,66,0.1)' : 'rgba(255,255,255,0.03)',
            color: params.type === 'male' ? '#f5c542' : '#888',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          👨 Мужской
        </button>
        <button
          onClick={() => setType('female')}
          style={{
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '0.5rem',
            fontWeight: 600,
            border: params.type === 'female' ? '2px solid rgba(245,197,66,0.4)' : '1px solid rgba(255,255,255,0.06)',
            background: params.type === 'female' ? 'rgba(245,197,66,0.1)' : 'rgba(255,255,255,0.03)',
            color: params.type === 'female' ? '#f5c542' : '#888',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          👩 Женский
        </button>
        <button
          onClick={() => setType('child')}
          style={{
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '0.5rem',
            fontWeight: 600,
            border: params.type === 'child' ? '2px solid rgba(245,197,66,0.4)' : '1px solid rgba(255,255,255,0.06)',
            background: params.type === 'child' ? 'rgba(245,197,66,0.1)' : 'rgba(255,255,255,0.03)',
            color: params.type === 'child' ? '#f5c542' : '#888',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          👶 Детский
        </button>
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

      {/* Параметры */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
        gap: '4px',
        marginBottom: '10px'
      }}>
        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>HPF</span>
            <span style={{ fontSize: '0.45rem', color: '#4a9eff' }}>{params.hpf} Гц</span>
          </div>
          <input
            type="range" min="20" max="200" step="5"
            value={params.hpf}
            onChange={(e) => updateHpf(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #4a9eff, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        {params.bands.map((band, i) => {
          const bandNames = ['Низ', 'Низ-Сред', 'Сред', 'Верх']
          return (
            <div key={i} style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.35rem', color: '#666' }}>{bandNames[i] || i+1}</span>
                <span style={{ fontSize: '0.45rem', color: '#f5c542' }}>{band.gain > 0 ? '+' : ''}{band.gain} дБ</span>
              </div>
              <input
                type="range" min="-12" max="12" step="0.5"
                value={band.gain}
                onChange={(e) => updateBand(i, { gain: parseFloat(e.target.value) })}
                onMouseEnter={() => setSelectedBand(i)}
                onMouseLeave={() => setSelectedBand(null)}
                style={{
                  width: '100%',
                  height: '2px',
                  appearance: 'none',
                  background: 'linear-gradient(to right, #f5c542, rgba(255,255,255,0.07))',
                  cursor: 'pointer'
                }}
              />
            </div>
          )
        })}
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
        🎛️ Настройте EQ под голос — частота, усиление, Q
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default VocalEQWidget