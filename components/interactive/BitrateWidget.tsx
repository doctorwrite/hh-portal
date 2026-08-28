// components/interactive/BitrateWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface BitrateParams {
  bitrate: number
  format: 'mp3' | 'aac' | 'flac' | 'wav'
  showSpectrum: boolean
  gain: number
}

const BitrateWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<BitrateParams>({
    bitrate: 320,
    format: 'mp3',
    showSpectrum: true,
    gain: 80
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBitrate, setCurrentBitrate] = useState(320)
  const [currentFormat, setCurrentFormat] = useState<'mp3' | 'aac' | 'flac' | 'wav'>('mp3')
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const bitrates = [64, 96, 128, 192, 256, 320]
  const formats = [
    { id: 'mp3', label: 'MP3', color: '#4a9eff', maxBitrate: 320 },
    { id: 'aac', label: 'AAC', color: '#50c878', maxBitrate: 256 },
    { id: 'flac', label: 'FLAC', color: '#f5c542', maxBitrate: 1411 },
    { id: 'wav', label: 'WAV', color: '#ff6b6b', maxBitrate: 1411 },
  ]

  // ===== РЕНДЕРИНГ =====
  const renderWidget = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    const bitrate = currentBitrate
    const format = currentFormat
    const formatInfo = formats.find(f => f.id === format) || formats[0]
    const maxBitrate = formatInfo.maxBitrate
    const qualityPercent = Math.min(100, (bitrate / maxBitrate) * 100)
    const isLossless = format === 'flac' || format === 'wav'

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    const margin = 16
    const topY = 10
    const graphH = 140
    const graphY = topY + 24
    const barX = margin
    const barW = W - margin * 2

    // === 1. Спектр (визуализация) ===
    if (params.showSpectrum) {
      const freqCount = 80
      const freqs: number[] = []
      const minFreq = 20
      const maxFreq = 20000

      for (let i = 0; i < freqCount; i++) {
        const t = i / freqCount
        const freq = Math.pow(10, Math.log10(minFreq) + t * (Math.log10(maxFreq) - Math.log10(minFreq)))
        freqs.push(freq)
      }

      // Генерируем спектр с учётом битрейта
      const spectrum: number[] = []
      const noiseFloor = isLossless ? -80 : (-80 + (1 - qualityPercent / 100) * 40)

      for (let i = 0; i < freqCount; i++) {
        const freq = freqs[i]
        // Основной сигнал (синус + гармоники)
        let amplitude = 0
        const baseFreq = 440
        const harmonics = [1, 2, 3, 4, 5, 6, 7]
        for (const h of harmonics) {
          const f = baseFreq * h
          if (freq > f * 0.9 && freq < f * 1.1) {
            amplitude += 0.3 / h
          }
        }
        // Широкополосный шум
        const noise = (Math.random() - 0.5) * 0.05
        amplitude += noise

        // Потеря высоких частот при низком битрейде
        const lossFactor = qualityPercent / 100
        const freqLoss = Math.max(0, 1 - (freq / 10000) * (1 - lossFactor) * 1.5)
        amplitude *= Math.min(1, freqLoss + 0.2)

        // Базовый уровень шума
        const noiseLevel = noiseFloor / 100
        amplitude = Math.max(noiseLevel, amplitude)

        spectrum.push(Math.max(0, Math.min(1, amplitude * 2)))
      }

      // Рисуем спектр
      const barWidth = barW / freqCount

      // Заливка под спектром
      ctx.beginPath()
      ctx.moveTo(barX, graphY + graphH)
      for (let i = 0; i < spectrum.length; i++) {
        const x = barX + i * barWidth
        const y = graphY + graphH - spectrum[i] * graphH * 0.85
        if (i === 0) ctx.lineTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.lineTo(barX + barW, graphY + graphH)
      ctx.closePath()
      ctx.fillStyle = isLossless 
        ? 'rgba(245,197,66,0.08)' 
        : `rgba(74,158,255,${0.03 + (qualityPercent / 100) * 0.08})`
      ctx.fill()

      // Рисуем столбцы
      for (let i = 0; i < spectrum.length; i++) {
        const x = barX + i * barWidth
        const h = spectrum[i] * graphH * 0.85
        const y = graphY + graphH - h
        
        const color = isLossless 
          ? `rgba(245,197,66,${0.3 + spectrum[i] * 0.5})`
          : `rgba(74,158,255,${0.2 + spectrum[i] * 0.5})`
        
        ctx.fillStyle = color
        ctx.fillRect(x, y, Math.max(1, barWidth - 1), Math.max(1, h))
      }

      // Отметка частоты Найквиста (потеря высоких частот)
      if (!isLossless && bitrate < 320) {
        const nyquistFreq = Math.min(20000, 8000 + (bitrate / 320) * 12000)
        const nyquistX = barX + (Math.log10(nyquistFreq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * barW
        ctx.fillStyle = 'rgba(255,107,107,0.15)'
        ctx.fillRect(nyquistX, graphY, barW - (nyquistX - barX), graphH)
        ctx.fillStyle = 'rgba(255,107,107,0.4)'
        ctx.font = '6px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(`⚠ Потеря высоких частот ~${Math.round(nyquistFreq/1000)} кГц`, nyquistX + 4, graphY + 4)
      }

      // Подписи частот
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.font = '5px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const freqLabels = [20, 100, 1000, 5000, 10000, 20000]
      for (const f of freqLabels) {
        const x = barX + (Math.log10(f) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * barW
        ctx.fillText(f >= 1000 ? `${f/1000}k` : `${f}`, x, graphY + graphH + 4)
      }
    }

    // === 2. Информация о битрейте ===
    const infoY = graphY + graphH + 28

    // Качество
    const qualityText = isLossless 
      ? '✅ Lossless (без потерь)'
      : qualityPercent > 80 
        ? '🔊 Отличное качество'
        : qualityPercent > 50
          ? '🎧 Хорошее качество'
          : '📉 Базовое качество'

    ctx.fillStyle = isLossless ? 'rgba(80,200,120,0.1)' : 'rgba(245,197,66,0.06)'
    ctx.beginPath()
    ctx.roundRect(barX, infoY, barW, 28, 4)
    ctx.fill()

    ctx.fillStyle = isLossless ? '#50c878' : (qualityPercent > 80 ? '#50c878' : '#f5c542')
    ctx.font = 'bold 8px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(qualityText, barX + 8, infoY + 14)

    // Размер файла (эмуляция)
    const fileSize = isLossless 
      ? (format === 'flac' ? 15 : 30)
      : Math.round((bitrate / 320) * 7.2)
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '7px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(`~${fileSize} МБ (3 мин)`, barX + barW - 8, infoY + 14)

    // Индикатор качества (полоса)
    const barY = infoY + 34
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.beginPath()
    ctx.roundRect(barX, barY, barW, 6, 3)
    ctx.fill()

    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0)
    grad.addColorStop(0, '#ff6b6b')
    grad.addColorStop(0.3, '#f5c542')
    grad.addColorStop(0.6, '#50c878')
    grad.addColorStop(1, '#4a9eff')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(barX, barY, Math.max(4, (qualityPercent / 100) * barW), 6, 3)
    ctx.fill()

    // Метка текущего битрейта
    const markerX = barX + (qualityPercent / 100) * barW
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(markerX, barY + 3, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Подписи битрейтов
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.font = '5px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const labelPositions = [64, 128, 192, 256, 320]
    for (const b of labelPositions) {
      const x = barX + (b / 320) * barW
      ctx.fillText(`${b}`, x, barY + 10)
    }

    // === 3. Формат ===
    ctx.fillStyle = formatInfo.color
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${formatInfo.label.toUpperCase()} • ${bitrate} кбит/с`, W / 2, topY + 6)

  }, [currentBitrate, currentFormat, params])

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
      canvas.height = Math.min(240, w * 0.3)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ ПАРАМЕТРОВ =====
  useEffect(() => {
    renderWidget()
  }, [currentBitrate, currentFormat, params, renderWidget])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof BitrateParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ИЗМЕНЕНИЕ БИТРЕЙТА =====
  const setBitrate = useCallback((bitrate: number) => {
    setCurrentBitrate(bitrate)
  }, [])

  // ===== ИЗМЕНЕНИЕ ФОРМАТА =====
  const setFormat = useCallback((format: 'mp3' | 'aac' | 'flac' | 'wav') => {
    setCurrentFormat(format)
    const formatInfo = formats.find(f => f.id === format)
    if (formatInfo && (format === 'flac' || format === 'wav')) {
      // Для lossless показываем, что битрейт не важен
      setCurrentBitrate(formatInfo.maxBitrate)
    } else if (formatInfo) {
      // Для lossy устанавливаем битрейт в зависимости от формата
      if (format === 'mp3') setCurrentBitrate(320)
      else if (format === 'aac') setCurrentBitrate(256)
    }
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setCurrentBitrate(320)
    setCurrentFormat('mp3')
    setParams({
      bitrate: 320,
      format: 'mp3',
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Bitrate Visualizer
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

      {/* Выбор формата */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {formats.map(f => (
          <button
            key={f.id}
            onClick={() => setFormat(f.id as any)}
            style={{
              padding: '4px 14px',
              borderRadius: '50px',
              fontSize: '0.55rem',
              fontWeight: 600,
              border: currentFormat === f.id ? `2px solid ${f.color}` : '1px solid rgba(255,255,255,0.06)',
              background: currentFormat === f.id ? `${f.color}20` : 'rgba(255,255,255,0.03)',
              color: currentFormat === f.id ? f.color : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Выбор битрейта */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {bitrates.map(b => {
          const isDisabled = currentFormat === 'flac' || currentFormat === 'wav'
          return (
            <button
              key={b}
              onClick={() => !isDisabled && setBitrate(b)}
              style={{
                padding: '4px 12px',
                borderRadius: '50px',
                fontSize: '0.5rem',
                fontWeight: 600,
                border: currentBitrate === b && !isDisabled ? '2px solid rgba(245,197,66,0.4)' : '1px solid rgba(255,255,255,0.06)',
                background: currentBitrate === b && !isDisabled ? 'rgba(245,197,66,0.1)' : 'rgba(255,255,255,0.03)',
                color: isDisabled ? '#555' : (currentBitrate === b ? '#f5c542' : '#888'),
                cursor: isDisabled ? 'default' : 'pointer',
                opacity: isDisabled ? 0.3 : 1,
                transition: 'all 0.3s',
                fontFamily: 'inherit'
              }}
            >
              {b} кбит/с
            </button>
          )
        })}
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
        📊 Визуализация спектра при разных битрейтах и форматах
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default BitrateWidget