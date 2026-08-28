// components/interactive/BitDepthWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface BitDepthParams {
  bitDepth: number
  showNoise: boolean
  gain: number
}

const BitDepthWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<BitDepthParams>({
    bitDepth: 24,
    showNoise: true,
    gain: 80
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBitDepth, setCurrentBitDepth] = useState(24)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const bitDepths = [8, 12, 16, 20, 24, 32]

  // ===== ИНИЦИАЛИЗАЦИЯ АУДИО =====
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  // ===== ВОСПРОИЗВЕДЕНИЕ ТОНА =====
  const playTone = useCallback((bitDepth: number) => {
    const ctx = initAudio()
    
    // Останавливаем старый
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop() } catch(e) {}
      oscillatorRef.current = null
    }

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 440

    const gain = ctx.createGain()
    gain.gain.value = 0.3 * (params.gain / 100)

    // Эмуляция шума квантования
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = params.showNoise ? Math.pow(2, -(bitDepth / 2)) * 0.5 : 0

    // Белый шум
    const bufferSize = 4096
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true

    const merger = ctx.createChannelMerger(2)
    osc.connect(gain)
    gain.connect(merger, 0, 0)
    gain.connect(merger, 0, 1)

    noise.connect(noiseGain)
    noiseGain.connect(merger, 0, 0)
    noiseGain.connect(merger, 0, 1)

    merger.connect(ctx.destination)

    osc.start()
    noise.start()

    oscillatorRef.current = osc
    gainNodeRef.current = gain

    // Остановка через 2 секунды
    setTimeout(() => {
      try { osc.stop() } catch(e) {}
      try { noise.stop() } catch(e) {}
    }, 2000)

  }, [params, initAudio])

  // ===== РЕНДЕРИНГ ВОЛНЫ =====
  const renderWaveform = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    const bitDepth = currentBitDepth
    const levels = Math.pow(2, bitDepth)
    const centerY = H / 2
    const steps = 400

    // Фон
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // Сетка уровней
    const gridLines = Math.min(16, Math.pow(2, Math.min(4, bitDepth - 4)))
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < gridLines; i++) {
      const y = (i / gridLines) * H
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }

    // Генерация волны с квантованием
    const freq = 2
    const amp = 0.8 * (params.gain / 100)
    const pts: { x: number; y: number }[] = []

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4
      const x = (i / steps) * W
      let val = Math.sin(t * freq * Math.PI * 2) * amp
      
      // Применяем квантование (ступеньки)
      const maxVal = 1
      const step = (maxVal * 2) / levels
      const quantized = Math.round(val / step) * step
      
      // Гармоники (эмуляция разной битности)
      if (bitDepth <= 12) {
        val = quantized
      } else if (bitDepth <= 16) {
        val = quantized * 0.7 + val * 0.3
      } else {
        val = quantized * 0.3 + val * 0.7
      }

      const y = centerY - val * (H * 0.42)
      pts.push({ x, y })
    }

    // Рисуем волну
    ctx.beginPath()
    ctx.strokeStyle = '#f5c542'
    ctx.lineWidth = 2.5
    ctx.shadowColor = 'rgba(245,197,66,0.3)'
    ctx.shadowBlur = 8
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) ctx.moveTo(pts[i].x, pts[i].y)
      else ctx.lineTo(pts[i].x, pts[i].y)
    }
    ctx.stroke()
    ctx.shadowBlur = 0

    // Ступеньки (квантование)
    if (bitDepth <= 16) {
      ctx.strokeStyle = 'rgba(74,158,255,0.15)'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 4])
      ctx.beginPath()
      let lastY = pts[0].y
      for (let i = 0; i < pts.length; i++) {
        const diff = Math.abs(pts[i].y - lastY)
        if (diff > 1) {
          ctx.lineTo(pts[i].x, lastY)
          ctx.lineTo(pts[i].x, pts[i].y)
          lastY = pts[i].y
        }
      }
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Уровни (горизонтальные линии для 16 бит)
    if (bitDepth <= 16) {
      const visibleLevels = Math.min(32, levels)
      for (let i = 0; i < visibleLevels; i++) {
        const level = ((i / visibleLevels) - 0.5) * 2
        const y = centerY - level * (H * 0.42)
        ctx.fillStyle = 'rgba(255,255,255,0.02)'
        ctx.fillRect(0, y - 0.5, W, 1)
      }
    }

    // Динамический диапазон
    const dynamicRange = bitDepth * 6
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.font = '8px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`Динамический диапазон: ${dynamicRange} дБ`, 8, 8)
    ctx.fillText(`Уровней: ${levels.toLocaleString()}`, 8, 20)

    // Шум квантования
    if (params.showNoise) {
      const noiseLevel = -dynamicRange
      ctx.fillStyle = 'rgba(255,107,107,0.05)'
      const noiseY = centerY + (noiseLevel / (bitDepth * 6)) * (H * 0.42)
      ctx.fillRect(0, noiseY - 1, W, 2)
      ctx.fillStyle = 'rgba(255,107,107,0.3)'
      ctx.font = '6px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'top'
      ctx.fillText(`Шум квантования ~${noiseLevel} дБ`, W - 8, noiseY + 4)
    }

    // Информация о битности
    ctx.fillStyle = '#f5c542'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${bitDepth} бит`, W / 2, H - 8)

  }, [currentBitDepth, params])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    const loop = () => {
      timeRef.current += 0.01
      
      // Меняем частоту для динамики
      if (timeRef.current % 4 < 2) {
        // Плавно меняем частоту
      }
      
      renderWaveform()
      frameId = requestAnimationFrame(loop)
    }
    
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, renderWaveform])

  // ===== ПРИ ИЗМЕНЕНИИ ПАРАМЕТРОВ =====
  useEffect(() => {
    renderWaveform()
  }, [currentBitDepth, params, renderWaveform])

  // ===== RESIZE =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = Math.max(200, rect.width - 12)
      canvas.height = 160
      renderWaveform()
    }
  }, [renderWaveform])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof BitDepthParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ИЗМЕНЕНИЕ БИТНОСТИ =====
  const setBitDepth = useCallback((depth: number) => {
    setCurrentBitDepth(depth)
    if (isPlaying) {
      playTone(depth)
    }
  }, [isPlaying, playTone])

  // ===== ВОСПРОИЗВЕДЕНИЕ С ТЕКУЩЕЙ БИТНОСТЬЮ =====
  const playWithCurrentBitDepth = useCallback(() => {
    playTone(currentBitDepth)
  }, [playTone, currentBitDepth])

  // ===== СРАВНЕНИЕ (A/B) =====
  const [compareBitDepth, setCompareBitDepth] = useState<number | null>(null)

  const toggleCompare = useCallback(() => {
    if (compareBitDepth === null) {
      setCompareBitDepth(currentBitDepth === 16 ? 24 : 16)
      playTone(compareBitDepth === null ? currentBitDepth : compareBitDepth)
    } else {
      setCompareBitDepth(null)
      playTone(currentBitDepth)
    }
  }, [compareBitDepth, currentBitDepth, playTone])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setCurrentBitDepth(24)
    setParams({
      bitDepth: 24,
      showNoise: true,
      gain: 80
    })
    setCompareBitDepth(null)
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Bit Depth Visualizer
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
        {compareBitDepth !== null && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(245,197,66,0.15)',
            border: '1px solid rgba(245,197,66,0.2)',
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '0.55rem',
            color: '#f5c542'
          }}>
            A/B: {compareBitDepth} бит
          </div>
        )}
      </div>

      {/* Переключатели битности */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {bitDepths.map(depth => (
          <button
            key={depth}
            onClick={() => setBitDepth(depth)}
            style={{
              padding: '6px 14px',
              borderRadius: '50px',
              fontSize: '0.65rem',
              fontWeight: 700,
              border: currentBitDepth === depth ? '2px solid rgba(245,197,66,0.4)' : '1px solid rgba(255,255,255,0.06)',
              background: currentBitDepth === depth ? 'rgba(245,197,66,0.1)' : 'rgba(255,255,255,0.03)',
              color: currentBitDepth === depth ? '#f5c542' : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit',
              minWidth: '48px'
            }}
            onMouseEnter={(e) => {
              if (currentBitDepth !== depth) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = '#fff'
              }
            }}
            onMouseLeave={(e) => {
              if (currentBitDepth !== depth) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.color = '#888'
              }
            }}
          >
            {depth} бит
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Show Noise</span>
            <span style={{ fontSize: '0.55rem', color: params.showNoise ? '#50c878' : '#888' }}>
              {params.showNoise ? 'ON' : 'OFF'}
            </span>
          </div>
          <button
            onClick={() => updateParam('showNoise', !params.showNoise)}
            style={{
              width: '100%',
              padding: '4px 0',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: params.showNoise ? 'rgba(80,200,120,0.15)' : 'rgba(255,255,255,0.03)',
              color: params.showNoise ? '#50c878' : '#888',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.5rem',
              fontWeight: 600,
              transition: 'all 0.3s'
            }}
          >
            {params.showNoise ? '🟢 ON' : '⚪ OFF'}
          </button>
        </div>
      </div>

      {/* Информация о битности */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        padding: '6px',
        background: 'rgba(0,0,0,0.15)',
        borderRadius: '6px',
        marginBottom: '10px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '0.5rem', color: '#666' }}>
          Уровней: <strong style={{ color: '#f5c542' }}>{Math.pow(2, currentBitDepth).toLocaleString()}</strong>
        </span>
        <span style={{ fontSize: '0.5rem', color: '#666' }}>
          Динамический диапазон: <strong style={{ color: '#4a9eff' }}>{currentBitDepth * 6} дБ</strong>
        </span>
        <span style={{ fontSize: '0.5rem', color: '#666' }}>
          Шум квантования: <strong style={{ color: '#ff6b6b' }}>~{-(currentBitDepth * 6)} дБ</strong>
        </span>
      </div>

      {/* Кнопки */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
        <button
          onClick={() => {
            setIsPlaying(!isPlaying)
            if (!isPlaying) {
              playTone(currentBitDepth)
            }
          }}
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
          {isPlaying ? '⏸ Пауза' : '▶ Play Tone'}
        </button>
        <button
          onClick={playWithCurrentBitDepth}
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
          🔊 Послушать
        </button>
        <button
          onClick={toggleCompare}
          style={{
            padding: '4px 16px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.55rem',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
            background: compareBitDepth !== null ? 'rgba(245,197,66,0.15)' : 'rgba(255,255,255,0.03)',
            color: compareBitDepth !== null ? '#f5c542' : '#888',
            fontFamily: 'inherit'
          }}
        >
          {compareBitDepth !== null ? '⏹ A/B' : '🔄 A/B Сравнить'}
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
        🎵 Нажмите "Play Tone" или "Послушать" чтобы услышать разницу в качестве
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default BitDepthWidget