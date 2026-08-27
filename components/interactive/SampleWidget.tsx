// components/interactive/SampleWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface SampleParams {
  pitch: number
  speed: number
  start: number
  end: number
  volume: number
}

const SampleWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<SampleParams>({
    pitch: 0,
    speed: 100,
    start: 0,
    end: 100,
    volume: 80
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeSample, setActiveSample] = useState<string | null>(null)
  const [playhead, setPlayhead] = useState(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const animRef = useRef<number | null>(null)
  const timeRef = useRef(0)

  // ===== ВСТРОЕННЫЕ СЭМПЛЫ (генерируемые) =====
  const sampleGenerators: Record<string, (ctx: AudioContext) => AudioBuffer> = {
    kick: (ctx) => {
      const sampleRate = ctx.sampleRate
      const duration = 0.8
      const length = Math.floor(sampleRate * duration)
      const buffer = ctx.createBuffer(1, length, sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate
        const env = Math.exp(-t * 12)
        const freq = 60 + 40 * Math.exp(-t * 8)
        data[i] = Math.sin(t * freq * 2 * Math.PI) * env * 0.8
      }
      return buffer
    },
    snare: (ctx) => {
      const sampleRate = ctx.sampleRate
      const duration = 0.4
      const length = Math.floor(sampleRate * duration)
      const buffer = ctx.createBuffer(1, length, sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate
        const env = Math.exp(-t * 8)
        const noise = (Math.random() - 0.5) * 0.7
        const tone = Math.sin(t * 180 * 2 * Math.PI) * Math.exp(-t * 15) * 0.3
        data[i] = (noise + tone) * env * 0.7
      }
      return buffer
    },
    hat: (ctx) => {
      const sampleRate = ctx.sampleRate
      const duration = 0.15
      const length = Math.floor(sampleRate * duration)
      const buffer = ctx.createBuffer(1, length, sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate
        const env = Math.exp(-t * 30)
        const noise = (Math.random() - 0.5) * 0.8
        data[i] = noise * env * 0.5
      }
      return buffer
    },
    clap: (ctx) => {
      const sampleRate = ctx.sampleRate
      const duration = 0.2
      const length = Math.floor(sampleRate * duration)
      const buffer = ctx.createBuffer(1, length, sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate
        const env1 = Math.exp(-t * 25)
        const env2 = Math.exp(-(t - 0.05) * 30) * (t > 0.05 ? 1 : 0)
        const noise = (Math.random() - 0.5) * 0.6
        data[i] = noise * (env1 + env2 * 0.7) * 0.7
      }
      return buffer
    },
    bass: (ctx) => {
      const sampleRate = ctx.sampleRate
      const duration = 1.5
      const length = Math.floor(sampleRate * duration)
      const buffer = ctx.createBuffer(1, length, sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate
        const env = Math.exp(-t * 0.5)
        const freq = 55 + 10 * Math.sin(t * 2)
        const slide = 1 + 0.5 * (1 - Math.exp(-t * 2))
        data[i] = Math.sin(t * freq * 2 * Math.PI * slide) * env * 0.6
      }
      return buffer
    },
    piano: (ctx) => {
      const sampleRate = ctx.sampleRate
      const duration = 2
      const length = Math.floor(sampleRate * duration)
      const buffer = ctx.createBuffer(1, length, sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate
        const env = Math.exp(-t * 2) * 0.8
        const harmonics = [1, 2, 3, 4, 5]
        let sum = 0
        for (const h of harmonics) {
          sum += Math.sin(t * 440 * h * 2 * Math.PI) * (1 / h) * 0.4
        }
        data[i] = sum * env * 0.5
      }
      return buffer
    },
    vox: (ctx) => {
      const sampleRate = ctx.sampleRate
      const duration = 0.8
      const length = Math.floor(sampleRate * duration)
      const buffer = ctx.createBuffer(1, length, sampleRate)
      const data = buffer.getChannelData(0)
      const formants = [
        { f: 400, a: 0.6 },
        { f: 1000, a: 0.4 },
        { f: 2500, a: 0.3 }
      ]
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate
        const env = Math.exp(-t * 6)
        const vib = 1 + 0.03 * Math.sin(t * 5)
        let sum = 0
        for (const f of formants) {
          sum += Math.sin(t * f.f * vib * 2 * Math.PI) * f.a
        }
        data[i] = sum * env * 0.4
      }
      return buffer
    },
    fx: (ctx) => {
      const sampleRate = ctx.sampleRate
      const duration = 1.2
      const length = Math.floor(sampleRate * duration)
      const buffer = ctx.createBuffer(1, length, sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate
        const env = Math.exp(-t * 5)
        const sweep = Math.sin(t * 800 * 2 * Math.PI * (1 + t * 0.5))
        const noise = (Math.random() - 0.5) * 0.3
        data[i] = (sweep * 0.6 + noise) * env * 0.5
      }
      return buffer
    }
  }

  const sampleNames: Record<string, string> = {
    kick: 'Kick',
    snare: 'Snare',
    hat: 'Hi-Hat',
    clap: 'Clap',
    bass: 'Bass',
    piano: 'Piano',
    vox: 'Vocal',
    fx: 'FX'
  }

  const sampleIcons: Record<string, string> = {
    kick: '🥁',
    snare: '🥁',
    hat: '🥁',
    clap: '👏',
    bass: '🎸',
    piano: '🎹',
    vox: '🎤',
    fx: '✨'
  }

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

  // ===== ГЕНЕРАЦИЯ И ВОСПРОИЗВЕДЕНИЕ СЭМПЛА =====
  const playSample = useCallback((name: string) => {
    const ctx = initAudio()
    const generator = sampleGenerators[name]
    if (!generator) return

    // Останавливаем текущий
    if (sourceRef.current) {
      try { sourceRef.current.stop() } catch(e) {}
      sourceRef.current = null
    }

    const buffer = generator(ctx)
    bufferRef.current = buffer

    const { pitch, speed, start, end, volume } = params
    const startTime = (start / 100) * buffer.duration
    const endTime = (end / 100) * buffer.duration
    const duration = endTime - startTime

    if (duration <= 0) return

    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gainNode = ctx.createGain()
    gainNode.gain.value = volume / 100

    const playbackRate = (speed / 100) * Math.pow(2, pitch / 12)
    source.playbackRate.value = playbackRate

    source.connect(gainNode)
    gainNode.connect(ctx.destination)

    sourceRef.current = source
    setActiveSample(name)
    setPlayhead(0)

    source.start(0, startTime, duration)
    source.onended = () => {
      setActiveSample(null)
      setPlayhead(0)
      sourceRef.current = null
    }

    // Обновляем playhead
    const startPlayhead = performance.now()
    const updatePlayhead = () => {
      if (!sourceRef.current) {
        setPlayhead(0)
        return
      }
      const elapsed = (performance.now() - startPlayhead) / 1000
      const progress = (elapsed * playbackRate) / duration
      setPlayhead(Math.min(progress * 100, 100))
      animRef.current = requestAnimationFrame(updatePlayhead)
    }
    if (animRef.current) cancelAnimationFrame(animRef.current)
    updatePlayhead()
  }, [params, initAudio])

  // ===== ОСТАНОВКА =====
  const stopSample = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop() } catch(e) {}
      sourceRef.current = null
    }
    setActiveSample(null)
    setPlayhead(0)
    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = null
    }
  }, [])

  // ===== РЕНДЕРИНГ ВОЛНЫ =====
  const renderWaveform = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Если нет буфера
    if (!bufferRef.current) {
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Нажмите на пад', W/2, H/2)
      return
    }

    const data = bufferRef.current.getChannelData(0)
    const totalSamples = data.length
    const start = (params.start / 100) * totalSamples
    const end = (params.end / 100) * totalSamples
    const visibleLen = Math.floor(end - start)

    if (visibleLen <= 0) return

    // Фон
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // Волна
    const step = Math.max(1, Math.floor(visibleLen / W))
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(245,197,66,0.6)'
    ctx.lineWidth = 2

    for (let i = 0; i < W; i++) {
      const idx = start + i * step
      if (idx >= totalSamples) break
      const val = data[idx] || 0
      const x = i
      const y = H/2 - val * H * 0.45
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Playhead
    if (activeSample) {
      const phX = (playhead / 100) * W
      ctx.beginPath()
      ctx.moveTo(phX, 0)
      ctx.lineTo(phX, H)
      ctx.strokeStyle = '#f5c542'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = 'rgba(245,197,66,0.1)'
      ctx.fillRect(0, 0, phX, H)
    }

    // Область выделения (start/end)
    const startX = (params.start / 100) * W
    const endX = (params.end / 100) * W
    ctx.fillStyle = 'rgba(245,197,66,0.05)'
    ctx.fillRect(startX, 0, endX - startX, H)
    ctx.strokeStyle = 'rgba(245,197,66,0.15)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(startX, 0)
    ctx.lineTo(startX, H)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(endX, 0)
    ctx.lineTo(endX, H)
    ctx.stroke()
    ctx.setLineDash([])

    // Информация о сэмпле
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    ctx.fillText(activeSample ? sampleNames[activeSample] : '', W - 10, 4)
  }, [params, activeSample, playhead])

  // ===== ЭФФЕКТЫ ПРИ ИЗМЕНЕНИИ ПАРАМЕТРОВ =====
  useEffect(() => {
    if (bufferRef.current) {
      renderWaveform()
    }
  }, [params, renderWaveform])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof SampleParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setParams({
      pitch: 0,
      speed: 100,
      start: 0,
      end: 100,
      volume: 80
    })
    stopSample()
  }, [stopSample])

  // ===== RESIZE CANVAS =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = rect.width - 12
      canvas.height = 120
      renderWaveform()
    }
  }, [renderWaveform])

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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Sampler
        </span>
        <span style={{ fontSize: '0.5rem', color: activeSample ? '#50c878' : '#444' }}>
          {activeSample ? `●  ${sampleNames[activeSample]}` : '●  Stopped'}
        </span>
      </div>

      {/* Волна */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        padding: '4px',
        border: '1px solid rgba(255,255,255,0.03)',
        marginBottom: '10px',
        position: 'relative'
      }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '120px', display: 'block', borderRadius: '4px' }}
        />
      </div>

      {/* Пады */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        marginBottom: '10px'
      }}>
        {Object.keys(sampleGenerators).map(name => (
          <button
            key={name}
            onClick={() => playSample(name)}
            onDoubleClick={stopSample}
            style={{
              padding: '8px 4px',
              borderRadius: '8px',
              border: activeSample === name ? '2px solid #f5c542' : '1px solid rgba(255,255,255,0.06)',
              background: activeSample === name ? 'rgba(245,197,66,0.1)' : 'rgba(255,255,255,0.03)',
              color: activeSample === name ? '#f5c542' : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              if (activeSample !== name) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeSample !== name) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              }
            }}
          >
            <div style={{ fontSize: '1.4rem' }}>{sampleIcons[name]}</div>
            <div style={{ fontSize: '0.5rem', marginTop: '2px' }}>{sampleNames[name]}</div>
            {activeSample === name && (
              <div style={{
                width: '16px',
                height: '2px',
                background: '#f5c542',
                margin: '4px auto 0',
                borderRadius: '2px',
                animation: 'pulse 0.8s ease-in-out infinite'
              }} />
            )}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Pitch</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>{params.pitch > 0 ? '+' : ''}{params.pitch}</span>
          </div>
          <input
            type="range" min="-12" max="12" step="1"
            value={params.pitch}
            onChange={(e) => updateParam('pitch', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #4a9eff, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Speed</span>
            <span style={{ fontSize: '0.55rem', color: '#50c878' }}>{params.speed}%</span>
          </div>
          <input
            type="range" min="25" max="200" step="1"
            value={params.speed}
            onChange={(e) => updateParam('speed', parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #50c878, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Start</span>
            <span style={{ fontSize: '0.55rem', color: '#f5c542' }}>{params.start}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="0.5"
            value={params.start}
            onChange={(e) => updateParam('start', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>End</span>
            <span style={{ fontSize: '0.55rem', color: '#ff6b6b' }}>{params.end}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="0.5"
            value={params.end}
            onChange={(e) => updateParam('end', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #ff6b6b, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Volume</span>
            <span style={{ fontSize: '0.55rem', color: '#da70d6' }}>{params.volume}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={params.volume}
            onChange={(e) => updateParam('volume', parseInt(e.target.value))}
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
          onClick={stopSample}
          style={{
            padding: '4px 16px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.55rem',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
            background: 'rgba(255,80,80,0.05)',
            color: '#ff6b6b',
            fontFamily: 'inherit'
          }}
        >
          ■ Stop
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.45rem', color: '#555', padding: '4px 0' }}>
        🔊 Кликните по паду для воспроизведения · Двойной клик — остановить
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

export default SampleWidget