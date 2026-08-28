// components/interactive/SessionPrepWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Track {
  id: number
  name: string
  color: string
  category: 'vocal' | 'bass' | 'drums' | 'guitar' | 'synth' | 'fx'
  ready: boolean
  consolidated: boolean
  cleaned: boolean
  labeled: boolean
}

interface SessionPrepState {
  tracks: Track[]
  categories: {
    id: string
    name: string
    color: string
    expanded: boolean
  }[]
}

const SessionPrepWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<SessionPrepState>({
    tracks: [
      { id: 1, name: 'Вокал основной', color: '#f5c542', category: 'vocal', ready: false, consolidated: false, cleaned: false, labeled: true },
      { id: 2, name: 'Вокал бэк', color: '#f5c542', category: 'vocal', ready: false, consolidated: false, cleaned: false, labeled: true },
      { id: 3, name: 'Бас', color: '#ff6b6b', category: 'bass', ready: false, consolidated: false, cleaned: false, labeled: true },
      { id: 4, name: 'Бочка', color: '#4a9eff', category: 'drums', ready: false, consolidated: false, cleaned: false, labeled: true },
      { id: 5, name: 'Снэр', color: '#4a9eff', category: 'drums', ready: false, consolidated: false, cleaned: false, labeled: true },
      { id: 6, name: 'Хай-хэт', color: '#4a9eff', category: 'drums', ready: false, consolidated: false, cleaned: false, labeled: true },
      { id: 7, name: 'Гитара L', color: '#50c878', category: 'guitar', ready: false, consolidated: false, cleaned: false, labeled: true },
      { id: 8, name: 'Гитара R', color: '#50c878', category: 'guitar', ready: false, consolidated: false, cleaned: false, labeled: true },
      { id: 9, name: 'Синтезатор', color: '#da70d6', category: 'synth', ready: false, consolidated: false, cleaned: false, labeled: true },
      { id: 10, name: 'Реверберация', color: '#888', category: 'fx', ready: false, consolidated: false, cleaned: false, labeled: true },
    ],
    categories: [
      { id: 'vocal', name: 'Вокал', color: '#f5c542', expanded: true },
      { id: 'bass', name: 'Бас', color: '#ff6b6b', expanded: true },
      { id: 'drums', name: 'Барабаны', color: '#4a9eff', expanded: true },
      { id: 'guitar', name: 'Гитары', color: '#50c878', expanded: true },
      { id: 'synth', name: 'Синтезаторы', color: '#da70d6', expanded: true },
      { id: 'fx', name: 'Эффекты', color: '#888', expanded: true },
    ]
  })

  const [progress, setProgress] = useState(0)
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null)
  const timeRef = useRef(0)
  const isPlaying = true // Всегда активен

  // ===== РАСЧЁТ ПРОГРЕССА =====
  const calculateProgress = useCallback(() => {
    const total = state.tracks.length
    const ready = state.tracks.filter(t => t.ready).length
    return Math.round((ready / total) * 100)
  }, [state.tracks])

  // ===== ПЕРЕКЛЮЧЕНИЕ ГОТОВНОСТИ =====
  const toggleTrackReady = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === id ? { ...t, ready: !t.ready } : t
      )
    }))
  }, [])

  // ===== ПЕРЕКЛЮЧЕНИЕ КАТЕГОРИИ =====
  const toggleCategory = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c =>
        c.id === id ? { ...c, expanded: !c.expanded } : c
      )
    }))
  }, [])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => ({ ...t, ready: false }))
    }))
  }, [])

  // ===== ОТМЕТИТЬ ВСЁ =====
  const markAllReady = useCallback(() => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => ({ ...t, ready: true }))
    }))
  }, [])

  // ===== РЕНДЕРИНГ =====
  const renderWidget = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    const margin = 8
    const leftCol = 110
    const trackH = 18
    const trackGap = 2
    const catH = 22
    const statusW = 16
    const progressH = 12

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    const headerY = 6
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('📂 Органайзер проекта', margin, headerY)

    // === Прогресс ===
    const progX = margin + leftCol
    const progY = 4
    const progW = W - margin * 2 - leftCol - 20
    const prog = calculateProgress()

    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    ctx.beginPath()
    ctx.roundRect(progX, progY, progW, progressH, 6)
    ctx.fill()

    const grad = ctx.createLinearGradient(progX, 0, progX + progW, 0)
    grad.addColorStop(0, '#50c878')
    grad.addColorStop(0.6, '#f5c542')
    grad.addColorStop(1, '#ff6b6b')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(progX, progY, (prog / 100) * progW, progressH, 6)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = 'bold 6px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${prog}% готово`, progX + progW / 2, progY + progressH / 2)

    // === Категории ===
    let yPos = 4 + progressH + 4

    for (const cat of state.categories) {
      // Заголовок категории
      const catY = yPos
      const catW = W - margin * 2

      ctx.fillStyle = 'rgba(255,255,255,0.02)'
      ctx.beginPath()
      ctx.roundRect(margin, catY, catW, catH, 3)
      ctx.fill()

      ctx.fillStyle = cat.color
      ctx.font = 'bold 6px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(cat.expanded ? '▾' : '▸', margin + 4, catY + catH / 2)
      ctx.fillText(cat.name, margin + 18, catY + catH / 2)

      // Количество готовых дорожек
      const catTracks = state.tracks.filter(t => t.category === cat.id)
      const readyCount = catTracks.filter(t => t.ready).length
      const totalCount = catTracks.length

      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.font = '5px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${readyCount}/${totalCount}`, margin + catW - 4, catY + catH / 2)

      // Индикатор готовности категории
      const catProg = totalCount > 0 ? (readyCount / totalCount) * 100 : 0
      const catProgX = margin + catW - 50
      const catProgW = 36
      const catProgY = catY + (catH - 4) / 2 + 2
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.fillRect(catProgX, catProgY, catProgW, 4)
      const catGrad = ctx.createLinearGradient(catProgX, 0, catProgX + catProgW, 0)
      catGrad.addColorStop(0, '#50c878')
      catGrad.addColorStop(1, '#f5c542')
      ctx.fillStyle = catGrad
      ctx.fillRect(catProgX, catProgY, (catProg / 100) * catProgW, 4)

      yPos += catH

      // Дорожки в категории
      if (cat.expanded) {
        for (const track of state.tracks.filter(t => t.category === cat.id)) {
          const trY = yPos
          const trW = W - margin * 2 - 4

          // Фон дорожки
          const isSelected = selectedTrack === track.id
          ctx.fillStyle = isSelected ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)'
          ctx.beginPath()
          ctx.roundRect(margin + 12, trY, trW - 12, trackH, 2)
          ctx.fill()

          // Цветной индикатор
          ctx.fillStyle = track.color
          ctx.fillRect(margin + 14, trY + 2, 3, trackH - 4)

          // Название
          ctx.fillStyle = track.ready ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'
          ctx.font = '5px sans-serif'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(track.name, margin + 22, trY + trackH / 2)

          // Статус готовности
          const statusX = margin + trW - 20
          ctx.fillStyle = track.ready ? '#50c878' : 'rgba(255,255,255,0.1)'
          ctx.beginPath()
          ctx.arc(statusX, trY + trackH / 2, 5, 0, Math.PI * 2)
          ctx.fill()
          if (track.ready) {
            ctx.fillStyle = '#fff'
            ctx.font = '4px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('✓', statusX, trY + trackH / 2 + 0.5)
          }

          yPos += trackH + trackGap
        }
      }

      yPos += 2
    }

    // === Легенда ===
    const legendY = H - 12
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(0, legendY - 1, W, 12)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '3px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('🟢 Готово  ●  🔴 Не готово  ●  🖱️ Клик по дорожке — переключить', margin + 4, legendY + 5)

    // Обновляем прогресс
    setProgress(prog)

  }, [state, selectedTrack, calculateProgress])

  // ===== РЕСАЙЗ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      const w = Math.max(200, rect.width - 12)
      canvas.width = w
      canvas.height = Math.min(360, w * 0.4)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ОБНОВЛЕНИЕ ПРИ ИЗМЕНЕНИИ =====
  useEffect(() => {
    renderWidget()
  }, [state, selectedTrack, renderWidget])

  // ===== ОБРАБОТЧИК КЛИКОВ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getTrackAt = (x: number, y: number): number | null => {
      const W = canvas.width
      const H = canvas.height
      const margin = 8
      const trackH = 18
      const trackGap = 2
      const catH = 22
      const progressH = 12

      let yPos = 4 + progressH + 4

      for (const cat of state.categories) {
        yPos += catH
        if (cat.expanded) {
          for (const track of state.tracks.filter(t => t.category === cat.id)) {
            const trY = yPos
            const trW = W - margin * 2 - 4
            if (x >= margin + 12 && x <= margin + 12 + trW - 12 &&
                y >= trY && y <= trY + trackH) {
              return track.id
            }
            yPos += trackH + trackGap
          }
        }
        yPos += 2
      }
      return null
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * canvas.width
      const y = (e.clientY - rect.top) / rect.height * canvas.height

      // Проверяем клик по заголовку категории
      const W = canvas.width
      const margin = 8
      const progressH = 12
      const catH = 22
      let yPos = 4 + progressH + 4

      for (const cat of state.categories) {
        if (x >= margin && x <= margin + W - margin * 2 && y >= yPos && y <= yPos + catH) {
          toggleCategory(cat.id)
          return
        }
        yPos += catH
        if (cat.expanded) {
          const tracks = state.tracks.filter(t => t.category === cat.id)
          yPos += tracks.length * (trackH + trackGap)
        }
        yPos += 2
      }

      // Проверяем клик по дорожке
      const trackId = getTrackAt(x, y)
      if (trackId !== null) {
        toggleTrackReady(trackId)
        setSelectedTrack(trackId)
      } else {
        setSelectedTrack(null)
      }
    }

    canvas.addEventListener('click', handleClick)
    canvas.style.cursor = 'pointer'

    return () => canvas.removeEventListener('click', handleClick)
  }, [state, toggleCategory, toggleTrackReady])

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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Session Prep
        </span>
        <span style={{ fontSize: '0.5rem', color: '#50c878' }}>
          ●  Организуйте проект перед сведением
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
          🖱️ Клик по дорожке — отметить готовность
        </div>
      </div>

      {/* Управление */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '6px'
      }}>
        <button
          onClick={markAllReady}
          style={{
            padding: '4px 14px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728)',
            color: '#000',
            fontFamily: 'inherit'
          }}
        >
          ✅ Всё готово
        </button>
        <button
          onClick={resetAll}
          style={{
            padding: '4px 14px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.5rem',
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

      <div style={{ textAlign: 'center', fontSize: '0.4rem', color: '#555', padding: '2px 0' }}>
        📂 Отмечайте готовность дорожек — прогресс обновляется автоматически
      </div>
    </div>
  )
}

export default SessionPrepWidget