// components/interactive/ClippingWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ClippingParams {
  clipLevel: number
  showSpectrum: boolean
  gain: number
}

const ClippingWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<ClippingParams>({
    clipLevel: 0,
    showSpectrum: true,
    gain: 80
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentClipLevel, setCurrentClipLevel] = useState(0)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const clipLevels = [0, 3, 6, 10, 15, 20]

  // ===== РЕНДЕРИНГ =====
  const renderWidget = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    const clipDb = currentClipLevel
    const isClipping = clipDb > 0
    const amp = 0.8 * (params.gain / 100)
    const margin = 16
    const graphW = W - margin * 2
    const graphH = 120
    const graphX = margin
    const graphY = 28

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Визуализация волны ===
    const steps = 300
    const centerY = graphY + graphH / 2
    const maxAmp = amp * (graphH / 2 - 8)

    // Генерация сигнала (синус с гармониками)
    const signal: { x: number; y: number; clipped: boolean }[] = []

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 * Math.PI
      const x = graphX + (i / steps) * graphW

      // Основной сигнал + гармоники
      let val = Math.sin(t) * 0.6
      val += Math.sin(t * 2 + 0.5) * 0.2
      val += Math.sin(t * 3 + 0.2) * 0.1
      val += Math.sin(t * 4 + 0.7) * 0.05

      // Применяем клиппинг
      let clipped = false
      if (isClipping) {
        const clipThreshold = 1 - clipDb / 30
        if (val > clipThreshold) {
          val = clipThreshold
          clipped = true
        } else if (val < -clipThreshold) {
          val = -clipThreshold
          clipped = true
        }
      }

      const y = centerY - val * maxAmp
      signal.push({ x, y, clipped })
    }

    // === Волна (фон) ===
    ctx.beginPath()
    ctx.moveTo(signal[0].x, signal[0].y)
    for (let i = 1; i < signal.length; i++) {
      ctx.lineTo(signal[i].x, signal[i].y)
    }
    ctx.strokeStyle = isClipping ? 'rgba(255,107,107,0.15)' : 'rgba(74,158,255,0.1)'
    ctx.lineWidth = 1
    ctx.stroke()

    // === Волна (основная) ===
    ctx.beginPath()
    let lastClipped = false
    for (let i = 0; i < signal.length; i++) {
      const s = signal[i]
      if (s.clipped && isClipping) {
        if (!lastClipped) {
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(s.x, s.y)
          lastClipped = true
        }
        ctx.lineTo(s.x, s.y)
      } else {
        if (lastClipped) {
          ctx.strokeStyle = '#ff6b6b'
          ctx.lineWidth = 3
          ctx.stroke()
          ctx.beginPath()
          ctx.strokeStyle = '#f5c542'
          ctx.lineWidth = 2.5
          ctx.moveTo(s.x, s.y)
          lastClipped = false
        } else {
          if (i === 0) ctx.moveTo(s.x, s.y)
          else ctx.lineTo(s.x, s.y)
        }
      }
    }
    ctx.strokeStyle = isClipping ? '#ff6b6b' : '#f5c542'
    ctx.lineWidth = isClipping ? 2 : 2.5
    ctx.stroke()

    // === Зона клиппинга ===
    if (isClipping) {
      const clipY = centerY - (1 - clipDb / 30) * maxAmp
      ctx.fillStyle = 'rgba(255,107,107,0.06)'
      ctx.fillRect(graphX, clipY, graphW, (centerY - clipY) * 2)
      ctx.fillStyle = 'rgba(255,107,107,0.08)'
      ctx.fillRect(graphX, centerY - 1, graphW, 2)
    }

    // === Сетка ===
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 0.5
    const yLevels = [-20, -10, 0, -10, -20]
    for (const db of [-20, -10, 0]) {
      const y = centerY - (db / 20) * maxAmp
      if (y > graphY && y < graphY + graphH) {
        ctx.beginPath()
        ctx.moveTo(graphX, y)
        ctx.lineTo(graphX + graphW, y)
        ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.font = '5px sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${db}`, graphX - 4, y)
      }
    }

    // === Спектр (частотный анализ) ===
    if (params.showSpectrum) {
      const specX = graphX
      const specY = graphY
      const specW = graphW
      const specH = 36
      const specSteps = 60

      // Генерируем спектр
      const spectrum: number[] = []
      const freqMin = 20
      const freqMax = 20000

      for (let i = 0; i < specSteps; i++) {
        const t = i / specSteps
        const freq = Math.pow(10, Math.log10(freqMin) + t * (Math.log10(freqMax) - Math.log10(freqMin)))
        let amp2 = 0

        // Основные частоты
        const baseFreqs = [220, 440, 660, 880, 1100]
        for (const bf of baseFreqs) {
          const dist = Math.abs(Math.log10(freq / bf))
          if (dist < 0.1) amp2 += 0.4 * (1 - dist / 0.1)
        }

        // Гармоники клиппинга
        if (isClipping) {
          const clipHarmonics = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          for (const h of clipHarmonics) {
            const hf = 440 * h
            const dist = Math.abs(Math.log10(freq / hf))
            if (dist < 0.05) {
              const harmonicAmp = 0.05 * (1 - dist / 0.05) * (clipDb / 20)
              amp2 += harmonicAmp
            }
          }

          // Шум клиппинга (высокие частоты)
          if (freq > 5000) {
            const noiseAmp = 0.02 * (clipDb / 20) * (freq / 20000)
            amp2 += noiseAmp * (0.5 + 0.5 * Math.sin(freq / 1000))
          }
        }

        spectrum.push(Math.min(1, Math.max(0, amp2 * 2)))
      }

      // Фон спектра
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.fillRect(specX, specY, specW, specH)

      // Столбцы спектра
      const barW = specW / specSteps
      for (let i = 0; i < spectrum.length; i++) {
        const x = specX + i * barW
        const h = spectrum[i] * specH * 0.9
        const y = specY + specH - h

        // Цвет зависит от наличия клиппинга
        const isHarmonic = isClipping && i > 10 && spectrum[i] > 0.05
        ctx.fillStyle = isHarmonic
          ? `rgba(255,107,107,${0.3 + spectrum[i] * 0.5})`
          : `rgba(74,158,255,${0.1 + spectrum[i] * 0.5})`

        ctx.fillRect(x, y, Math.max(1, barW - 1), Math.max(1, h))
      }

      // Подписи частот
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const freqLabels = [20, 100, 1000, 5000, 10000, 20000]
      for (const f of freqLabels) {
        const t = (Math.log10(f) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20))
        const x = specX + t * specW
        ctx.fillText(f >= 1000 ? `${f/1000}k` : `${f}`, x, specY + specH + 2)
      }

      // Подпись "Спектр"
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'top'
      ctx.fillText('Спектр', specX + specW - 4, specY + 2)

      // Гармоники клиппинга (отметка)
      if (isClipping) {
        ctx.fillStyle = 'rgba(255,107,107,0.15)'
        ctx.fillRect(specX + specW * 0.3, specY, specW * 0.7, specH)
        ctx.fillStyle = 'rgba(255,107,107,0.3)'
        ctx.font = '4px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        ctx.fillText('⚠ Гармоники клиппинга', specX + 4, specY + specH - 2)
      }
    }

    // === Информация о клиппинге ===
    const infoY = graphY + graphH + (params.showSpectrum ? 44 : 6)

    ctx.fillStyle = isClipping ? 'rgba(255,107,107,0.1)' : 'rgba(80,200,120,0.06)'
    ctx.beginPath()
    ctx.roundRect(graphX, infoY, graphW, 22, 4)
    ctx.fill()

    const statusText = isClipping
      ? `⚠️ КЛИППИНГ! Уровень превышен на ${clipDb.toFixed(1)} дБ`
      : '✅ Нет клиппинга. Уровень в норме.'

    ctx.fillStyle = isClipping ? '#ff6b6b' : '#50c878'
    ctx.font = 'bold 7px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(statusText, graphX + 8, infoY + 11)

    // True Peak
    const truePeak = isClipping ? 0.5 + clipDb / 20 : -2 + Math.random() * 0.5
    const tpDisplay = Math.min(0, truePeak)
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(`True Peak: ${tpDisplay.toFixed(1)} dBTP`, graphX + graphW - 8, infoY + 11)

    // === Индикатор уровня ===
    const meterY = infoY + 28
    const meterW = graphW
    const meterH = 6

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.beginPath()
    ctx.roundRect(graphX, meterY, meterW, meterH, 3)
    ctx.fill()

    const level = isClipping ? 1 : 0.6 + Math.random() * 0.3
    const grad = ctx.createLinearGradient(graphX, 0, graphX + meterW, 0)
    grad.addColorStop(0, '#50c878')
    grad.addColorStop(0.6, '#f5c542')
    grad.addColorStop(0.85, '#ff6b6b')
    grad.addColorStop(1, '#ff0000')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(graphX, meterY, Math.min(meterW, (isClipping ? 1 : level) * meterW), meterH, 3)
    ctx.fill()

    // Маркер 0 dB
    const zeroX = graphX + meterW
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fillRect(zeroX - 1, meterY - 2, 2, meterH + 4)

    // Подписи
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('-∞', graphX, meterY + meterH + 2)
    ctx.textAlign = 'right'
    ctx.fillText('0 dBFS', graphX + meterW, meterY + meterH + 2)

  }, [currentClipLevel, params])

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
      canvas.height = Math.min(260, w * 0.32)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ ПАРАМЕТРОВ =====
  useEffect(() => {
    renderWidget()
  }, [currentClipLevel, params, renderWidget])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof ClippingParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ИЗМЕНЕНИЕ УРОВНЯ КЛИППИНГА =====
  const setClipLevel = useCallback((level: number) => {
    setCurrentClipLevel(level)
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setCurrentClipLevel(0)
    setParams({
      clipLevel: 0,
      showSpectrum: true,
      gain: 80
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Clipping Visualizer
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
        {currentClipLevel > 0 && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(255,80,80,0.15)',
            border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '0.55rem',
            color: '#ff6b6b',
            fontWeight: 700,
            animation: 'pulse 0.8s ease-in-out infinite'
          }}>
            ⚠️ КЛИППИНГ
          </div>
        )}
      </div>

      {/* Выбор уровня клиппинга */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        <button
          onClick={() => setClipLevel(0)}
          style={{
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '0.5rem',
            fontWeight: 600,
            border: currentClipLevel === 0 ? '2px solid rgba(80,200,120,0.4)' : '1px solid rgba(255,255,255,0.06)',
            background: currentClipLevel === 0 ? 'rgba(80,200,120,0.1)' : 'rgba(255,255,255,0.03)',
            color: currentClipLevel === 0 ? '#50c878' : '#888',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontFamily: 'inherit'
          }}
        >
          ✅ Нет
        </button>
        {clipLevels.filter(l => l > 0).map(level => (
          <button
            key={level}
            onClick={() => setClipLevel(level)}
            style={{
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '0.5rem',
              fontWeight: 600,
              border: currentClipLevel === level ? '2px solid rgba(255,80,80,0.4)' : '1px solid rgba(255,255,255,0.06)',
              background: currentClipLevel === level ? 'rgba(255,80,80,0.1)' : 'rgba(255,255,255,0.03)',
              color: currentClipLevel === level ? '#ff6b6b' : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit'
            }}
          >
            {level} дБ
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
            <span style={{ fontSize: '0.55rem', color: '#f5c542' }}>{params.gain}%</span>
          </div>
          <input
            type="range" min="10" max="100" step="1"
            value={params.gain}
            onChange={(e) => updateParam('gain', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Spectrum</span>
            <span style={{ fontSize: '0.55rem', color: params.showSpectrum ? '#50c878' : '#888' }}>
              {params.showSpectrum ? 'ON' : 'OFF'}
            </span>
          </div>
          <button
            onClick={() => updateParam('showSpectrum', !params.showSpectrum)}
            style={{
              width: '100%',
              padding: '4px 0',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: params.showSpectrum ? 'rgba(80,200,120,0.15)' : 'rgba(255,255,255,0.03)',
              color: params.showSpectrum ? '#50c878' : '#888',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.5rem',
              fontWeight: 600,
              transition: 'all 0.3s'
            }}
          >
            {params.showSpectrum ? '🟢 ON' : '⚪ OFF'}
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
          {isPlaying ? '⏸ Пауза' : '▶ Запустить симуляцию'}
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
        📊 Визуализация волны и спектра при разном уровне клиппинга
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default ClippingWidget