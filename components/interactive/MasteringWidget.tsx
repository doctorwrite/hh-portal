// components/interactive/MasteringWidget.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface MasteringParams {
  eqLow: number
  eqMid: number
  eqHigh: number
  compRatio: number
  compThreshold: number
  limiterCeiling: number
  limiterThreshold: number
  targetLUFS: number
}

const MasteringWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [params, setParams] = useState<MasteringParams>({
    eqLow: 0,
    eqMid: 0,
    eqHigh: 0,
    compRatio: 2,
    compThreshold: -5,
    limiterCeiling: -1,
    limiterThreshold: -6,
    targetLUFS: -14
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentLUFS, setCurrentLUFS] = useState(-18)
  const [gainReduction, setGainReduction] = useState(0)
  const [truePeak, setTruePeak] = useState(-2)
  const timeRef = useRef(0)
  const animRef = useRef<number | null>(null)

  // ===== СИМУЛЯЦИЯ =====
  const simulate = useCallback(() => {
    // Симуляция LUFS (медленно приближается к целевому)
    const target = params.targetLUFS
    const current = currentLUFS + (target - currentLUFS) * 0.002
    setCurrentLUFS(current)

    // Симуляция GR (зависит от компрессии)
    const gr = Math.min(6, (params.compThreshold + 20) / 8 * (params.compRatio / 4))
    setGainReduction(gr)

    // Симуляция True Peak (зависит от лимитера)
    const tp = Math.max(-5, Math.min(-0.5, params.limiterCeiling + 0.5 + Math.sin(timeRef.current * 0.5) * 0.3))
    setTruePeak(tp)
  }, [params, currentLUFS])

  // ===== РЕНДЕРИНГ =====
  const renderWidget = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    const margin = 16
    const graphX = margin
    const graphY = 24
    const graphW = W - margin * 2
    const graphH = 100

    // === Фон ===
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, W, H)

    // === 1. Визуализация цепочки мастеринга ===
    // EQ
    const eqX = graphX
    const eqW = graphW * 0.25
    const eqH = graphH
    const eqY = graphY

    ctx.fillStyle = 'rgba(74,158,255,0.05)'
    ctx.beginPath()
    ctx.roundRect(eqX, eqY, eqW, eqH, 4)
    ctx.fill()
    ctx.strokeStyle = 'rgba(74,158,255,0.15)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.roundRect(eqX, eqY, eqW, eqH, 4)
    ctx.stroke()

    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('EQ', eqX + eqW / 2, eqY + 4)

    // Отображение EQ кривой (упрощённо)
    const eqCenterY = eqY + eqH / 2
    const eqAmp = 20
    const lowGain = params.eqLow / 12
    const midGain = params.eqMid / 12
    const highGain = params.eqHigh / 12

    ctx.beginPath()
    for (let i = 0; i <= 50; i++) {
      const t = i / 50
      const x = eqX + 10 + t * (eqW - 20)
      let gain = 0
      if (t < 0.3) gain = lowGain * (1 - t / 0.3)
      else if (t < 0.7) gain = midGain
      else gain = highGain * ((t - 0.7) / 0.3)
      const y = eqCenterY - gain * eqAmp
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#4a9eff'
    ctx.lineWidth = 2
    ctx.stroke()

    // === Компрессор ===
    const compX = eqX + eqW + 4
    const compW = graphW * 0.25
    const compH = graphH
    const compY = graphY

    ctx.fillStyle = 'rgba(80,200,120,0.05)'
    ctx.beginPath()
    ctx.roundRect(compX, compY, compW, compH, 4)
    ctx.fill()
    ctx.strokeStyle = 'rgba(80,200,120,0.15)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.roundRect(compX, compY, compW, compH, 4)
    ctx.stroke()

    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('Comp', compX + compW / 2, compY + 4)

    // GR-метр
    const grMeterX = compX + 8
    const grMeterW = compW - 16
    const grMeterH = 20
    const grMeterY = compY + 20

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(grMeterX, grMeterY, grMeterW, grMeterH)

    const grPercent = Math.min(1, gainReduction / 6)
    ctx.fillStyle = '#ff6b6b'
    ctx.fillRect(grMeterX, grMeterY, grPercent * grMeterW, grMeterH)

    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`GR: ${gainReduction.toFixed(1)} dB`, compX + compW / 2, grMeterY + grMeterH / 2)

    // Ratio и Threshold
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = '5px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(`R:${params.compRatio}:1  Th:${params.compThreshold}dB`, compX + compW / 2, grMeterY + grMeterH + 6)

    // === Лимитер ===
    const limX = compX + compW + 4
    const limW = graphW * 0.25
    const limH = graphH
    const limY = graphY

    ctx.fillStyle = 'rgba(245,197,66,0.05)'
    ctx.beginPath()
    ctx.roundRect(limX, limY, limW, limH, 4)
    ctx.fill()
    ctx.strokeStyle = 'rgba(245,197,66,0.15)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.roundRect(limX, limY, limW, limH, 4)
    ctx.stroke()

    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('Limiter', limX + limW / 2, limY + 4)

    // Визуализация лимитера
    const limCenterY = limY + limH / 2
    const limAmp = 25

    ctx.beginPath()
    for (let i = 0; i <= 50; i++) {
      const t = i / 50
      const x = limX + 10 + t * (limW - 20)
      let y
      if (t < 0.5) {
        const input = (t / 0.5) * 20 - 10
        const output = input < params.limiterThreshold ? input : params.limiterThreshold + (input - params.limiterThreshold) / 2
        y = limCenterY - (output / 10) * limAmp
      } else {
        const input = ((t - 0.5) / 0.5) * 20 - 10
        const output = input < params.limiterThreshold ? input : params.limiterThreshold + (input - params.limiterThreshold) / 2
        y = limCenterY - (output / 10) * limAmp
      }
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#f5c542'
    ctx.lineWidth = 2
    ctx.stroke()

    // Отметка Ceiling
    const ceilingY = limCenterY - (params.limiterCeiling / 10) * limAmp
    ctx.fillStyle = 'rgba(255,107,107,0.15)'
    ctx.fillRect(limX, ceilingY - 1, limW, 2)
    ctx.fillStyle = 'rgba(255,107,107,0.3)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`Ceiling ${params.limiterCeiling}dBTP`, limX + limW - 4, ceilingY - 2)

    // === Master Output ===
    const outX = limX + limW + 4
    const outW = graphW * 0.2
    const outH = graphH
    const outY = graphY

    ctx.fillStyle = 'rgba(245,197,66,0.05)'
    ctx.beginPath()
    ctx.roundRect(outX, outY, outW, outH, 4)
    ctx.fill()
    ctx.strokeStyle = 'rgba(245,197,66,0.15)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.roundRect(outX, outY, outW, outH, 4)
    ctx.stroke()

    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '6px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('Output', outX + outW / 2, outY + 4)

    // VU-метр выхода
    const outMeterX = outX + 6
    const outMeterW = outW - 12
    const outMeterH = 30
    const outMeterY = outY + 20

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(outMeterX, outMeterY, outMeterW, outMeterH)

    const outLevel = 0.3 + 0.3 * Math.sin(timeRef.current * 0.5) + 0.2 * Math.sin(timeRef.current * 0.3)
    const outPercent = Math.min(1, outLevel)

    const grad = ctx.createLinearGradient(0, outMeterY + outMeterH, 0, outMeterY)
    grad.addColorStop(0, '#50c878')
    grad.addColorStop(0.6, '#f5c542')
    grad.addColorStop(0.85, '#ff6b6b')
    grad.addColorStop(1, '#ff0000')
    ctx.fillStyle = grad
    ctx.fillRect(outMeterX, outMeterY + outMeterH - outPercent * outMeterH, outMeterW, outPercent * outMeterH)

    // True Peak
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(`TP: ${truePeak.toFixed(1)} dBTP`, outX + outW / 2, outMeterY + outMeterH + 6)

    // === LUFS Индикатор ===
    const lufsY = graphY + graphH + 20
    const lufsW = graphW
    const lufsH = 20

    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    ctx.beginPath()
    ctx.roundRect(graphX, lufsY, lufsW, lufsH, 4)
    ctx.fill()

    // Шкала LUFS
    const lufsMin = -30
    const lufsMax = -5
    const target = params.targetLUFS
    const current = currentLUFS

    // Фон шкалы
    const gradL = ctx.createLinearGradient(graphX, 0, graphX + lufsW, 0)
    gradL.addColorStop(0, '#4a9eff')
    gradL.addColorStop(0.4, '#50c878')
    gradL.addColorStop(0.7, '#f5c542')
    gradL.addColorStop(1, '#ff6b6b')
    ctx.fillStyle = gradL
    ctx.beginPath()
    ctx.roundRect(graphX, lufsY, lufsW, lufsH, 4)
    ctx.fill()

    // Маркер текущего LUFS
    const currentX = graphX + ((current - lufsMin) / (lufsMax - lufsMin)) * lufsW
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(currentX, lufsY + lufsH / 2, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Маркер цели
    const targetX = graphX + ((target - lufsMin) / (lufsMax - lufsMin)) * lufsW
    ctx.fillStyle = 'rgba(245,197,66,0.3)'
    ctx.fillRect(targetX - 1, lufsY, 2, lufsH)
    ctx.fillStyle = 'rgba(245,197,66,0.6)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText('▼ ЦЕЛЬ', targetX, lufsY - 2)

    // Подписи
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.font = '4px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('-30', graphX, lufsY + lufsH + 2)
    ctx.textAlign = 'right'
    ctx.fillText('-5', graphX + lufsW, lufsY + lufsH + 2)

    // Значение LUFS
    const isOnTarget = Math.abs(current - target) < 0.5
    ctx.fillStyle = isOnTarget ? '#50c878' : '#f5c542'
    ctx.font = 'bold 7px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${current.toFixed(1)} LUFS`, graphX + lufsW / 2, lufsY + lufsH / 2)

    // === Статус ===
    const statusY = lufsY + lufsH + 12
    const statusText = isOnTarget
      ? '✅ Отличный уровень! Мастер готов к стримингам.'
      : (current < target
        ? `📈 Мастер тише цели на ${(target - current).toFixed(1)} LUFS. Поднимите уровень.`
        : `📉 Мастер громче цели на ${(current - target).toFixed(1)} LUFS. Уменьшите уровень.`)

    ctx.fillStyle = isOnTarget ? 'rgba(80,200,120,0.06)' : 'rgba(245,197,66,0.06)'
    ctx.beginPath()
    ctx.roundRect(graphX, statusY, graphW, 14, 4)
    ctx.fill()

    ctx.fillStyle = isOnTarget ? '#50c878' : '#f5c542'
    ctx.font = '5px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(statusText, graphX + graphW / 2, statusY + 7)

  }, [params, currentLUFS, gainReduction, truePeak])

  // ===== АНИМАЦИЯ =====
  useEffect(() => {
    if (!isPlaying) return

    let frameId: number
    const loop = () => {
      timeRef.current += 0.02
      simulate()
      renderWidget()
      frameId = requestAnimationFrame(loop)
    }
    
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, simulate, renderWidget])

  // ===== РЕСАЙЗ =====
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      const w = Math.max(200, rect.width - 12)
      canvas.width = w
      canvas.height = Math.min(240, w * 0.28)
      renderWidget()
    }
  }, [renderWidget])

  // ===== ПРИ ИЗМЕНЕНИИ ПАРАМЕТРОВ =====
  useEffect(() => {
    renderWidget()
  }, [params, renderWidget])

  // ===== ОБНОВЛЕНИЕ ПАРАМЕТРА =====
  const updateParam = useCallback((key: keyof MasteringParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  // ===== ПРЕСЕТЫ =====
  const presets: Record<string, MasteringParams> = {
    'Spotify': { eqLow: 0, eqMid: 0, eqHigh: 0, compRatio: 2, compThreshold: -5, limiterCeiling: -1, limiterThreshold: -6, targetLUFS: -14 },
    'Apple Music': { eqLow: 0, eqMid: 0, eqHigh: 0, compRatio: 2, compThreshold: -4, limiterCeiling: -1, limiterThreshold: -5, targetLUFS: -16 },
    'CD': { eqLow: 0, eqMid: 0, eqHigh: 0, compRatio: 2, compThreshold: -3, limiterCeiling: -0.3, limiterThreshold: -4, targetLUFS: -9 },
    'Club': { eqLow: 1, eqMid: 0, eqHigh: 1, compRatio: 3, compThreshold: -8, limiterCeiling: -0.3, limiterThreshold: -3, targetLUFS: -9 },
    'Classical': { eqLow: 0, eqMid: 0, eqHigh: 0, compRatio: 1.5, compThreshold: -2, limiterCeiling: -1, limiterThreshold: -10, targetLUFS: -18 },
  }

  const loadPreset = useCallback((name: string) => {
    const preset = presets[name]
    if (preset) setParams(preset)
  }, [])

  // ===== РЕСЕТ =====
  const resetAll = useCallback(() => {
    setParams({
      eqLow: 0,
      eqMid: 0,
      eqHigh: 0,
      compRatio: 2,
      compThreshold: -5,
      limiterCeiling: -1,
      limiterThreshold: -6,
      targetLUFS: -14
    })
    setCurrentLUFS(-18)
    setGainReduction(0)
    setTruePeak(-2)
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
          <span style={{ color: '#f5c542' }}>HH</span>Records · Mastering Chain
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

      {/* Пресеты */}
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
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '0.5rem',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.03)',
              color: '#888',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit'
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
        gap: '6px',
        marginBottom: '10px'
      }}>
        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>EQ Low</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>{params.eqLow > 0 ? '+' : ''}{params.eqLow} dB</span>
          </div>
          <input
            type="range" min="-3" max="3" step="0.5"
            value={params.eqLow}
            onChange={(e) => updateParam('eqLow', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>EQ Mid</span>
            <span style={{ fontSize: '0.55rem', color: '#50c878' }}>{params.eqMid > 0 ? '+' : ''}{params.eqMid} dB</span>
          </div>
          <input
            type="range" min="-3" max="3" step="0.5"
            value={params.eqMid}
            onChange={(e) => updateParam('eqMid', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>EQ High</span>
            <span style={{ fontSize: '0.55rem', color: '#da70d6' }}>{params.eqHigh > 0 ? '+' : ''}{params.eqHigh} dB</span>
          </div>
          <input
            type="range" min="-3" max="3" step="0.5"
            value={params.eqHigh}
            onChange={(e) => updateParam('eqHigh', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #da70d6, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Comp Ratio</span>
            <span style={{ fontSize: '0.55rem', color: '#ff8c42' }}>{params.compRatio}:1</span>
          </div>
          <input
            type="range" min="1" max="4" step="0.5"
            value={params.compRatio}
            onChange={(e) => updateParam('compRatio', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #ff8c42, rgba(255,255,255,0.07))',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Comp Th</span>
            <span style={{ fontSize: '0.55rem', color: '#ff6b6b' }}>{params.compThreshold} dB</span>
          </div>
          <input
            type="range" min="-12" max="0" step="0.5"
            value={params.compThreshold}
            onChange={(e) => updateParam('compThreshold', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Limiter Ceiling</span>
            <span style={{ fontSize: '0.55rem', color: '#f5c542' }}>{params.limiterCeiling} dBTP</span>
          </div>
          <input
            type="range" min="-3" max="0" step="0.1"
            value={params.limiterCeiling}
            onChange={(e) => updateParam('limiterCeiling', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Limiter Th</span>
            <span style={{ fontSize: '0.55rem', color: '#ff6b6b' }}>{params.limiterThreshold} dB</span>
          </div>
          <input
            type="range" min="-12" max="0" step="0.5"
            value={params.limiterThreshold}
            onChange={(e) => updateParam('limiterThreshold', parseFloat(e.target.value))}
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
            <span style={{ fontSize: '0.4rem', color: '#666' }}>Target LUFS</span>
            <span style={{ fontSize: '0.55rem', color: '#4a9eff' }}>{params.targetLUFS} LUFS</span>
          </div>
          <input
            type="range" min="-20" max="-6" step="0.5"
            value={params.targetLUFS}
            onChange={(e) => updateParam('targetLUFS', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '2px',
              appearance: 'none',
              background: 'linear-gradient(to right, #4a9eff, rgba(255,255,255,0.07))',
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
        🎧 Симуляция цепочки мастеринга: EQ → Компрессор → Лимитер → LUFS
      </div>

      <style>{`
        input[type="range"] { -webkit-appearance: none; appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
        input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.12); }
      `}</style>
    </div>
  )
}

export default MasteringWidget