// components/interactive/MIDIWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface MIDIParams {
  velocity: number
  channel: number
  octave: number
  cc: number
}

interface Note {
  note: number
  type: 'white' | 'black'
}

const MIDIWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [params, setParams] = useState<MIDIParams>({
    velocity: 80,
    channel: 1,
    octave: 0,
    cc: 0
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set())
  const timeRef = useRef(0)

  const L = 60, R = 760, T = 60, B = 340
  const centerX = (L + R) / 2
  const centerY = (T + B) / 2

  // ===== НОТЫ =====
  const whiteKeys = [0, 2, 4, 5, 7, 9, 11]
  const blackKeys = [1, 3, 6, 8, 10]
  const notes: Note[] = []

  for (let octave = -1; octave <= 1; octave++) {
    for (const key of whiteKeys) {
      notes.push({ note: (octave + 1) * 12 + key + 12, type: 'white' })
    }
    for (const key of blackKeys) {
      notes.push({ note: (octave + 1) * 12 + key + 12, type: 'black' })
    }
  }

  // ===== РЕНДЕРИНГ =====
  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    // === Клавиатура ===
    const keyboardGroup = svg.querySelector('[data-group="keyboard"]') as SVGGElement
    if (keyboardGroup) {
      let html = ''
      const totalKeys = notes.length
      const keyWidth = (R - L) / totalKeys

      for (let i = 0; i < notes.length; i++) {
        const { note, type } = notes[i]
        const x = L + i * keyWidth
        const isActive = activeNotes.has(note)
        const isBlack = type === 'black'
        const w = isBlack ? keyWidth * 0.55 : keyWidth * 1.05

        html += `
          <rect
            x="${x}"
            y="${isBlack ? T + 20 : T}"
            width="${w}"
            height="${isBlack ? (B - T - 20) * 0.65 : B - T}"
            fill="${isActive ? (isBlack ? 'rgba(245,197,66,0.4)' : 'rgba(245,197,66,0.25)') : (isBlack ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.06)')}"
            stroke="${isActive ? '#f5c542' : (isBlack ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)')}"
            stroke-width="${isActive ? '2' : '1'}"
            rx="${isBlack ? '0 0 4 4' : '2'}"
            data-note="${note}"
            style="cursor:pointer;transition:all 0.08s ease;"
          />
          ${isBlack ? `<text x="${x + w/2}" y="${T + 30}" fill="rgba(255,255,255,0.1)" font-size="5" text-anchor="middle" font-family="'Montserrat', sans-serif">${note % 12}</text>` : ''}
        `
      }

      keyboardGroup.innerHTML = html

      // === События на клавиши ===
      keyboardGroup.querySelectorAll('rect').forEach(el => {
        const note = parseInt(el.dataset.note || '0')
        const isBlack = notes.find(n => n.note === note)?.type === 'black'

        el.addEventListener('mousedown', () => playNote(note))
        el.addEventListener('mouseup', () => stopNote(note))
        el.addEventListener('mouseleave', () => stopNote(note))
        el.addEventListener('touchstart', (e) => { e.preventDefault(); playNote(note) }, { passive: false })
        el.addEventListener('touchend', (e) => { e.preventDefault(); stopNote(note) }, { passive: false })
      })
    }

    // === Velocity метки ===
    const velLabel = svg.querySelector('[data-group="velocity-label"]') as SVGTextElement
    if (velLabel) {
      velLabel.textContent = `Velocity: ${params.velocity}`
    }

    const channelLabel = svg.querySelector('[data-group="channel-label"]') as SVGTextElement
    if (channelLabel) {
      channelLabel.textContent = `Channel: ${params.channel}`
    }

    // === Индикатор CC ===
    const ccIndicator = svg.querySelector('[data-group="cc-indicator"]') as SVGRectElement
    if (ccIndicator) {
      const ccValue = params.cc / 127
      ccIndicator.setAttribute('width', String(ccValue * 80))
    }
  }, [params, activeNotes, notes, L, R, T, B])

  // ===== ВОСПРОИЗВЕДЕНИЕ НОТ =====
  const playNote = useCallback((note: number) => {
    setActiveNotes(prev => {
      const newSet = new Set(prev)
      newSet.add(note)
      return newSet
    })
    render()

    // Добавляем сообщение (симуляция MIDI)
    const messages = document.querySelector('[data-group="midi-messages"]')
    if (messages) {
      const noteName = getNoteName(note)
      const time = new Date().toLocaleTimeString()
      const msg = document.createElement('span')
      msg.className = 'msg'
      msg.innerHTML = `[${time}] 🎹 <span class="hl">Note On</span> ${note} (${noteName}) · <span class="hl2">Vel:</span> ${params.velocity} · <span class="hl">Ch:</span> ${params.channel}`
      messages.appendChild(msg)
      if (messages.children.length > 10) {
        messages.removeChild(messages.firstChild)
      }
    }
  }, [params, render])

  const stopNote = useCallback((note: number) => {
    setActiveNotes(prev => {
      const newSet = new Set(prev)
      newSet.delete(note)
      return newSet
    })
    render()

    const messages = document.querySelector('[data-group="midi-messages"]')
    if (messages) {
      const time = new Date().toLocaleTimeString()
      const msg = document.createElement('span')
      msg.className = 'msg'
      msg.innerHTML = `[${time}] ⏹ <span class="hl">Note Off</span> ${note} · <span class="hl">Ch:</span> ${params.channel}`
      messages.appendChild(msg)
      if (messages.children.length > 10) {
        messages.removeChild(messages.firstChild)
      }
    }
  }, [params, render])

  const getNoteName = useCallback((note: number) => {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const octave = Math.floor(note / 12) - 1
    return names[note % 12] + octave
  }, [])

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

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof MIDIParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ПРЕСЕТЫ =====
  const presets: Record<string, MIDIParams> = {
    piano: { velocity: 80, channel: 1, octave: 0, cc: 0 },
    synth: { velocity: 90, channel: 2, octave: 1, cc: 50 },
    drums: { velocity: 100, channel: 10, octave: 0, cc: 0 }
  }

  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) setParams(preset)
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setParams({
      velocity: 80,
      channel: 1,
      octave: 0,
      cc: 0
    })
    setActiveNotes(new Set())
  }, [])

  // ===== ARPEGGIO =====
  const [arpActive, setArpActive] = useState(false)
  const arpRef = useRef<NodeJS.Timeout | null>(null)

  const toggleArpeggio = useCallback(() => {
    if (arpActive) {
      setArpActive(false)
      if (arpRef.current) clearInterval(arpRef.current)
      setActiveNotes(new Set())
      return
    }

    setArpActive(true)
    let index = 0
    const arpNotes = [60, 64, 67, 72, 67, 64]

    arpRef.current = setInterval(() => {
      setActiveNotes(new Set([arpNotes[index % arpNotes.length]]))
      render()
      index++
    }, 150)
  }, [arpActive, render])

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
          <span style={{ color: '#f5c542' }}>HH</span>Records · MIDI Visualizer
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
          <g opacity="0.05">
            <line x1={L} y1={T} x2={R} y2={T} stroke="#fff" strokeWidth="0.5"/>
            <line x1={L} y1={B} x2={R} y2={B} stroke="#fff" strokeWidth="0.5"/>
            <line x1={centerX} y1={T} x2={centerX} y2={B} stroke="#fff" strokeWidth="0.5"/>
          </g>

          {/* Клавиатура */}
          <g data-group="keyboard" />

          {/* Информация */}
          <text data-group="velocity-label" x={L} y={B + 20} fill="#4a9eff" fontSize="8" fontFamily="'Montserrat', sans-serif">Velocity: 80</text>
          <text data-group="channel-label" x={L + 120} y={B + 20} fill="#f5c542" fontSize="8" fontFamily="'Montserrat', sans-serif">Channel: 1</text>

          {/* CC Индикатор */}
          <rect x={R - 90} y={T + 10} width="80" height="8" fill="rgba(255,255,255,0.05)" rx="4"/>
          <rect data-group="cc-indicator" x={R - 90} y={T + 10} width="0" height="8" fill="#da70d6" rx="4"/>
          <text x={R - 90} y={T + 8} fill="#666" fontSize="5" fontFamily="'Montserrat', sans-serif">CC#1 (Mod)</text>

          {/* MIDI Сообщения */}
          <foreignObject x={L} y={B - 60} width={R - L} height="50">
            <div xmlns="http://www.w3.org/1999/xhtml" data-group="midi-messages" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '3px 8px',
              padding: '4px 6px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '6px',
              height: '100%',
              overflow: 'hidden',
              alignItems: 'center',
              alignContent: 'center',
              fontFamily: 'monospace',
              fontSize: '0.5rem',
              color: '#888'
            }}>
              <span style={{ color: '#666', fontFamily: 'monospace' }}>MIDI-сообщения будут здесь</span>
            </div>
          </foreignObject>

          {/* Легенда */}
          <g transform={`translate(${L}, ${T + 10})`}>
            <rect x="0" y="0" width="10" height="10" fill="rgba(245,197,66,0.15)" rx="2"/>
            <text x="14" y="9" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="'Montserrat', sans-serif">Active Notes</text>
          </g>

          <style>{`
            .msg { color: #f5c542; background: rgba(245,197,66,0.06); padding: 1px 6px; border-radius: 3px; border: 1px solid rgba(245,197,66,0.06); font-family: monospace; font-size: 0.5rem; white-space: nowrap; }
            .msg .hl { color: #4a9eff; }
            .msg .hl2 { color: #50c878; }
          `}</style>
        </svg>
      </div>

      {/* Типы */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {Object.keys(presets).map(name => (
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

      {/* Параметры */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '6px',
        marginBottom: '10px'
      }}>
        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Velocity</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>{params.velocity}</span>
          </div>
          <input
            type="range" min="0" max="127" step="1"
            value={params.velocity}
            onChange={(e) => updateParam('velocity', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Channel</span>
            <span style={{ fontSize: '0.55rem', color: '#f5c542' }}>{params.channel}</span>
          </div>
          <input
            type="range" min="1" max="16" step="1"
            value={params.channel}
            onChange={(e) => updateParam('channel', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Octave</span>
            <span style={{ fontSize: '0.55rem', color: '#50c878' }}>{params.octave > 0 ? '+' : ''}{params.octave}</span>
          </div>
          <input
            type="range" min="-2" max="2" step="1"
            value={params.octave}
            onChange={(e) => updateParam('octave', parseInt(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>CC#1 (Mod)</span>
            <span style={{ fontSize: '0.55rem', color: '#da70d6' }}>{params.cc}</span>
          </div>
          <input
            type="range" min="0" max="127" step="1"
            value={params.cc}
            onChange={(e) => updateParam('cc', parseInt(e.target.value))}
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
          onClick={toggleArpeggio}
          style={{
            padding: '4px 16px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.55rem',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
            background: arpActive ? 'rgba(245,197,66,0.15)' : 'rgba(255,255,255,0.03)',
            color: arpActive ? '#f5c542' : '#888',
            fontFamily: 'inherit'
          }}
        >
          {arpActive ? '⏹ Arp OFF' : '🎹 Arpeggio'}
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.45rem', color: '#555', padding: '4px 0' }}>
        🎹 Кликайте по клавишам для воспроизведения MIDI-нот
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
        .msg { display: inline-block; }
      `}</style>
    </div>
  )
}

export default MIDIWidget
