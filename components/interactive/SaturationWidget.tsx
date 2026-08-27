// components/interactive/SaturationWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface SaturationParams {
  drive: number
  mix: number
  tone: number
  bias: number
  hp: number
  lp: number
}

const SaturationWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [params, setParams] = useState<SaturationParams>({
    drive: 30,
    mix: 50,
    tone: 50,
    bias: 0,
    hp: 10,
    lp: 90
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentType, setCurrentType] = useState('tape')
  const timeRef = useRef(0)

  const L = 60, R = 760, T = 50, B = 370

  // ===== ПРЕСЕТЫ =====
  const presets: Record<string, SaturationParams> = {
    tape: { drive: 30, mix: 50, tone: 40, bias: 0, hp: 10, lp: 90 },
    tube: { drive: 40, mix: 50, tone: 60, bias: 20, hp: 5, lp: 85 },
    transformer: { drive: 35, mix: 70, tone: 30, bias: -10, hp: 15, lp: 80 },
    digital: { drive: 50, mix: 40, tone: 80, bias: 30, hp: 0, lp: 95 }
  }

  // ===== РЕНДЕРИНГ =====
  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    const { drive, mix, tone, bias, hp, lp } = params

    // === Кривая сатурации ===
    const curve = svg.querySelector('[data-group="curve"]') as SVGPathElement
    const zone = svg.querySelector('[data-group="zone"]') as SVGPolygonElement
    const wave = svg.querySelector('[data-group="wave"]') as SVGPathElement

    if (curve && zone) {
      const steps = 50
      const pts: string[] = []
      const zonePts: string[] = []

      for (let i = 0; i <= steps; i++) {
        const input = -24 + (i / steps) * 72
        const x = L + (i / steps) * (R - L)

        const driveFactor = 0.5 + (drive / 100) * 2
        const biasFactor = 0.5 + (bias / 100) * 0.5
        let output = input * driveFactor + biasFactor * 2

        // Soft clipping
        const clip = 12 + (drive / 100) * 24
        if (output > clip) output = clip + (output - clip) / (1 + (output - clip) / 6)
        if (output < -clip) output = -clip + (output + clip) / (1 + (-output - clip) / 6)

        // Tone
        output = output * (0.5 + (tone / 100) * 0.5)

        const y = B - ((output + 20) / 40) * (B - T)
        pts.push(x.toFixed(1) + ',' + y.toFixed(1))
        zonePts.push(x.toFixed(1) + ',' + y.toFixed(1))
      }

      curve.setAttribute('points', pts.join(' '))

      // Зона сатурации
      const fillPts = zonePts.slice()
      for (let i = steps; i >= 0; i--) {
        const input = -24 + (i / steps) * 72
        const x = L + (i / steps) * (R - L)
        const inputY = B - ((input + 20) / 40) * (B - T)
        fillPts.push(x.toFixed(1) + ',' + inputY.toFixed(1))
      }
      zone.setAttribute('points', fillPts.join(' '))
      zone.setAttribute('opacity', drive > 5 ? '1' : '0')
    }

    // === Волна ===
    if (wave) {
      const steps = 300
      const pts: string[] = []
      const centerY = (T + B) / 2

      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * 4
        const x = L + (i / steps) * (R - L)

        const freq = 2 + Math.sin(t * 0.3) * 0.5
        const amp = 0.3 + (drive / 100) * 0.4
        const base = Math.sin(t * freq * 8) * 0.4
        const harmonic = Math.sin(t * freq * 16 + 0.5) * 0.15 * (1 + (drive / 100) * 0.5)

        // Простая сатурация
        let val = (base + harmonic) * amp * 0.6
        const clip = 0.7 + (drive / 100) * 0.3
        if (val > clip) val = clip + (val - clip) / (1 + (val - clip) / 0.3)
        if (val < -clip) val = -clip + (val + clip) / (1 + (-val - clip) / 0.3)

        // Mix
        const dry = (base + harmonic) * 0.3
        val = dry * (1 - mix / 100) + val * (mix / 100)

        const y = centerY - val * (B - T) * 0.45
        pts.push(x.toFixed(1) + ',' + y.toFixed(1))
      }
      wave.setAttribute('points', pts.join(' '))
    }
  }, [params, L, R, T, B])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    const loop = () => {
      timeRef.current += 0.01
      render()
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, render])

  // ===== ИНИЦИАЛИЗАЦИЯ =====
  useEffect(() => {
    render()
  }, [render])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof SaturationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ЗАГРУЗКА ПРЕСЕТА =====
  const loadPreset = useCallback((type: string) => {
    const preset = presets[type]
    if (preset) {
      setParams(preset)
      setCurrentType(type)
    }
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setParams({
      drive: 30,
      mix: 50,
      tone: 50,
      bias: 0,
      hp: 10,
      lp: 90
    })
    setCurrentType('tape')
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Saturator
        </span>
        <span style={{ fontSize: '0.5rem', color: isPlaying ? '#50c878' : '#444' }}>
          {isPlaying ? '●  Running' : '●  Stopped'}
        </span>
      </div>

      {/* График */}
      <div style={{
        background: 'rgba(0,0,0,0.25)',
        borderRadius: '10px',
        padding: '4px',
        border: '1px solid rgba(255,255,255,0.03)',
        position: 'relative',
        marginBottom: '12px'
      }}>
        <svg
          ref={svgRef}
          viewBox="0 0 820 420"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {/* Сетка */}
          <g opacity="0.05">
            {[L, 180, 300, 420, 540, 660, R].map(x => (
              <line key={x} x1={x} y1={T} x2={x} y2={B} stroke="#fff" strokeWidth="0.5"/>
            ))}
            {[90, 140, 190, 240, 290, 340].map(y => (
              <line key={y} x1={L} y1={y} x2={R} y2={y} stroke="#fff" strokeWidth="0.5"/>
            ))}
          </g>

          {/* Оси */}
          <line x1={L} y1={B} x2={R} y2={B} stroke="#444" strokeWidth="1.5"/>
          <line x1={L} y1={B} x2={L} y2={T} stroke="#444" strokeWidth="1.5"/>
          <polygon points={`${R},${B} ${R-8},${B-4} ${R-8},${B+4}`} fill="#444"/>
          <polygon points={`${L},${T} ${L-4},${T+8} ${L+4},${T+8}`} fill="#444"/>

          {/* Метки */}
          <g fill="#555" fontSize="8" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
            <text x={L} y={B+18}>-24</text>
            <text x="180" y={B+18}>-12</text>
            <text x="300" y={B+18}>0</text>
            <text x="420" y={B+18}>+12</text>
            <text x="540" y={B+18}>+24</text>
            <text x="660" y={B+18}>+36</text>
            <text x={R} y={B+18}>+48</text>
            <text x={L-14} y={B}>-24</text>
            <text x={L-14} y={B-60}>-12</text>
            <text x={L-14} y={B-120}>0</text>
            <text x={L-14} y={B-180}>+12</text>
            <text x={L-14} y={B-240}>+24</text>
            <text x={L-14} y={B-300}>+36</text>
          </g>

          <text x="410" y={B+36} fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif">Input Level (dB)</text>
          <text x="22" y="210" fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif" transform="rotate(-90, 22, 210)">Output Level (dB)</text>

          {/* Линия 1:1 */}
          <line x1={L} y1={B} x2={R} y2={T} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="5,5"/>
          <text x={R-20} y={T+12} fill="rgba(255,255,255,0.06)" fontSize="8" fontFamily="'Montserrat', sans-serif" textAnchor="end">1:1</text>

          {/* Кривая сатурации */}
          <polyline data-group="curve" points="" fill="none" stroke="#f5c542" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>

          {/* Зона сатурации */}
          <polygon data-group="zone" points="" fill="rgba(255,107,107,0.06)" opacity="0"/>

          {/* Волна */}
          <polyline data-group="wave" points="" fill="none" stroke="rgba(74,158,255,0.25)" strokeWidth="1.5"/>

          {/* Легенда */}
          <g transform={`translate(${L}, 16)`}>
            <rect x="0" y="0" width="10" height="10" fill="#f5c542" rx="2"/>
            <text x="14" y="9" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="'Montserrat', sans-serif">Saturation Curve</text>
            <line x1="110" y1="0" x2="120" y2="10" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" strokeDasharray="5,5"/>
            <text x="124" y="9" fill="rgba(255,255,255,0.15)" fontSize="7" fontFamily="'Montserrat', sans-serif">1:1</text>
            <rect x="155" y="0" width="10" height="10" fill="rgba(255,107,107,0.15)" rx="2"/>
            <text x="169" y="9" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="'Montserrat', sans-serif">Saturation Zone</text>
            <rect x="245" y="0" width="10" height="10" fill="rgba(74,158,255,0.15)" rx="2"/>
            <text x="259" y="9" fill="rgba(255,255,255,0.15)" fontSize="7" fontFamily="'Montserrat', sans-serif">Signal</text>
          </g>
        </svg>
      </div>

      {/* Типы */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {Object.keys(presets).map(type => (
          <button
            key={type}
            onClick={() => loadPreset(type)}
            style={{
              padding: '4px 14px',
              borderRadius: '50px',
              fontSize: '0.55rem',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.06)',
              background: currentType === type ? 'rgba(245,197,66,0.1)' : 'rgba(255,255,255,0.03)',
              color: currentType === type ? '#f5c542' : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit',
              textTransform: 'capitalize'
            }}
            onMouseEnter={(e) => {
              if (currentType !== type) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = '#fff'
              }
            }}
            onMouseLeave={(e) => {
              if (currentType !== type) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.color = '#888'
              }
            }}
          >
            {type}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Drive</span>
            <span style={{ fontSize: '0.55rem', color: '#ff6b6b' }}>{params.drive}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.drive}
            onChange={(e) => updateParam('drive', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #ff6b6b, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Mix</span>
            <span style={{ fontSize: '0.55rem', color: '#f5c542' }}>{params.mix}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.mix}
            onChange={(e) => updateParam('mix', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Tone</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>{params.tone}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.tone}
            onChange={(e) => updateParam('tone', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Bias</span>
            <span style={{ fontSize: '0.55rem', color: '#50c878' }}>{params.bias > 0 ? '+' : ''}{params.bias}%</span>
          </div>
          <input
            type="range" min="-100" max="100" step="1"
            value={params.bias}
            onChange={(e) => updateParam('bias', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>High-Pass</span>
            <span style={{ fontSize: '0.55rem', color: '#da70d6' }}>{params.hp}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.hp}
            onChange={(e) => updateParam('hp', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #da70d6, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Low-Pass</span>
            <span style={{ fontSize: '0.55rem', color: '#ff8c42' }}>{params.lp}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.lp}
            onChange={(e) => updateParam('lp', parseFloat(e.target.value))}
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
          {isPlaying ? '⏸ Пауза' : '▶ Play'}
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
        🔥 Настройте сатурацию и наблюдайте за изменением кривой и сигнала
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default SaturationWidget