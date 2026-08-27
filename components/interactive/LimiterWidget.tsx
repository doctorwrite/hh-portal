// components/interactive/LimiterWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface LimiterParams {
  threshold: number
  ceiling: number
  attack: number
  release: number
  makeup: number
  lookahead: number
}

const LimiterWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [params, setParams] = useState<LimiterParams>({
    threshold: -6,
    ceiling: -1,
    attack: 0.5,
    release: 100,
    makeup: 3,
    lookahead: 3
  })
  const [gainReduction, setGainReduction] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timeRef = useRef(0)
  const samplesRef = useRef<number[]>([])
  const grRef = useRef(0)

  const L = 70, R = 750, T = 60, B = 460
  const dbMin = -30, dbMax = 20

  const dBtoX = useCallback((db: number) => {
    return L + ((db - dbMin) / (dbMax - dbMin)) * (R - L)
  }, [L, R])

  const dBtoY = useCallback((db: number) => {
    return B - ((db - dbMin) / (dbMax - dbMin)) * (B - T)
  }, [B, T])

  const calcOutput = useCallback((input: number, threshold: number, ceiling: number) => {
    if (input <= threshold) return input
    return Math.min(threshold, ceiling)
  }, [])

  const generateSignal = useCallback((t: number) => {
    const bass = Math.sin(t * 60 * 0.05) * 0.3 * Math.exp(-t * 0.03)
    const hit = Math.sin(t * 120 * 0.05) * 0.8 * Math.exp(-((t % 2) * 6))
    const vocal = Math.sin(t * 200 * 0.05 + Math.sin(t * 4 * 0.05) * 0.1) * 0.5
    return (bass * 0.2 + hit * 0.6 + vocal * 0.2) * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.25 * 0.05)))
  }, [])

  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    const { threshold, ceiling, makeup } = params

    // === Кривая лимитера ===
    const curve = svg.querySelector('[data-group="curve"]') as SVGPathElement
    if (curve) {
      const pts: string[] = []
      const steps = 100
      for (let i = 0; i <= steps; i++) {
        const input = dbMin + (i / steps) * (dbMax - dbMin)
        const output = calcOutput(input, threshold, ceiling) + makeup
        const x = dBtoX(input)
        const y = dBtoY(output)
        pts.push(x.toFixed(1) + ',' + y.toFixed(1))
      }
      curve.setAttribute('points', pts.join(' '))
    }

    // === Линия порога ===
    const thrLine = svg.querySelector('[data-group="threshold"]') as SVGLineElement
    if (thrLine) {
      const x = dBtoX(threshold)
      const y = dBtoY(threshold)
      thrLine.setAttribute('x1', String(x))
      thrLine.setAttribute('x2', String(x))
      thrLine.setAttribute('y1', String(B))
      thrLine.setAttribute('y2', String(y))
    }

    // === Линия потолка ===
    const ceilLine = svg.querySelector('[data-group="ceiling"]') as SVGLineElement
    if (ceilLine) {
      const y = dBtoY(ceiling + makeup)
      ceilLine.setAttribute('y1', String(y))
      ceilLine.setAttribute('y2', String(y))
    }

    // === Текст порога ===
    const thrLabel = svg.querySelector('[data-group="threshold-label"]') as SVGTextElement
    if (thrLabel) {
      const x = dBtoX(threshold)
      thrLabel.setAttribute('x', String(x))
      thrLabel.textContent = `${threshold} dB`
    }

    // === Текст потолка ===
    const ceilLabel = svg.querySelector('[data-group="ceiling-label"]') as SVGTextElement
    if (ceilLabel) {
      const y = dBtoY(ceiling + makeup)
      ceilLabel.textContent = `${ceiling} dBTP`
    }

    // === Зона ограничения ===
    const zone = svg.querySelector('[data-group="limiter-zone"]') as SVGRectElement
    if (zone) {
      const x = dBtoX(threshold)
      const y = dBtoY(ceiling + makeup)
      zone.setAttribute('x', String(x))
      zone.setAttribute('y', String(y))
      zone.setAttribute('width', String(R - x))
      zone.setAttribute('height', String(B - y))
    }

    // === Gain Reduction ===
    const grCurve = svg.querySelector('[data-group="gr-curve"]') as SVGPathElement
    if (grCurve && gainReduction > 0.2) {
      const pts: string[] = []
      const steps = 100
      for (let i = 0; i <= steps; i++) {
        const input = dbMin + (i / steps) * (dbMax - dbMin)
        const output = calcOutput(input, threshold, ceiling) + makeup
        const gr = Math.max(0, input - calcOutput(input, threshold, ceiling))
        const x = dBtoX(input)
        const y = dBtoY(output + gr)
        pts.push(x.toFixed(1) + ',' + y.toFixed(1))
      }
      grCurve.setAttribute('points', pts.join(' '))
      grCurve.setAttribute('opacity', '0.85')
    } else if (grCurve) {
      grCurve.setAttribute('opacity', '0')
    }

    // === Волна ===
    const samples = samplesRef.current
    if (samples.length > 10) {
      const inputWave = svg.querySelector('[data-group="input-wave"]') as SVGPathElement
      const outputWave = svg.querySelector('[data-group="output-wave"]') as SVGPathElement
      
      const maxVal = Math.max(2, ...samples.map(Math.abs)) * 1.2
      const centerY = (T + B) / 2
      
      const inputPts: string[] = []
      const outputPts: string[] = []
      let gr = grRef.current
      const atkF = Math.exp(-1 / ((params.attack / 1000) * 60))
      const relF = Math.exp(-1 / ((params.release / 1000) * 60))
      
      for (let i = 0; i < samples.length; i++) {
        const input = samples[i] * 15
        const output = calcOutput(input, threshold, ceiling)
        const grVal = Math.max(0, input - output)
        gr = gr * (grVal > gr ? atkF : relF) + grVal * (grVal > gr ? (1 - atkF) : (1 - relF))
        
        const x = L + (i / samples.length) * (R - L)
        const inputY = centerY - (input / maxVal) * ((B - T) / 2 - 20)
        const outputY = centerY - ((output + gr + makeup) / maxVal) * ((B - T) / 2 - 20)
        inputPts.push(x.toFixed(1) + ',' + inputY.toFixed(1))
        outputPts.push(x.toFixed(1) + ',' + outputY.toFixed(1))
      }
      
      grRef.current = gr
      setGainReduction(gr)
      
      if (inputWave) inputWave.setAttribute('points', inputPts.join(' '))
      if (outputWave) outputWave.setAttribute('points', outputPts.join(' '))
    }
  }, [params, gainReduction, L, R, T, B, dbMin, dbMax, calcOutput, dBtoX, dBtoY])

  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    let lastTime = 0
    
    const loop = (timestamp: number) => {
      const dt = (timestamp - lastTime) / 1000
      lastTime = timestamp
      
      if (dt < 0.05) {
        timeRef.current += dt * 2
        const samples = samplesRef.current
        for (let i = 0; i < 2; i++) {
          samples.push(generateSignal(timeRef.current))
        }
        if (samples.length > 600) samples.splice(0, samples.length - 600)
        render()
      }
      
      frameId = requestAnimationFrame(loop)
    }
    
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, render, generateSignal])

  useEffect(() => {
    if (samplesRef.current.length === 0) {
      for (let i = 0; i < 600; i++) {
        timeRef.current += 0.005
        samplesRef.current.push(generateSignal(timeRef.current))
      }
      render()
    }
  }, [render, generateSignal])

  const updateParam = useCallback((key: keyof LimiterParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ПРЕСЕТЫ =====
  const presets: Record<string, LimiterParams> = {
    mastering: { threshold: -6, ceiling: -1, attack: 0.5, release: 100, makeup: 3, lookahead: 3 },
    protect: { threshold: -12, ceiling: -0.3, attack: 0.01, release: 30, makeup: 0, lookahead: 1 },
    punch: { threshold: -4, ceiling: -0.5, attack: 2, release: 80, makeup: 4, lookahead: 5 },
    loud: { threshold: -3, ceiling: -0.3, attack: 0.1, release: 50, makeup: 6, lookahead: 5 }
  }

  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) setParams(preset)
  }, [])

  const resetAll = useCallback(() => {
    setParams({
      threshold: -6,
      ceiling: -1,
      attack: 0.5,
      release: 100,
      makeup: 3,
      lookahead: 3
    })
    grRef.current = 0
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Limiter
        </span>
        <span style={{ fontSize: '0.5rem', color: isPlaying ? '#50c878' : '#444' }}>
          {isPlaying ? '●  Running' : '●  Stopped'}
        </span>
      </div>

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
          viewBox="0 0 820 520"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <g opacity="0.06">
            {[70, 206, 342, 478, 614, 750].map(x => (
              <line key={x} x1={x} y1={60} x2={x} y2={460} stroke="#fff" strokeWidth="0.5"/>
            ))}
            {[100, 190, 280, 370, 460].map(y => (
              <line key={y} x1={70} y1={y} x2={750} y2={y} stroke="#fff" strokeWidth="0.5"/>
            ))}
          </g>

          <line x1={70} y1={460} x2={750} y2={460} stroke="#444" strokeWidth="1.5"/>
          <line x1={70} y1={460} x2={70} y2={60} stroke="#444" strokeWidth="1.5"/>
          <polygon points="750,460 742,456 742,464" fill="#444"/>
          <polygon points="70,60 66,68 74,68" fill="#444"/>

          <g fill="#555" fontSize="9" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
            <text x="70" y="478">-30</text><text x="206" y="478">-20</text>
            <text x="342" y="478">-10</text><text x="478" y="478">0</text>
            <text x="614" y="478">+10</text><text x="750" y="478">+20</text>
            <text x="52" y="462">-30</text><text x="52" y="392">-20</text>
            <text x="52" y="322">-10</text><text x="52" y="252">0</text>
            <text x="52" y="182">+10</text><text x="52" y="112">+20</text>
          </g>

          <text x="410" y="498" fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif">Input (dB)</text>
          <text x="28" y="260" fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif" transform="rotate(-90, 28, 260)">Output (dB)</text>

          <line x1="70" y1="460" x2="750" y2="60" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="5,5"/>
          <text x="740" y="72" fill="rgba(255,255,255,0.06)" fontSize="8" fontFamily="'Montserrat', sans-serif" textAnchor="end">1:1</text>

          {/* Зона ограничения */}
          <rect data-group="limiter-zone" x="342" y="322" width="408" height="138" fill="rgba(255,107,107,0.06)" stroke="rgba(255,107,107,0.1)" strokeWidth="1" rx="3"/>

          {/* Линия порога */}
          <line data-group="threshold" x1="342" y1="460" x2="342" y2="322" stroke="#ff6b6b" strokeWidth="1.5" strokeDasharray="5,5"/>
          <text data-group="threshold-label" x="342" y="486" fill="#ff6b6b" fontSize="8" textAnchor="middle" fontWeight="600" fontFamily="'Montserrat', sans-serif">THRESHOLD</text>

          {/* Линия потолка */}
          <line data-group="ceiling" x1="70" y1="252" x2="750" y2="252" stroke="#4a9eff" strokeWidth="2" strokeDasharray="4,4"/>
          <text data-group="ceiling-label" x="750" y="242" fill="#4a9eff" fontSize="8" textAnchor="end" fontWeight="600" fontFamily="'Montserrat', sans-serif">CEILING</text>

          {/* Кривая лимитера */}
          <polyline data-group="curve" points="" fill="none" stroke="#f5c542" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>

          {/* Gain Reduction */}
          <polyline data-group="gr-curve" points="" fill="none" stroke="#ff6b6b" strokeWidth="1.5" strokeDasharray="5,5" opacity="0"/>

          {/* Входной сигнал */}
          <polyline data-group="input-wave" points="" fill="none" stroke="rgba(255,107,107,0.15)" strokeWidth="1.5"/>

          {/* Выходной сигнал */}
          <polyline data-group="output-wave" points="" fill="none" stroke="rgba(245,197,66,0.25)" strokeWidth="1.5"/>

          <g transform="translate(70, 16)">
            <rect x="0" y="0" width="10" height="10" fill="#f5c542" rx="2"/>
            <text x="14" y="9" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="'Montserrat', sans-serif">Limiter</text>
            <line x1="70" y1="0" x2="80" y2="10" stroke="#ff6b6b" strokeWidth="2" strokeDasharray="4,4"/>
            <text x="84" y="9" fill="#ff6b6b" fontSize="7" fontFamily="'Montserrat', sans-serif">GR</text>
            <line x1="110" y1="0" x2="120" y2="10" stroke="#4a9eff" strokeWidth="2" strokeDasharray="4,4"/>
            <text x="124" y="9" fill="#4a9eff" fontSize="7" fontFamily="'Montserrat', sans-serif">Ceiling</text>
            <rect x="170" y="0" width="10" height="10" fill="rgba(255,107,107,0.15)" rx="2"/>
            <text x="184" y="9" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="'Montserrat', sans-serif">Signal</text>
          </g>
        </svg>
      </div>

      {/* GR-метр */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '6px 12px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        marginBottom: '12px',
        border: '1px solid rgba(255,255,255,0.03)'
      }}>
        <span style={{ fontSize: '0.5rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          Gain Reduction
        </span>
        <div style={{
          flex: 1,
          height: '8px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, gainReduction * 5)}%`,
            background: 'linear-gradient(90deg, #ff6b6b, #ff9a9a)',
            borderRadius: '4px',
            transition: 'width 0.05s ease'
          }} />
        </div>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#ff6b6b',
          minWidth: '50px',
          textAlign: 'right'
        }}>
          {gainReduction.toFixed(1)} dB
        </span>
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Threshold</span>
            <span style={{ fontSize: '0.55rem', color: '#ff6b6b' }}>{params.threshold} dB</span>
          </div>
          <input
            type="range" min="-24" max="0" step="0.5"
            value={params.threshold}
            onChange={(e) => updateParam('threshold', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Ceiling</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>{params.ceiling} dBTP</span>
          </div>
          <input
            type="range" min="-12" max="0" step="0.5"
            value={params.ceiling}
            onChange={(e) => updateParam('ceiling', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Attack</span>
            <span style={{ fontSize: '0.55rem', color: '#50c878' }}>{params.attack} ms</span>
          </div>
          <input
            type="range" min="0.01" max="10" step="0.01"
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

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Release</span>
            <span style={{ fontSize: '0.55rem', color: '#da70d6' }}>{params.release} ms</span>
          </div>
          <input
            type="range" min="10" max="500" step="5"
            value={params.release}
            onChange={(e) => updateParam('release', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Make-up</span>
            <span style={{ fontSize: '0.55rem', color: '#f5c542' }}>+{params.makeup} dB</span>
          </div>
          <input
            type="range" min="0" max="12" step="0.5"
            value={params.makeup}
            onChange={(e) => updateParam('makeup', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Lookahead</span>
            <span style={{ fontSize: '0.55rem', color: '#ff8c42' }}>{params.lookahead} ms</span>
          </div>
          <input
            type="range" min="0" max="10" step="0.5"
            value={params.lookahead}
            onChange={(e) => updateParam('lookahead', parseFloat(e.target.value))}
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
        📈 Настройте лимитер и наблюдайте за ограничением сигнала
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default LimiterWidget