// components/interactive/AudioInterfaceWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface InterfaceParams {
  gain: number
  phantom: boolean
  buffer: number
  sampleRate: number
  bitDepth: number
  directMonitor: boolean
}

const AudioInterfaceWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [params, setParams] = useState<InterfaceParams>({
    gain: 50,
    phantom: false,
    buffer: 128,
    sampleRate: 48,
    bitDepth: 24,
    directMonitor: false
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [inputLevel, setInputLevel] = useState(0)
  const [outputLevel, setOutputLevel] = useState(0)
  const timeRef = useRef(0)

  const L = 60, R = 760, T = 60, B = 360

  // ===== ГЕНЕРАЦИЯ СИГНАЛА =====
  const generateSignal = useCallback((t: number) => {
    const bass = Math.sin(t * 60 * 0.05) * 0.3 * Math.exp(-t * 0.03)
    const hit = Math.sin(t * 120 * 0.05) * 0.8 * Math.exp(-((t % 2) * 6))
    const vocal = Math.sin(t * 200 * 0.05 + Math.sin(t * 4 * 0.05) * 0.1) * 0.5
    return (bass * 0.2 + hit * 0.6 + vocal * 0.2) * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.25 * 0.05)))
  }, [])

  // ===== РЕНДЕРИНГ =====
  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    const { gain, phantom, buffer, sampleRate, bitDepth, directMonitor } = params

    // === Входной сигнал ===
    const inputWave = svg.querySelector('[data-group="input-wave"]') as SVGPathElement
    const outputWave = svg.querySelector('[data-group="output-wave"]') as SVGPathElement
    const centerY = (T + B) / 2

    if (inputWave && outputWave) {
      const steps = 200
      const inputPts: string[] = []
      const outputPts: string[] = []

      const amp = 0.1 + (gain / 100) * 0.5
      const phantomNoise = phantom ? 0.02 : 0.06

      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * 3
        const x = L + (i / steps) * (R - L)
        const signal = generateSignal(t)
        const inputVal = signal * amp * 0.8 + (Math.random() - 0.5) * phantomNoise
        const inputY = centerY - inputVal * (B - T) * 0.4

        // Выходной сигнал с учётом буфера (симуляция задержки)
        const bufferDelay = buffer / 1024
        const delayIndex = Math.floor(i - bufferDelay * steps)
        const safeIndex = Math.max(0, Math.min(steps, delayIndex))
        const outputVal = signal * amp * 0.7
        const outputY = centerY - outputVal * (B - T) * 0.4

        inputPts.push(x.toFixed(1) + ',' + inputY.toFixed(1))
        outputPts.push(x.toFixed(1) + ',' + outputY.toFixed(1))
      }

      inputWave.setAttribute('points', inputPts.join(' '))
      outputWave.setAttribute('points', outputPts.join(' '))
    }

    // === Уровни ===
    const inputLevelFill = svg.querySelector('[data-group="input-level-fill"]') as SVGRectElement
    const outputLevelFill = svg.querySelector('[data-group="output-level-fill"]') as SVGRectElement
    const inputLevelText = svg.querySelector('[data-group="input-level-text"]') as SVGTextElement
    const outputLevelText = svg.querySelector('[data-group="output-level-text"]') as SVGTextElement

    if (inputLevelFill && outputLevelFill) {
      const inLevel = Math.min(1, (gain / 100) * 0.8 + 0.1)
      const outLevel = Math.min(1, (gain / 100) * 0.7 + 0.1)
      
      inputLevelFill.setAttribute('height', String(inLevel * 80))
      outputLevelFill.setAttribute('height', String(outLevel * 80))
      
      if (inputLevelText) inputLevelText.textContent = `${Math.round(inLevel * 100)}%`
      if (outputLevelText) outputLevelText.textContent = `${Math.round(outLevel * 100)}%`
    }

    // === Индикаторы ===
    const phantomIndicator = svg.querySelector('[data-group="phantom-indicator"]') as SVGRectElement
    const phantomText = svg.querySelector('[data-group="phantom-text"]') as SVGTextElement
    if (phantomIndicator && phantomText) {
      phantomIndicator.setAttribute('fill', phantom ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.05)')
      phantomText.textContent = phantom ? 'ON +48V' : 'OFF'
      phantomText.setAttribute('fill', phantom ? '#4a9eff' : '#555')
    }

    // === Direct Monitoring ===
    const dmIndicator = svg.querySelector('[data-group="dm-indicator"]') as SVGRectElement
    const dmText = svg.querySelector('[data-group="dm-text"]') as SVGTextElement
    if (dmIndicator && dmText) {
      dmIndicator.setAttribute('fill', directMonitor ? 'rgba(80,200,120,0.3)' : 'rgba(255,255,255,0.05)')
      dmText.textContent = directMonitor ? 'ON' : 'OFF'
      dmText.setAttribute('fill', directMonitor ? '#50c878' : '#555')
    }

    // === Информация ===
    const infoText = svg.querySelector('[data-group="info-text"]') as SVGTextElement
    if (infoText) {
      infoText.textContent = `Buffer: ${buffer} samples · ${sampleRate} kHz · ${bitDepth}-bit`
    }
  }, [params, L, R, T, B, generateSignal])

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
  const updateParam = useCallback((key: keyof InterfaceParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ПРЕСЕТЫ =====
  const presets: Record<string, InterfaceParams> = {
    vocal: { gain: 60, phantom: true, buffer: 64, sampleRate: 48, bitDepth: 24, directMonitor: true },
    guitar: { gain: 50, phantom: false, buffer: 64, sampleRate: 48, bitDepth: 24, directMonitor: true },
    mixing: { gain: 40, phantom: false, buffer: 256, sampleRate: 48, bitDepth: 24, directMonitor: false },
    mastering: { gain: 35, phantom: false, buffer: 512, sampleRate: 96, bitDepth: 32, directMonitor: false },
    podcast: { gain: 70, phantom: true, buffer: 128, sampleRate: 44.1, bitDepth: 24, directMonitor: true }
  }

  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) setParams(preset)
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setParams({
      gain: 50,
      phantom: false,
      buffer: 128,
      sampleRate: 48,
      bitDepth: 24,
      directMonitor: false
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Audio Interface
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
            {[100, 150, 200, 250, 300, 350].map(y => (
              <line key={y} x1={L} y1={y} x2={R} y2={y} stroke="#fff" strokeWidth="0.5"/>
            ))}
          </g>

          {/* Оси */}
          <line x1={L} y1={B} x2={R} y2={B} stroke="#444" strokeWidth="1.5"/>
          <line x1={L} y1={B} x2={L} y2={T} stroke="#444" strokeWidth="1.5"/>
          <polygon points={`${R},${B} ${R-8},${B-4} ${R-8},${B+4}`} fill="#444"/>
          <polygon points={`${L},${T} ${L-4},${T+8} ${L+4},${T+8}`} fill="#444"/>

          <g fill="#555" fontSize="8" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
            <text x={L} y={B+18}>0</text>
            <text x="180" y={B+18}>0.5</text>
            <text x="300" y={B+18}>1.0</text>
            <text x="420" y={B+18}>1.5</text>
            <text x="540" y={B+18}>2.0</text>
            <text x="660" y={B+18}>2.5</text>
            <text x={R} y={B+18}>3.0</text>
            <text x={L-14} y={B}>-inf</text>
            <text x={L-14} y={B-60}>-12</text>
            <text x={L-14} y={B-120}>-6</text>
            <text x={L-14} y={B-180}>0</text>
            <text x={L-14} y={B-240}>+6</text>
            <text x={L-14} y={B-300}>+12</text>
          </g>

          <text x="410" y={B+36} fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif">Time (s)</text>
          <text x="22" y="210" fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif" transform="rotate(-90, 22, 210)">Level (dB)</text>

          {/* Входной сигнал */}
          <polyline data-group="input-wave" points="" fill="none" stroke="#4a9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

          {/* Выходной сигнал */}
          <polyline data-group="output-wave" points="" fill="none" stroke="#f5c542" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

          {/* Индикатор уровня (вход) */}
          <rect x="700" y={B-80} width="12" height="80" fill="rgba(255,255,255,0.05)" rx="4"/>
          <rect data-group="input-level-fill" x="700" y={B-80} width="12" height="0" fill="#4a9eff" rx="4"/>
          <text data-group="input-level-text" x="706" y={B+14} fill="#888" fontSize="6" textAnchor="middle" fontFamily="'Montserrat', sans-serif">0%</text>

          {/* Индикатор уровня (выход) */}
          <rect x="720" y={B-80} width="12" height="80" fill="rgba(255,255,255,0.05)" rx="4"/>
          <rect data-group="output-level-fill" x="720" y={B-80} width="12" height="0" fill="#f5c542" rx="4"/>
          <text data-group="output-level-text" x="726" y={B+14} fill="#888" fontSize="6" textAnchor="middle" fontFamily="'Montserrat', sans-serif">0%</text>

          {/* Phantom Power индикатор */}
          <rect data-group="phantom-indicator" x="660" y="70" width="55" height="20" fill="rgba(255,255,255,0.05)" rx="4"/>
          <text data-group="phantom-text" x="687" y="84" fill="#555" fontSize="7" textAnchor="middle" fontWeight="600" fontFamily="'Montserrat', sans-serif">OFF</text>

          {/* Direct Monitoring индикатор */}
          <rect data-group="dm-indicator" x="660" y="96" width="55" height="20" fill="rgba(255,255,255,0.05)" rx="4"/>
          <text data-group="dm-text" x="687" y="110" fill="#555" fontSize="7" textAnchor="middle" fontWeight="600" fontFamily="'Montserrat', sans-serif">OFF</text>

          {/* Информация */}
          <text data-group="info-text" x="410" y="30" fill="rgba(255,255,255,0.2)" fontSize="7" textAnchor="middle" fontFamily="'Montserrat', sans-serif">Buffer: 128 samples · 48 kHz · 24-bit</text>

          {/* Легенда */}
          <g transform={`translate(${L}, 16)`}>
            <rect x="0" y="0" width="10" height="10" fill="#4a9eff" rx="2"/>
            <text x="14" y="9" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="'Montserrat', sans-serif">Input</text>
            <rect x="55" y="0" width="10" height="10" fill="#f5c542" rx="2"/>
            <text x="69" y="9" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="'Montserrat', sans-serif">Output</text>
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Gain</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>{params.gain}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.gain}
            onChange={(e) => updateParam('gain', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Phantom</span>
            <span style={{ fontSize: '0.55rem', color: params.phantom ? '#4a9eff' : '#888' }}>
              {params.phantom ? 'ON +48V' : 'OFF'}
            </span>
          </div>
          <button
            onClick={() => updateParam('phantom', !params.phantom)}
            style={{
              width: '100%',
              padding: '4px 0',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: params.phantom ? 'rgba(74,158,255,0.15)' : 'rgba(255,255,255,0.03)',
              color: params.phantom ? '#4a9eff' : '#888',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.5rem',
              fontWeight: 600,
              transition: 'all 0.3s'
            }}
          >
            {params.phantom ? '🔵 ON' : '⚪ OFF'}
          </button>
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Buffer</span>
            <span style={{ fontSize: '0.55rem', color: '#50c878' }}>{params.buffer}</span>
          </div>
          <input
            type="range" min="32" max="1024" step="32"
            value={params.buffer}
            onChange={(e) => updateParam('buffer', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Sample Rate</span>
            <span style={{ fontSize: '0.55rem', color: '#da70d6' }}>{params.sampleRate} kHz</span>
          </div>
          <input
            type="range" min="44.1" max="192" step="0.1"
            value={params.sampleRate}
            onChange={(e) => updateParam('sampleRate', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Bit Depth</span>
            <span style={{ fontSize: '0.55rem', color: '#ff8c42' }}>{params.bitDepth}-bit</span>
          </div>
          <input
            type="range" min="16" max="32" step="1"
            value={params.bitDepth}
            onChange={(e) => updateParam('bitDepth', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #ff8c42, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Direct Monitor</span>
            <span style={{ fontSize: '0.55rem', color: params.directMonitor ? '#50c878' : '#888' }}>
              {params.directMonitor ? 'ON' : 'OFF'}
            </span>
          </div>
          <button
            onClick={() => updateParam('directMonitor', !params.directMonitor)}
            style={{
              width: '100%',
              padding: '4px 0',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: params.directMonitor ? 'rgba(80,200,120,0.15)' : 'rgba(255,255,255,0.03)',
              color: params.directMonitor ? '#50c878' : '#888',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.5rem',
              fontWeight: 600,
              transition: 'all 0.3s'
            }}
          >
            {params.directMonitor ? '🟢 ON' : '⚪ OFF'}
          </button>
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
        🎧 Настройте параметры аудиоинтерфейса и наблюдайте за изменением сигнала
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default AudioInterfaceWidget