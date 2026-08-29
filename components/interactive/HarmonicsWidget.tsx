// components/interactive/HarmonicsWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface HarmonicsParams {
  type: 'even' | 'odd' | 'mixed' | 'sine'
  harmonicsLevel: number
  drive: number
  filter: number
}

const HarmonicsWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<HarmonicsParams>({
    type: 'mixed',
    harmonicsLevel: 50,
    drive: 30,
    filter: 50,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const presets: Record<string, HarmonicsParams> = {
    'Тёплый (ламповый)': { type: 'even', harmonicsLevel: 60, drive: 25, filter: 40 },
    'Агрессивный (транзисторный)': { type: 'odd', harmonicsLevel: 70, drive: 45, filter: 60 },
    'Сбалансированный': { type: 'mixed', harmonicsLevel: 50, drive: 30, filter: 50 },
    'Чистый (синус)': { type: 'sine', harmonicsLevel: 0, drive: 0, filter: 50 },
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
    const graphY = 24
    const graphW = W - margin * 2
    const graphH = H - 50

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    const typeLabels = { even: 'Чётные (теплота)', odd: 'Нечётные (агрессия)', mixed: 'Смешанные', sine: 'Синус (чистый)' }
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`🎵 Гармоники — ${typeLabels[params.type]}`, margin, 2)

    // === Генерация спектра ===
    const freqCount = 80
    const freqs: number[] = []
    const minFreq = 20
    const maxFreq = 20000

    for (let i = 0; i < freqCount; i++) {
      const t = i / freqCount
      freqs.push(Math.pow(10, Math.log10(minFreq) + t * (Math.log10(maxFreq) - Math.log10(minFreq))))
    }

    // Основная частота (440 Гц)
    const fundamental = 440
    const fundIdx = Math.round((Math.log10(fundamental) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq)) * freqCount)

    const spectrum: number[] = []
    const harmonicsLevel = params.harmonicsLevel / 100
    const drive = params.drive / 100
    const filter = params.filter / 100

    const isEven = params.type === 'even'
    const isOdd = params.type === 'odd'
    const isMixed = params.type === 'mixed'
    const isSine = params.type === 'sine'

    for (let i = 0; i < freqCount; i++) {
      const freq = freqs[i]
      let amp = 0

      // Основная частота
      if (i === fundIdx) {
        amp = 0.7
      }

      // Гармоники
      if (!isSine) {
        const harmonicCount = 8
        for (let h = 2; h <= harmonicCount; h++) {
          const hFreq = fundamental * h
          const hIdx = Math.round((Math.log10(hFreq) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq)) * freqCount)
          if (hIdx === i) {
            let hAmp = 0.3 / h            // Чётные гармоники
            if (h % 2 === 0) {
              if (isEven || isMixed) hAmp *= (1 + harmonicsLevel * 1.5)
              else hAmp *= 0.1
            }
            // Нечётные гармоники
            else {
              if (isOdd || isMixed) hAmp *= (1 + harmonicsLevel * 1.5)
              else hAmp *= 0.1
            }
            // Drive (усиление всех гармоник)
            hAmp *= (1 + drive * 1.5)
            amp += hAmp
          }
        }
      }

      // Фильтр (ослабление высоких частот)
      const filterFactor = 1 - (i / freqCount) * (1 - filter) * 0.8
      amp *= filterFactor

      spectrum.push(Math.min(1, Math.max(0, amp)))
    }

    // === Оси ===
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(graphX, graphY)
    ctx.lineTo(graphX, graphY + graphH)
    ctx.lineTo(graphX + graphW, graphY + graphH)
    ctx.stroke()

    // === Спектр ===
    const barWidth = graphW / freqCount

    for (let i = 0; i < spectrum.length; i++) {
      const x = graphX + i * barWidth
      const h = spectrum[i] * graphH * 0.85
      const y = graphY + graphH - h

      const isFundamental = i === fundIdx
      const isHarmonic = spectrum[i] > 0.1 && !isFundamental

      let color = 'rgba(74,158,255,0.3)'
      if (isFundamental) color = '#f5c542'
      else if (isHarmonic && params.type === 'even') color = 'rgba(80,200,120,0.5)'
      else if (isHarmonic && params.type === 'odd') color = 'rgba(255,107,107,0.5)'
      else if (isHarmonic && params.type === 'mixed') color = 'rgba(200,200,150,0.4)'

      ctx.fillStyle = color
      ctx.fillRect(x, y, Math.max(1, barWidth - 1), Math.max(1, h))
    }

    // === Подписи частот ===
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const freqLabels = [20, 100, 440, 1000, 5000, 10000, 20000]
    for (const f of freqLabels) {
      const idx = (Math.log10(f) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq))
      const x = graphX + idx * graphW
      ctx.fillText(f >= 1000 ? `${f/1000}k` : `${f}`, x, graphY + graphH + 2)
    }

    // === Отметка основной частоты ===
    const fundX = graphX + (fundIdx / freqCount) * graphW
    ctx.fillStyle = 'rgba(245,197,66,0.1)'
    ctx.fillRect(fundX - 2, graphY, 4, graphH)
    ctx.fillStyle = 'rgba(245,197,66,0.3)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText('440 Гц', fundX, graphY - 2)

    // === Информация ===
    const infoY = graphY + graphH + 12
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 4)
    ctx.fill()

    const infoText = `Harmonics: ${params.harmonicsLevel}%  |  Drive: ${params.drive}%  |  Filter: ${params.filter}%`

    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(infoText, graphX + graphW / 2, infoY + 7)

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
  const updateParam = useCallback((key: keyof HarmonicsParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
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
      type: 'mixed',
      harmonicsLevel: 50,
      drive: 30,
      filter: 50,
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Harmonics Visualizer
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
        <div style={{
          position: 'absolute',
          bottom: '4px',
          right: '8px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '0.35rem',
          color: '#888'
        }}>
          🟡 Основная частота · 🟢 Чётные · 🔴 Нечётные
        </div>
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

      {/* Выбор типа гармоник */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        <button
          onClick={() => updateParam('type', 'even')}
          style={{
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.45rem',
            fontWeight: 600,
            border: params.type === 'even' ? '2px solid rgba(80,200,120,0.4)' : '1px solid rgba(255,255,255,0.06)',
            background: params.type === 'even' ? 'rgba(80,200,120,0.1)' : 'rgba(255,255,255,0.03)',
            color: params.type === 'even' ? '#50c878' : '#888',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          🟢 Чётные (теплота)
        </button>
        <button
          onClick={() => updateParam('type', 'odd')}
          style={{
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.45rem',
            fontWeight: 600,
            border: params.type === 'odd' ? '2px solid rgba(255,107,107,0.4)' : '1px solid rgba(255,255,255,0.06)',
            background: params.type === 'odd' ? 'rgba(255,107,107,0.1)' : 'rgba(255,255,255,0.03)',
            color: params.type === 'odd' ? '#ff6b6b' : '#888',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          🔴 Нечётные (агрессия)
        </button>
        <button
          onClick={() => updateParam('type', 'mixed')}
          style={{
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.45rem',
            fontWeight: 600,
            border: params.type === 'mixed' ? '2px solid rgba(245,197,66,0.4)' : '1px solid rgba(255,255,255,0.06)',
            background: params.type === 'mixed' ? 'rgba(245,197,66,0.1)' : 'rgba(255,255,255,0.03)',
            color: params.type === 'mixed' ? '#f5c542' : '#888',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          🟡 Смешанные
        </button>
        <button
          onClick={() => updateParam('type', 'sine')}
          style={{
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.45rem',
            fontWeight: 600,
            border: params.type === 'sine' ? '2px solid rgba(74,158,255,0.4)' : '1px solid rgba(255,255,255,0.06)',
            background: params.type === 'sine' ? 'rgba(74,158,255,0.1)' : 'rgba(255,255,255,0.03)',
            color: params.type === 'sine' ? '#4a9eff' : '#888',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          🔵 Синус (чистый)
        </button>
      </div>

      {/* Параметры */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '4px',
        marginBottom: '10px'
      }}>
        <div style={{ padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Harmonics</span>
            <span style={{ fontSize: '0.45rem', color: '#f5c542' }}>{params.harmonicsLevel}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.harmonicsLevel}
            onChange={(e) => updateParam('harmonicsLevel', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Drive</span>
            <span style={{ fontSize: '0.45rem', color: '#ff6b6b' }}>{params.drive}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.drive}
            onChange={(e) => updateParam('drive', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Filter</span>
            <span style={{ fontSize: '0.45rem', color: '#4a9eff' }}>{params.filter}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.filter}
            onChange={(e) => updateParam('filter', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #4a9eff, rgba(255,255,255,0.07))',
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
        🎵 Настройте гармоники и наблюдайте за изменением спектра
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default HarmonicsWidget