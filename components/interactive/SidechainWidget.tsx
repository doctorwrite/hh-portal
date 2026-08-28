// components/interactive/SidechainWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface SidechainParams {
  threshold: number
  ratio: number
  attack: number
  release: number
  triggerGain: number
  targetGain: number
}

const SidechainWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<SidechainParams>({
    threshold: -18,
    ratio: 4,
    attack: 10,
    release: 100,
    triggerGain: 0,
    targetGain: 0,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [signalLevel, setSignalLevel] = useState({ trigger: 0, target: 0, compressed: 0 })
  const [gainReduction, setGainReduction] = useState(0)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const presets: Record<string, Partial<SidechainParams>> = {
    'Бас + бочка (классика)': { threshold: -18, ratio: 4, attack: 10, release: 100 },
    'Насос (pumping)': { threshold: -25, ratio: 8, attack: 3, release: 60 },
    'Мягкий сайд-чейн': { threshold: -12, ratio: 3, attack: 15, release: 150 },
    'Вокал + инструменты': { threshold: -15, ratio: 4, attack: 20, release: 200 },
    'Мастеринг': { threshold: -8, ratio: 2, attack: 30, release: 300 },
  }

  // ===== СИМУЛЯЦИЯ =====
  const simulate = useCallback(() => {
    // Триггер (бочка) — короткие импульсы
    const triggerBase = 0.15 + 0.35 * Math.max(0, Math.sin(timeRef.current * 2.5) * 0.6 + 0.4)
    const triggerLevel = Math.min(1, triggerBase * Math.pow(10, params.triggerGain / 20) * 1.2)

    // Таргет (бас) — непрерывный сигнал с "просадками"
    const targetBase = 0.2 + 0.3 * Math.sin(timeRef.current * 0.5) + 0.15 * Math.sin(timeRef.current * 0.3 + 1)
    const targetRaw = Math.min(1, targetBase * Math.pow(10, params.targetGain / 20) * 1.2)

    // Расчёт GR (Gain Reduction) на основе триггера
    const triggerDb = 20 * Math.log10(triggerLevel + 0.001)
    const thresholdDb = params.threshold
    let gr = 0
    if (triggerDb > thresholdDb) {
      gr = (triggerDb - thresholdDb) * (1 - 1 / params.ratio)
    }
    // Сглаживание (эмуляция Attack/Release)
    const attackFactor = Math.exp(-1 / ((params.attack / 1000) * 60))
    const releaseFactor = Math.exp(-1 / ((params.release / 1000) * 60))
    const factor = gr > gainReduction ? attackFactor : releaseFactor
    const smoothedGr = gainReduction + (gr - gainReduction) * (1 - factor)
    setGainReduction(Math.max(0, smoothedGr))

    // Применяем GR к таргету
    const gainDb = -Math.max(0, smoothedGr)
    const gainFactor = Math.pow(10, gainDb / 20)
    const compressedLevel = Math.min(1, targetRaw * gainFactor)

    setSignalLevel({
      trigger: triggerLevel,
      target: targetRaw,
      compressed: compressedLevel,
    })
  }, [params, gainReduction])

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
    ctx.fillText('🔗 Сайд-чейн компрессия', margin, 2)

    // === Волны ===
    const centerY = graphY + graphH / 2
    const steps = 300

    // Триггер (красная) — короткие импульсы
    const triggerAmp = signalLevel.trigger * 30
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      const val = Math.max(0, Math.sin(t * 2.5) * 0.5 + 0.5) * signalLevel.trigger * 0.6
      const y = centerY - val * 40
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#ff6b6b'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Таргет без сжатия (серая, фон)
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      const val = Math.sin(t * 0.5) * 0.3 + Math.sin(t * 0.3 + 1) * 0.15
      const y = centerY - val * signalLevel.target * 35
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Таргет СЖАТЫЙ (жёлтая)
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      const val = Math.sin(t * 0.5) * 0.3 + Math.sin(t * 0.3 + 1) * 0.15
      const compVal = val * (signalLevel.compressed / (signalLevel.target + 0.001))
      const y = centerY - compVal * 35
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#f5c542'
    ctx.lineWidth = 2.5
    ctx.shadowColor = 'rgba(245,197,66,0.3)'
    ctx.shadowBlur = 6
    ctx.stroke()
    ctx.shadowBlur = 0

    // === Просадки (GR) ===
    if (gainReduction > 0.5) {
      const grDb = Math.min(12, gainReduction)
      const grY = graphY + graphH - 4
      const grH = (grDb / 12) * graphH * 0.3
      ctx.fillStyle = 'rgba(255,107,107,0.08)'
      ctx.fillRect(graphX, grY - grH, graphW, grH)
      ctx.fillStyle = 'rgba(255,107,107,0.15)'
      ctx.fillRect(graphX, grY - grH, graphW, 1)
    }

    // === Легенда ===
    const legendY = graphY + graphH + 4
    const legendItems = [
      { label: 'Триггер (бочка)', color: '#ff6b6b' },
      { label: 'Таргет (сжатый)', color: '#f5c542' },
      { label: 'Таргет (оригинал)', color: 'rgba(255,255,255,0.1)' },
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
      legendX += item.label.length * 5 + 20
    }

    // === GR индикатор ===
    const grY = legendY + 10
    const grX = graphX
    const grW = graphW
    const grH = 6

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.beginPath()
    ctx.roundRect(grX, grY, grW, grH, 3)
    ctx.fill()

    const grPercent = Math.min(1, gainReduction / 12)
    const grGrad = ctx.createLinearGradient(0, 0, grW, 0)
    grGrad.addColorStop(0, '#50c878')
    grGrad.addColorStop(0.5, '#f5c542')
    grGrad.addColorStop(1, '#ff6b6b')
    ctx.fillStyle = grGrad
    ctx.beginPath()
    ctx.roundRect(grX, grY, grPercent * grW, grH, 3)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '3px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('Gain Reduction', grX, grY + grH + 2)

    // === Информация ===
    const infoY = grY + grH + 12
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 4)
    ctx.fill()

    const triggerDb = Math.round(20 * Math.log10(signalLevel.trigger + 0.001))
    const targetDb = Math.round(20 * Math.log10(signalLevel.target + 0.001))
    const compDb = Math.round(20 * Math.log10(signalLevel.compressed + 0.001))

    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      `Триггер: ${triggerDb} dB  |  Таргет: ${targetDb} dB  |  Сжатый: ${compDb} dB  |  GR: -${gainReduction.toFixed(1)} dB`,
      graphX + graphW / 2,
      infoY + 7
    )

  }, [signalLevel, gainReduction])

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
  const updateParam = useCallback((key: keyof SidechainParams, value: number) => {
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
      threshold: -18,
      ratio: 4,
      attack: 10,
      release: 100,
      triggerGain: 0,
      targetGain: 0,
    })
    setGainReduction(0)
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Sidechain Compressor
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
          right: '8px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '0.35rem',
          color: '#888'
        }}>
          🔗 Триггер управляет сжатием таргета
        </div>
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Attack</span>
            <span style={{ fontSize: '0.45rem', color: '#50c878' }}>{params.attack} ms</span>
          </div>
          <input
            type="range" min="1" max="50" step="1"
            value={params.attack}
            onChange={(e) => updateParam('attack', parseInt(e.target.value))}
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

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Trigger</span>
            <span style={{ fontSize: '0.45rem', color: '#ff6b6b' }}>{params.triggerGain > 0 ? '+' : ''}{params.triggerGain} dB</span>
          </div>
          <input
            type="range" min="-12" max="6" step="0.5"
            value={params.triggerGain}
            onChange={(e) => updateParam('triggerGain', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Target</span>
            <span style={{ fontSize: '0.45rem', color: '#f5c542' }}>{params.targetGain > 0 ? '+' : ''}{params.targetGain} dB</span>
          </div>
          <input
            type="range" min="-12" max="6" step="0.5"
            value={params.targetGain}
            onChange={(e) => updateParam('targetGain', parseFloat(e.target.value))}
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
        🔗 Триггер (бочка) управляет сжатием таргета (бас) — освобождаем место в миксе
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default SidechainWidget