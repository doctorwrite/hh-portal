// components/interactive/EQVisualizer.tsx
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Band {
  id: number
  type: string
  freq: number
  gain: number
  q: number
  color: string
}

const EQVisualizer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const animIdRef = useRef<number | null>(null)
  const dragIdRef = useRef<number | null>(null)
  const timeRef = useRef<number>(0)

  const [bands, setBands] = useState<Band[]>([
    { id: 1, type: 'bell', freq: 1000, gain: 0, q: 1, color: '#f5c542' }
  ])
  const [activeId, setActiveId] = useState<number>(1)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  // Параметры графика
  const L = 55
  const R = 875
  const T = 20
  const B = 365
  const FMIN = 20
  const FMAX = 20000
  const GMIN = -20
  const GMAX = 20
  const colors = ['#f5c542', '#4a9eff', '#50c878', '#ff6b6b', '#c77dff', '#ff8c42']

  // Названия фильтров для отображения
  const filterLabels: Record<string, string> = {
    bell: 'Bell',
    lowshelf: 'Low Shelf',
    highshelf: 'High Shelf',
    lowcut: 'Low Cut',
    highcut: 'High Cut',
    notch: 'Notch',
    bandpass: 'Band'
  }

  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
  const fToX = useCallback((f: number) => {
    return L + ((Math.log10(f) - Math.log10(FMIN)) / (Math.log10(FMAX) - Math.log10(FMIN))) * (R - L)
  }, [L, R, FMIN, FMAX])

  const xToF = useCallback((x: number) => {
    return Math.pow(10, Math.log10(FMIN) + ((x - L) / (R - L)) * (Math.log10(FMAX) - Math.log10(FMIN)))
  }, [L, R, FMIN, FMAX])

  const dbToY = useCallback((db: number) => {
    const c = Math.max(GMIN, Math.min(GMAX, db))
    return B - ((c - GMIN) / (GMAX - GMIN)) * (B - T)
  }, [B, T, GMIN, GMAX])

  const yToDb = useCallback((y: number) => {
    return GMIN + (1 - ((y - T) / (B - T))) * (GMAX - GMIN)
  }, [B, T, GMIN, GMAX])

  // ===== РАСЧЁТ ФИЛЬТРА =====
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
        const num = g * g * (n2 + q2)
        const den = n2 + g * g * q2
        return 10 * Math.log10(num / den)
      }
      case 'highshelf': {
        const g = Math.pow(10, gain / 20)
        const n2 = norm * norm
        const q2 = Q * Q
        const num = g * g * (n2 * q2 + 1)
        const den = n2 * q2 + g * g
        return 10 * Math.log10(num / den)
      }
      case 'lowcut': {
        const n2 = norm * norm
        const q2 = Q * Q
        const num = n2 * n2
        const den = n2 * n2 + q2 * (1 - n2) * (1 - n2)
        return 10 * Math.log10(num / den)
      }
      case 'highcut': {
        const n2 = norm * norm
        const q2 = Q * Q
        const num = 1
        const den = 1 + q2 * (1 - n2) * (1 - n2) / n2
        return 10 * Math.log10(num / den)
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

  // ===== РЕНДЕРИНГ ГРАФИКА =====
  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    // --- Кривая ---
    let curve = svg.querySelector('[data-group="curve"]') as SVGPathElement
    if (!curve) {
      curve = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      curve.setAttribute('data-group', 'curve')
      curve.setAttribute('fill', 'none')
      curve.setAttribute('stroke', '#f5c542')
      curve.setAttribute('stroke-width', '2.5')
      svg.appendChild(curve)
    }

    const steps = 250
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

    // --- Точки ---
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
      const filterLabel = filterLabels[band.type] || band.type

      // ===== ОСНОВНОЙ КРУГ =====
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', String(x))
      circle.setAttribute('cy', String(y))
      circle.setAttribute('r', String(isActive ? 12 : 9))
      circle.setAttribute('fill', band.color)
      circle.setAttribute('stroke', isActive ? '#fff' : 'rgba(255,255,255,0.3)')
      circle.setAttribute('stroke-width', isActive ? '3' : '2')
      circle.setAttribute('data-id', String(band.id))
      circle.setAttribute('style', 'cursor:grab;transition:all 0.15s;')
      dotsGroup.appendChild(circle)

      // ===== НОМЕР ПОЛОСЫ =====
      const numText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      numText.setAttribute('x', String(x))
      numText.setAttribute('y', String(y + 4))
      numText.setAttribute('text-anchor', 'middle')
      numText.setAttribute('fill', isActive ? '#fff' : 'rgba(255,255,255,0.4)')
      numText.setAttribute('font-size', '7')
      numText.setAttribute('font-family', 'Arial, sans-serif')
      numText.setAttribute('font-weight', 'bold')
      numText.setAttribute('pointer-events', 'none')
      numText.textContent = String(bands.indexOf(band) + 1)
      dotsGroup.appendChild(numText)

      // ===== НАЗВАНИЕ ФИЛЬТРА ПОД ТОЧКОЙ =====
      const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      labelText.setAttribute('x', String(x))
      labelText.setAttribute('y', String(y + 18))
      labelText.setAttribute('text-anchor', 'middle')
      labelText.setAttribute('fill', isActive ? '#fcf6ba' : 'rgba(255,255,255,0.2)')
      labelText.setAttribute('font-size', '6')
      labelText.setAttribute('font-family', 'Arial, sans-serif')
      labelText.setAttribute('pointer-events', 'none')
      
      // Сокращаем длинные названия
      const shortLabel = filterLabel === 'Low Shelf' ? 'LSh' :
                         filterLabel === 'High Shelf' ? 'HSh' :
                         filterLabel === 'Low Cut' ? 'LC' :
                         filterLabel === 'High Cut' ? 'HC' :
                         filterLabel === 'Band' ? 'BP' :
                         filterLabel === 'Notch' ? 'Notch' :
                         filterLabel
      labelText.textContent = shortLabel
      dotsGroup.appendChild(labelText)

      // ===== ХИТ-ОБЛАСТЬ ДЛЯ ПЕРЕТАСКИВАНИЯ =====
      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      hit.setAttribute('cx', String(x))
      hit.setAttribute('cy', String(y))
      hit.setAttribute('r', '30')
      hit.setAttribute('fill', 'rgba(0,0,0,0.001)')
      hit.setAttribute('data-id', String(band.id))
      hit.setAttribute('style', 'cursor:grab;')
      dotsGroup.appendChild(hit)
    }
  }, [bands, activeId, fToX, dbToY, calcTotal])

  // ===== СПЕКТР =====
  const renderSpectrum = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    let specGroup = svg.querySelector('[data-group="spectrum"]') as SVGPathElement
    if (!specGroup) {
      specGroup = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      specGroup.setAttribute('data-group', 'spectrum')
      specGroup.setAttribute('fill', 'rgba(74,158,255,0.04)')
      svg.appendChild(specGroup)
    }

    const steps = 60
    let d = ''
    const points: { x: number; y: number }[] = []

    for (let i = 0; i <= steps; i++) {
      const logF = Math.log10(FMIN) + (i / steps) * (Math.log10(FMAX) - Math.log10(FMIN))
      const f = Math.pow(10, logF)
      let level = Math.random() * 0.05 + 0.02
      const tones = [80, 200, 500, 1000, 2000, 5000, 8000]
      for (const tone of tones) {
        const dist = Math.abs(Math.log10(f) - Math.log10(tone))
        if (dist < 0.3) {
          level += 0.15 * (1 - dist / 0.3) * (0.5 + 0.5 * Math.sin(timeRef.current * 2 + i * 0.1))
        }
      }
      const gain = calcTotal(f)
      const gainDb = Math.min(Math.max(gain, -20), 20)
      const gainLinear = Math.pow(10, gainDb / 20)
      const finalLevel = Math.min(0.5, level * gainLinear)
      const x = fToX(f)
      const y = B - finalLevel * (B - T) * 0.6
      points.push({ x, y })
    }

    for (let i = 0; i < points.length; i++) {
      d += (i === 0 ? 'M' : 'L') + points[i].x.toFixed(1) + ',' + points[i].y.toFixed(1)
    }
    d += 'L' + R + ',' + B + 'L' + L + ',' + B + 'Z'
    specGroup.setAttribute('d', d)
  }, [fToX, calcTotal, B, T, L, R])

  // ===== ДОБАВЛЕНИЕ ПОЛОСЫ =====
  const addBand = useCallback((freq: number, gain: number) => {
    if (bands.length >= 8) return
    const newBand: Band = {
      id: Date.now(),
      type: 'bell',
      freq: Math.max(FMIN, Math.min(FMAX, freq)),
      gain: Math.max(GMIN, Math.min(GMAX, gain)),
      q: 1,
      color: colors[bands.length % colors.length]
    }
    setBands(prev => [...prev, newBand])
    setActiveId(newBand.id)
  }, [bands.length])

  // ===== УДАЛЕНИЕ ПОЛОСЫ =====
  const deleteBand = useCallback((id: number) => {
    if (bands.length <= 1) return
    setBands(prev => prev.filter(b => b.id !== id))
    if (activeId === id) {
      const remaining = bands.filter(b => b.id !== id)
      setActiveId(remaining[0]?.id || 0)
    }
  }, [bands, activeId])

  // ===== ОБНОВЛЕНИЕ ПОЛОСЫ =====
  const updateBand = useCallback((id: number, updates: Partial<Band>) => {
    setBands(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }, [])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setBands([{ id: 1, type: 'bell', freq: 1000, gain: 0, q: 1, color: '#f5c542' }])
    setActiveId(1)
  }, [])

  // ===== СМЕНА ТИПА ФИЛЬТРА =====
  const changeFilterType = useCallback((type: string) => {
    const band = bands.find(b => b.id === activeId)
    if (band) {
      const gainless = ['lowcut', 'highcut', 'notch', 'bandpass'].includes(type)
      updateBand(activeId, { 
        type, 
        gain: gainless ? 0 : band.gain 
      })
    }
  }, [bands, activeId, updateBand])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current)
        animIdRef.current = null
      }
      return
    }

    const animate = () => {
      timeRef.current += 0.02
      renderSpectrum()
      animIdRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current)
        animIdRef.current = null
      }
    }
  }, [isPlaying, renderSpectrum])

  // ===== ПЕРЕРИСОВКА ПРИ ИЗМЕНЕНИИ =====
  useEffect(() => {
    render()
  }, [bands, activeId, render])

  // ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as SVGElement
      const id = target.getAttribute('data-id')
      if (id) {
        const bandId = parseInt(id)
        setActiveId(bandId)
        dragIdRef.current = bandId
        return
      }

      const rect = svg.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * (R - L) + L
      const y = (e.clientY - rect.top) / rect.height * (B - T) + T
      if (x >= L && x <= R && y >= T && y <= B) {
        const freq = xToF(x)
        const gain = yToDb(y)
        addBand(freq, gain)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (dragIdRef.current === null) return
      const rect = svg.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * (R - L) + L
      const y = (e.clientY - rect.top) / rect.height * (B - T) + T
      if (x >= L && x <= R && y >= T && y <= B) {
        const freq = xToF(x)
        const gain = yToDb(y)
        updateBand(dragIdRef.current, { freq, gain })
      }
    }

    const handleMouseUp = () => {
      dragIdRef.current = null
    }

    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as SVGElement
      const id = target.getAttribute('data-id')
      if (id) {
        deleteBand(parseInt(id))
      }
    }

    // Mouse
    svg.addEventListener('mousedown', handleMouseDown)
    svg.addEventListener('mousemove', handleMouseMove)
    svg.addEventListener('mouseup', handleMouseUp)
    svg.addEventListener('mouseleave', handleMouseUp)
    svg.addEventListener('dblclick', handleDoubleClick)

    // Touch
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      const rect = svg.getBoundingClientRect()
      const x = (touch.clientX - rect.left) / rect.width * (R - L) + L
      const y = (touch.clientY - rect.top) / rect.height * (B - T) + T

      let hit = false
      for (const band of bands) {
        const bx = fToX(band.freq)
        const by = dbToY(band.gain)
        const dist = Math.sqrt((x - bx) ** 2 + (y - by) ** 2)
        if (dist < 30) {
          setActiveId(band.id)
          dragIdRef.current = band.id
          hit = true
          break
        }
      }

      if (!hit && x >= L && x <= R && y >= T && y <= B) {
        const freq = xToF(x)
        const gain = yToDb(y)
        addBand(freq, gain)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (dragIdRef.current === null) return
      const touch = e.touches[0]
      const rect = svg.getBoundingClientRect()
      const x = (touch.clientX - rect.left) / rect.width * (R - L) + L
      const y = (touch.clientY - rect.top) / rect.height * (B - T) + T
      if (x >= L && x <= R && y >= T && y <= B) {
        const freq = xToF(x)
        const gain = yToDb(y)
        updateBand(dragIdRef.current, { freq, gain })
      }
    }

    const handleTouchEnd = () => {
      dragIdRef.current = null
    }

    svg.addEventListener('touchstart', handleTouchStart, { passive: false })
    svg.addEventListener('touchmove', handleTouchMove, { passive: false })
    svg.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      svg.removeEventListener('mousedown', handleMouseDown)
      svg.removeEventListener('mousemove', handleMouseMove)
      svg.removeEventListener('mouseup', handleMouseUp)
      svg.removeEventListener('mouseleave', handleMouseUp)
      svg.removeEventListener('dblclick', handleDoubleClick)
      svg.removeEventListener('touchstart', handleTouchStart)
      svg.removeEventListener('touchmove', handleTouchMove)
      svg.removeEventListener('touchend', handleTouchEnd)
    }
  }, [bands, fToX, xToF, dbToY, yToDb, addBand, deleteBand, updateBand, L, R, T, B])

  // ===== ПОЛУЧИТЬ ТЕКУЩУЮ ПОЛОСУ =====
  const currentBand = bands.find(b => b.id === activeId)
  const isGainless = currentBand ? ['lowcut', 'highcut', 'notch', 'bandpass'].includes(currentBand.type) : false

  return (
    <div 
      ref={containerRef}
      style={{
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '16px',
        padding: '16px 20px 20px',
        margin: '16px 0 24px',
        border: '1px solid rgba(255,255,255,0.06)',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '900px',
        marginLeft: 'auto',
        marginRight: 'auto',
        userSelect: 'none'
      }}
    >
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

      {/* SVG */}
      <div style={{
        background: 'rgba(0,0,0,0.25)',
        borderRadius: '10px',
        padding: '4px',
        border: '1px solid rgba(255,255,255,0.03)',
        position: 'relative',
        marginBottom: '12px'
      }}>
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.45rem',
          color: '#444',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          zIndex: 2
        }}>
          Частотная характеристика
        </div>
        <svg
          ref={svgRef}
          viewBox="0 0 900 400"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '6px',
            background: 'rgba(0,0,0,0.1)',
            cursor: 'crosshair'
          }}
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
          <polygon points={`${R},${B} ${R-8},${B-4} ${R-8},${B+4}`} fill="#444"/>
          <polygon points={`${L},${T} ${L-4},${T+8} ${L+4},${T+8}`} fill="#444"/>

          {/* Метки частот */}
          <g fill="#555" fontSize="8" fontFamily="Arial, sans-serif" textAnchor="middle">
            {[20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].map(f => {
              const x = fToX(f)
              const label = f >= 1000 ? (f/1000) + 'k' : f
              return <text key={f} x={x} y={B + 18}>{label}</text>
            })}
          </g>

          {/* Метки dB */}
          <g fill="#555" fontSize="8" fontFamily="Arial, sans-serif" textAnchor="end">
            {[-20, -10, 0, 10, 20].map(db => {
              const y = dbToY(db)
              return <text key={db} x={L - 6} y={y + 3}>{db}</text>
            })}
          </g>

          {/* Нулевая линия */}
          <line x1={L} y1={dbToY(0)} x2={R} y2={dbToY(0)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4,4"/>

          {/* Подписи осей */}
          <text x="450" y={B + 38} fill="#666" fontSize="7" textAnchor="middle" fontFamily="Arial, sans-serif">Частота (Гц)</text>
          <text x="18" y="210" fill="#666" fontSize="7" textAnchor="middle" fontFamily="Arial, sans-serif" transform="rotate(-90, 18, 210)">Уровень (дБ)</text>
        </svg>
      </div>

      {/* Панель управления */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '6px',
        marginBottom: '10px'
      }}>
        {/* Тип фильтра */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '6px 8px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <span style={{ fontSize: '0.4rem', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Тип фильтра</span>
          <select
            value={currentBand?.type || 'bell'}
            onChange={(e) => changeFilterType(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#ccc',
              fontSize: '0.5rem',
              padding: '3px 6px',
              borderRadius: '4px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          >
            <option value="bell">Bell</option>
            <option value="lowshelf">Low Shelf</option>
            <option value="highshelf">High Shelf</option>
            <option value="lowcut">Low Cut</option>
            <option value="highcut">High Cut</option>
            <option value="notch">Notch</option>
          </select>
        </div>

        {/* Частота */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '6px 8px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.4rem', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Частота</span>
            <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#4a9eff' }}>
              {currentBand?.freq?.toFixed(0) || 1000} Гц
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={currentBand ? (Math.log10(currentBand.freq) - Math.log10(FMIN)) / (Math.log10(FMAX) - Math.log10(FMIN)) : 0.5}
            onChange={(e) => {
              const val = parseFloat(e.target.value)
              const freq = Math.pow(10, Math.log10(FMIN) + val * (Math.log10(FMAX) - Math.log10(FMIN)))
              if (currentBand) updateBand(currentBand.id, { freq })
            }}
            style={{
              width: '100%',
              height: '2px',
              borderRadius: '2px',
              outline: 'none',
              background: 'linear-gradient(to right, #4a9eff, rgba(255,255,255,0.07))',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
        </div>

        {/* Усиление */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '6px 8px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.4rem', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Усиление</span>
            <span style={{ fontSize: '0.5rem', fontWeight: 700, color: isGainless ? '#666' : '#f5c542' }}>
              {isGainless ? '—' : (currentBand?.gain?.toFixed(1) || 0) + ' дБ'}
            </span>
          </div>
          <input
            type="range"
            min="-20"
            max="20"
            step="0.5"
            value={currentBand?.gain || 0}
            onChange={(e) => {
              const gain = parseFloat(e.target.value)
              if (currentBand) updateBand(currentBand.id, { gain })
            }}
            disabled={isGainless}
            style={{
              width: '100%',
              height: '2px',
              borderRadius: '2px',
              outline: 'none',
              background: isGainless 
                ? 'rgba(255,255,255,0.03)' 
                : 'linear-gradient(to right, #f5c542, rgba(255,255,255,0.07))',
              cursor: isGainless ? 'not-allowed' : 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none',
              opacity: isGainless ? 0.3 : 1
            }}
          />
        </div>

        {/* Q */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '6px 8px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.4rem', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Q</span>
            <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#50c878' }}>
              {currentBand?.q?.toFixed(1) || 1}
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="10"
            step="0.1"
            value={currentBand?.q || 1}
            onChange={(e) => {
              const q = parseFloat(e.target.value)
              if (currentBand) updateBand(currentBand.id, { q })
            }}
            style={{
              width: '100%',
              height: '2px',
              borderRadius: '2px',
              outline: 'none',
              background: 'linear-gradient(to right, #50c878, rgba(255,255,255,0.07))',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
        </div>
      </div>

      {/* Стили для слайдеров */}
      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.15);
        }
        input[type="range"]::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.15);
        }
        .freq-slider::-webkit-slider-thumb { background: #4a9eff; }
        .freq-slider::-moz-range-thumb { background: #4a9eff; }
        .gain-slider::-webkit-slider-thumb { background: #f5c542; }
        .gain-slider::-moz-range-thumb { background: #f5c542; }
        .q-slider::-webkit-slider-thumb { background: #50c878; }
        .q-slider::-moz-range-thumb { background: #50c878; }
      `}</style>

      {/* Кнопки */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '6px'
      }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '4px 16px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.55rem',
            border: 'none',
            cursor: 'pointer',
            background: isPlaying 
              ? 'rgba(255,80,80,0.15)' 
              : 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728)',
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
          + Добавить полосу
        </button>
      </div>

      {/* Информация */}
      <div style={{
        textAlign: 'center',
        fontSize: '0.45rem',
        color: '#555',
        padding: '4px 0',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        marginTop: '4px',
        paddingTop: '8px'
      }}>
        <span>🖱️ Клик по графику — добавить полосу</span>
        <span style={{ margin: '0 6px', color: '#333' }}>·</span>
        <span>Перетаскивание точек</span>
        <span style={{ margin: '0 6px', color: '#333' }}>·</span>
        <span>Двойной клик — удалить</span>
        <span style={{ margin: '0 6px', color: '#333' }}>·</span>
        <span style={{ color: '#666' }}>Активный фильтр: <strong style={{ color: '#fcf6ba' }}>{currentBand ? filterLabels[currentBand.type] : '—'}</strong></span>
      </div>
    </div>
  )
}

export default EQVisualizer
