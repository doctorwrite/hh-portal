// components/interactive/DelayWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface DelayParams {
  time: number
  feedback: number
  mix: number
  tone: number
  ping: number
  mod: number
}

const DelayWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [params, setParams] = useState<DelayParams>({
    time: 400,
    feedback: 40,
    mix: 30,
    tone: 50,
    ping: 0,
    mod: 0
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const animRef = useRef<number | null>(null)

  const L = 60, R = 760, T = 50, B = 350

  // ===== РЕНДЕРИНГ =====
  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    const { time, feedback, mix, tone, ping, mod } = params

    const repeatsGroup = svg.querySelector('[data-group="repeats"]') as SVGGElement
    if (!repeatsGroup) return

    let html = ''

    // Исходный сигнал
    html += `
      <rect x="60" y="${B - 40}" width="20" height="40" fill="#4a9eff" opacity="0.8" rx="2"/>
      <text x="70" y="${B + 10}" fill="rgba(74,158,255,0.6)" font-size="6" text-anchor="middle" font-family="'Montserrat', sans-serif">Original</text>
    `

    // Повторы
    const maxRepeats = Math.min(15, Math.round((feedback / 100) * 20) + 2)
    const timeMs = time

    for (let i = 1; i <= maxRepeats; i++) {
      const xPos = 60 + (i * timeMs / 1200) * 700
      if (xPos > 760) break

      const amp = Math.pow(feedback / 100, i) * (0.7 + 0.3 * (1 - i / maxRepeats))
      const height = Math.max(3, amp * 40 * (0.5 + 0.5 * mix / 100))
      const yPos = B - 10 - height

      const isPing = (ping > 30) && (i % 2 === 0)
      const color = isPing ? '#ff6b6b' : '#f5c542'
      const opacity = Math.max(0.1, amp * 0.7)

      // Тон (затемнение)
      const toneFactor = 1 - tone / 100 * 0.5

      html += `
        <rect x="${xPos}" y="${yPos}" width="${Math.max(6, 16 - i * 0.3)}" height="${height}" fill="${color}" opacity="${opacity}" rx="2"/>
        <text x="${xPos + 8}" y="${B + 10}" fill="rgba(245,197,66,0.2)" font-size="5" text-anchor="middle" font-family="'Montserrat', sans-serif">${i}</text>
      `

      // Линия обратной связи
      if (i > 1 && i < maxRepeats) {
        html += `
          <line x1="${xPos - 20}" y1="${yPos + height}" x2="${xPos}" y2="${yPos + height}" stroke="rgba(255,107,107,0.08)" stroke-width="1" stroke-dasharray="2,2"/>
        `
      }

      // Модуляция
      if (mod > 30 && i > 1) {
        const modOffset = Math.sin(i * mod / 100 * 0.5) * 4
        html += `
          <rect x="${xPos + 2}" y="${yPos - modOffset}" width="3" height="${height * 0.3}" fill="rgba(255,154,154,0.15)" rx="1"/>
        `
      }
    }

    repeatsGroup.innerHTML = html
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
  const updateParam = useCallback((key: keyof DelayParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ПРЕСЕТЫ =====
  const presets: Record<string, DelayParams> = {
    digital: { time: 400, feedback: 40, mix: 30, tone: 50, ping: 0, mod: 0 },
    analog: { time: 350, feedback: 45, mix: 35, tone: 30, ping: 0, mod: 10 },
    tape: { time: 500, feedback: 50, mix: 40, tone: 20, ping: 0, mod: 20 },
    pingpong: { time: 450, feedback: 45, mix: 35, tone: 50, ping: 100, mod: 0 },
    modulated: { time: 400, feedback: 40, mix: 35, tone: 50, ping: 0, mod: 60 }
  }

  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) setParams(preset)
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setParams({
      time: 400,
      feedback: 40,
      mix: 30,
      tone: 50,
      ping: 0,
      mod: 0
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Delay
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
              <line key={x} x1={x} y1={50} x2={x} y2={350} stroke="#fff" strokeWidth="0.5"/>
            ))}
            {[100, 150, 200, 250, 300].map(y => (
              <line key={y} x1={60} y1={y} x2={760} y2={y} stroke="#fff" strokeWidth="0.5"/>
            ))}
          </g>

          {/* Оси */}
          <line x1={60} y1={350} x2={760} y2={350} stroke="#444" strokeWidth="1.5"/>
          <line x1={60} y1={350} x2={60} y2={50} stroke="#444" strokeWidth="1.5"/>
          <polygon points="760,350 752,346 752,354" fill="#444"/>
          <polygon points="60,50 56,58 64,58" fill="#444"/>

          {/* Метки */}
          <g fill="#555" fontSize="8" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
            <text x="60" y="370">0</text>
            <text x="180" y="370">200</text>
            <text x="300" y="370">400</text>
            <text x="420" y="370">600</text>
            <text x="540" y="370">800</text>
            <text x="660" y="370">1000</text>
            <text x="760" y="370">1200</text>
            <text x="36" y="352">0</text>
            <text x="36" y="272">-10</text>
            <text x="36" y="192">-20</text>
            <text x="36" y="112">-30</text>
            <text x="36" y="72">-40</text>
          </g>

          <text x="410" y="388" fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif">Time (ms)</text>
          <text x="22" y="200" fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif" transform="rotate(-90, 22, 200)">Amplitude (dB)</text>

          {/* Повторы дилея */}
          <g data-group="repeats" />

          {/* Легенда */}
          <g transform="translate(60, 16)">
            <rect x="0" y="0" width="10" height="10" fill="#4a9eff" rx="2"/>
            <text x="14" y="9" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="'Montserrat', sans-serif">Original</text>
            <rect x="75" y="0" width="10" height="10" fill="#f5c542" rx="2"/>
            <text x="89" y="9" fill="rgba(255,255,255,0.15)" fontSize="7" fontFamily="'Montserrat', sans-serif">Delay Repeats</text>
            <line x1="165" y1="0" x2="175" y2="10" stroke="#ff6b6b" strokeWidth="2"/>
            <text x="179" y="9" fill="#ff6b6b" fontSize="7" fontFamily="'Montserrat', sans-serif">Feedback</text>
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Time</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>
              {params.time}ms
            </span>
          </div>
          <input
            type="range" min="20" max="1200" step="5"
            value={params.time}
            onChange={(e) => updateParam('time', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Feedback</span>
            <span style={{ fontSize: '0.55rem', color: '#ff6b6b' }}>
              {params.feedback}%
            </span>
          </div>
          <input
            type="range" min="0" max="95" step="1"
            value={params.feedback}
            onChange={(e) => updateParam('feedback', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.55rem', color: '#f5c542' }}>
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
              background: 'linear-gradient(to right, #f5c542, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Tone</span>
            <span style={{ fontSize: '0.55rem', color: '#50c878' }}>
              {params.tone}%
            </span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.tone}
            onChange={(e) => updateParam('tone', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Ping-Pong</span>
            <span style={{ fontSize: '0.55rem', color: '#da70d6' }}>
              {params.ping}%
            </span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.ping}
            onChange={(e) => updateParam('ping', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Modulation</span>
            <span style={{ fontSize: '0.55rem', color: '#ff8c42' }}>
              {params.mod}%
            </span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.mod}
            onChange={(e) => updateParam('mod', parseFloat(e.target.value))}
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
        ⏳ Настройте дилей и наблюдайте за изменением паттерна повторов
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default DelayWidget