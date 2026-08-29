// components/interactive/BassMixingWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface BassParams {
  eqLow: number
  eqMid: number
  eqHigh: number
  compression: number
  saturation: number
  sidechain: number
  density: number
}

const BassMixingWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<BassParams>({
    eqLow: 50,
    eqMid: 30,
    eqHigh: 40,
    compression: 60,
    saturation: 30,
    sidechain: 40,
    density: 50,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const presets: Record<string, BassParams> = {
    'Рок': { eqLow: 55, eqMid: 25, eqHigh: 45, compression: 65, saturation: 25, sidechain: 35, density: 55 },
    'Металл': { eqLow: 65, eqMid: 20, eqHigh: 50, compression: 75, saturation: 35, sidechain: 45, density: 65 },
    'Поп': { eqLow: 50, eqMid: 30, eqHigh: 40, compression: 55, saturation: 25, sidechain: 30, density: 50 },
    'Хип-хоп': { eqLow: 70, eqMid: 20, eqHigh: 35, compression: 60, saturation: 35, sidechain: 50, density: 60 },
    'Электроника': { eqLow: 60, eqMid: 25, eqHigh: 45, compression: 55, saturation: 20, sidechain: 40, density: 55 },
    'Джаз': { eqLow: 40, eqMid: 35, eqHigh: 30, compression: 45, saturation: 15, sidechain: 20, density: 40 },
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
    const graphH = H - 60

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('🔊 Плотность баса', margin, 2)

    // === Визуализация ===
    const centerY = graphY + graphH / 2
    const steps = 200

    const eqLow = params.eqLow / 100
    const eqMid = params.eqMid / 100
    const eqHigh = params.eqHigh / 100
    const comp = params.compression / 100
    const sat = params.saturation / 100
    const sc = params.sidechain / 100
    const density = params.density / 100

    // === Волна баса ===
    const bassAmp = 20 + density * 20

    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      let val = Math.sin(t * 0.8 + 0.2) * 0.35 + Math.sin(t * 1.6 + 0.5) * 0.12
      // EQ
      val *= (0.7 + eqLow * 0.6)
      // Компрессия (сглаживание пиков)
      const compFactor = 1 - comp * 0.5
      val = Math.min(1, Math.max(-1, val * compFactor))
      // Сатурация (добавление гармоник)
      const satGain = 1 + sat * 0.5
      val = Math.tanh(val * satGain) / Math.tanh(satGain)
      // Сайд-чейн (просадки)
      const scFactor = 1 - sc * 0.3 * (0.5 + 0.5 * Math.sin(t * 4))
      val *= scFactor
      // Плотность
      const densityFactor = 1 + density * 0.3
      const y = centerY - val * bassAmp * densityFactor
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#4a9eff'
    ctx.lineWidth = 3
    ctx.shadowColor = 'rgba(74,158,255,0.3)'
    ctx.shadowBlur = 8
    ctx.stroke()
    ctx.shadowBlur = 0

    // === Бочка (удары) ===
    for (let i = 0; i < 15; i++) {
      const x = graphX + (i / 15) * graphW + Math.random() * 5
      const y = centerY - 25 - Math.random() * 15
      const size = 4 + Math.random() * 4
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,200,50,${0.2 + sc * 0.3})`
      ctx.fill()
    }

    // === Индикатор плотности ===
    const densY = graphY + graphH + 8
    const densX = graphX
    const densW = graphW
    const densH = 8

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.beginPath()
    ctx.roundRect(densX, densY, densW, densH, 4)
    ctx.fill()

    const grad = ctx.createLinearGradient(densX, 0, densX + densW, 0)
    grad.addColorStop(0, '#4a9eff')
    grad.addColorStop(0.5, '#f5c542')
    grad.addColorStop(1, '#ff6b6b')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(densX, densY, (density) * densW, densH, 4)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('Тонкий', densX, densY + densH + 2)
    ctx.textAlign = 'right'
    ctx.fillText('Плотный', densX + densW, densY + densH + 2)

    // === Информация ===
    const infoY = densY + densH + 10
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 4)
    ctx.fill()

    const infoText = `EQ: ${params.eqLow}%  |  Comp: ${params.compression}%  |  Sat: ${params.saturation}%  |  SC: ${params.sidechain}%  |  Density: ${params.density}%`

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
  const updateParam = useCallback((key: keyof BassParams, value: number) => {
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
      eqLow: 50,
      eqMid: 30,
      eqHigh: 40,
      compression: 60,
      saturation: 30,
      sidechain: 40,
      density: 50,
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Bass Mixing
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>EQ Low</span>
            <span style={{ fontSize: '0.45rem', color: '#ff6b6b' }}>{params.eqLow}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.eqLow}
            onChange={(e) => updateParam('eqLow', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.45rem', color: '#f5c542' }}>{params.eqMid}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.eqMid}
            onChange={(e) => updateParam('eqMid', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.45rem', color: '#4a9eff' }}>{params.eqHigh}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.eqHigh}
            onChange={(e) => updateParam('eqHigh', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Compression</span>
            <span style={{ fontSize: '0.45rem', color: '#50c878' }}>{params.compression}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.compression}
            onChange={(e) => updateParam('compression', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Saturation</span>
            <span style={{ fontSize: '0.45rem', color: '#ff8c42' }}>{params.saturation}%</span>
          </div>
          <input
            type="range" min="0" max="80" step="1"
            value={params.saturation}
            onChange={(e) => updateParam('saturation', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #ff8c42, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Sidechain</span>
            <span style={{ fontSize: '0.45rem', color: '#c77dff' }}>{params.sidechain}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.sidechain}
            onChange={(e) => updateParam('sidechain', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Density</span>
            <span style={{ fontSize: '0.45rem', color: '#f5c542' }}>{params.density}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.density}
            onChange={(e) => updateParam('density', parseInt(e.target.value))}
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
        🔊 Настройте EQ, компрессию, сатурацию, сайд-чейн и плотность баса
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default BassMixingWidget