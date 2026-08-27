// components/interactive/MIDIControllerWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ControllerParams {
  velocity: number
  channel: number
  octave: number
  cc: number
}

const MIDIControllerWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [params, setParams] = useState<ControllerParams>({
    velocity: 80,
    channel: 1,
    octave: 0,
    cc: 0
  })
  const [mode, setMode] = useState<'keyboard' | 'pads' | 'mixer' | 'dj'>('keyboard')
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set())
  const [activePads, setActivePads] = useState<Set<number>>(new Set())
  const [faderValues, setFaderValues] = useState<number[]>([64, 64, 64, 64, 64, 64, 64, 64])
  const [mutedChannels, setMutedChannels] = useState<number[]>([])
  const [crossfader, setCrossfader] = useState(50)
  const timeRef = useRef(0)

  const L = 60, R = 760, T = 60, B = 360

  // ===== НОТЫ ДЛЯ КЛАВИАТУРЫ =====
  const getNotes = useCallback(() => {
    const notes: number[] = []
    const startNote = 48 + params.octave * 12
    for (let i = 0; i < 25; i++) {
      notes.push(startNote + i)
    }
    return notes
  }, [params.octave])

  const getNoteName = useCallback((note: number) => {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const octave = Math.floor(note / 12) - 1
    return names[note % 12] + octave
  }, [])

  const isBlackKey = useCallback((note: number) => {
    return [1, 3, 6, 8, 10].includes(note % 12)
  }, [])

  // ===== MIDI-СООБЩЕНИЯ =====
  const addMessage = useCallback((msg: string) => {
    const messages = document.querySelector('[data-group="midi-messages"]')
    if (!messages) return
    const time = new Date().toLocaleTimeString()
    const el = document.createElement('span')
    el.className = 'msg'
    el.innerHTML = `[${time}] ${msg}`
    messages.appendChild(el)
    if (messages.children.length > 15 && messages.firstChild) {
      messages.removeChild(messages.firstChild)
    }
    const hint = messages.querySelector('span[style]')
    if (hint) hint.remove()
  }, [])

  // ===== ВОСПРОИЗВЕДЕНИЕ НОТ =====
  const playNote = useCallback((note: number) => {
    setActiveKeys(prev => {
      const newSet = new Set(prev)
      newSet.add(note)
      return newSet
    })
    const noteName = getNoteName(note)
    addMessage(`🎹 <span class="hl">Note On</span> ${note} (${noteName}) · <span class="hl2">Vel:</span> ${params.velocity} · <span class="hl">Ch:</span> ${params.channel}`)
    render()
  }, [params, addMessage, getNoteName])

  const stopNote = useCallback((note: number) => {
    setActiveKeys(prev => {
      const newSet = new Set(prev)
      newSet.delete(note)
      return newSet
    })
    addMessage(`⏹ <span class="hl">Note Off</span> ${note} · <span class="hl">Ch:</span> ${params.channel}`)
    render()
  }, [params, addMessage])

  // ===== ВОСПРОИЗВЕДЕНИЕ ПЭДОВ =====
  const playPad = useCallback((note: number, padIndex: number) => {
    setActivePads(prev => {
      const newSet = new Set(prev)
      newSet.add(note)
      return newSet
    })
    const noteName = getNoteName(note)
    addMessage(`🥁 <span class="hl">Pad Hit</span> ${note} (${noteName}) · <span class="hl2">Vel:</span> ${params.velocity} · <span class="hl">Ch:</span> ${params.channel}`)
    render()
    setTimeout(() => {
      setActivePads(prev => {
        const newSet = new Set(prev)
        newSet.delete(note)
        return newSet
      })
      render()
    }, 200)
  }, [params, addMessage, getNoteName])

  // ===== ОБНОВЛЕНИЕ ФЕЙДЕРА =====
  const updateFader = useCallback((index: number, value: number) => {
    setFaderValues(prev => {
      const newVals = [...prev]
      newVals[index] = value
      return newVals
    })
    addMessage(`🎛 <span class="hl">Fader ${index + 1}</span> · <span class="hl2">Val:</span> ${value} · <span class="hl">Ch:</span> ${params.channel}`)
    render()
  }, [params, addMessage])

  // ===== ОБНОВЛЕНИЕ КРОССФЕЙДЕРА =====
  const updateCrossfader = useCallback((value: number) => {
    setCrossfader(value)
    addMessage(`🎚 <span class="hl">Crossfader</span> · <span class="hl2">Val:</span> ${value}% · <span class="hl">Ch:</span> ${params.channel}`)
    render()
  }, [params, addMessage])

  // ===== РЕНДЕРИНГ =====
  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    const contentGroup = svg.querySelector('[data-group="content"]') as SVGGElement
    if (!contentGroup) return

    let html = ''

    // === РЕЖИМ: КЛАВИАТУРА ===
    if (mode === 'keyboard') {
      const notes = getNotes()
      const keyWidth = (R - L) / notes.length

      for (let i = 0; i < notes.length; i++) {
        const note = notes[i]
        const x = L + i * keyWidth
        const isBlack = isBlackKey(note)
        const isActive = activeKeys.has(note)
        const w = isBlack ? keyWidth * 0.55 : keyWidth * 1.05

        html += `
          <rect
            x="${x}"
            y="${isBlack ? T + 15 : T}"
            width="${w}"
            height="${isBlack ? (B - T - 15) * 0.65 : B - T}"
            fill="${isActive ? (isBlack ? 'rgba(245,197,66,0.4)' : 'rgba(245,197,66,0.25)') : (isBlack ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.06)')}"
            stroke="${isActive ? '#f5c542' : (isBlack ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)')}"
            stroke-width="${isActive ? '2' : '1'}"
            rx="${isBlack ? '0 0 4 4' : '2'}"
            data-note="${note}"
            style="cursor:pointer;transition:all 0.08s ease;"
          />
          ${!isBlack ? `<text x="${x + w/2}" y="${B - 6}" fill="rgba(255,255,255,0.1)" font-size="6" text-anchor="middle" font-family="'Montserrat', sans-serif">${getNoteName(note)}</text>` : ''}
        `
      }
    }

    // === РЕЖИМ: PADS ===
    if (mode === 'pads') {
      const padNames = ['Kick', 'Snare', 'Hat', 'Clap', 'Bass', 'Piano', 'Vox', 'FX']
      const padIcons = ['🥁', '🥁', '🥁', '👏', '🎸', '🎹', '🎤', '✨']
      const padColors = ['#ff6b6b', '#ff8c42', '#f5c542', '#50c878', '#4a9eff', '#da70d6', '#c77dff', '#ff69b4']
      const padW = (R - L) / 4 - 8
      const padH = (B - T - 20) / 2 - 8

      for (let i = 0; i < 8; i++) {
        const col = i % 4
        const row = Math.floor(i / 4)
        const x = L + 4 + col * (padW + 8)
        const y = T + 10 + row * (padH + 8)
        const note = 36 + i
        const isActive = activePads.has(note)

        html += `
          <rect
            x="${x}" y="${y}"
            width="${padW}" height="${padH}"
            fill="${isActive ? padColors[i] + '40' : 'rgba(255,255,255,0.04)'}"
            stroke="${isActive ? padColors[i] : 'rgba(255,255,255,0.06)'}"
            stroke-width="${isActive ? '2' : '1'}"
            rx="6"
            data-pad="${i}"
            style="cursor:pointer;transition:all 0.1s ease;"
          />
          <text x="${x + padW/2}" y="${y + padH/2 - 4}" fill="${isActive ? padColors[i] : '#888'}" font-size="14" text-anchor="middle" font-family="'Segoe UI Emoji', sans-serif">${padIcons[i]}</text>
          <text x="${x + padW/2}" y="${y + padH/2 + 14}" fill="${isActive ? padColors[i] : '#666'}" font-size="7" text-anchor="middle" font-family="'Montserrat', sans-serif">${padNames[i]}</text>
        `
      }
    }

    // === РЕЖИМ: MIXER ===
    if (mode === 'mixer') {
      const labels = ['Kick', 'Snare', 'Hat', 'Clap', 'Bass', 'Piano', 'Vox', 'FX']
      const colors = ['#ff6b6b', '#ff8c42', '#f5c542', '#50c878', '#4a9eff', '#da70d6', '#c77dff', '#ff69b4']
      const chW = (R - L) / 8 - 4

      for (let i = 0; i < 8; i++) {
        const x = L + 2 + i * (chW + 4)
        const val = faderValues[i] || 64
        const pct = (val / 127) * 100
        const isMuted = mutedChannels.includes(i)

        html += `
          <rect x="${x}" y="${T + 20}" width="${chW}" height="${B - T - 35}" fill="rgba(255,255,255,0.02)" rx="4" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
          <rect x="${x + chW/2 - 2}" y="${T + 25}" width="4" height="${B - T - 60}" fill="rgba(255,255,255,0.03)" rx="2"/>
          <rect x="${x + chW/2 - 2}" y="${T + 25 + (100 - pct) * (B - T - 60) / 100}" width="4" height="${pct * (B - T - 60) / 100}" fill="${colors[i]}" rx="2" opacity="0.6"/>
          <rect x="${x + chW/2 - 4}" y="${T + 25 + (100 - pct) * (B - T - 60) / 100 - 6}" width="8" height="12" fill="${colors[i]}" rx="2" opacity="0.9" style="cursor:grab;"/>
          <text x="${x + chW/2}" y="${B - 10}" fill="${isMuted ? '#ff6b6b' : '#666'}" font-size="5" text-anchor="middle" font-family="'Montserrat', sans-serif">${labels[i]}</text>
          <text x="${x + chW/2}" y="${T + 12}" fill="#888" font-size="5" text-anchor="middle" font-family="'Montserrat', sans-serif">${val}</text>
          <rect x="${x + chW/2 - 8}" y="${B - 8}" width="16" height="10" fill="${isMuted ? 'rgba(255,80,80,0.15)' : 'rgba(255,255,255,0.03)'}" rx="3" stroke="${isMuted ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.06)'}" stroke-width="1" data-mute="${i}" style="cursor:pointer;"/>
          <text x="${x + chW/2}" y="${B - 2}" fill="${isMuted ? '#ff6b6b' : '#666'}" font-size="5" text-anchor="middle" font-family="'Montserrat', sans-serif">${isMuted ? 'M' : 'S'}</text>
        `
      }
    }

    // === РЕЖИМ: DJ ===
    if (mode === 'dj') {
      const deckW = 200
      const deckH = 120
      const deckY = T + 40

      // Deck A
      html += `
        <rect x="${L + 20}" y="${deckY}" width="${deckW}" height="${deckH}" fill="rgba(255,255,255,0.02)" rx="8" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <text x="${L + 120}" y="${deckY + 20}" fill="#666" font-size="8" text-anchor="middle" font-family="'Montserrat', sans-serif">DECK A</text>
        <circle cx="${L + 120}" cy="${deckY + 75}" r="35" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" stroke-width="1" data-deck="A" style="cursor:pointer;"/>
        <circle cx="${L + 120}" cy="${deckY + 75}" r="20" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <text x="${L + 120}" y="${deckY + 75}" fill="#666" font-size="10" text-anchor="middle" font-family="'Segoe UI Emoji', sans-serif">⏺</text>
      `

      // Crossfader
      const cfX = L + 220 + 40
      const cfY = deckY + 20
      const cfH = deckH - 20
      const cfPct = crossfader / 100

      html += `
        <rect x="${cfX}" y="${cfY}" width="20" height="${cfH}" fill="rgba(255,255,255,0.03)" rx="4" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <rect x="${cfX + 2}" y="${cfY + (100 - cfPct) * (cfH - 20) / 100 + 2}" width="16" height="16" fill="#f5c542" rx="8" style="cursor:grab;"/>
        <text x="${cfX + 10}" y="${cfY + cfH + 14}" fill="#666" font-size="6" text-anchor="middle" font-family="'Montserrat', sans-serif">X-FADER</text>
        <text x="${cfX + 10}" y="${cfY - 4}" fill="#888" font-size="6" text-anchor="middle" font-family="'Montserrat', sans-serif">${crossfader}%</text>
      `

      // Deck B
      html += `
        <rect x="${cfX + 30}" y="${deckY}" width="${deckW}" height="${deckH}" fill="rgba(255,255,255,0.02)" rx="8" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <text x="${cfX + 30 + 100}" y="${deckY + 20}" fill="#666" font-size="8" text-anchor="middle" font-family="'Montserrat', sans-serif">DECK B</text>
        <circle cx="${cfX + 30 + 100}" cy="${deckY + 75}" r="35" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" stroke-width="1" data-deck="B" style="cursor:pointer;"/>
        <circle cx="${cfX + 30 + 100}" cy="${deckY + 75}" r="20" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <text x="${cfX + 30 + 100}" y="${deckY + 75}" fill="#666" font-size="10" text-anchor="middle" font-family="'Segoe UI Emoji', sans-serif">⏺</text>
      `
    }

    // === MIDI-сообщения ===
    html += `
      <foreignObject x="${L}" y="${B + 10}" width="${R - L}" height="40">
        <div xmlns="http://www.w3.org/1999/xhtml" data-group="midi-messages" style="display:flex;flex-wrap:wrap;gap:3px 8px;padding:4px 6px;background:rgba(0,0,0,0.3);border-radius:6px;height:100%;overflow:hidden;align-items:center;align-content:center;font-family:monospace;font-size:0.5rem;color:#888;">
          <span style="color:#666;">MIDI-сообщения будут здесь</span>
        </div>
      </foreignObject>
    `

    contentGroup.innerHTML = html

    // === ОБРАБОТЧИКИ ДЛЯ КЛАВИАТУРЫ ===
    if (mode === 'keyboard') {
      contentGroup.querySelectorAll('rect[data-note]').forEach(el => {
        const note = parseInt(el.getAttribute('data-note') || '0')
        const isBlack = isBlackKey(note)

        const startNote = (e: Event) => {
          e.preventDefault()
          playNote(note)
        }
        const endNote = (e: Event) => {
          e.preventDefault()
          stopNote(note)
        }

        el.removeEventListener('mousedown', startNote as any)
        el.removeEventListener('mouseup', endNote as any)
        el.removeEventListener('mouseleave', endNote as any)
        el.removeEventListener('touchstart', startNote as any)
        el.removeEventListener('touchend', endNote as any)

        el.addEventListener('mousedown', startNote)
        el.addEventListener('mouseup', endNote)
        el.addEventListener('mouseleave', endNote)
        el.addEventListener('touchstart', startNote, { passive: false })
        el.addEventListener('touchend', endNote, { passive: false })
      })
    }

    // === ОБРАБОТЧИКИ ДЛЯ ПЭДОВ ===
    if (mode === 'pads') {
      contentGroup.querySelectorAll('rect[data-pad]').forEach(el => {
        const padIndex = parseInt(el.getAttribute('data-pad') || '0')
        const note = 36 + padIndex

        const play = (e: Event) => {
          e.preventDefault()
          playPad(note, padIndex)
        }

        el.removeEventListener('mousedown', play as any)
        el.removeEventListener('touchstart', play as any)
        el.addEventListener('mousedown', play)
        el.addEventListener('touchstart', play, { passive: false })
      })
    }

    // === ОБРАБОТЧИКИ ДЛЯ МИКШЕРА ===
    if (mode === 'mixer') {
      // Mute
      contentGroup.querySelectorAll('rect[data-mute]').forEach(el => {
        const index = parseInt(el.getAttribute('data-mute') || '0')
        const click = (e: Event) => {
          e.stopPropagation()
          setMutedChannels(prev => {
            if (prev.includes(index)) {
              return prev.filter(i => i !== index)
            } else {
              return [...prev, index]
            }
          })
          addMessage(`🔇 <span class="hl">Mute ${index + 1}</span> · ${mutedChannels.includes(index) ? 'OFF' : 'ON'}`)
        }
        el.removeEventListener('click', click as any)
        el.addEventListener('click', click)
      })

      // Faders (drag)
      const faderRects = contentGroup.querySelectorAll('rect[style*="cursor:grab"]')
      faderRects.forEach((el, index) => {
        const startDrag = (e: MouseEvent | TouchEvent) => {
          e.preventDefault()
          const parent = el.parentElement
          if (!parent) return
          const rect = parent.getBoundingClientRect()
          const chW = (R - L) / 8 - 4
          const faderX = L + 2 + index * (chW + 4) + chW / 2 - 4
          const faderY = T + 25
          const faderH = B - T - 60

          const getY = (clientY: number) => {
            const svgRect = svg.getBoundingClientRect()
            const y = (clientY - svgRect.top) / svgRect.height * (B - T) - 20
            const val = Math.max(0, Math.min(127, 127 - (y - faderY) / faderH * 127))
            return Math.round(val)
          }

          const move = (ev: MouseEvent | TouchEvent) => {
            const clientY = 'touches' in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY
            const val = getY(clientY)
            updateFader(index, val)
          }

          const end = () => {
            document.removeEventListener('mousemove', move as any)
            document.removeEventListener('mouseup', end as any)
            document.removeEventListener('touchmove', move as any)
            document.removeEventListener('touchend', end as any)
          }

          document.addEventListener('mousemove', move as any)
          document.addEventListener('mouseup', end as any)
          document.addEventListener('touchmove', move as any, { passive: false })
          document.addEventListener('touchend', end as any)
        }

        el.removeEventListener('mousedown', startDrag as any)
        el.removeEventListener('touchstart', startDrag as any)
        el.addEventListener('mousedown', startDrag as any)
        el.addEventListener('touchstart', startDrag as any, { passive: false })
      })
    }

    // === ОБРАБОТЧИКИ ДЛЯ DJ ===
    if (mode === 'dj') {
      // Джоги
      contentGroup.querySelectorAll('circle[data-deck]').forEach(el => {
        const deck = el.getAttribute('data-deck') || 'A'
        const click = (e: Event) => {
          e.stopPropagation()
          const isActive = el.getAttribute('data-active') === 'true'
          el.setAttribute('data-active', isActive ? 'false' : 'true')
          el.setAttribute('stroke', isActive ? 'rgba(255,255,255,0.06)' : 'rgba(245,197,66,0.3)')
          addMessage(`⏺ <span class="hl">Deck ${deck}</span> · ${isActive ? 'STOP' : 'PLAY'}`)
        }
        el.removeEventListener('click', click as any)
        el.addEventListener('click', click)
      })

      // Кроссфейдер
      const cfThumb = contentGroup.querySelector('rect[style*="cursor:grab"]')
      if (cfThumb) {
        const startDrag = (e: MouseEvent | TouchEvent) => {
          e.preventDefault()
          const svgRect = svg.getBoundingClientRect()
          const cfX = L + 220 + 40
          const cfY = T + 40 + 20
          const cfH = 120 - 20

          const getVal = (clientY: number) => {
            const y = (clientY - svgRect.top) / svgRect.height * (B - T) - 40
            const val = Math.max(0, Math.min(100, (y - cfY) / cfH * 100))
            return Math.round(100 - val)
          }

          const move = (ev: MouseEvent | TouchEvent) => {
            const clientY = 'touches' in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY
            const val = getVal(clientY)
            updateCrossfader(val)
          }

          const end = () => {
            document.removeEventListener('mousemove', move as any)
            document.removeEventListener('mouseup', end as any)
            document.removeEventListener('touchmove', move as any)
            document.removeEventListener('touchend', end as any)
          }

          document.addEventListener('mousemove', move as any)
          document.addEventListener('mouseup', end as any)
          document.addEventListener('touchmove', move as any, { passive: false })
          document.addEventListener('touchend', end as any)
        }

        cfThumb.removeEventListener('mousedown', startDrag as any)
        cfThumb.removeEventListener('touchstart', startDrag as any)
        cfThumb.addEventListener('mousedown', startDrag as any)
        cfThumb.addEventListener('touchstart', startDrag as any, { passive: false })
      }
    }
  }, [mode, params, activeKeys, activePads, faderValues, mutedChannels, crossfader, L, R, T, B, playNote, stopNote, playPad, addMessage, getNotes, getNoteName, isBlackKey, updateFader, updateCrossfader])

  // ===== ПЕРЕКЛЮЧЕНИЕ РЕЖИМА =====
  const setModeHandler = useCallback((newMode: 'keyboard' | 'pads' | 'mixer' | 'dj') => {
    setMode(newMode)
    addMessage(`🔄 <span class="hl">Mode:</span> ${newMode.charAt(0).toUpperCase() + newMode.slice(1)}`)
    render()
  }, [addMessage, render])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof ControllerParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Virtual Controller
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
          viewBox="0 0 820 460"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {/* Сетка */}
          <g opacity="0.03">
            <line x1={L} y1={T} x2={R} y2={T} stroke="#fff" strokeWidth="0.5"/>
            <line x1={L} y1={B} x2={R} y2={B} stroke="#fff" strokeWidth="0.5"/>
          </g>

          {/* Режим */}
          <text x={L} y={T - 8} fill="#666" fontSize="7" fontFamily="'Montserrat', sans-serif">
            Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </text>

          {/* Контент */}
          <g data-group="content" />

          {/* Легенда */}
          <g transform={`translate(${L}, ${B + 6})`}>
            <rect x="0" y="0" width="10" height="10" fill="rgba(245,197,66,0.15)" rx="2"/>
            <text x="14" y="9" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="'Montserrat', sans-serif">Active</text>
            <rect x="55" y="0" width="10" height="10" fill="rgba(255,255,255,0.02)" rx="2"/>
            <text x="69" y="9" fill="rgba(255,255,255,0.15)" fontSize="6" fontFamily="'Montserrat', sans-serif">🖱️ Клик по элементам = отправка MIDI</text>
          </g>

          <style>{`
            .msg { color: #f5c542; background: rgba(245,197,66,0.06); padding: 1px 6px; border-radius: 3px; border: 1px solid rgba(245,197,66,0.06); font-family: monospace; font-size: 0.5rem; white-space: nowrap; }
            .msg .hl { color: #4a9eff; }
            .msg .hl2 { color: #50c878; }
          `}</style>
        </svg>
      </div>

      {/* Режимы */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {['keyboard', 'pads', 'mixer', 'dj'].map(m => (
          <button
            key={m}
            onClick={() => setModeHandler(m as any)}
            style={{
              padding: '4px 16px',
              borderRadius: '50px',
              fontSize: '0.55rem',
              fontWeight: 600,
              border: mode === m ? '1px solid rgba(245,197,66,0.2)' : '1px solid rgba(255,255,255,0.06)',
              background: mode === m ? 'rgba(245,197,66,0.08)' : 'rgba(255,255,255,0.03)',
              color: mode === m ? '#f5c542' : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit',
              textTransform: 'capitalize'
            }}
            onMouseEnter={(e) => {
              if (mode !== m) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = '#fff'
              }
            }}
            onMouseLeave={(e) => {
              if (mode !== m) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.color = '#888'
              }
            }}
          >
            {m === 'keyboard' && '🎹 Keyboard'}
            {m === 'pads' && '🥁 Pads'}
            {m === 'mixer' && '🎛️ Mixer'}
            {m === 'dj' && '🎚️ DJ'}
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
          onClick={() => {
            setActiveKeys(new Set())
            setActivePads(new Set())
            setFaderValues([64, 64, 64, 64, 64, 64, 64, 64])
            setMutedChannels([])
            setCrossfader(50)
            render()
            addMessage('⟳ <span class="hl">Reset</span>')
          }}
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
        🎹 Кликайте по элементам для отправки MIDI-сообщений
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

export default MIDIControllerWidget
