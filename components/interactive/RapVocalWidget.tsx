// components/interactive/RapVocalWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface RapVocalParams {
  style: 'aggressive' | 'melodic' | 'lofi' | 'boombap'
  compression: number
  saturation: number
  presence: number
  reverb: number
  delay: number
  adlibs: number
}

const RapVocalWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<RapVocalParams>({
    style: 'aggressive',
    compression: 70,
    saturation: 40,
    presence: 50,
    reverb: 15,
    delay: 15,
    adlibs: 30,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const styles = [
    { id: 'aggressive', label: '🔥 Агрессивный', color: '#ff6b6b' },
    { id: 'melodic', label: '🎵 Мелодичный', color: '#4a9eff' },
    { id: 'lofi', label: '🎧 Лоу-фай', color: '#f5c542' },
    { id: 'boombap', label: '🎚️ Бум-бэп', color: '#50c878' },
  ]

  const presets: Record<string, RapVocalParams> = {
    'Агрессивный': { style: 'aggressive', compression: 80, saturation: 50, presence: 70, reverb: 10, delay: 15, adlibs: 25 },
    'Мелодичный': { style: 'melodic', compression: 50, saturation: 30, presence: 50, reverb: 25, delay: 25, adlibs: 35 },
    'Лоу-фай': { style: 'lofi', compression: 60, saturation: 60, presence: 40, reverb: 30, delay: 30, adlibs: 40 },
    'Бум-бэп': { style: 'boombap', compression: 70, saturation: 30, presence: 50, reverb: 15, delay: 15, adlibs: 25 },
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
    const graphH = H - 50

    const currentStyle = styles.find(s => s.id === params.style) || styles[0]

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`🎤 Рэп-вокал — ${currentStyle.label}`, margin, 2)

    // === Визуализация ===
    const centerY = graphY + graphH / 2
    const steps = 200

    // Параметры визуализации
    const compFactor = params.compression / 100
    const satFactor = params.saturation / 100
    const presFactor = params.presence / 100
    const revFactor = params.reverb / 100
    const delFactor = params.delay / 100
    const adlibFactor = params.adlibs / 100

    // Основная волна (вокал)
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      let val = Math.sin(t) * 0.4 + Math.sin(t * 2 + 0.3) * 0.15 + Math.sin(t * 3 + 0.7) * 0.05
      // Компрессия делает волну более "плоской" и плотной
      const compGain = 1 + compFactor * 0.5
      val = Math.min(1, Math.max(-1, val * compGain))
      // Сатурация добавляет гармоники
      const satGain = 1 + satFactor * 0.3
      val = Math.tanh(val * satGain) / Math.tanh(satGain)
      const y = centerY - val * 30
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#f5c542'
    ctx.lineWidth = 2.5
    ctx.shadowColor = 'rgba(245,197,66,0.3)'
    ctx.shadowBlur = 6
    ctx.stroke()
    ctx.shadowBlur = 0

    // Присутствие (яркие всплески)
    if (presFactor > 0.2) {
      ctx.fillStyle = `rgba(245,197,66,${presFactor * 0.08})`
      for (let i = 0; i < 20; i++) {
        const x = graphX + Math.random() * graphW
        const y = centerY - Math.random() * 40 * presFactor
        ctx.fillRect(x - 2, y - 2, 4, 4)
      }
    }

    // Реверберация (затухающие хвосты)
    if (revFactor > 0.1) {
      ctx.strokeStyle = `rgba(200,200,255,${revFactor * 0.15})`
      ctx.lineWidth = 1
      for (let i = 0; i < 30; i++) {
        const offset = 20 + i * 3
        const decay = Math.exp(-i * 0.1)
        if (decay < 0.05) break
        const yOffset = (Math.random() - 0.5) * 20 * revFactor
        ctx.beginPath()
        const x = graphX + graphW - 20 - i * 5
        const y = centerY + yOffset
        ctx.moveTo(x, y)
        ctx.lineTo(x + 10 * decay, y + (Math.random() - 0.5) * 10 * revFactor)
        ctx.stroke()
      }
    }

    // Дилей (повторы)
    if (delFactor > 0.1) {
      ctx.fillStyle = `rgba(255,255,200,${delFactor * 0.1})`
      for (let i = 0; i < 10; i++) {
        const delay = 10 + i * 8
        const decay = Math.exp(-i * 0.2)
        if (decay < 0.05) break
        const x = graphX + graphW - 20 - delay
        const y = centerY + (Math.random() - 0.5) * 15
        ctx.beginPath()
        ctx.arc(x, y, 2 * decay, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Ad-libs (маленькие голоса по бокам)
    if (adlibFactor > 0.1) {
      ctx.fillStyle = `rgba(200,200,200,${adlibFactor * 0.15})`
      for (let i = 0; i < 20; i++) {
        const t = i / 20
        const x = graphX + t * graphW
        const side = i % 2 === 0 ? -1 : 1
        const y = centerY + side * (25 + Math.random() * 15) * adlibFactor * 0.8
        ctx.beginPath()
        ctx.arc(x, y, 3 + Math.random() * 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // === Легенда ===
    const legendY = graphY + graphH + 4
    const legendItems = [
      { label: 'Вокал', color: '#f5c542' },
      { label: 'Ad-libs', color: 'rgba(200,200,200,0.3)' },
      { label: 'Резерберация', color: 'rgba(200,200,255,0.15)' },
      { label: 'Дилей', color: 'rgba(255,255,200,0.1)' },
    ]

    let legendX = graphX
    for (const item of legendItems) {
      ctx.fillStyle = item.color
      ctx.fillRect(legendX, legendY, 10, 3)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(item.label, legendX + 14, legendY + 2)
      legendX += 60
    }

    // === Информация ===
    const infoY = legendY + 12
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 4)
    ctx.fill()

    const compText = `Comp: ${params.compression}%`
    const satText = `Sat: ${params.saturation}%`
    const presText = `Pres: ${params.presence}%`
    const revText = `Rev: ${params.reverb}%`
    const delText = `Del: ${params.delay}%`
    const adText = `Ad: ${params.adlibs}%`

    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${compText}  |  ${satText}  |  ${presText}  |  ${revText}  |  ${delText}  |  ${adText}`, graphX + graphW / 2, infoY + 7)

  }, [params])

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
      canvas.height = Math.min(200, w * 0.25)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ =====
  useEffect(() => {
    renderWidget()
  }, [params, renderWidget])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof RapVocalParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ИЗМЕНЕНИЕ СТИЛЯ =====
  const setStyle = useCallback((style: 'aggressive' | 'melodic' | 'lofi' | 'boombap') => {
    setParams(prev => ({ ...prev, style }))
  }, [])

  // ===== ЗАГРУЗКА ПРЕСЕТА =====
  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) {
      setParams(preset)
    }
  }, [])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setParams({
      style: 'aggressive',
      compression: 70,
      saturation: 40,
      presence: 50,
      reverb: 15,
      delay: 15,
      adlibs: 30,
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Rap Vocal Processor
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

      {/* Стили */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {styles.map(s => (
          <button
            key={s.id}
            onClick={() => setStyle(s.id as any)}
            style={{
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '0.5rem',
              fontWeight: 600,
              border: params.style === s.id ? `2px solid ${s.color}` : '1px solid rgba(255,255,255,0.06)',
              background: params.style === s.id ? `${s.color}20` : 'rgba(255,255,255,0.03)',
              color: params.style === s.id ? s.color : '#888',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {s.label}
          </button>
        ))}
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

      {/* Параметры */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
        gap: '4px',
        marginBottom: '10px'
      }}>
        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Comp</span>
            <span style={{ fontSize: '0.45rem', color: '#ff6b6b' }}>{params.compression}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.compression}
            onChange={(e) => updateParam('compression', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #ff6b6b, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Sat</span>
            <span style={{ fontSize: '0.45rem', color: '#f5c542' }}>{params.saturation}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.saturation}
            onChange={(e) => updateParam('saturation', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #f5c542, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Pres</span>
            <span style={{ fontSize: '0.45rem', color: '#4a9eff' }}>{params.presence}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.presence}
            onChange={(e) => updateParam('presence', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #4a9eff, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Reverb</span>
            <span style={{ fontSize: '0.45rem', color: '#c77dff' }}>{params.reverb}%</span>
          </div>
          <input
            type="range" min="0" max="50" step="1"
            value={params.reverb}
            onChange={(e) => updateParam('reverb', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #c77dff, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Delay</span>
            <span style={{ fontSize: '0.45rem', color: '#ff8c42' }}>{params.delay}%</span>
          </div>
          <input
            type="range" min="0" max="40" step="1"
            value={params.delay}
            onChange={(e) => updateParam('delay', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #ff8c42, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Ad-libs</span>
            <span style={{ fontSize: '0.45rem', color: '#da70d6' }}>{params.adlibs}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.adlibs}
            onChange={(e) => updateParam('adlibs', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #da70d6, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

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
        🎤 Настройте обработку рэп-вокала — компрессия, сатурация, присутствие, эффекты
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default RapVocalWidget