// components/interactive/EQVisualizer.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Band {
  id: number
  freq: number
  gain: number
  q: number
  type: string
  color: string
}

const EQVisualizer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [bands, setBands] = useState<Band[]>([
    { id: 1, freq: 1000, gain: 0, q: 1, type: 'bell', color: '#f5c542' }
  ])
  const [activeId, setActiveId] = useState<number>(1)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const dragIdRef = useRef<number | null>(null)

  // Параметры графика
  const L = 60, R = 890, T = 30, B = 370
  const FMIN = 20, FMAX = 20000
  const GMIN = -20, GMAX = 20
  const colors = ['#f5c542', '#4a9eff', '#50c878', '#ff6b6b', '#c77dff', '#ff8c42']

  const filterLabels: Record<string, string> = {
    bell: 'Bell',
    lowshelf: 'LShelf',
    highshelf: 'HShelf',
    lowcut: 'LCut',
    highcut: 'HCut',
    notch: 'Notch'
  }

  // ===== МАТЕМАТИКА =====
  const fToX = useCallback((f: number) => {
    return L + ((Math.log10(f) - Math.log10(FMIN)) / (Math.log10(FMAX) - Math.log10(FMIN))) * (R - L)
  }, [L, R])

  const xToF = useCallback((x: number) => {
    return Math.pow(10, Math.log10(FMIN) + ((x - L) / (R - L)) * (Math.log10(FMAX) - Math.log10(FMIN)))
  }, [L, R])

  const dbToY = useCallback((db: number) => {
    const c = Math.max(GMIN, Math.min(GMAX, db))
    return B - ((c - GMIN) / (GMAX - GMIN)) * (B - T)
  }, [B, T])

  const yToDb = useCallback((y: number) => {
    return GMIN + (1 - ((y - T) / (B - T))) * (GMAX - GMIN)
  }, [B, T])

  const calcFilter = useCallback((type: string, f: number, fc: number, gain: number, Q: number): number => {
    const norm = f / fc
    switch(type) {
      case 'bell': {
        const g = Math.pow(10, gain / 40)
        const n = norm - 1/norm
        const h = n * n * Q * Q
        return 20 * Math.log10((1 + h) / (1 + h / (g * g)))
      }
      case 'lowshelf': {
        const g = Math.pow(10, gain / 20)
        const n2 = norm * norm
        const q2 = Q * Q
        return 10 * Math.log10((g * g * (n2 + q2)) / (n2 + g * g * q2))
      }
      case 'highshelf': {
        const g = Math.pow(10, gain / 20)
        const n2 = norm * norm
        const q2 = Q * Q
        return 10 * Math.log10((g * g * (n2 * q2 + 1)) / (n2 * q2 + g * g))
      }
      case 'lowcut': {
        const n2 = norm * norm
        const q2 = Q * Q
        return 10 * Math.log10((n2 * n2) / (n2 * n2 + q2 * (1 - n2) * (1 - n2)))
      }
      case 'highcut': {
        const n2 = norm * norm
        const q2 = Q * Q
        return 10 * Math.log10(1 / (1 + q2 * (1 - n2) * (1 - n2) / n2))
      }
      case 'notch': {
        const n = norm - 1/norm
        const depth = Math.min(1, Math.abs(gain) / 20)
        return -depth * 60 * (1 - 1 / (1 + n * n * Q * Q * 1000))
      }
      default: return 0
    }
  }, [])

  const calcTotal = useCallback((f: number) => {
    let total = 0
    for (const band of bands) {
      total += calcFilter(band.type, f, band.freq, band.gain, band.q)
    }
    return total
  }, [bands, calcFilter])

  // ===== РЕНДЕРИНГ =====
  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    // Кривая
    let curve = svg.querySelector('[data-group="curve"]') as SVGPathElement
    if (!curve) {
      curve = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      curve.setAttribute('data-group', 'curve')
      curve.setAttribute('fill', 'none')
      curve.setAttribute('stroke', '#f5c542')
      curve.setAttribute('stroke-width', '2.5')
      svg.appendChild(curve)
    }

    const steps = 300
    let d = ''
    for (let i = 0; i <= steps; i++) {
      const logF = Math.log10(FMIN) + (i / steps) * (Math.log10(FMAX) - Math.log10(FMIN))
      const f = Math.pow(10, logF)
      const gain = calcTotal(f)
      const x = fToX(f)
      const y = dbToY(gain)
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1)
    }
    curve.setAttribute('d', d)

    // Точки
    let dotsGroup = svg.querySelector('[data-group="dots"]')
    if (!dotsGroup) {
      dotsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      dotsGroup.setAttribute('data-group', 'dots')
      svg.appendChild(dotsGroup)
    }
    dotsGroup.innerHTML = ''

    for (const band of bands) {
      const isActive = band.id === activeId
      const x = fToX(band.freq)
      const y = dbToY(band.gain)

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', String(x))
      circle.setAttribute('cy', String(y))
      circle.setAttribute('r', String(isActive ? 12 : 8))
      circle.setAttribute('fill', band.color)
      circle.setAttribute('stroke', isActive ? '#fff' : 'rgba(255,255,255,0.3)')
      circle.setAttribute('stroke-width', isActive ? '2.5' : '1.5')
      circle.setAttribute('data-id', String(band.id))
      circle.setAttribute('style', 'cursor:grab')
      dotsGroup.appendChild(circle)

      // Номер
      const num = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      num.setAttribute('x', String(x))
      num.setAttribute('y', String(y + 4))
      num.setAttribute('text-anchor', 'middle')
      num.setAttribute('fill', isActive ? '#fff' : 'rgba(255,255,255,0.3)')
      num.setAttribute('font-size', '7')
      num.setAttribute('font-weight', 'bold')
      num.setAttribute('pointer-events', 'none')
      num.textContent = String(bands.indexOf(band) + 1)
      dotsGroup.appendChild(num)

      // Хит-область
      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      hit.setAttribute('cx', String(x))
      hit.setAttribute('cy', String(y))
      hit.setAttribute('r', '25')
      hit.setAttribute('fill', 'rgba(0,0,0,0.001)')
      hit.setAttribute('data-id', String(band.id))
      hit.setAttribute('style', 'cursor:grab')
      dotsGroup.appendChild(hit)
    }
  }, [bands, activeId, fToX, dbToY, calcTotal])

  // ===== ОБНОВЛЕНИЕ ПОЛОСЫ =====
  const updateBand = useCallback((id: number, updates: Partial<Band>) => {
    setBands(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }, [])

  const addBand = useCallback((freq: number, gain: number) => {
    if (bands.length >= 8) return
    const newBand: Band = {
      id: Date.now(),
      freq: Math.max(FMIN, Math.min(FMAX, freq)),
      gain: Math.max(GMIN, Math.min(GMAX, gain)),
      q: 1,
      type: 'bell',
      color: colors[bands.length % colors.length]
    }
    setBands(prev => [...prev, newBand])
    setActiveId(newBand.id)
  }, [bands.length])

  const deleteBand = useCallback((id: number) => {
    if (bands.length <= 1) return
    setBands(prev => prev.filter(b => b.id !== id))
    if (activeId === id) {
      const remaining = bands.filter(b => b.id !== id)
      setActiveId(remaining[0]?.id || 0)
    }
  }, [bands, activeId])

  const resetAll = useCallback(() => {
    setBands([{ id: 1, freq: 1000, gain: 0, q: 1, type: 'bell', color: '#f5c542' }])
    setActiveId(1)
  }, [])

  // ===== ОБРАБОТЧИКИ =====
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as SVGElement
      const id = target.getAttribute('data-id')
      if (id) {
        setActiveId(parseInt(id))
        dragIdRef.current = parseInt(id)
        return
      }

      const rect = svg.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * (R - L) + L
      const y = (e.clientY - rect.top) / rect.height * (B - T) + T
      if (x >= L && x <= R && y >= T && y <= B) {
        addBand(xToF(x), yToDb(y))
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (dragIdRef.current === null) return
      const rect = svg.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * (R - L) + L
      const y = (e.clientY - rect.top) / rect.height * (B - T) + T
      if (x >= L && x <= R && y >= T && y <= B) {
        updateBand(dragIdRef.current, { freq: xToF(x), gain: yToDb(y) })
      }
    }

    const handleMouseUp = () => { dragIdRef.current = null }

    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as SVGElement
      const id = target.getAttribute('data-id')
      if (id) deleteBand(parseInt(id))
    }

    svg.addEventListener('mousedown', handleMouseDown)
    svg.addEventListener('mousemove', handleMouseMove)
    svg.addEventListener('mouseup', handleMouseUp)
    svg.addEventListener('mouseleave', handleMouseUp)
    svg.addEventListener('dblclick', handleDoubleClick)

    return () => {
      svg.removeEventListener('mousedown', handleMouseDown)
      svg.removeEventListener('mousemove', handleMouseMove)
      svg.removeEventListener('mouseup', handleMouseUp)
      svg.removeEventListener('mouseleave', handleMouseUp)
      svg.removeEventListener('dblclick', handleDoubleClick)
    }
  }, [bands, addBand, updateBand, deleteBand, xToF, yToDb])

  useEffect(() => { render() }, [bands, activeId, render])

  const currentBand = bands.find(b => b.id === activeId)

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
          <span style={{ color: '#f5c542' }}>HH</span>Records · EQ Visualizer
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
          viewBox="0 0 950 400"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
        >
          {/* Сетка */}
          <g opacity="0.06">
            {[60, 140, 220, 300, 380, 460, 540, 620, 700, 760].map(x => (
              <line key={x} x1={x} y1={T} x2={x} y2={B} stroke="#fff" strokeWidth="0.5"/>
            ))}
            {[50, 100, 150, 200, 250, 300, 350].map(y => (
              <line key={y} x1={L} y1={y} x2={R} y2={y} stroke="#fff" strokeWidth="0.5"/>
            ))}
          </g>

          {/* Оси */}
          <line x1={L} y1={B} x2={R} y2={B} stroke="#444" strokeWidth="1.5"/>
          <line x1={L} y1={B} x2={L} y2={T} stroke="#444" strokeWidth="1.5"/>

          {/* Метки частот */}
          <g fill="#555" fontSize="8" fontFamily="Arial, sans-serif" textAnchor="middle">
            {[20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].map(f => {
              const x = fToX(f)
              return <text key={f} x={x} y={B + 18}>{f >= 1000 ? (f/1000) + 'k' : f}</text>
            })}
          </g>

          {/* Метки dB */}
          <g fill="#555" fontSize="8" fontFamily="Arial, sans-serif" textAnchor="end">
            {[-20, -10, 0, 10, 20].map(db => (
              <text key={db} x={L - 6} y={dbToY(db) + 3}>{db}</text>
            ))}
          </g>

          {/* Нулевая линия */}
          <line x1={L} y1={dbToY(0)} x2={R} y2={dbToY(0)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4,4"/>

          {/* Подписи */}
          <text x="480" y={B + 38} fill="#666" fontSize="7" textAnchor="middle">Частота (Гц)</text>
          <text x="18" y="210" fill="#666" fontSize="7" textAnchor="middle" transform="rotate(-90, 18, 210)">Уровень (дБ)</text>

          {/* Спектр (анимация) */}
          <path data-group="spectrum" fill="rgba(74,158,255,0.03)" d=""/>
        </svg>
      </div>

      {/* Панель управления */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '6px',
        marginBottom: '10px'
      }}>
        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.4rem', color: '#666' }}>Тип</span>
          <select
            value={currentBand?.type || 'bell'}
            onChange={(e) => {
              const type = e.target.value
              const gainless = ['lowcut', 'highcut', 'notch'].includes(type)
              if (currentBand) updateBand(currentBand.id, { type, gain: gainless ? 0 : currentBand.gain })
            }}
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#ccc', fontSize: '0.5rem', padding: '2px 4px', borderRadius: '4px', outline: 'none' }}
          >
            <option value="bell">Bell</option>
            <option value="lowshelf">Low Shelf</option>
            <option value="highshelf">High Shelf</option>
            <option value="lowcut">Low Cut</option>
            <option value="highcut">High Cut</option>
            <option value="notch">Notch</option>
          </select>
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>F</span>
            <span style={{ fontSize: '0.5rem', color: '#4a9eff' }}>
              {currentBand?.freq?.toFixed(0) || 1000} Гц
            </span>
          </div>
          <input
            type="range" min="0" max="1" step="0.001"
            value={currentBand ? (Math.log10(currentBand.freq) - Math.log10(FMIN)) / (Math.log10(FMAX) - Math.log10(FMIN)) : 0.5}
            onChange={(e) => {
              const val = parseFloat(e.target.value)
              const freq = Math.pow(10, Math.log10(FMIN) + val * (Math.log10(FMAX) - Math.log10(FMIN)))
              if (currentBand) updateBand(currentBand.id, { freq })
            }}
            style={{ width: '100%', height: '2px', appearance: 'none', background: 'linear-gradient(to right, #4a9eff, rgba(255,255,255,0.07))', cursor: 'pointer' }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>G</span>
            <span style={{ fontSize: '0.5rem', color: '#f5c542' }}>
              {['lowcut', 'highcut', 'notch'].includes(currentBand?.type || '') ? '—' : (currentBand?.gain?.toFixed(1) || 0) + 'дБ'}
            </span>
          </div>
          <input
            type="range" min="-20" max="20" step="0.5"
            value={currentBand?.gain || 0}
            disabled={['lowcut', 'highcut', 'notch'].includes(currentBand?.type || '')}
            onChange={(e) => {
              const gain = parseFloat(e.target.value)
              if (currentBand) updateBand(currentBand.id, { gain })
            }}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: ['lowcut', 'highcut', 'notch'].includes(currentBand?.type || '') 
                ? 'rgba(255,255,255,0.03)' 
                : 'linear-gradient(to right, #f5c542, rgba(255,255,255,0.07))',
              cursor: ['lowcut', 'highcut', 'notch'].includes(currentBand?.type || '') ? 'not-allowed' : 'pointer',
              opacity: ['lowcut', 'highcut', 'notch'].includes(currentBand?.type || '') ? 0.3 : 1
            }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Q</span>
            <span style={{ fontSize: '0.5rem', color: '#50c878' }}>
              {currentBand?.q?.toFixed(1) || 1}
            </span>
          </div>
          <input
            type="range" min="0.2" max="10" step="0.1"
            value={currentBand?.q || 1}
            onChange={(e) => {
              const q = parseFloat(e.target.value)
              if (currentBand) updateBand(currentBand.id, { q })
            }}
            style={{ width: '100%', height: '2px', appearance: 'none', background: 'linear-gradient(to right, #50c878, rgba(255,255,255,0.07))', cursor: 'pointer' }}
          />
        </div>
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.15); }
        input[type="range"]::-moz-range-thumb { width: 10px; height: 10px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.15); }
        input[type="range"]:not([disabled])::-webkit-slider-thumb { background: #4a9eff; }
        input[type="range"]:not([disabled])::-moz-range-thumb { background: #4a9eff; }
        input[type="range"]:disabled::-webkit-slider-thumb { background: #444; }
        input[type="range"]:disabled::-moz-range-thumb { background: #444; }
      `}</style>

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
        <button
          onClick={() => {
            if (bands.length < 8 && currentBand) {
              const freq = Math.min(FMAX, currentBand.freq * 1.8)
              const gain = Math.max(GMIN, Math.min(GMAX, currentBand.gain + 2))
              addBand(freq, gain)
            }
          }}
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
          + Добавить
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.45rem', color: '#555', padding: '4px 0' }}>
        🖱️ Клик на график — добавить · Перетаскивание · Двойной клик — удалить
      </div>
    </div>
  )
}

export default EQVisualizer
