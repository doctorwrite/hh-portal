// components/interactive/ParallelCompressionWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ParallelCompParams {
  dryGain: number
  compGain: number
  blend: number
  ratio: number
  threshold: number
  attack: number
  release: number
}

const ParallelCompressionWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<ParallelCompParams>({
    dryGain: 0,
    compGain: -6,
    blend: 50,
    ratio: 6,
    threshold: -24,
    attack: 5,
    release: 100,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [signalLevel, setSignalLevel] = useState({ dry: 0, compressed: 0, mixed: 0 })
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const presets: Record<string, Partial<ParallelCompParams>> = {
    'Барабаны': { ratio: 8, threshold: -28, attack: 3, release: 60, blend: 50 },
    'Басс': { ratio: 6, threshold: -24, attack: 10, release: 150, blend: 40 },
    'Вокал': { ratio: 4, threshold: -20, attack: 15, release: 120, blend: 30 },
    'Шина микса': { ratio: 3, threshold: -16, attack: 20, release: 200, blend: 40 },
    'Рок (агрессивный)': { ratio: 10, threshold: -30, attack: 2, release: 50, blend: 50 },
  }

  // ===== СИМУЛЯЦИЯ =====
  const simulate = useCallback(() => {
    const base = 0.2 + 0.3 * Math.sin(timeRef.current * 0.3) + 0.2 * Math.sin(timeRef.current * 0.7)
    const base2 = 0.15 + 0.25 * Math.sin(timeRef.current * 0.4 + 1) + 0.2 * Math.sin(timeRef.current * 0.6 + 2)

    const dryGainFactor = Math.pow(10, params.dryGain / 20)
    const compGainFactor = Math.pow(10, params.compGain / 20)
    const blendFactor = params.blend / 100

    const dryLevel = Math.min(1, base * dryGainFactor * 1.2)
    const compLevel = Math.min(1, base2 * compGainFactor * 1.5)

    const mixedLevel = dryLevel * (1 - blendFactor) + compLevel * blendFactor

    setSignalLevel({ dry: dryLevel, compressed: compLevel, mixed: mixedLevel })
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
    const graphW = W - margin * 2
    const graphH = 70
    const graphX = margin
    const graphY = 22

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('📊 Параллельная компрессия', margin, 2)

    // === Волны ===
    const centerY = graphY + graphH / 2
    const steps = 200

    const dryAmp = signalLevel.dry * 30
    const compAmp = signalLevel.compressed * 25
    const mixedAmp = signalLevel.mixed * 32

    // Dry (зелёная)
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      const val = Math.sin(t) * 0.4 + Math.sin(t * 2 + 0.3) * 0.15 + Math.sin(t * 3 + 0.7) * 0.05
      const y = centerY - val * dryAmp
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#50c878'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Compressed (красная)
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      const val = Math.sin(t * 1.2 + 0.5) * 0.35 + Math.sin(t * 2.4 + 1) * 0.12
      const y = centerY - val * compAmp
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#ff6b6b'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Mixed (жёлтая)
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      const val = Math.sin(t) * 0.4 + Math.sin(t * 2 + 0.3) * 0.15 + Math.sin(t * 3 + 0.7) * 0.05
      const mixedVal = val * (1 - params.blend / 100) + (Math.sin(t * 1.2 + 0.5) * 0.35 + Math.sin(t * 2.4 + 1) * 0.12) * (params.blend / 100)
      const y = centerY - mixedVal * mixedAmp
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#f5c542'
    ctx.lineWidth = 2.5
    ctx.shadowColor = 'rgba(245,197,66,0.3)'
    ctx.shadowBlur = 6
    ctx.stroke()
    ctx.shadowBlur = 0

    // === Легенда ===
    const legendY = graphY + graphH + 4
    const legendItems = [
      { label: 'Сухой', color: '#50c878' },
      { label: 'Сжатый', color: '#ff6b6b' },
      { label: 'Микс', color: '#f5c542' },
    ]

    let legendX = graphX
    for (const item of legendItems) {
      ctx.fillStyle = item.color
      ctx.fillRect(legendX, legendY, 10, 3)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(item.label, legendX + 14, legendY + 2)
      legendX += 55
    }

    // === Blend индикатор ===
    const blendY = legendY + 12
    const blendX = graphX
    const blendW = graphW
    const blendH = 6

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.beginPath()
    ctx.roundRect(blendX, blendY, blendW, blendH, 3)
    ctx.fill()

    const blendGrad = ctx.createLinearGradient(blendX, 0, blendX + blendW, 0)
    blendGrad.addColorStop(0, '#50c878')
    blendGrad.addColorStop(0.5, '#f5c542')
    blendGrad.addColorStop(1, '#ff6b6b')
    ctx.fillStyle = blendGrad
    ctx.beginPath()
    ctx.roundRect(blendX, blendY, (params.blend / 100) * blendW, blendH, 3)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(blendX + (params.blend / 100) * blendW, blendY + blendH / 2, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '3px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('Сухой', blendX, blendY + blendH + 2)
    ctx.textAlign = 'right'
    ctx.fillText('Сжатый', blendX + blendW, blendY + blendH + 2)

    // === Информация ===
    const infoY = blendY + blendH + 12
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 4)
    ctx.fill()

    const dryDb = Math.round(20 * Math.log10(signalLevel.dry + 0.001))
    const compDb = Math.round(20 * Math.log10(signalLevel.compressed + 0.001))
    const mixedDb = Math.round(20 * Math.log10(signalLevel.mixed + 0.001))
    const grDb = Math.round(20 * Math.log10((signalLevel.compressed + 0.001) / (signalLevel.dry + 0.001)))

    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      `Dry: ${dryDb} dB  |  Comp: ${compDb} dB  |  GR: -${Math.abs(grDb)} dB  |  Mixed: ${mixedDb} dB`,
      graphX + graphW / 2,
      infoY + 7
    )

  }, [signalLevel, params])

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
      canvas.height = Math.min(180, w * 0.22)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ ПАРАМЕТРОВ =====
  useEffect(() => {
    renderWidget()
  }, [params, renderWidget])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof ParallelCompParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ЗАГРУЗКА ПРЕСЕТА =====
  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) {
      setParams(prev => ({ ...prev, ...preset }))
    }
  }, [])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setParams({
      dryGain: 0,
      compGain: -6,
      blend: 50,
      ratio: 6,
      threshold: -24,
      attack: 5,
      release: 100,
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Parallel Compressor
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
              fontSize: '0.45rem',
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(75px, 1fr))',
        gap: '4px',
        marginBottom: '10px'
      }}>
        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Dry</span>
            <span style={{ fontSize: '0.45rem', color: '#50c878' }}>{params.dryGain > 0 ? '+' : ''}{params.dryGain} dB</span>
          </div>
          <input
            type="range" min="-12" max="6" step="0.5"
            value={params.dryGain}
            onChange={(e) => updateParam('dryGain', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #50c878, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Comp</span>
            <span style={{ fontSize: '0.45rem', color: '#ff6b6b' }}>{params.compGain > 0 ? '+' : ''}{params.compGain} dB</span>
          </div>
          <input
            type="range" min="-24" max="6" step="0.5"
            value={params.compGain}
            onChange={(e) => updateParam('compGain', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #ff6b6b, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Blend</span>
            <span style={{ fontSize: '0.45rem', color: '#f5c542' }}>{params.blend}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.blend}
            onChange={(e) => updateParam('blend', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #f5c542, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Ratio</span>
            <span style={{ fontSize: '0.45rem', color: '#4a9eff' }}>{params.ratio}:1</span>
          </div>
          <input
            type="range" min="1" max="12" step="0.5"
            value={params.ratio}
            onChange={(e) => updateParam('ratio', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #4a9eff, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Threshold</span>
            <span style={{ fontSize: '0.45rem', color: '#ff6b6b' }}>{params.threshold} dB</span>
          </div>
          <input
            type="range" min="-40" max="0" step="1"
            value={params.threshold}
            onChange={(e) => updateParam('threshold', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #ff6b6b, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Attack</span>
            <span style={{ fontSize: '0.45rem', color: '#50c878' }}>{params.attack} ms</span>
          </div>
          <input
            type="range" min="0.1" max="50" step="0.5"
            value={params.attack}
            onChange={(e) => updateParam('attack', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #50c878, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Release</span>
            <span style={{ fontSize: '0.45rem', color: '#da70d6' }}>{params.release} ms</span>
          </div>
          <input
            type="range" min="10" max="400" step="5"
            value={params.release}
            onChange={(e) => updateParam('release', parseInt(e.target.value))}
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

      <div style={{ textAlign: 'center', fontSize: '0.4rem', color: '#555', padding: '4px 0' }}>
        📊 Сухой + Сжатый = Плотность без потери динамики
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default ParallelCompressionWidget