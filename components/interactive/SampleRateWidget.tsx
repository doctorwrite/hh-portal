// components/interactive/SampleRateWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface SampleRateParams {
  sampleRate: number
  showAliasing: boolean
  gain: number
}

const SampleRateWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<SampleRateParams>({
    sampleRate: 48,
    showAliasing: true,
    gain: 80
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSampleRate, setCurrentSampleRate] = useState(48)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const sampleRates = [22.05, 32, 44.1, 48, 88.2, 96, 192]
  const humanRates = ['22.05', '32', '44.1', '48', '88.2', '96', '192']

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
  const playTone = useCallback((sampleRate: number) => {
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

    // Создаём второй осциллятор для эмуляции алиасинга
    // (высокая частота, которая будет "маскироваться" при низком sample rate)
    const highFreq = 20000 // 20 кГц — предел слышимости
    const maxFreq = sampleRate / 2 // частота Найквиста
    
    // Если частота Найквиста меньше 20 кГц — эмулируем алиасинг
    const showAliasingEffect = params.showAliasing && maxFreq < 20000
    
    if (showAliasingEffect) {
      // Создаём высокочастотный сигнал, который будет "маскироваться"
      const oscHigh = ctx.createOscillator()
      oscHigh.type = 'sine'
      // Частота выше частоты Найквиста
      oscHigh.frequency.value = Math.min(highFreq, maxFreq * 1.5)
      
      const gainHigh = ctx.createGain()
      gainHigh.gain.value = 0.05 // тихий, чтобы не раздражал
      
      const merger = ctx.createChannelMerger(2)
      
      osc.connect(gain)
      gain.connect(merger, 0, 0)
      gain.connect(merger, 0, 1)
      
      oscHigh.connect(gainHigh)
      gainHigh.connect(merger, 0, 0)
      gainHigh.connect(merger, 0, 1)
      
      merger.connect(ctx.destination)
      
      osc.start()
      oscHigh.start()
      
      setTimeout(() => {
        try { osc.stop() } catch(e) {}
        try { oscHigh.stop() } catch(e) {}
      }, 2000)
    } else {
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      
      setTimeout(() => {
        try { osc.stop() } catch(e) {}
      }, 2000)
    }

    oscillatorRef.current = osc

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

    const sampleRate = currentSampleRate
    const centerY = H / 2
    const steps = 400

    // Фон
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // Генерация сигнала с учётом частоты дискретизации
    const freq = 440 // частота сигнала в Гц
    const amp = 0.8 * (params.gain / 100)
    const duration = 0.004 // 4 мс
    const totalSamples = Math.floor(sampleRate * duration)
    const visibleSamples = Math.min(totalSamples, steps)
    const step = Math.max(1, Math.floor(totalSamples / steps))

    // Собираем точки
    const pts: { x: number; y: number }[] = []
    const samplePts: { x: number; y: number }[] = []

    for (let i = 0; i <= Math.min(totalSamples, steps); i++) {
      const t = (i / (sampleRate * duration)) * 2 * Math.PI
      const val = Math.sin(freq * t / (2 * Math.PI)) * amp
      const x = (i / steps) * W
      const y = centerY - val * (H * 0.42)
      pts.push({ x, y })
    }

    // Точки дискретизации (сэмплы)
    const numSamples = Math.min(60, Math.floor(sampleRate * duration / 8))
    const sampleStep = Math.max(1, Math.floor(totalSamples / numSamples))

    for (let i = 0; i < numSamples; i++) {
      const idx = i * sampleStep
      if (idx >= totalSamples) break
      const t = (idx / (sampleRate * duration)) * 2 * Math.PI
      const val = Math.sin(freq * t / (2 * Math.PI)) * amp
      const x = (idx / totalSamples) * W
      const y = centerY - val * (H * 0.42)
      samplePts.push({ x, y })
    }

    // Рисуем сетку (отметки сэмплов)
    ctx.fillStyle = 'rgba(74,158,255,0.04)'
    for (const sp of samplePts) {
      ctx.fillRect(sp.x - 0.5, 0, 1, H)
    }

    // Рисуем волну (непрерывную)
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(74,158,255,0.15)'
    ctx.lineWidth = 1.5
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) ctx.moveTo(pts[i].x, pts[i].y)
      else ctx.lineTo(pts[i].x, pts[i].y)
    }
    ctx.stroke()

    // Рисуем точки дискретизации (сэмплы)
    if (samplePts.length > 0) {
      ctx.beginPath()
      ctx.strokeStyle = '#f5c542'
      ctx.lineWidth = 2.5
      ctx.shadowColor = 'rgba(245,197,66,0.3)'
      ctx.shadowBlur = 8
      
      // Соединяем точки (ступенчатая линия — квантование по времени)
      for (let i = 0; i < samplePts.length; i++) {
        if (i === 0) ctx.moveTo(samplePts[i].x, samplePts[i].y)
        else {
          // Горизонтальная линия до следующей точки
          ctx.lineTo(samplePts[i].x, samplePts[i - 1].y)
          ctx.lineTo(samplePts[i].x, samplePts[i].y)
        }
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Рисуем кружки на точках сэмплов
      for (const sp of samplePts) {
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#f5c542'
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    // Информация о частоте Найквиста
    const nyquistFreq = sampleRate / 2
    const nyquistY = centerY - (nyquistFreq / 20000) * (H * 0.42)
    if (nyquistY > 0) {
      ctx.fillStyle = 'rgba(255,107,107,0.05)'
      ctx.fillRect(0, nyquistY - 1, W, 2)
      ctx.fillStyle = 'rgba(255,107,107,0.3)'
      ctx.font = '6px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'top'
      ctx.fillText(`Частота Найквиста: ${nyquistFreq.toFixed(1)} кГц`, W - 8, nyquistY + 4)
    }

    // Зона слышимости (до 20 кГц)
    const hearingY = centerY - (20000 / 20000) * (H * 0.42)
    ctx.fillStyle = 'rgba(80,200,120,0.04)'
    ctx.fillRect(0, hearingY, W, centerY - hearingY)
    ctx.fillStyle = 'rgba(80,200,120,0.15)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillText('👂 Слышимый диапазон (до 20 кГц)', 8, hearingY - 2)

    // Информация о частоте дискретизации
    ctx.fillStyle = '#f5c542'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${sampleRate} кГц`, W / 2, H - 8)

    // Алиасинг (предупреждение)
    if (params.showAliasing && nyquistFreq < 20000) {
      const aliasFreq = 20000 - (20000 - nyquistFreq)
      ctx.fillStyle = 'rgba(255,80,80,0.15)'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('⚠️ Частота ниже 40 кГц → возможен алиасинг!', W / 2, 8)
    }

  }, [currentSampleRate, params])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    const loop = () => {
      timeRef.current += 0.01
      renderWaveform()
      frameId = requestAnimationFrame(loop)
    }
    
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, renderWaveform])

  // ===== ПРИ ИЗМЕНЕНИИ ПАРАМЕТРОВ =====
  useEffect(() => {
    renderWaveform()
  }, [currentSampleRate, params, renderWaveform])

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
  const updateParam = useCallback((key: keyof SampleRateParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ИЗМЕНЕНИЕ ЧАСТОТЫ =====
  const setSampleRate = useCallback((rate: number) => {
    setCurrentSampleRate(rate)
    if (isPlaying) {
      playTone(rate)
    }
  }, [isPlaying, playTone])

  // ===== ВОСПРОИЗВЕДЕНИЕ С ТЕКУЩЕЙ ЧАСТОТОЙ =====
  const playWithCurrentRate = useCallback(() => {
    playTone(currentSampleRate)
  }, [playTone, currentSampleRate])

  // ===== СРАВНЕНИЕ (A/B) =====
  const [compareSampleRate, setCompareSampleRate] = useState<number | null>(null)

  const toggleCompare = useCallback(() => {
    if (compareSampleRate === null) {
      setCompareSampleRate(currentSampleRate === 48 ? 44.1 : 48)
      playTone(compareSampleRate === null ? currentSampleRate : compareSampleRate)
    } else {
      setCompareSampleRate(null)
      playTone(currentSampleRate)
    }
  }, [compareSampleRate, currentSampleRate, playTone])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setCurrentSampleRate(48)
    setParams({
      sampleRate: 48,
      showAliasing: true,
      gain: 80
    })
    setCompareSampleRate(null)
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Sample Rate Visualizer
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
        {compareSampleRate !== null && (
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
            A/B: {compareSampleRate} кГц
          </div>
        )}
      </div>

      {/* Переключатели частоты */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {sampleRates.map((rate, idx) => (
          <button
            key={rate}
            onClick={() => setSampleRate(rate)}
            style={{
              padding: '6px 14px',
              borderRadius: '50px',
              fontSize: '0.65rem',
              fontWeight: 700,
              border: currentSampleRate === rate ? '2px solid rgba(245,197,66,0.4)' : '1px solid rgba(255,255,255,0.06)',
              background: currentSampleRate === rate ? 'rgba(245,197,66,0.1)' : 'rgba(255,255,255,0.03)',
              color: currentSampleRate === rate ? '#f5c542' : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit',
              minWidth: '48px'
            }}
            onMouseEnter={(e) => {
              if (currentSampleRate !== rate) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = '#fff'
              }
            }}
            onMouseLeave={(e) => {
              if (currentSampleRate !== rate) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.color = '#888'
              }
            }}
          >
            {humanRates[idx]} кГц
          </button>
        ))}
      </div>

      {/* Информация о частоте */}
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
          Частота Найквиста: <strong style={{ color: '#4a9eff' }}>{(currentSampleRate / 2).toFixed(1)} кГц</strong>
        </span>
        <span style={{ fontSize: '0.5rem', color: '#666' }}>
          Макс. частота записи: <strong style={{ color: '#f5c542' }}>{(currentSampleRate / 2).toFixed(1)} кГц</strong>
        </span>
        <span style={{ fontSize: '0.5rem', color: '#666' }}>
          Сэмплов/сек: <strong style={{ color: '#50c878' }}>{currentSampleRate * 1000}</strong>
        </span>
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Show Aliasing</span>
            <span style={{ fontSize: '0.55rem', color: params.showAliasing ? '#50c878' : '#888' }}>
              {params.showAliasing ? 'ON' : 'OFF'}
            </span>
          </div>
          <button
            onClick={() => updateParam('showAliasing', !params.showAliasing)}
            style={{
              width: '100%',
              padding: '4px 0',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: params.showAliasing ? 'rgba(80,200,120,0.15)' : 'rgba(255,255,255,0.03)',
              color: params.showAliasing ? '#50c878' : '#888',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.5rem',
              fontWeight: 600,
              transition: 'all 0.3s'
            }}
          >
            {params.showAliasing ? '🟢 ON' : '⚪ OFF'}
          </button>
        </div>
      </div>

      {/* Кнопки */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
        <button
          onClick={() => {
            setIsPlaying(!isPlaying)
            if (!isPlaying) {
              playTone(currentSampleRate)
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
          onClick={playWithCurrentRate}
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
            background: compareSampleRate !== null ? 'rgba(245,197,66,0.15)' : 'rgba(255,255,255,0.03)',
            color: compareSampleRate !== null ? '#f5c542' : '#888',
            fontFamily: 'inherit'
          }}
        >
          {compareSampleRate !== null ? '⏹ A/B' : '🔄 A/B Сравнить'}
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
        🎵 Чем выше частота дискретизации — тем больше сэмплов и детальнее волна
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default SampleRateWidget