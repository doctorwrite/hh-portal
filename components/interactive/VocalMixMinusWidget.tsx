// components/interactive/VocalMixMinusWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface VocalMixParams {
  vocalGain: number
  minusGain: number
  eqLow: number
  eqMid: number
  eqHigh: number
  compRatio: number
  compThreshold: number
  reverbMix: number
  delayMix: number
}

const VocalMixMinusWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<VocalMixParams>({
    vocalGain: 0,
    minusGain: -3,
    eqLow: 0,
    eqMid: 0,
    eqHigh: 0,
    compRatio: 3,
    compThreshold: -12,
    reverbMix: 20,
    delayMix: 15,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [signalLevel, setSignalLevel] = useState({ vocal: 0, minus: 0, master: 0 })
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const presets: Record<string, Partial<VocalMixParams>> = {
    'Рэп': { vocalGain: 0, minusGain: -4, eqLow: 0, eqMid: 3, eqHigh: 2, compRatio: 4, compThreshold: -14, reverbMix: 10, delayMix: 15 },
    'Поп': { vocalGain: 0, minusGain: -3, eqLow: -2, eqMid: 4, eqHigh: 3, compRatio: 3, compThreshold: -12, reverbMix: 25, delayMix: 20 },
    'Рок': { vocalGain: 0, minusGain: -3, eqLow: 2, eqMid: 2, eqHigh: 2, compRatio: 4, compThreshold: -15, reverbMix: 15, delayMix: 10 },
    'Акустика': { vocalGain: 0, minusGain: -4, eqLow: -1, eqMid: 2, eqHigh: 3, compRatio: 2, compThreshold: -10, reverbMix: 30, delayMix: 15 },
    'Электроника': { vocalGain: 0, minusGain: -3, eqLow: -1, eqMid: 5, eqHigh: 4, compRatio: 4, compThreshold: -14, reverbMix: 25, delayMix: 25 },
  }

  // ===== СИМУЛЯЦИЯ СИГНАЛА =====
  const simulate = useCallback(() => {
    const vocalBase = 0.2 + 0.3 * Math.sin(timeRef.current * 0.3) + 0.2 * Math.sin(timeRef.current * 0.7)
    const vocalGainFactor = Math.pow(10, params.vocalGain / 20)
    const vocalLevel = Math.min(1, vocalBase * vocalGainFactor * 1.2)

    const minusBase = 0.3 + 0.3 * Math.sin(timeRef.current * 0.2 + 1) + 0.2 * Math.sin(timeRef.current * 0.5 + 2)
    const minusGainFactor = Math.pow(10, params.minusGain / 20)
    const minusLevel = Math.min(1, minusBase * minusGainFactor * 1.2)

    const masterLevel = Math.min(1, vocalLevel * 0.7 + minusLevel * 0.5)

    setSignalLevel({ vocal: vocalLevel, minus: minusLevel, master: masterLevel })
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
    const graphH = 90
    const graphX = margin
    const graphY = 24

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('🎤 Сведение вокала с минусом', margin, 2)

    // === Волна ===
    const centerY = graphY + graphH / 2
    const steps = 200
    const vocalAmp = signalLevel.vocal * 35
    const minusAmp = signalLevel.minus * 25

    // Волна вокала (жёлтая)
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      const val = Math.sin(t) * 0.4 + Math.sin(t * 2 + 0.3) * 0.15 + Math.sin(t * 3 + 0.7) * 0.05
      const y = centerY - val * vocalAmp
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#f5c542'
    ctx.lineWidth = 2
    ctx.shadowColor = 'rgba(245,197,66,0.3)'
    ctx.shadowBlur = 6
    ctx.stroke()
    ctx.shadowBlur = 0

    // Волна минуса (синяя)
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      const val = Math.sin(t * 1.2 + 0.5) * 0.3 + Math.sin(t * 2.4 + 1) * 0.1
      const y = centerY - val * minusAmp
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#4a9eff'
    ctx.lineWidth = 1.5
    ctx.shadowColor = 'rgba(74,158,255,0.2)'
    ctx.shadowBlur = 4
    ctx.stroke()
    ctx.shadowBlur = 0

    // === Легенда ===
    const legendY = graphY + graphH + 6
    const legendItems = [
      { label: 'Вокал', color: '#f5c542' },
      { label: 'Минус', color: '#4a9eff' },
      { label: 'Мастер', color: '#50c878' },
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
      legendX += 60
    }

    // === VU-метры ===
    const meterX = graphX
    const meterY = legendY + 14
    const meterW = graphW
    const meterH = 6

    // Vocal
    const vocalX = meterX
    const vocalW = meterW * 0.3
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(vocalX, meterY, vocalW, meterH)
    const vocalGrad = ctx.createLinearGradient(0, 0, vocalW, 0)
    vocalGrad.addColorStop(0, '#f5c542')
    vocalGrad.addColorStop(0.7, '#f5c542')
    vocalGrad.addColorStop(1, '#ff6b6b')
    ctx.fillStyle = vocalGrad
    ctx.fillRect(vocalX, meterY, signalLevel.vocal * vocalW, meterH)

    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillText('Вокал', vocalX, meterY - 1)

    // Minus
    const minusX = vocalX + vocalW + 4
    const minusW = meterW * 0.3
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(minusX, meterY, minusW, meterH)
    const minusGrad = ctx.createLinearGradient(0, 0, minusW, 0)
    minusGrad.addColorStop(0, '#4a9eff')
    minusGrad.addColorStop(0.7, '#4a9eff')
    minusGrad.addColorStop(1, '#ff6b6b')
    ctx.fillStyle = minusGrad
    ctx.fillRect(minusX, meterY, signalLevel.minus * minusW, meterH)

    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.textAlign = 'left'
    ctx.fillText('Минус', minusX, meterY - 1)

    // Master
    const masterX = minusX + minusW + 4
    const masterW = meterW * 0.3
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(masterX, meterY, masterW, meterH)
    const masterGrad = ctx.createLinearGradient(0, 0, masterW, 0)
    masterGrad.addColorStop(0, '#50c878')
    masterGrad.addColorStop(0.7, '#f5c542')
    masterGrad.addColorStop(1, '#ff6b6b')
    ctx.fillStyle = masterGrad
    ctx.fillRect(masterX, meterY, signalLevel.master * masterW, meterH)

    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.textAlign = 'left'
    ctx.fillText('Мастер', masterX, meterY - 1)

    // === Информация ===
    const infoY = meterY + meterH + 10
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 4)
    ctx.fill()

    const vocalDb = Math.round(20 * Math.log10(signalLevel.vocal + 0.001))
    const minusDb = Math.round(20 * Math.log10(signalLevel.minus + 0.001))
    const masterDb = Math.round(20 * Math.log10(signalLevel.master + 0.001))

    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      `Вокал: ${vocalDb} dB  |  Минус: ${minusDb} dB  |  Мастер: ${masterDb} dB`,
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
      canvas.height = Math.min(200, w * 0.25)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ ПАРАМЕТРОВ =====
  useEffect(() => {
    renderWidget()
  }, [params, renderWidget])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof VocalMixParams, value: number) => {
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
      vocalGain: 0,
      minusGain: -3,
      eqLow: 0,
      eqMid: 0,
      eqHigh: 0,
      compRatio: 3,
      compThreshold: -12,
      reverbMix: 20,
      delayMix: 15,
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Vocal Mix Minus
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
        gap: '5px',
        marginBottom: '10px'
      }}>
        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Vocal Gain</span>
            <span style={{ fontSize: '0.45rem', color: '#f5c542' }}>{params.vocalGain > 0 ? '+' : ''}{params.vocalGain} dB</span>
          </div>
          <input
            type="range" min="-12" max="6" step="0.5"
            value={params.vocalGain}
            onChange={(e) => updateParam('vocalGain', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Minus Gain</span>
            <span style={{ fontSize: '0.45rem', color: '#4a9eff' }}>{params.minusGain > 0 ? '+' : ''}{params.minusGain} dB</span>
          </div>
          <input
            type="range" min="-12" max="6" step="0.5"
            value={params.minusGain}
            onChange={(e) => updateParam('minusGain', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>EQ Low</span>
            <span style={{ fontSize: '0.45rem', color: '#ff6b6b' }}>{params.eqLow > 0 ? '+' : ''}{params.eqLow} dB</span>
          </div>
          <input
            type="range" min="-6" max="6" step="0.5"
            value={params.eqLow}
            onChange={(e) => updateParam('eqLow', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>EQ Mid</span>
            <span style={{ fontSize: '0.45rem', color: '#f5c542' }}>{params.eqMid > 0 ? '+' : ''}{params.eqMid} dB</span>
          </div>
          <input
            type="range" min="-6" max="6" step="0.5"
            value={params.eqMid}
            onChange={(e) => updateParam('eqMid', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>EQ High</span>
            <span style={{ fontSize: '0.45rem', color: '#da70d6' }}>{params.eqHigh > 0 ? '+' : ''}{params.eqHigh} dB</span>
          </div>
          <input
            type="range" min="-6" max="6" step="0.5"
            value={params.eqHigh}
            onChange={(e) => updateParam('eqHigh', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #da70d6, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Comp Ratio</span>
            <span style={{ fontSize: '0.45rem', color: '#50c878' }}>{params.compRatio}:1</span>
          </div>
          <input
            type="range" min="1" max="6" step="0.5"
            value={params.compRatio}
            onChange={(e) => updateParam('compRatio', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Comp Th</span>
            <span style={{ fontSize: '0.45rem', color: '#ff6b6b' }}>{params.compThreshold} dB</span>
          </div>
          <input
            type="range" min="-24" max="0" step="0.5"
            value={params.compThreshold}
            onChange={(e) => updateParam('compThreshold', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Reverb</span>
            <span style={{ fontSize: '0.45rem', color: '#c77dff' }}>{params.reverbMix}%</span>
          </div>
          <input
            type="range" min="0" max="50" step="1"
            value={params.reverbMix}
            onChange={(e) => updateParam('reverbMix', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #c77dff, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Delay</span>
            <span style={{ fontSize: '0.45rem', color: '#ff8c42' }}>{params.delayMix}%</span>
          </div>
          <input
            type="range" min="0" max="40" step="1"
            value={params.delayMix}
            onChange={(e) => updateParam('delayMix', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #ff8c42, rgba(255,255,255,0.07))',
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
        🎤 Настройте баланс, EQ, компрессию и эффекты для сведения голоса с минусом
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default VocalMixMinusWidget