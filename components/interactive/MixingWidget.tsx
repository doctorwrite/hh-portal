// components/interactive/MixingWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Channel {
  id: number
  name: string
  color: string
  gain: number
  pan: number
  mute: boolean
  solo: boolean
}

const MixingWidget: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([
    { id: 1, name: 'Вокал', color: '#f5c542', gain: 0, pan: 0, mute: false, solo: false },
    { id: 2, name: 'Бас', color: '#ff6b6b', gain: 0, pan: 0, mute: false, solo: false },
    { id: 3, name: 'Бочка', color: '#4a9eff', gain: 0, pan: 0, mute: false, solo: false },
    { id: 4, name: 'Снэр', color: '#50c878', gain: 0, pan: 0, mute: false, solo: false },
    { id: 5, name: 'Гитара L', color: '#da70d6', gain: 0, pan: -30, mute: false, solo: false },
    { id: 6, name: 'Гитара R', color: '#da70d6', gain: 0, pan: 30, mute: false, solo: false },
    { id: 7, name: 'Синтезатор', color: '#ff8c42', gain: 0, pan: 0, mute: false, solo: false },
    { id: 8, name: 'Тарелки', color: '#c77dff', gain: 0, pan: 0, mute: false, solo: false },
  ])
  const [masterGain, setMasterGain] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null)
  const timeRef = useRef(0)

  const colors = ['#f5c542', '#ff6b6b', '#4a9eff', '#50c878', '#da70d6', '#da70d6', '#ff8c42', '#c77dff']

  // ===== ОБНОВЛЕНИЕ КАНАЛА =====
  const updateChannel = useCallback((id: number, updates: Partial<Channel>) => {
    setChannels(prev => prev.map(ch => ch.id === id ? { ...ch, ...updates } : ch))
  }, [])

  // ===== MUTE / SOLO =====
  const toggleMute = useCallback((id: number) => {
    setChannels(prev => prev.map(ch => ch.id === id ? { ...ch, mute: !ch.mute } : ch))
  }, [])

  const toggleSolo = useCallback((id: number) => {
    setChannels(prev => prev.map(ch => ch.id === id ? { ...ch, solo: !ch.solo } : ch))
  }, [])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setChannels(prev => prev.map(ch => ({ ...ch, gain: 0, pan: 0, mute: false, solo: false })))
    setMasterGain(0)
  }, [])

  // ===== РАСЧЁТ УРОВНЕЙ (СИМУЛЯЦИЯ) =====
  const getChannelLevel = useCallback((channel: Channel, time: number) => {
    if (channel.mute) return 0
    const base = 0.3 + 0.2 * Math.sin(time * 0.5 + channel.id)
    const gainFactor = Math.pow(10, channel.gain / 20)
    const level = Math.min(1, Math.max(0, base * gainFactor * 1.5))
    return level
  }, [])

  // ===== РЕНДЕРИНГ =====
  const renderWidget = useCallback(() => {
    const canvas = document.getElementById('mixerCanvas') as HTMLCanvasElement
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    const chCount = channels.length
    const chWidth = (W - 20) / chCount - 6
    const startX = 10

    // === Заголовок ===
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.font = '8px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText('🎛️ Микшер HHRecords', W / 2, 16)

    // === Каналы ===
    for (let i = 0; i < channels.length; i++) {
      const ch = channels[i]
      const x = startX + i * (chWidth + 6)
      const y = 20
      const w = chWidth
      const h = H - 40

      const isSelected = selectedChannel === ch.id
      const isSolo = ch.solo
      const isMuted = ch.mute
      const level = getChannelLevel(ch, timeRef.current)
      const isActive = !isMuted && !isSolo

      // Фон канала
      ctx.fillStyle = isSelected ? 'rgba(245,197,66,0.08)' : 'rgba(255,255,255,0.02)'
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 4)
      ctx.fill()

      // Рамка
      ctx.strokeStyle = isSelected ? 'rgba(245,197,66,0.3)' : 'rgba(255,255,255,0.04)'
      ctx.lineWidth = isSelected ? 1.5 : 0.5
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 4)
      ctx.stroke()

      // Название канала
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'
      ctx.font = '6px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(ch.name, x + w / 2, y + 4)

      // VU-метр
      const meterX = x + 4
      const meterW = w - 8
      const meterH = 60
      const meterY = y + 20

      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.fillRect(meterX, meterY, meterW, meterH)

      const meterLevel = isActive ? level : 0
      const meterHeight = meterLevel * meterH

      const grad = ctx.createLinearGradient(0, meterY + meterH, 0, meterY)
      grad.addColorStop(0, '#50c878')
      grad.addColorStop(0.6, '#f5c542')
      grad.addColorStop(0.85, '#ff6b6b')
      grad.addColorStop(1, '#ff0000')
      ctx.fillStyle = grad
      ctx.fillRect(meterX, meterY + meterH - meterHeight, meterW, meterHeight)

      // Клип (red)
      if (meterLevel > 0.95) {
        ctx.fillStyle = 'rgba(255,0,0,0.8)'
        ctx.fillRect(meterX, meterY, meterW, 2)
      }

      // Значение уровня
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.font = '5px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(`${Math.round(meterLevel * 100)}%`, x + w / 2, meterY + meterH + 2)

      // Ползунок Gain
      const gainY = meterY + meterH + 16
      const gainH = 8
      const gainVal = (ch.gain + 12) / 24

      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.fillRect(meterX, gainY, meterW, gainH)

      ctx.fillStyle = ch.color
      ctx.fillRect(meterX, gainY, Math.max(2, gainVal * meterW), gainH)

      // Маркер ползунка
      const markerX = meterX + gainVal * meterW
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(markerX, gainY + gainH / 2, 3, 0, Math.PI * 2)
      ctx.fill()

      // Значение Gain
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(`${ch.gain > 0 ? '+' : ''}${ch.gain} dB`, x + w / 2, gainY + gainH + 2)

      // Панорама
      const panY = gainY + gainH + 14
      const panH = 4
      const panVal = (ch.pan + 100) / 200

      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.fillRect(meterX, panY, meterW, panH)

      ctx.fillStyle = 'rgba(74,158,255,0.3)'
      ctx.fillRect(meterX, panY, panVal * meterW, panH)

      // Маркер панорамы
      const panMarkerX = meterX + panVal * meterW
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(panMarkerX, panY + panH / 2, 2, 0, Math.PI * 2)
      ctx.fill()

      // Подписи L / R
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('L', meterX, panY + panH + 2)
      ctx.textAlign = 'right'
      ctx.fillText('R', meterX + meterW, panY + panH + 2)

      // Кнопки Mute / Solo
      const btnY = panY + panH + 14
      const btnW = (meterW - 2) / 2

      // Mute
      ctx.fillStyle = isMuted ? 'rgba(255,80,80,0.2)' : 'rgba(255,255,255,0.03)'
      ctx.beginPath()
      ctx.roundRect(meterX, btnY, btnW, 12, 2)
      ctx.fill()
      ctx.fillStyle = isMuted ? '#ff6b6b' : 'rgba(255,255,255,0.2)'
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('M', meterX + btnW / 2, btnY + 6)

      // Solo
      ctx.fillStyle = isSolo ? 'rgba(245,197,66,0.2)' : 'rgba(255,255,255,0.03)'
      ctx.beginPath()
      ctx.roundRect(meterX + btnW + 2, btnY, btnW, 12, 2)
      ctx.fill()
      ctx.fillStyle = isSolo ? '#f5c542' : 'rgba(255,255,255,0.2)'
      ctx.fillText('S', meterX + btnW + 2 + btnW / 2, btnY + 6)
    }

    // === Мастер-канал ===
    const masterX = 10 + channels.length * (chWidth + 6)
    const masterW = chWidth
    const masterH = H - 40

    ctx.fillStyle = 'rgba(245,197,66,0.05)'
    ctx.beginPath()
    ctx.roundRect(masterX, 20, masterW, masterH, 4)
    ctx.fill()

    ctx.strokeStyle = 'rgba(245,197,66,0.1)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.roundRect(masterX, 20, masterW, masterH, 4)
    ctx.stroke()

    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('MASTER', masterX + masterW / 2, 24)

    // Мастер VU
    const masterMeterX = masterX + 4
    const masterMeterW = masterW - 8
    const masterMeterH = 60
    const masterMeterY = 38

    const masterLevel = 0.3 + 0.2 * Math.sin(timeRef.current * 0.5)
    const masterMeterHeight = masterLevel * masterMeterH

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(masterMeterX, masterMeterY, masterMeterW, masterMeterH)

    const grad2 = ctx.createLinearGradient(0, masterMeterY + masterMeterH, 0, masterMeterY)
    grad2.addColorStop(0, '#50c878')
    grad2.addColorStop(0.6, '#f5c542')
    grad2.addColorStop(0.85, '#ff6b6b')
    grad2.addColorStop(1, '#ff0000')
    ctx.fillStyle = grad2
    ctx.fillRect(masterMeterX, masterMeterY + masterMeterH - masterMeterHeight, masterMeterW, masterMeterHeight)

    // Мастер Gain
    const masterGainY = masterMeterY + masterMeterH + 16
    const masterGainH = 8
    const masterGainVal = (masterGain + 12) / 24

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(masterMeterX, masterGainY, masterMeterW, masterGainH)
    ctx.fillStyle = '#f5c542'
    ctx.fillRect(masterMeterX, masterGainY, masterGainVal * masterMeterW, masterGainH)

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(masterMeterX + masterGainVal * masterMeterW, masterGainY + masterGainH / 2, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(`${masterGain > 0 ? '+' : ''}${masterGain} dB`, masterX + masterW / 2, masterGainY + masterGainH + 2)

    // === Индикатор "solo active" ===
    const anySolo = channels.some(ch => ch.solo)
    if (anySolo) {
      ctx.fillStyle = 'rgba(245,197,66,0.1)'
      ctx.fillRect(0, H - 12, W, 12)
      ctx.fillStyle = 'rgba(245,197,66,0.4)'
      ctx.font = '6px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🔊 SOLO ACTIVE', W / 2, H - 6)
    }

    // === Легенда ===
    const legendY = 6
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.font = '5px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('🖱️ Клик по ползунку — регулировка', 10, legendY)

  }, [channels, masterGain, selectedChannel, getChannelLevel])

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
    const canvas = document.getElementById('mixerCanvas') as HTMLCanvasElement
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const w = Math.max(200, parent.clientWidth - 12)
    canvas.width = w
    canvas.height = Math.min(280, w * 0.35)
    renderWidget()
  }, [renderWidget])

  // ===== ОБНОВЛЕНИЕ ПРИ ИЗМЕНЕНИИ КАНАЛОВ =====
  useEffect(() => {
    renderWidget()
  }, [channels, masterGain, renderWidget])

  // ===== ОБРАБОТЧИКИ КЛИКОВ =====
  useEffect(() => {
    const canvas = document.getElementById('mixerCanvas') as HTMLCanvasElement
    if (!canvas) return

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * canvas.width
      const y = (e.clientY - rect.top) / rect.height * canvas.height

      const W = canvas.width
      const H = canvas.height
      const chCount = channels.length
      const chWidth = (W - 20) / chCount - 6
      const startX = 10

      for (let i = 0; i < channels.length; i++) {
        const ch = channels[i]
        const chX = startX + i * (chWidth + 6)
        const chY = 20
        const chW = chWidth
        const chH = H - 40

        // Проверяем попадание в канал
        if (x >= chX && x <= chX + chW && y >= chY && y <= chY + chH) {
          // Проверяем попадание в ползунок Gain
          const meterY = chY + 20
          const meterH = 60
          const gainY = meterY + meterH + 16
          const gainH = 8
          const gainW = chW - 8
          const gainX = chX + 4

          if (x >= gainX && x <= gainX + gainW && y >= gainY && y <= gainY + gainH) {
            const val = Math.max(-12, Math.min(12, ((x - gainX) / gainW) * 24 - 12))
            updateChannel(ch.id, { gain: Math.round(val) })
            return
          }

          // Проверяем попадание в кнопки Mute/Solo
          const panY = gainY + gainH + 14
          const btnY = panY + 18
          const btnW = (chW - 10) / 2
          const btnX = chX + 4

          if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + 12) {
            toggleMute(ch.id)
            return
          }
          if (x >= btnX + btnW + 2 && x <= btnX + btnW * 2 + 2 && y >= btnY && y <= btnY + 12) {
            toggleSolo(ch.id)
            return
          }

          // Выбор канала
          setSelectedChannel(ch.id)
          return
        }
      }

      // Мастер-канал
      const masterX = startX + channels.length * (chWidth + 6)
      const masterW = chWidth
      const masterY = 20
      const masterH = H - 40

      if (x >= masterX && x <= masterX + masterW && y >= masterY && y <= masterY + masterH) {
        const masterMeterY = 38
        const masterMeterH = 60
        const masterGainY = masterMeterY + masterMeterH + 16
        const masterGainH = 8
        const masterGainW = masterW - 8
        const masterGainX = masterX + 4

        if (x >= masterGainX && x <= masterGainX + masterGainW && y >= masterGainY && y <= masterGainY + masterGainH) {
          const val = Math.max(-12, Math.min(12, ((x - masterGainX) / masterGainW) * 24 - 12))
          setMasterGain(Math.round(val))
          return
        }
      }

      // Сброс выбора
      setSelectedChannel(null)
    }

    canvas.addEventListener('click', handleClick)
    canvas.style.cursor = 'pointer'

    return () => canvas.removeEventListener('click', handleClick)
  }, [channels, updateChannel, toggleMute, toggleSolo])

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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Mixer Simulator
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
          id="mixerCanvas"
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }}
        />
      </div>

      {/* Информация о выбранном канале */}
      {selectedChannel !== null && (
        <div style={{
          padding: '6px 12px',
          background: 'rgba(245,197,66,0.06)',
          borderRadius: '6px',
          marginBottom: '10px',
          border: '1px solid rgba(245,197,66,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '4px'
        }}>
          <span style={{ fontSize: '0.5rem', color: '#f5c542' }}>
            Выбран: <strong>{channels.find(ch => ch.id === selectedChannel)?.name}</strong>
          </span>
          <span style={{ fontSize: '0.4rem', color: '#888' }}>
            Кликните по другому каналу для переключения
          </span>
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
        🎛️ Управляйте громкостью, панорамой, Mute/Solo — симуляция микшера
      </div>
    </div>
  )
}

export default MixingWidget