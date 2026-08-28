// components/interactive/RecordingMistakesWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Mistake {
  id: string
  name: string
  icon: string
  fixable: 'yes' | 'partial' | 'no'
  description: string
  solution: string
}

const RecordingMistakesWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedMistake, setSelectedMistake] = useState<string>('clipping')
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  const mistakes: Mistake[] = [
    {
      id: 'clipping',
      name: 'Клиппинг (перегруз)',
      icon: '⚠️',
      fixable: 'no',
      description: 'Уровень сигнала превысил 0 dBFS, верхушки волны обрезаны. Данные потеряны навсегда.',
      solution: 'Установите уровень -12…-6 dBFS, используйте Pad на интерфейсе, записывайте с запасом.'
    },
    {
      id: 'acoustics',
      name: 'Плохая акустика',
      icon: '🏠',
      fixable: 'partial',
      description: 'Отражения от стен добавляют "комнату", эхо и реверберацию. EQ не убирает это.',
      solution: 'Используйте ковры, одеяла, акустические панели. Пойте ближе к микрофону (15-25 см).'
    },
    {
      id: 'microphone',
      name: 'Неправильный микрофон',
      icon: '🎙️',
      fixable: 'partial',
      description: 'Не тот микрофон даёт неправильный тембр. EQ не может полностью исправить это.',
      solution: 'Подберите микрофон под голос. Попробуйте разные модели перед записью.'
    },
    {
      id: 'position',
      name: 'Неправильная позиция',
      icon: '📍',
      fixable: 'partial',
      description: 'Слишком близко = бубнение, слишком далеко = эхо. Сбоку = потеря высоких.',
      solution: 'Оптимальная дистанция 15-25 см, чуть выше рта. Экспериментируйте с позицией.'
    },
    {
      id: 'phase',
      name: 'Фазовые проблемы',
      icon: '🔄',
      fixable: 'partial',
      description: 'Звук попадает в несколько микрофонов с разной задержкой. Убивает плотность.',
      solution: 'Используйте правило 3:1. Проверяйте фазу коррелометром. Перемещайте микрофоны.'
    },
    {
      id: 'level',
      name: 'Неправильный уровень',
      icon: '📊',
      fixable: 'no',
      description: 'Слишком тихо = шум, слишком громко = клиппинг. Нет правильного запаса.',
      solution: 'Пики -12…-6 dBFS. 24 бит даёт запас. Красный индикатор = перегруз.'
    },
    {
      id: 'noise',
      name: 'Шумы и посторонние звуки',
      icon: '🔊',
      fixable: 'partial',
      description: 'Гул, щелчки, уличный шум, дыхание. Шумоподавители дают артефакты.',
      solution: 'Выключите кондиционер, холодильник. Записывайте в тихое время. Используйте шумоподавление.'
    },
    {
      id: 'tempo',
      name: 'Неправильный темп/тональность',
      icon: '🎵',
      fixable: 'partial',
      description: 'Вокалист не успевает или напрягается. Песня теряет эмоцию.',
      solution: 'Всегда используйте клик-трек. Проверьте тональность до записи. Транспонируйте если нужно.'
    },
    {
      id: 'performance',
      name: 'Плохое исполнение',
      icon: '🎤',
      fixable: 'no',
      description: 'Фальшь, сбитый ритм, отсутствие эмоции. Auto-Tune не добавит душу.',
      solution: 'Перезапишите. Эмоцию нельзя исправить плагинами. Качество > количество.'
    },
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

    const margin = 12
    const leftCol = 120
    const rowH = 20
    const rowGap = 2
    const headerH = 16
    const detailH = 40

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === Заголовок ===
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('❌ Проверка записи на ошибки', margin, 2)

    // === Список ошибок ===
    const listY = headerH + 4
    let yPos = listY

    for (const m of mistakes) {
      const isSelected = selectedMistake === m.id
      const isChecked = checkedItems.has(m.id)
      const fixColor = m.fixable === 'no' ? '#ff6b6b' : m.fixable === 'partial' ? '#f5c542' : '#50c878'

      // Фон строки
      ctx.fillStyle = isSelected ? 'rgba(245,197,66,0.06)' : 'rgba(255,255,255,0.01)'
      ctx.beginPath()
      ctx.roundRect(margin, yPos, W - margin * 2, rowH, 3)
      ctx.fill()

      // Иконка
      ctx.fillStyle = isSelected ? '#f5c542' : 'rgba(255,255,255,0.3)'
      ctx.font = '8px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(m.icon, margin + 4, yPos + rowH / 2)

      // Название
      ctx.fillStyle = isSelected ? '#f5c542' : (isChecked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)')
      ctx.font = isSelected ? 'bold 5px sans-serif' : '5px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(m.name, margin + 20, yPos + rowH / 2)

      // Индикатор "исправимо"
      const fixLabel = m.fixable === 'no' ? '❌ Неисправимо' : m.fixable === 'partial' ? '🟡 Частично' : '✅ Исправимо'
      ctx.fillStyle = fixColor
      ctx.font = '4px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(fixLabel, W - margin - 4, yPos + rowH / 2)

      // Детали (если выбрано)
      if (isSelected) {
        const detailY = yPos + rowH + 2
        ctx.fillStyle = 'rgba(255,255,255,0.03)'
        ctx.beginPath()
        ctx.roundRect(margin + 4, detailY, W - margin * 2 - 8, detailH, 3)
        ctx.fill()

        // Описание
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.font = '4px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText('⚠️ ' + m.description, margin + 10, detailY + 4)

        // Решение
        ctx.fillStyle = '#50c878'
        ctx.font = '4px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText('✅ ' + m.solution, margin + 10, detailY + 20)

        // Обводка
        ctx.strokeStyle = 'rgba(245,197,66,0.1)'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.roundRect(margin + 4, detailY, W - margin * 2 - 8, detailH, 3)
        ctx.stroke()
      }

      yPos += rowH + rowGap + (isSelected ? detailH + 2 : 0)
    }

    // === Индикатор прогресса ===
    const progressY = yPos + 4
    const progressX = margin
    const progressW = W - margin * 2
    const progressH = 8

    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    ctx.beginPath()
    ctx.roundRect(progressX, progressY, progressW, progressH, 4)
    ctx.fill()

    const progress = (checkedItems.size / mistakes.length) * 100
    const grad = ctx.createLinearGradient(progressX, 0, progressX + progressW, 0)
    grad.addColorStop(0, '#50c878')
    grad.addColorStop(0.6, '#f5c542')
    grad.addColorStop(1, '#ff6b6b')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(progressX, progressY, (progress / 100) * progressW, progressH, 4)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Проверено: ${checkedItems.size}/${mistakes.length}`, progressX + progressW / 2, progressY + progressH / 2)

  }, [selectedMistake, checkedItems])

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
      canvas.height = Math.min(340, w * 0.4)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ =====
  useEffect(() => {
    renderWidget()
  }, [selectedMistake, checkedItems, renderWidget])

  // ===== ОБРАБОТЧИКИ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getMistakeAt = (x: number, y: number): string | null => {
      const W = canvas.width
      const H = canvas.height

      const margin = 12
      const rowH = 20
      const rowGap = 2
      const headerH = 16
      const detailH = 40

      let yPos = headerH + 4

      for (const m of mistakes) {
        const isSelected = selectedMistake === m.id
        const totalH = rowH + rowGap + (isSelected ? detailH + 2 : 0)
        if (x >= margin && x <= W - margin && y >= yPos && y <= yPos + rowH) {
          return m.id
        }
        yPos += totalH
      }
      return null
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width * canvas.width
      const y = (e.clientY - rect.top) / rect.height * canvas.height

      const id = getMistakeAt(x, y)
      if (id) {
        if (selectedMistake === id) {
          // Переключение чекбокса при повторном клике
          setCheckedItems(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) newSet.delete(id)
            else newSet.add(id)
            return newSet
          })
        } else {
          setSelectedMistake(id)
        }
      }
    }

    canvas.addEventListener('click', handleClick)
    canvas.style.cursor = 'pointer'

    return () => canvas.removeEventListener('click', handleClick)
  }, [selectedMistake, mistakes])

  // ===== СБРОС =====
  const resetAll = useCallback(() => {
    setCheckedItems(new Set())
    setSelectedMistake('clipping')
  }, [])

  // ===== ОТМЕТИТЬ ВСЁ =====
  const checkAll = useCallback(() => {
    const allIds = new Set(mistakes.map(m => m.id))
    setCheckedItems(allIds)
  }, [mistakes])

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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Recording Check
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
          🖱️ Клик по ошибке — подробности · Повторный клик — отметить как проверено
        </div>
      </div>

      {/* Легенда */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        <span style={{ fontSize: '0.35rem', color: '#ff6b6b' }}>❌ Неисправимо</span>
        <span style={{ fontSize: '0.35rem', color: '#f5c542' }}>🟡 Частично</span>
        <span style={{ fontSize: '0.35rem', color: '#50c878' }}>✅ Исправимо</span>
        <span style={{ fontSize: '0.35rem', color: '#888' }}>Клик = выбрать · Повторный клик = чекнуть</span>
      </div>

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
          onClick={checkAll}
          style={{
            padding: '4px 14px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.5rem',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
            background: 'rgba(80,200,120,0.1)',
            color: '#50c878',
            fontFamily: 'inherit'
          }}
        >
          ✅ Всё проверил
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

      <div style={{ textAlign: 'center', fontSize: '0.4rem', color: '#555', padding: '4px 0' }}>
        ❌ Проверьте запись на ошибки до начала сведения
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default RecordingMistakesWidget