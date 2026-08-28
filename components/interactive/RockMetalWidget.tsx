// components/interactive/RockMetalWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface RockMetalParams {
  guitarGain: number
  guitarWidth: number
  drumPunch: number
  bassDensity: number
  vocalAggression: number
  mixDensity: number
}

const RockMetalWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<RockMetalParams>({
    guitarGain: 45,
    guitarWidth: 85,
    drumPunch: 65,
    bassDensity: 60,
    vocalAggression: 50,
    mixDensity: 50,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const presets: Record<string, RockMetalParams> = {
    'Хард-рок': { guitarGain: 35, guitarWidth: 80, drumPunch: 55, bassDensity: 55, vocalAggression: 40, mixDensity: 45 },
    'Трэш-метал': { guitarGain: 60, guitarWidth: 90, drumPunch: 75, bassDensity: 70, vocalAggression: 70, mixDensity: 65 },
    'Прогрессив': { guitarGain: 45, guitarWidth: 85, drumPunch: 60, bassDensity: 50, vocalAggression: 50, mixDensity: 50 },
    'Дум-метал': { guitarGain: 50, guitarWidth: 75, drumPunch: 50, bassDensity: 85, vocalAggression: 35, mixDensity: 60 },
    'Ню-метал': { guitarGain: 55, guitarWidth: 85, drumPunch: 70, bassDensity: 65, vocalAggression: 60, mixDensity: 55 },
  }

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

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('🎸 Рок / Металл — микс', margin, 2)

    // === Визуализация ===
    const centerY = graphY + graphH / 2
    const steps = 200

    // Параметры
    const gGain = params.guitarGain / 100
    const gWidth = params.guitarWidth / 100
    const dPunch = params.drumPunch / 100
    const bDensity = params.bassDensity / 100
    const vAgg = params.vocalAggression / 100
    const mDensity = params.mixDensity / 100

    // === Гитары (левая и правая) ===
    // Левая
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      let val = Math.sin(t * 1.2 + 0.3) * 0.35 + Math.sin(t * 2.4 + 0.7) * 0.12
      // Gain влияет на амплитуду
      val *= (0.7 + gGain * 0.5)
      const y = centerY - val * 20 * (1 + gGain * 0.5)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = `rgba(200,100,100,${0.3 + gGain * 0.4})`
    ctx.lineWidth = 2
    ctx.stroke()

    // Правая
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      let val = Math.sin(t * 1.2 + 0.3 + 0.5) * 0.35 + Math.sin(t * 2.4 + 0.7 + 0.5) * 0.12
      val *= (0.7 + gGain * 0.5)
      const y = centerY - val * 20 * (1 + gGain * 0.5)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = `rgba(200,100,100,${0.3 + gGain * 0.4})`
    ctx.lineWidth = 2
    ctx.stroke()

    // Ширина гитар (заливка между ними)
    const widthOffset = gWidth * 15
    ctx.fillStyle = `rgba(200,100,100,${0.02 + gWidth * 0.04})`
    ctx.fillRect(graphX + widthOffset, centerY - 15, graphW - widthOffset * 2, 30)

    // === Барабаны (удары) ===
    const punchIntensity = 0.3 + dPunch * 0.6
    for (let i = 0; i < 20; i++) {
      const x = graphX + (i / 20) * graphW + Math.random() * 10
      const y = centerY + (Math.random() - 0.5) * 20 * punchIntensity * 2
      const size = 3 + dPunch * 4
      const alpha = 0.1 + dPunch * 0.2
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,200,50,${alpha})`
      ctx.fill()
    }

    // === Бас (плотность) ===
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      const val = Math.sin(t * 0.8 + 0.5) * 0.25 * (0.5 + bDensity * 0.8)
      const y = centerY + 30 - val * 15 * (0.5 + bDensity * 0.8)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = `rgba(100,150,255,${0.2 + bDensity * 0.4})`
    ctx.lineWidth = 3 + bDensity * 3
    ctx.stroke()

    // === Вокал (агрессия) ===
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      const val = Math.sin(t * 1.5 + 0.2) * 0.3 + Math.sin(t * 3 + 0.8) * 0.1
      const aggression = 0.5 + vAgg * 0.8
      const y = centerY - 30 - val * 15 * aggression
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = `rgba(255,200,100,${0.2 + vAgg * 0.3})`
    ctx.lineWidth = 2 + vAgg * 2
    ctx.stroke()

    // === Плотность микса (общая заливка) ===
    const densityAlpha = 0.02 + mDensity * 0.04
    ctx.fillStyle = `rgba(100,100,100,${densityAlpha})`
    ctx.fillRect(graphX, centerY - 20 * (0.5 + mDensity * 0.5), graphW, 40 * (0.5 + mDensity * 0.5))

    // === Легенда ===
    const legendY = graphY + graphH + 4
    const legendItems = [
      { label: 'Гитары L/R', color: 'rgba(200,100,100,0.5)' },
      { label: 'Барабаны', color: 'rgba(255,200,50,0.5)' },
      { label: 'Бас', color: 'rgba(100,150,255,0.5)' },
      { label: 'Вокал', color: 'rgba(255,200,100,0.5)' },
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
      legendX += 65
    }

    // === Информация ===
    const infoY = legendY + 12
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 4)
    ctx.fill()

    const infoText = `Gain: ${params.guitarGain}%  |  Width: ${params.guitarWidth}%  |  Punch: ${params.drumPunch}%  |  Bass: ${params.bassDensity}%  |  Vocals: ${params.vocalAggression}%  |  Density: ${params.mixDensity}%`

    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(infoText, graphX + graphW / 2, infoY + 7)

  }, [params])

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
  }, [params, renderWidget])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof RockMetalParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ЗАГРУЗКА ПРЕСЕТА =====
  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) {
      setParams(preset)
    }
  }, [])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setParams({
      guitarGain: 45,
      guitarWidth: 85,
      drumPunch: 65,
      bassDensity: 60,
      vocalAggression: 50,
      mixDensity: 50,
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Rock/Metal Mixer
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Guitar Gain</span>
            <span style={{ fontSize: '0.45rem', color: '#ff6b6b' }}>{params.guitarGain}%</span>
          </div>
          <input
            type="range" min="20" max="70" step="1"
            value={params.guitarGain}
            onChange={(e) => updateParam('guitarGain', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Guitar Width</span>
            <span style={{ fontSize: '0.45rem', color: '#da70d6' }}>{params.guitarWidth}%</span>
          </div>
          <input
            type="range" min="50" max="100" step="1"
            value={params.guitarWidth}
            onChange={(e) => updateParam('guitarWidth', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Drum Punch</span>
            <span style={{ fontSize: '0.45rem', color: '#f5c542' }}>{params.drumPunch}%</span>
          </div>
          <input
            type="range" min="20" max="100" step="1"
            value={params.drumPunch}
            onChange={(e) => updateParam('drumPunch', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Bass Density</span>
            <span style={{ fontSize: '0.45rem', color: '#4a9eff' }}>{params.bassDensity}%</span>
          </div>
          <input
            type="range" min="20" max="100" step="1"
            value={params.bassDensity}
            onChange={(e) => updateParam('bassDensity', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Vocal Aggression</span>
            <span style={{ fontSize: '0.45rem', color: '#c77dff' }}>{params.vocalAggression}%</span>
          </div>
          <input
            type="range" min="10" max="90" step="1"
            value={params.vocalAggression}
            onChange={(e) => updateParam('vocalAggression', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Mix Density</span>
            <span style={{ fontSize: '0.45rem', color: '#50c878' }}>{params.mixDensity}%</span>
          </div>
          <input
            type="range" min="20" max="90" step="1"
            value={params.mixDensity}
            onChange={(e) => updateParam('mixDensity', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #50c878, rgba(255,255,255,0.07))',
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
        🎸 Настройте гитарный гейн, ширину, панч барабанов, плотность баса, агрессию вокала и плотность микса
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default RockMetalWidget