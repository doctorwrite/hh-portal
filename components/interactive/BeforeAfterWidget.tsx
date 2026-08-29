// components/interactive/BeforeAfterWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface BeforeAfterParams {
  mode: 'before' | 'after' | 'compare'
  intensity: number
}

const BeforeAfterWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<BeforeAfterParams>({
    mode: 'compare',
    intensity: 50,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

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
    const graphH = H - 60

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    const modeLabels = { before: '🔴 До обработки', after: '🟢 После обработки', compare: '🔄 Сравнение' }
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`🎤 Спасение вокала — ${modeLabels[params.mode]}`, margin, 2)

    // === Волна ===
    const centerY = graphY + graphH / 2
    const steps = 300

    // До обработки (нечёткая, с шумом, с ошибками)
    const beforeAmp = 25
    const afterAmp = 30

    // Рисуем "До" (красная, нечёткая)
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      let val = Math.sin(t * 0.8 + 0.2) * 0.3 + Math.sin(t * 1.6 + 0.5) * 0.1
      val += (Math.random() - 0.5) * 0.15 // шум
      // Ошибки интонации (скачки)
      if (t > 0.3 && t < 0.4) val += 0.2
      if (t > 0.7 && t < 0.75) val -= 0.25
      const y = centerY - val * beforeAmp
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = 'rgba(255,80,80,0.4)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Рисуем "После" (зелёная, чистая)
    ctx.beginPath()
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW
      let val = Math.sin(t * 0.8 + 0.2) * 0.35 + Math.sin(t * 1.6 + 0.5) * 0.12
      // Чистая, без ошибок
      const y = centerY - val * afterAmp
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = 'rgba(80,200,120,0.6)'
    ctx.lineWidth = 2.5
    ctx.shadowColor = 'rgba(80,200,120,0.2)'
    ctx.shadowBlur = 6
    ctx.stroke()
    ctx.shadowBlur = 0

    // === Если режим сравнения — показываем разделитель ===
    if (params.mode === 'compare') {
      const splitX = graphX + (params.intensity / 100) * graphW
      ctx.fillStyle = 'rgba(255,255,255,0.03)'
      ctx.fillRect(splitX, graphY, 2, graphH)
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('◄ ДО', splitX - 20, graphY + graphH + 4)
      ctx.fillText('ПОСЛЕ ►', splitX + 22, graphY + graphH + 4)
    }

    // === Легенда ===
    const legendY = graphY + graphH + 14
    const legendItems = [
      { label: 'До обработки', color: 'rgba(255,80,80,0.4)' },
      { label: 'После обработки', color: 'rgba(80,200,120,0.6)' },
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
      legendX += 80
    }

    // === Информация ===
    const infoY = legendY + 10
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 14, 4)
    ctx.fill()

    const infoText = params.mode === 'before'
      ? '❌ Клиппинг, фальшь, шум, сбитый ритм'
      : params.mode === 'after'
      ? '✅ Чисто, ровно, профессионально'
      : '🔄 Сравните результат до и после обработки'

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
  const updateParam = useCallback((key: keyof BeforeAfterParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setParams({
      mode: 'compare',
      intensity: 50,
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Before & After
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

      {/* Режимы */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        <button
          onClick={() => updateParam('mode', 'before')}
          style={{
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '0.5rem',
            fontWeight: 600,
            border: params.mode === 'before' ? '2px solid rgba(255,80,80,0.4)' : '1px solid rgba(255,255,255,0.06)',
            background: params.mode === 'before' ? 'rgba(255,80,80,0.1)' : 'rgba(255,255,255,0.03)',
            color: params.mode === 'before' ? '#ff6b6b' : '#888',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          🔴 До
        </button>
        <button
          onClick={() => updateParam('mode', 'after')}
          style={{
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '0.5rem',
            fontWeight: 600,
            border: params.mode === 'after' ? '2px solid rgba(80,200,120,0.4)' : '1px solid rgba(255,255,255,0.06)',
            background: params.mode === 'after' ? 'rgba(80,200,120,0.1)' : 'rgba(255,255,255,0.03)',
            color: params.mode === 'after' ? '#50c878' : '#888',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          🟢 После
        </button>
        <button
          onClick={() => updateParam('mode', 'compare')}
          style={{
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '0.5rem',
            fontWeight: 600,
            border: params.mode === 'compare' ? '2px solid rgba(245,197,66,0.4)' : '1px solid rgba(255,255,255,0.06)',
            background: params.mode === 'compare' ? 'rgba(245,197,66,0.1)' : 'rgba(255,255,255,0.03)',
            color: params.mode === 'compare' ? '#f5c542' : '#888',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          🔄 Сравнить
        </button>
      </div>

      {/* Ползунок сравнения */}
      {params.mode === 'compare' && (
        <div style={{
          padding: '4px 8px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '6px',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.35rem', color: '#666' }}>Разделитель</span>
            <span style={{ fontSize: '0.45rem', color: '#f5c542' }}>{params.intensity}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.intensity}
            onChange={(e) => updateParam('intensity', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #f5c542, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
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
        🎤 Сравните вокал до и после профессиональной обработки
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default BeforeAfterWidget