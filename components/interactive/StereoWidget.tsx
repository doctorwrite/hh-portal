// components/interactive/StereoWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface StereoParams {
  pan: number
  width: number
  balance: number
  phase: number
  mid: number
  side: number
}

const StereoWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [params, setParams] = useState<StereoParams>({
    pan: 0,
    width: 100,
    balance: 0,
    phase: 0,
    mid: 0,
    side: 0
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const timeRef = useRef(0)

  const L = 60, R = 760, T = 50, B = 370
  const centerX = (L + R) / 2
  const centerY = (T + B) / 2

  // ===== РЕНДЕРИНГ =====
  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    const { pan, width, balance, phase, mid, side } = params

    // === Левый и правый каналы ===
    const leftArea = svg.querySelector('[data-group="left-area"]') as SVGPolygonElement
    const rightArea = svg.querySelector('[data-group="right-area"]') as SVGPolygonElement

    const panNorm = pan / 100
    const balanceFactor = Math.pow(10, balance / 20)
    const midFactor = Math.pow(10, mid / 20)
    const sideFactor = Math.pow(10, side / 20)

    const leftLevel = Math.max(0, 1 - Math.abs(panNorm)) * balanceFactor * midFactor
    const rightLevel = Math.max(0, 1 + panNorm) * balanceFactor * midFactor

    const maxHeight = 280
    const leftHeight = Math.max(10, leftLevel * maxHeight * (1 + sideFactor * 0.5))
    const rightHeight = Math.max(10, rightLevel * maxHeight * (1 + sideFactor * 0.5))

    if (leftArea) {
      leftArea.setAttribute('points', `${L},${B} ${centerX},${B} ${centerX},${B - leftHeight} ${L},${B - leftHeight}`)
      leftArea.setAttribute('opacity', '0.8')
    }

    if (rightArea) {
      rightArea.setAttribute('points', `${R},${B} ${centerX},${B} ${centerX},${B - rightHeight} ${R},${B - rightHeight}`)
      rightArea.setAttribute('opacity', '0.8')
    }

    // === Точка сигнала ===
    const dot = svg.querySelector('[data-group="dot"]') as SVGCircleElement
    const dotGlow = svg.querySelector('[data-group="dot-glow"]') as SVGCircleElement

    const dotSize = 8 + (width / 100) * 8
    const phaseOffset = Math.sin((phase * Math.PI) / 180) * 10
    const dotX = centerX + panNorm * 300 + phaseOffset * (width / 100) * 0.5
    const dotY = B - (leftHeight + rightHeight) / 2

    if (dot) {
      dot.setAttribute('cx', String(dotX))
      dot.setAttribute('cy', String(dotY))
      dot.setAttribute('r', String(dotSize))
    }

    if (dotGlow) {
      dotGlow.setAttribute('cx', String(dotX))
      dotGlow.setAttribute('cy', String(dotY))
      dotGlow.setAttribute('r', String(dotSize * 1.8))
      dotGlow.setAttribute('opacity', '0.15')
    }

    // === Информация ===
    const infoText = svg.querySelector('[data-group="info-text"]') as SVGTextElement
    if (infoText) {
      const panText = pan > 0 ? `+${pan}%` : `${pan}%`
      const phaseText = phase > 0 ? `+${phase}°` : `${phase}°`
      infoText.textContent = `Pan: ${panText} · Width: ${width}% · Balance: ${balance > 0 ? '+' : ''}${balance}dB · Phase: ${phaseText}`
    }
  }, [params, L, R, T, B, centerX, centerY])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    const loop = () => {
      timeRef.current += 0.01
      // Небольшие изменения для динамики
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
  const updateParam = useCallback((key: keyof StereoParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ПРЕСЕТЫ =====
  const presets: Record<string, StereoParams> = {
    center: { pan: 0, width: 100, balance: 0, phase: 0, mid: 0, side: 0 },
    wide: { pan: 0, width: 150, balance: 0, phase: 0, mid: 0, side: 3 },
    left: { pan: -50, width: 100, balance: 0, phase: 0, mid: 0, side: 0 },
    right: { pan: 50, width: 100, balance: 0, phase: 0, mid: 0, side: 0 },
    phase: { pan: 0, width: 120, balance: 0, phase: 90, mid: 0, side: 0 },
    ms: { pan: 0, width: 130, balance: 0, phase: 0, mid: 2, side: 4 }
  }

  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) setParams(preset)
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setParams({
      pan: 0,
      width: 100,
      balance: 0,
      phase: 0,
      mid: 0,
      side: 0
    })
  }, [])

  // ===== DRAG =====
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 820
    const y = ((e.clientY - rect.top) / rect.height) * 420

    if (x >= L && x <= R && y >= T && y <= B) {
      setIsDragging(true)
      const panVal = ((x - centerX) / 300) * 100
      setParams(prev => ({
        ...prev,
        pan: Math.max(-100, Math.min(100, panVal))
      }))
    }
  }, [L, R, T, B, centerX])

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 820
    const panVal = ((x - centerX) / 300) * 100
    setParams(prev => ({
      ...prev,
      pan: Math.max(-100, Math.min(100, panVal))
    }))
  }, [isDragging, centerX])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // ===== TOUCH =====
  const handleTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((touch.clientX - rect.left) / rect.width) * 820
    const y = ((touch.clientY - rect.top) / rect.height) * 420

    if (x >= L && x <= R && y >= T && y <= B) {
      setIsDragging(true)
      const panVal = ((x - centerX) / 300) * 100
      setParams(prev => ({
        ...prev,
        pan: Math.max(-100, Math.min(100, panVal))
      }))
    }
  }, [L, R, T, B, centerX])

  const handleTouchMove = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault()
    if (!isDragging) return
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((touch.clientX - rect.left) / rect.width) * 820
    const panVal = ((x - centerX) / 300) * 100
    setParams(prev => ({
      ...prev,
      pan: Math.max(-100, Math.min(100, panVal))
    }))
  }, [isDragging, centerX])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Stereo Imager
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
          style={{ width: '100%', height: 'auto', display: 'block', cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Сетка */}
          <g opacity="0.05">
            {[60, 200, 340, 400, 460, 600, 760].map(x => (
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
            <text x="60" y="390">-100%</text>
            <text x="200" y="390">-50%</text>
            <text x="400" y="390">0%</text>
            <text x="600" y="390">+50%</text>
            <text x="760" y="390">+100%</text>
            <text x="36" y="372">L</text>
            <text x="36" y="292">-6dB</text>
            <text x="36" y="212">-12dB</text>
            <text x="36" y="132">-18dB</text>
            <text x="36" y="72">-24dB</text>
          </g>

          <text x="410" y="408" fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif">Pan Position</text>
          <text x="22" y="210" fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif" transform="rotate(-90, 22, 210)">Level (dB)</text>

          {/* Центральная линия */}
          <line x1="400" y1="370" x2="400" y2="50" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4,4"/>

          {/* Левый канал */}
          <polygon data-group="left-area" points={`${L},370 ${centerX},370 ${centerX},200 ${L},200`} fill="rgba(74,158,255,0.05)" opacity="0"/>

          {/* Правый канал */}
          <polygon data-group="right-area" points={`${R},370 ${centerX},370 ${centerX},200 ${R},200`} fill="rgba(255,107,107,0.05)" opacity="0"/>

          {/* Точка сигнала */}
          <circle data-group="dot" cx="400" cy="210" r="12" fill="#f5c542" opacity="0.9"/>
          <circle data-group="dot-glow" cx="400" cy="210" r="20" fill="rgba(245,197,66,0.1)" opacity="0"/>

          {/* Информация */}
          <text data-group="info-text" x="400" y="30" fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="middle" fontFamily="'Montserrat', sans-serif">Pan: 0% · Width: 100% · Balance: 0dB · Phase: 0°</text>

          {/* Легенда */}
          <g transform="translate(60, 16)">
            <rect x="0" y="0" width="10" height="10" fill="#f5c542" rx="2"/>
            <text x="14" y="9" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="'Montserrat', sans-serif">Signal Position</text>
            <rect x="95" y="0" width="10" height="10" fill="rgba(74,158,255,0.15)" rx="2"/>
            <text x="109" y="9" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="'Montserrat', sans-serif">Left</text>
            <rect x="145" y="0" width="10" height="10" fill="rgba(255,107,107,0.15)" rx="2"/>
            <text x="159" y="9" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="'Montserrat', sans-serif">Right</text>
            <line x1="200" y1="0" x2="210" y2="10" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="3,3"/>
            <text x="214" y="9" fill="rgba(255,255,255,0.15)" fontSize="7" fontFamily="'Montserrat', sans-serif">Center</text>
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Pan</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>{params.pan > 0 ? '+' : ''}{params.pan}%</span>
          </div>
          <input
            type="range" min="-100" max="100" step="1"
            value={params.pan}
            onChange={(e) => updateParam('pan', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Width</span>
            <span style={{ fontSize: '0.55rem', color: '#f5c542' }}>{params.width}%</span>
          </div>
          <input
            type="range" min="0" max="200" step="1"
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Balance</span>
            <span style={{ fontSize: '0.55rem', color: '#50c878' }}>{params.balance > 0 ? '+' : ''}{params.balance}dB</span>
          </div>
          <input
            type="range" min="-12" max="12" step="0.5"
            value={params.balance}
            onChange={(e) => updateParam('balance', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Phase</span>
            <span style={{ fontSize: '0.55rem', color: '#ff6b6b' }}>{params.phase > 0 ? '+' : ''}{params.phase}°</span>
          </div>
          <input
            type="range" min="-180" max="180" step="5"
            value={params.phase}
            onChange={(e) => updateParam('phase', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Mid</span>
            <span style={{ fontSize: '0.55rem', color: '#da70d6' }}>{params.mid > 0 ? '+' : ''}{params.mid}dB</span>
          </div>
          <input
            type="range" min="-12" max="12" step="0.5"
            value={params.mid}
            onChange={(e) => updateParam('mid', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Side</span>
            <span style={{ fontSize: '0.55rem', color: '#ff8c42' }}>{params.side > 0 ? '+' : ''}{params.side}dB</span>
          </div>
          <input
            type="range" min="-12" max="12" step="0.5"
            value={params.side}
            onChange={(e) => updateParam('side', parseFloat(e.target.value))}
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
        🔊 Перетащите точку или настройте параметры для изменения стерео-поля
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default StereoWidget