// components/interactive/VSTWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface VSTPlugin {
  id: string
  name: string
  icon: string
  type: string
  color: string
  params: { id: string; label: string; min: number; max: number; step: number; default: number; css: string }[]
}

interface Slot {
  plugin: VSTPlugin | null
  params: Record<string, number>
  enabled: boolean
}

const VSTWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [slots, setSlots] = useState<Slot[]>([
    { plugin: null, params: {}, enabled: true },
    { plugin: null, params: {}, enabled: true },
    { plugin: null, params: {}, enabled: true },
    { plugin: null, params: {}, enabled: true }
  ])
  const [selectedSlot, setSelectedSlot] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timeRef = useRef(0)

  const L = 60, R = 760, T = 60, B = 340

  // ===== ДОСТУПНЫЕ ПЛАГИНЫ =====
  const plugins: VSTPlugin[] = [
    {
      id: 'eq',
      name: 'Pro-Q 3',
      icon: '🎛️',
      type: 'EQ',
      color: '#4a9eff',
      params: [
        { id: 'low', label: 'Low', min: -12, max: 12, step: 0.5, default: 0, css: 'eq-low' },
        { id: 'mid', label: 'Mid', min: -12, max: 12, step: 0.5, default: 0, css: 'eq-mid' },
        { id: 'high', label: 'High', min: -12, max: 12, step: 0.5, default: 0, css: 'eq-high' }
      ]
    },
    {
      id: 'compressor',
      name: 'Pro-C 2',
      icon: '📊',
      type: 'Compressor',
      color: '#50c878',
      params: [
        { id: 'threshold', label: 'Thresh', min: -24, max: 0, step: 0.5, default: -12, css: 'threshold' },
        { id: 'ratio', label: 'Ratio', min: 1, max: 10, step: 0.5, default: 3, css: 'ratio' },
        { id: 'attack', label: 'Attack', min: 0.1, max: 50, step: 0.5, default: 5, css: 'attack' },
        { id: 'release', label: 'Release', min: 10, max: 200, step: 5, default: 50, css: 'release' }
      ]
    },
    {
      id: 'reverb',
      name: 'Pro-R',
      icon: '🌊',
      type: 'Reverb',
      color: '#da70d6',
      params: [
        { id: 'decay', label: 'Decay', min: 0.5, max: 5, step: 0.1, default: 2, css: 'decay' },
        { id: 'mix', label: 'Mix', min: 0, max: 100, step: 1, default: 30, css: 'mix' },
        { id: 'size', label: 'Size', min: 0, max: 100, step: 1, default: 50, css: 'size' }
      ]
    },
    {
      id: 'delay',
      name: 'Timeless',
      icon: '⏳',
      type: 'Delay',
      color: '#ff8c42',
      params: [
        { id: 'time', label: 'Time', min: 50, max: 1000, step: 10, default: 300, css: 'time' },
        { id: 'feedback', label: 'Feedback', min: 0, max: 80, step: 1, default: 30, css: 'feedback' },
        { id: 'mix', label: 'Mix', min: 0, max: 100, step: 1, default: 25, css: 'mix' }
      ]
    },
    {
      id: 'saturation',
      name: 'Saturn 2',
      icon: '🔥',
      type: 'Saturation',
      color: '#ff6b6b',
      params: [
        { id: 'drive', label: 'Drive', min: 0, max: 100, step: 1, default: 30, css: 'drive' },
        { id: 'mix', label: 'Mix', min: 0, max: 100, step: 1, default: 50, css: 'mix' },
        { id: 'tone', label: 'Tone', min: 0, max: 100, step: 1, default: 50, css: 'tone' }
      ]
    },
    {
      id: 'limiter',
      name: 'Pro-L 2',
      icon: '📈',
      type: 'Limiter',
      color: '#f5c542',
      params: [
        { id: 'threshold', label: 'Thresh', min: -12, max: 0, step: 0.5, default: -6, css: 'threshold' },
        { id: 'ceiling', label: 'Ceiling', min: -12, max: 0, step: 0.5, default: -1, css: 'ceiling' }
      ]
    }
  ]

  // ===== ПРОЦЕССОР СИГНАЛА =====
  const processSignal = useCallback((signal: number, index: number) => {
    const slot = slots[index]
    if (!slot || !slot.plugin || !slot.enabled) return signal

    const plugin = slot.plugin
    const params = slot.params

    switch (plugin.id) {
      case 'eq': {
        const low = (params.low || 0) * 0.02
        const mid = (params.mid || 0) * 0.015
        const high = (params.high || 0) * 0.01
        return signal * (1 + low + mid + high)
      }
      case 'compressor': {
        const threshold = params.threshold || -12
        const ratio = params.ratio || 3
        const gainReduction = Math.max(0, (signal * 20 - threshold) * (1 - 1 / ratio))
        return signal - gainReduction * 0.015
      }
      case 'reverb': {
        const mix = (params.mix || 30) / 100
        return signal * (1 - mix) + signal * mix * 0.7
      }
      case 'delay': {
        const mix = (params.mix || 25) / 100
        return signal * (1 - mix) + signal * mix * 0.6
      }
      case 'saturation': {
        const drive = (params.drive || 30) / 100
        const mix = (params.mix || 50) / 100
        const saturated = signal * (1 + drive * 0.5)
        return signal * (1 - mix) + saturated * mix
      }
      case 'limiter': {
        const ceiling = params.ceiling || -1
        return Math.min(signal, ceiling / 20 + 0.5)
      }
      default:
        return signal
    }
  }, [slots])

  // ===== РЕНДЕРИНГ =====
  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    // === Слоты ===
    const slotsGroup = svg.querySelector('[data-group="slots"]') as SVGGElement
    if (slotsGroup) {
      const slotWidth = (R - L) / 4
      let html = ''

      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]
        const x = L + i * slotWidth + 4
        const w = slotWidth - 8
        const isActive = i === selectedSlot
        const hasPlugin = slot.plugin !== null
        const color = slot.plugin?.color || '#555'

        html += `
          <rect
            x="${x}" y="${T + 40}"
            width="${w}" height="${B - T - 60}"
            fill="${hasPlugin ? `${color}15` : 'rgba(255,255,255,0.03)'}"
            stroke="${isActive ? color : (hasPlugin ? `${color}40` : 'rgba(255,255,255,0.06)')}"
            stroke-width="${isActive ? '2' : '1'}"
            rx="6"
            data-slot="${i}"
            style="cursor:pointer;transition:all 0.3s;"
          />
          ${hasPlugin ? `
            <text x="${x + w/2}" y="${T + 58}" fill="${color}" font-size="12" text-anchor="middle" font-family="'Montserrat', sans-serif">${slot.plugin?.icon}</text>
            <text x="${x + w/2}" y="${T + 78}" fill="${slot.enabled ? '#fff' : '#555'}" font-size="7" text-anchor="middle" font-family="'Montserrat', sans-serif">${slot.plugin?.name}</text>
            <text x="${x + w/2}" y="${T + 92}" fill="#666" font-size="5" text-anchor="middle" font-family="'Montserrat', sans-serif">${slot.plugin?.type}</text>
            <circle cx="${x + w - 10}" cy="${T + 48}" r="${slot.enabled ? 4 : 3}" fill="${slot.enabled ? '#50c878' : '#ff6b6b'}" />
          ` : `
            <text x="${x + w/2}" y="${T + 80}" fill="#666" font-size="6" text-anchor="middle" font-family="'Montserrat', sans-serif">+ Add Plugin</text>
          `}
        `
      }

      slotsGroup.innerHTML = html

      // === События на слоты ===
      slotsGroup.querySelectorAll('rect').forEach(el => {
        const slotIndex = parseInt(el.dataset.slot || '0')
        el.addEventListener('click', () => setSelectedSlot(slotIndex))
        el.addEventListener('dblclick', () => {
          if (slots[slotIndex].plugin === null) {
            showPluginSelector(slotIndex)
          } else {
            removePlugin(slotIndex)
          }
        })
      })
    }

    // === Сигнал ===
    const wave = svg.querySelector('[data-group="wave"]') as SVGPathElement
    if (wave) {
      const steps = 200
      const pts: string[] = []
      const centerY = (T + B) / 2

      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * 3
        const x = L + (i / steps) * (R - L)
        let signal = Math.sin(t * 8) * 0.3 + Math.sin(t * 16 + 0.5) * 0.15 + (Math.random() - 0.5) * 0.05

        // Проходим через все слоты
        for (let s = 0; s < slots.length; s++) {
          signal = processSignal(signal, s)
        }

        const y = centerY - signal * (B - T) * 0.3
        pts.push(x.toFixed(1) + ',' + y.toFixed(1))
      }
      wave.setAttribute('points', pts.join(' '))
    }
  }, [slots, selectedSlot, L, R, T, B, processSignal])

  // ===== ВЫБОР ПЛАГИНА =====
  const showPluginSelector = useCallback((slotIndex: number) => {
    const names = plugins.map(p => `${p.icon} ${p.name}`).join('\n')
    const selected = window.prompt(
      `Выберите плагин для слота ${slotIndex + 1}:\n\n` +
      plugins.map((p, i) => `${i + 1}. ${p.icon} ${p.name} (${p.type})`).join('\n') +
      `\n\nВведите номер (1-${plugins.length}):`
    )

    if (selected) {
      const idx = parseInt(selected) - 1
      if (idx >= 0 && idx < plugins.length) {
        const plugin = plugins[idx]
        const params: Record<string, number> = {}
        for (const p of plugin.params) {
          params[p.id] = p.default
        }
        setSlots(prev => {
          const newSlots = [...prev]
          newSlots[slotIndex] = { plugin, params, enabled: true }
          return newSlots
        })
        setSelectedSlot(slotIndex)
      }
    }
  }, [plugins])

  // ===== УДАЛЕНИЕ ПЛАГИНА =====
  const removePlugin = useCallback((slotIndex: number) => {
    setSlots(prev => {
      const newSlots = [...prev]
      newSlots[slotIndex] = { plugin: null, params: {}, enabled: true }
      return newSlots
    })
  }, [])

  // ===== ПЕРЕКЛЮЧЕНИЕ ВКЛ/ВЫКЛ =====
  const togglePlugin = useCallback((slotIndex: number) => {
    setSlots(prev => {
      const newSlots = [...prev]
      newSlots[slotIndex].enabled = !newSlots[slotIndex].enabled
      return newSlots
    })
  }, [])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((slotIndex: number, paramId: string, value: number) => {
    setSlots(prev => {
      const newSlots = [...prev]
      if (newSlots[slotIndex].plugin) {
        newSlots[slotIndex].params[paramId] = value
      }
      return newSlots
    })
  }, [])

  // ===== ПРЕСЕТЫ =====
  const loadPreset = useCallback((name: string) => {
    const presets: Record<string, { pluginId: string; params: Record<string, number> }[]> = {
      vocal: [
        { pluginId: 'eq', params: { low: 0, mid: 3, high: 5 } },
        { pluginId: 'compressor', params: { threshold: -12, ratio: 3, attack: 5, release: 50 } },
        { pluginId: 'reverb', params: { decay: 2, mix: 30, size: 50 } }
      ],
      mastering: [
        { pluginId: 'eq', params: { low: -1, mid: 0, high: 2 } },
        { pluginId: 'compressor', params: { threshold: -8, ratio: 2, attack: 15, release: 100 } },
        { pluginId: 'limiter', params: { threshold: -6, ceiling: -1 } }
      ],
      guitar: [
        { pluginId: 'saturation', params: { drive: 35, mix: 50, tone: 60 } },
        { pluginId: 'delay', params: { time: 300, feedback: 30, mix: 25 } },
        { pluginId: 'reverb', params: { decay: 2.5, mix: 25, size: 60 } }
      ],
      electronic: [
        { pluginId: 'eq', params: { low: 3, mid: -1, high: 4 } },
        { pluginId: 'saturation', params: { drive: 45, mix: 40, tone: 70 } },
        { pluginId: 'delay', params: { time: 200, feedback: 40, mix: 30 } },
        { pluginId: 'limiter', params: { threshold: -4, ceiling: -1 } }
      ]
    }

    const preset = presets[name]
    if (!preset) return

    const newSlots: Slot[] = slots.map(() => ({ plugin: null, params: {}, enabled: true }))

    for (let i = 0; i < Math.min(preset.length, newSlots.length); i++) {
      const data = preset[i]
      const plugin = plugins.find(p => p.id === data.pluginId)
      if (plugin) {
        const params: Record<string, number> = {}
        for (const p of plugin.params) {
          params[p.id] = data.params[p.id] !== undefined ? data.params[p.id] : p.default
        }
        newSlots[i] = { plugin, params, enabled: true }
      }
    }

    setSlots(newSlots)
    setSelectedSlot(0)
  }, [slots, plugins])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setSlots(slots.map(() => ({ plugin: null, params: {}, enabled: true })))
    setSelectedSlot(0)
  }, [slots])

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

  const selectedPlugin = slots[selectedSlot]?.plugin
  const selectedParams = slots[selectedSlot]?.params || {}
  const isEnabled = slots[selectedSlot]?.enabled ?? true

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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Virtual Rack
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
          <g opacity="0.03">
            <line x1={L} y1={T} x2={R} y2={T} stroke="#fff" strokeWidth="0.5"/>
            <line x1={L} y1={B} x2={R} y2={B} stroke="#fff" strokeWidth="0.5"/>
          </g>

          {/* Заголовок слота */}
          <text x={L + 10} y={T + 25} fill="#666" fontSize="6" fontFamily="'Montserrat', sans-serif">Слот 1</text>
          <text x={L + 10 + (R-L)/4} y={T + 25} fill="#666" fontSize="6" fontFamily="'Montserrat', sans-serif">Слот 2</text>
          <text x={L + 10 + (R-L)/2} y={T + 25} fill="#666" fontSize="6" fontFamily="'Montserrat', sans-serif">Слот 3</text>
          <text x={L + 10 + (R-L)*0.75} y={T + 25} fill="#666" fontSize="6" fontFamily="'Montserrat', sans-serif">Слот 4</text>

          {/* Слоты */}
          <g data-group="slots" />

          {/* Сигнал */}
          <polyline data-group="wave" points="" fill="none" stroke="#f5c542" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

          {/* Информация */}
          <text x={L} y={B + 18} fill="#666" fontSize="6" fontFamily="'Montserrat', sans-serif">
            {selectedPlugin ? `${selectedPlugin.icon} ${selectedPlugin.name} · ${selectedPlugin.type}` : 'Выберите плагин'}
          </text>
          <text x={L + 250} y={B + 18} fill={isEnabled ? '#50c878' : '#ff6b6b'} fontSize="6" fontFamily="'Montserrat', sans-serif">
            {selectedPlugin ? (isEnabled ? '● ON' : '● OFF') : ''}
          </text>

          {/* Легенда */}
          <g transform={`translate(${L}, ${T + 10})`}>
            <rect x="0" y="0" width="10" height="10" fill="#f5c542" rx="2"/>
            <text x="14" y="9" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="'Montserrat', sans-serif">Signal</text>
            <rect x="65" y="0" width="10" height="10" fill="rgba(255,255,255,0.05)" rx="2"/>
            <text x="79" y="9" fill="rgba(255,255,255,0.15)" fontSize="6" fontFamily="'Montserrat', sans-serif">🖱️ Двойной клик</text>
          </g>
        </svg>
      </div>

      {/* Пресеты */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {['vocal', 'mastering', 'guitar', 'electronic'].map(name => (
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

      {/* Параметры выбранного плагина */}
      {selectedPlugin && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '6px',
          marginBottom: '10px',
          padding: '8px 10px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          {selectedPlugin.params.map(param => (
            <div key={param.id} style={{ padding: '4px 6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.4rem', color: '#666' }}>{param.label}</span>
                <span style={{ fontSize: '0.5rem', color: selectedPlugin.color }}>
                  {selectedParams[param.id] !== undefined ? selectedParams[param.id] : param.default}
                </span>
              </div>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={selectedParams[param.id] !== undefined ? selectedParams[param.id] : param.default}
                onChange={(e) => updateParam(selectedSlot, param.id, parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: '2px',
                  appearance: 'none',
                  background: `linear-gradient(to right, ${selectedPlugin.color}, rgba(255,255,255,0.07))`,
                  cursor: 'pointer'
                }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => togglePlugin(selectedSlot)}
              style={{
                padding: '4px 12px',
                borderRadius: '50px',
                fontSize: '0.5rem',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.06)',
                background: isEnabled ? 'rgba(80,200,120,0.1)' : 'rgba(255,80,80,0.1)',
                color: isEnabled ? '#50c878' : '#ff6b6b',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {isEnabled ? '✅ ON' : '⛔ OFF'}
            </button>
            <button
              onClick={() => removePlugin(selectedSlot)}
              style={{
                padding: '4px 12px',
                borderRadius: '50px',
                fontSize: '0.5rem',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,80,80,0.05)',
                color: '#ff6b6b',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              ✕ Удалить
            </button>
          </div>
        </div>
      )}

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
          onClick={() => showPluginSelector(selectedSlot)}
          style={{
            padding: '4px 16px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.55rem',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
            background: 'rgba(74,158,255,0.1)',
            color: '#4a9eff',
            fontFamily: 'inherit'
          }}
        >
          ➕ Добавить плагин
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.45rem', color: '#555', padding: '4px 0' }}>
        🧩 Нажмите "Добавить плагин" или дважды кликните на слот
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 10px; height: 10px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default VSTWidget