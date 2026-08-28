// components/interactive/VocalProcessingWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ProcessingModule {
  id: string
  name: string
  icon: string
  enabled: boolean
  value: number
  color: string
}

interface VocalProcessingParams {
  modules: ProcessingModule[]
  chainOrder: string[]
}

const VocalProcessingWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<VocalProcessingParams>({
    modules: [
      { id: 'hpf', name: 'HPF', icon: '📐', enabled: true, value: 80, color: '#4a9eff' },
      { id: 'deesser', name: 'Деэссер', icon: '🔇', enabled: true, value: 50, color: '#da70d6' },
      { id: 'fet', name: 'FET 1176', icon: '⚡', enabled: true, value: 70, color: '#ff6b6b' },
      { id: 'opto', name: 'LA-2A', icon: '🌊', enabled: true, value: 30, color: '#50c878' },
      { id: 'dyn_eq', name: 'Dyn EQ', icon: '🎯', enabled: true, value: 40, color: '#f5c542' },
      { id: 'saturation', name: 'Сатурация', icon: '🔥', enabled: true, value: 40, color: '#ff8c42' },
      { id: 'presence', name: 'Присутствие', icon: '🔊', enabled: true, value: 50, color: '#4a9eff' },
      { id: 'air', name: 'Воздух', icon: '💨', enabled: true, value: 30, color: '#c77dff' },
      { id: 'reverb', name: 'Реверберация', icon: '🌊', enabled: true, value: 20, color: '#c77dff' },
      { id: 'delay', name: 'Дилей', icon: '⏳', enabled: true, value: 15, color: '#ff8c42' },
    ],
    chainOrder: ['hpf', 'deesser', 'fet', 'opto', 'dyn_eq', 'saturation', 'presence', 'air', 'reverb', 'delay'],
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const presets: Record<string, { modules: Partial<ProcessingModule>[]; order: string[] }> = {
    'Поп': {
      modules: [
        { id: 'hpf', value: 80, enabled: true },
        { id: 'deesser', value: 40, enabled: true },
        { id: 'fet', value: 50, enabled: true },
        { id: 'opto', value: 40, enabled: true },
        { id: 'dyn_eq', value: 30, enabled: true },
        { id: 'saturation', value: 25, enabled: true },
        { id: 'presence', value: 50, enabled: true },
        { id: 'air', value: 35, enabled: true },
        { id: 'reverb', value: 25, enabled: true },
        { id: 'delay', value: 20, enabled: true },
      ],
      order: ['hpf', 'deesser', 'fet', 'opto', 'dyn_eq', 'saturation', 'presence', 'air', 'reverb', 'delay']
    },
    'Рэп': {
      modules: [
        { id: 'hpf', value: 90, enabled: true },
        { id: 'deesser', value: 50, enabled: true },
        { id: 'fet', value: 85, enabled: true },
        { id: 'opto', value: 20, enabled: true },
        { id: 'dyn_eq', value: 40, enabled: true },
        { id: 'saturation', value: 50, enabled: true },
        { id: 'presence', value: 70, enabled: true },
        { id: 'air', value: 25, enabled: true },
        { id: 'reverb', value: 12, enabled: true },
        { id: 'delay', value: 15, enabled: true },
      ],
      order: ['hpf', 'deesser', 'fet', 'opto', 'dyn_eq', 'saturation', 'presence', 'air', 'reverb', 'delay']
    },
    'Рок': {
      modules: [
        { id: 'hpf', value: 100, enabled: true },
        { id: 'deesser', value: 60, enabled: true },
        { id: 'fet', value: 75, enabled: true },
        { id: 'opto', value: 30, enabled: true },
        { id: 'dyn_eq', value: 40, enabled: true },
        { id: 'saturation', value: 45, enabled: true },
        { id: 'presence', value: 60, enabled: true },
        { id: 'air', value: 20, enabled: true },
        { id: 'reverb', value: 15, enabled: true },
        { id: 'delay', value: 12, enabled: true },
      ],
      order: ['hpf', 'deesser', 'fet', 'opto', 'dyn_eq', 'saturation', 'presence', 'air', 'reverb', 'delay']
    },
    'Джаз': {
      modules: [
        { id: 'hpf', value: 70, enabled: true },
        { id: 'deesser', value: 30, enabled: true },
        { id: 'fet', value: 30, enabled: true },
        { id: 'opto', value: 50, enabled: true },
        { id: 'dyn_eq', value: 20, enabled: true },
        { id: 'saturation', value: 15, enabled: true },
        { id: 'presence', value: 40, enabled: true },
        { id: 'air', value: 40, enabled: true },
        { id: 'reverb', value: 30, enabled: true },
        { id: 'delay', value: 15, enabled: true },
      ],
      order: ['hpf', 'deesser', 'fet', 'opto', 'dyn_eq', 'saturation', 'presence', 'air', 'reverb', 'delay']
    },
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
    const graphH = H - 40

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('🎤 Вокальная цепочка (продвинутая)', margin, 2)

    // === Цепочка модулей ===
    const moduleWidth = 48
    const moduleGap = 4
    const totalWidth = params.chainOrder.length * (moduleWidth + moduleGap) - moduleGap
    const startX = graphX + (graphW - totalWidth) / 2
    const startY = graphY + 14

    for (let i = 0; i < params.chainOrder.length; i++) {
      const id = params.chainOrder[i]
      const module = params.modules.find(m => m.id === id)
      if (!module) continue

      const x = startX + i * (moduleWidth + moduleGap)
      const y = startY
      const w = moduleWidth
      const h = 48
      const isSelected = selectedModule === id
      const isEnabled = module.enabled

      // Фон модуля
      ctx.fillStyle = isSelected ? 'rgba(245,197,66,0.08)' : 'rgba(255,255,255,0.02)'
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 4)
      ctx.fill()

      // Рамка
      ctx.strokeStyle = isSelected ? 'rgba(245,197,66,0.3)' : (isEnabled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)')
      ctx.lineWidth = isSelected ? 1.5 : 0.5
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 4)
      ctx.stroke()

      // Иконка
      ctx.fillStyle = isEnabled ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(module.icon, x + w / 2, y + 4)

      // Название
      ctx.fillStyle = isEnabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(module.name, x + w / 2, y + 22)

      // Индикатор значения
      const val = module.value / 100
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.fillRect(x + 4, y + 36, w - 8, 4)
      if (isEnabled) {
        ctx.fillStyle = module.color
        ctx.fillRect(x + 4, y + 36, Math.max(2, val * (w - 8)), 4)
      }

      // Индикатор включения
      ctx.fillStyle = isEnabled ? 'rgba(80,200,120,0.3)' : 'rgba(255,80,80,0.2)'
      ctx.beginPath()
      ctx.arc(x + w - 6, y + 6, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = isEnabled ? '#50c878' : '#ff6b6b'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(isEnabled ? '●' : '○', x + w - 6, y + 6)

      // Стрелка (между модулями)
      if (i < params.chainOrder.length - 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.05)'
        ctx.font = '6px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('→', x + w + moduleGap / 2, y + h / 2)
      }
    }

    // === Информация ===
    const infoY = startY + 48 + 12
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 4)
    ctx.fill()

    const selected = params.modules.find(m => m.id === selectedModule)
    const infoText = selected
      ? `${selected.icon} ${selected.name}: ${selected.value}% ${selected.enabled ? '✅ Вкл' : '❌ Выкл'}`
      : '🖱️ Клик по модулю для настройки'

    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(infoText, graphX + graphW / 2, infoY + 7)

    // === Легенда ===
    const legendY = infoY + 16
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(0, legendY - 1, W, 10)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '3px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('🟢 Вкл  ●  🔴 Выкл  ●  🖱️ Клик = выбор  ●  ⚡ Значение = интенсивность', margin + 4, legendY + 5)

  }, [params, selectedModule])

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
      canvas.height = Math.min(180, w * 0.22)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ =====
  useEffect(() => {
    renderWidget()
  }, [params, selectedModule, renderWidget])

  // ===== ОБРАБОТЧИКИ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getModuleAt = (x: number, y: number): string | null => {
      const W = canvas.width
      const graphX = 12
      const graphW = W - 24
      const moduleWidth = 48
      const moduleGap = 4
      const totalWidth = params.chainOrder.length * (moduleWidth + moduleGap) - moduleGap
      const startX = graphX + (graphW - totalWidth) / 2
      const startY = 34

      for (let i = 0; i < params.chainOrder.length; i++) {
        const mx = startX + i * (moduleWidth + moduleGap)
        const my = startY
        const mw = moduleWidth
        const mh = 48
        if (x >= mx && x <= mx + mw && y >= my && y <= my + mh) {
          return params.chainOrder[i]
        }
      }
      return null
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * canvas.width
      const y = (e.clientY - rect.top) / rect.height * canvas.height

      const id = getModuleAt(x, y)
      if (id) {
        if (selectedModule === id) {
          // Переключение включения
          setParams(prev => ({
            ...prev,
            modules: prev.modules.map(m =>
              m.id === id ? { ...m, enabled: !m.enabled } : m
            )
          }))
        } else {
          setSelectedModule(id)
        }
      } else {
        setSelectedModule(null)
      }
    }

    canvas.addEventListener('click', handleClick)
    canvas.style.cursor = 'pointer'

    return () => canvas.removeEventListener('click', handleClick)
  }, [params, selectedModule])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateModuleValue = useCallback((id: string, value: number) => {
    setParams(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === id ? { ...m, value: Math.max(0, Math.min(100, value)) } : m
      )
    }))
  }, [])

  // ===== ПЕРЕКЛЮЧЕНИЕ МОДУЛЯ =====
  const toggleModule = useCallback((id: string) => {
    setParams(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === id ? { ...m, enabled: !m.enabled } : m
      )
    }))
  }, [])

  // ===== ЗАГРУЗКА ПРЕСЕТА =====
  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) {
      setParams(prev => ({
        ...prev,
        modules: prev.modules.map(m => {
          const update = preset.modules.find(p => p.id === m.id)
          return update ? { ...m, ...update } : m
        }),
        chainOrder: preset.order,
      }))
      setSelectedModule(null)
    }
  }, [])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setParams({
      modules: [
        { id: 'hpf', name: 'HPF', icon: '📐', enabled: true, value: 80, color: '#4a9eff' },
        { id: 'deesser', name: 'Деэссер', icon: '🔇', enabled: true, value: 50, color: '#da70d6' },
        { id: 'fet', name: 'FET 1176', icon: '⚡', enabled: true, value: 70, color: '#ff6b6b' },
        { id: 'opto', name: 'LA-2A', icon: '🌊', enabled: true, value: 30, color: '#50c878' },
        { id: 'dyn_eq', name: 'Dyn EQ', icon: '🎯', enabled: true, value: 40, color: '#f5c542' },
        { id: 'saturation', name: 'Сатурация', icon: '🔥', enabled: true, value: 40, color: '#ff8c42' },
        { id: 'presence', name: 'Присутствие', icon: '🔊', enabled: true, value: 50, color: '#4a9eff' },
        { id: 'air', name: 'Воздух', icon: '💨', enabled: true, value: 30, color: '#c77dff' },
        { id: 'reverb', name: 'Реверберация', icon: '🌊', enabled: true, value: 20, color: '#c77dff' },
        { id: 'delay', name: 'Дилей', icon: '⏳', enabled: true, value: 15, color: '#ff8c42' },
      ],
      chainOrder: ['hpf', 'deesser', 'fet', 'opto', 'dyn_eq', 'saturation', 'presence', 'air', 'reverb', 'delay'],
    })
    setSelectedModule(null)
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Vocal Chain
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

      {/* Выбранный модуль */}
      {selectedModule && (
        <div style={{
          padding: '6px 10px',
          background: 'rgba(245,197,66,0.06)',
          borderRadius: '6px',
          marginBottom: '10px',
          border: '1px solid rgba(245,197,66,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '4px'
        }}>
          <span style={{ fontSize: '0.45rem', color: '#f5c542' }}>
            Выбран: <strong>{params.modules.find(m => m.id === selectedModule)?.name}</strong>
          </span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={params.modules.find(m => m.id === selectedModule)?.value || 0}
              onChange={(e) => updateModuleValue(selectedModule, parseInt(e.target.value))}
              style={{
                width: '100px',
                height: '2px',
                appearance: 'none',
                background: 'linear-gradient(to right, #f5c542, rgba(255,255,255,0.07))',
                cursor: 'pointer'
              }}
            />
            <button
              onClick={() => toggleModule(selectedModule)}
              style={{
                padding: '2px 10px',
                borderRadius: '50px',
                fontSize: '0.4rem',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.06)',
                background: params.modules.find(m => m.id === selectedModule)?.enabled ? 'rgba(80,200,120,0.1)' : 'rgba(255,80,80,0.1)',
                color: params.modules.find(m => m.id === selectedModule)?.enabled ? '#50c878' : '#ff6b6b',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {params.modules.find(m => m.id === selectedModule)?.enabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}

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
        🎤 Клик по модулю — выбор, повторный клик — ON/OFF, ползунок — интенсивность
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default VocalProcessingWidget