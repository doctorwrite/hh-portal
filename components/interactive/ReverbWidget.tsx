// components/interactive/ReverbWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ReverbParams {
  decay: number
  predelay: number
  size: number
  damping: number
  width: number
  mix: number
}

const ReverbWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [params, setParams] = useState<ReverbParams>({
    decay: 2.0,
    predelay: 20,
    size: 50,
    damping: 30,
    width: 100,
    mix: 30
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const animRef = useRef<number | null>(null)
  const timeRef = useRef(0)

  const L = 60, R = 760, T = 50, B = 370

  // ===== РЕНДЕРИНГ =====
  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    const { decay, predelay, size, damping, mix } = params

    // === Огибающая реверберации ===
    const envelope = svg.querySelector('[data-group="envelope"]') as SVGPathElement
    const curve = svg.querySelector('[data-group="curve"]') as SVGPathElement
    const wave = svg.querySelector('[data-group="wave"]') as SVGPathElement

    if (envelope && curve) {
      const steps = 300
      const maxTime = decay * 1.5 + predelay / 1000
      const pts: string[] = []
      const fillPts: string[] = []

      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * maxTime
        const x = L + (t / 3.0) * (R - L)
        
        let env = 0
        const predelaySec = predelay / 1000
        if (t > predelaySec) {
          const t2 = t - predelaySec
          const early = Math.sin(t2 * 50) * 0.5 * (1 - t2 / 0.1) * (t2 < 0.1 ? 1 : 0)
          const main = Math.exp(-t2 / decay) * (1 - damping / 100 * 0.5)
          const sizeFactor = 0.5 + size / 100 * 0.5
          env = Math.max(0, early * 0.3 + main * 0.7) * sizeFactor
        }

        const y = B - env * (B - T) * 0.9
        pts.push(x.toFixed(1) + ',' + y.toFixed(1))
        fillPts.push(x.toFixed(1) + ',' + y.toFixed(1))
      }

      curve.setAttribute('points', pts.join(' '))

      // Заливка
      fillPts.push(R + ',' + B)
      fillPts.push(L + ',' + B)
      envelope.setAttribute('points', fillPts.join(' '))
    }

    // === Волна ===
    if (wave) {
      const steps = 400
      const maxTime = decay * 1.2 + predelay / 1000
      const pts: string[] = []
      
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * maxTime * 1.2
        const x = L + (t / 3.0) * (R - L)
        const amp = 0.3 + 0.7 * Math.exp(-t / 0.3)
        const signal = Math.sin(t * 80 * 0.05) * amp * 0.3
        const reverb = Math.exp(-t / decay) * 0.5 * Math.sin(t * 60 * 0.05 + t * 0.5)
        const value = (signal + reverb * mix / 100) * 0.7
        const y = (T + B) / 2 - value * (B - T) * 0.4
        pts.push(x.toFixed(1) + ',' + y.toFixed(1))
      }
      wave.setAttribute('points', pts.join(' '))
    }

    // === Ранние отражения ===
    const earlyRef = svg.querySelector('[data-group="early"]') as SVGGElement
    if (earlyRef) {
      let html = ''
      const count = 8
      const predelaySec = predelay / 1000
      for (let i = 0; i < count; i++) {
        const t = predelaySec + 0.005 + i * 0.015
        const x = L + (t / 3.0) * (R - L)
        const amp = 0.5 * (1 - i / count) * (0.5 + size / 200)
        const y = B - amp * (B - T) * 0.5
        html += `<circle cx="${x}" cy="${y}" r="${3 - i * 0.2}" fill="#ff6b6b" opacity="${0.7 - i * 0.07}"/>`
      }
      earlyRef.innerHTML = html
    }
  }, [params, L, R, T, B])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    
    const loop = () => {
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
  const updateParam = useCallback((key: keyof ReverbParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ПРЕСЕТЫ =====
  const presets: Record<string, ReverbParams> = {
    room: { decay: 1.2, predelay: 15, size: 40, damping: 40, width: 80, mix: 25 },
    hall: { decay: 3.0, predelay: 30, size: 80, damping: 20, width: 100, mix: 35 },
    plate: { decay: 2.0, predelay: 10, size: 30, damping: 50, width: 90, mix: 30 },
    spring: { decay: 1.8, predelay: 5, size: 20, damping: 60, width: 70, mix: 40 },
    cathedral: { decay: 4.5, predelay: 50, size: 100, damping: 10, width: 100, mix: 20 }
  }

  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) setParams(preset)
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setParams({
      decay: 2.0,
      predelay: 20,
      size: 50,
      damping: 30,
      width: 100,
      mix: 30
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Reverb
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
            {[60, 180, 300, 420, 540, 660, 760].map(x => (
              <line key={x} x1={x} y1={50} x2={x} y2={370} stroke="#fff" strokeWidth="0.5"/>
            ))}
            {[100, 150, 200, 250, 300, 350].map(y => (
              <line key={y} x1={60} y1={y} x2={760} y2={y} stroke="#fff" strokeWidth="0.5"/>
            ))}
          </g>

          {/* Оси */}
          <line x1={60} y1={370} x2={760} y2={370} stroke="#444" strokeWidth="1.5"/>
          <line x1={60} y1={370} x2={60} y2={50} stroke="#444" strokeWidth="1.5"/>
          <polygon points="760,370 752,366 752,374" fill="#444"/>
          <polygon points="60,50 56,58 64,58" fill="#444"/>

          {/* Метки */}
          <g fill="#555" fontSize="8" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
            <text x="60" y="390">0</text>
            <text x="180" y="390">0.5</text>
            <text x="300" y="390">1.0</text>
            <text x="420" y="390">1.5</text>
            <text x="540" y="390">2.0</text>
            <text x="660" y="390">2.5</text>
            <text x="760" y="390">3.0</text>
            <text x="36" y="372">0</text>
            <text x="36" y="312">-10</text>
            <text x="36" y="252">-20</text>
            <text x="36" y="192">-30</text>
            <text x="36" y="132">-40</text>
            <text x="36" y="72">-50</text>
          </g>

          <text x="410" y="408" fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif">Time (seconds)</text>
          <text x="22" y="210" fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif" transform="rotate(-90, 22, 210)">Amplitude (dB)</text>

          {/* Заливка реверберации */}
          <polygon data-group="envelope" points="" fill="rgba(245,197,66,0.06)" opacity="1"/>

          {/* Кривая реверберации */}
          <polyline data-group="curve" points="" fill="none" stroke="#f5c542" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>

          {/* Волна */}
          <polyline data-group="wave" points="" fill="none" stroke="rgba(74,158,255,0.25)" strokeWidth="1.2"/>

          {/* Ранние отражения */}
          <g data-group="early" />

          {/* Легенда */}
          <g transform="translate(60, 16)">
            <rect x="0" y="0" width="10" height="10" fill="#f5c542" rx="2"/>
            <text x="14" y="9" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="'Montserrat', sans-serif">Reverb Envelope</text>
            <rect x="110" y="0" width="10" height="10" fill="rgba(74,158,255,0.2)" rx="2"/>
            <text x="124" y="9" fill="rgba(255,255,255,0.15)" fontSize="7" fontFamily="'Montserrat', sans-serif">Signal</text>
            <line x1="180" y1="0" x2="190" y2="10" stroke="#ff6b6b" strokeWidth="2"/>
            <text x="194" y="9" fill="#ff6b6b" fontSize="7" fontFamily="'Montserrat', sans-serif">Early Reflections</text>
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
        {Object.keys(presets).map(name => (
          <button
            key={name}
            onClick={() => loadPreset(name)}
            style={{
              padding: '4px 14px',
              borderRadius: '50px',
              fontSize: '0.55rem',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.03)',
              color: '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit',
              textTransform: 'capitalize'
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '6px',
        marginBottom: '10px'
      }}>
        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Decay</span>
            <span style={{ fontSize: '0.55rem', color: '#ff6b6b' }}>
              {params.decay.toFixed(1)}s
            </span>
          </div>
          <input
            type="range" min="0.2" max="5" step="0.1"
            value={params.decay}
            onChange={(e) => updateParam('decay', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Pre-delay</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>
              {params.predelay}ms
            </span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.predelay}
            onChange={(e) => updateParam('predelay', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Size</span>
            <span style={{ fontSize: '0.55rem', color: '#50c878' }}>
              {params.size}%
            </span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.size}
            onChange={(e) => updateParam('size', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Damping</span>
            <span style={{ fontSize: '0.55rem', color: '#da70d6' }}>
              {params.damping}%
            </span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.damping}
            onChange={(e) => updateParam('damping', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Width</span>
            <span style={{ fontSize: '0.55rem', color: '#f5c542' }}>
              {params.width}%
            </span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.width}
            onChange={(e) => updateParam('width', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Mix</span>
            <span style={{ fontSize: '0.55rem', color: '#ff8c42' }}>
              {params.mix}%
            </span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.mix}
            onChange={(e) => updateParam('mix', parseFloat(e.target.value))}
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
        🌊 Настройте реверберацию и наблюдайте за изменением огибающей
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default ReverbWidget