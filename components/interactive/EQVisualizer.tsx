// components/interactive/EQVisualizer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

interface EQVisualizerProps {
  theme?: 'dark' | 'light'
}

const EQVisualizer: React.FC<EQVisualizerProps> = ({ theme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // ===== ВЕСЬ JS КОД ИЗ eq.html =====
    // Проверяем что DOM загружен
    if (!containerRef.current) return

    const initEQ = () => {
      const container = containerRef.current
      if (!container) return

      // Ищем элементы внутри контейнера
      const eqContainer = container.querySelector('.eq-container')
      if (!eqContainer) return

      // ================================================================
      // 1. DOM-элементы
      // ================================================================
      const svg = eqContainer.querySelector('#eqSvg')
      const eqCurve = eqContainer.querySelector('#eqCurve')
      const eqDot = eqContainer.querySelector('#eqDot')
      const eqSpectrum = eqContainer.querySelector('#eqSpectrum')

      const freqSlider = eqContainer.querySelector('#eqFreq') as HTMLInputElement
      const gainSlider = eqContainer.querySelector('#eqGain') as HTMLInputElement
      const qSlider = eqContainer.querySelector('#eqQ') as HTMLInputElement

      const valFreq = eqContainer.querySelector('#eqValFreq')
      const valGain = eqContainer.querySelector('#eqValGain')
      const valQ = eqContainer.querySelector('#eqValQ')
      const eqInfo = eqContainer.querySelector('#eqInfo')

      const filterBtns = eqContainer.querySelectorAll('.filter-btn')
      const playBtn = eqContainer.querySelector('#eqPlayBtn') as HTMLButtonElement
      const pauseBtn = eqContainer.querySelector('#eqPauseBtn') as HTMLButtonElement
      const resetBtn = eqContainer.querySelector('#eqResetBtn') as HTMLButtonElement
      const flatBtn = eqContainer.querySelector('#eqFlatBtn') as HTMLButtonElement
      const statusEl = eqContainer.querySelector('#eqStatus')

      // ================================================================
      // 2. Константы
      // ================================================================
      const left = 60, right = 760, top = 50, bottom = 410
      const freqMin = 20, freqMax = 20000

      let currentFilter = { type: 'bell', freq: 1000, gain: 0, q: 1 }
      let isPlaying = false, isPaused = false, animId: number | null = null, time = 0

      // ================================================================
      // 3. Функция расчета фильтра
      // ================================================================
      function calcFilter(type: string, f: number, fc: number, gain: number, Q: number): number {
        switch(type) {
          case 'bell': {
            const g = Math.pow(10, gain / 40)
            const n = f / fc - fc / f
            const h = n * n * Q * Q
            return 20 * Math.log10((1 + h) / (1 + h / (g * g)))
          }
          case 'lowshelf': {
            const g = Math.pow(10, gain / 20)
            const n2 = (f / fc) * (f / fc)
            const q2 = Q * Q
            const num = g * g * (n2 + q2)
            const den = n2 + g * g * q2
            return 10 * Math.log10(num / den)
          }
          case 'highshelf': {
            const g = Math.pow(10, gain / 20)
            const n2 = (f / fc) * (f / fc)
            const q2 = Q * Q
            const num = g * g * (n2 * q2 + 1)
            const den = n2 * q2 + g * g
            return 10 * Math.log10(num / den)
          }
          case 'lowcut': {
            const n2 = (f / fc) * (f / fc)
            const q2 = Q * Q
            const num = n2 * n2
            const den = n2 * n2 + q2 * (1 - n2) * (1 - n2)
            return 10 * Math.log10(num / den)
          }
          case 'highcut': {
            const n2 = (f / fc) * (f / fc)
            const q2 = Q * Q
            const num = 1
            const den = 1 + q2 * (1 - n2) * (1 - n2) / n2
            return 10 * Math.log10(num / den)
          }
          case 'notch': {
            const n = f / fc - fc / f
            const depth = Math.min(1, Math.abs(gain) / 20)
            return -depth * 60 * (1 - 1 / (1 + n * n * Q * Q * 1000))
          }
          default: return 0
        }
      }

      // ================================================================
      // 4. Обновление кривой
      // ================================================================
      function updateCurve() {
        if (!eqCurve || !eqDot) return

        const steps = 250
        const pts: string[] = []

        for (let i = 0; i <= steps; i++) {
          const logF = Math.log10(freqMin) + (i / steps) * (Math.log10(freqMax) - Math.log10(freqMin))
          const f = Math.pow(10, logF)
          const gain = calcFilter(currentFilter.type, f, currentFilter.freq, currentFilter.gain, currentFilter.q)
          const x = left + ((Math.log10(f) - Math.log10(freqMin)) / (Math.log10(freqMax) - Math.log10(freqMin))) * (right - left)
          const y = bottom - ((Math.min(Math.max(gain, -20), 20) + 20) / 40) * (bottom - top)
          pts.push(x.toFixed(1) + ',' + y.toFixed(1))
        }
        eqCurve.setAttribute('points', pts.join(' '))

        const dotX = left + ((Math.log10(currentFilter.freq) - Math.log10(freqMin)) / (Math.log10(freqMax) - Math.log10(freqMin))) * (right - left)
        const dotY = bottom - ((Math.min(Math.max(currentFilter.gain, -20), 20) + 20) / 40) * (bottom - top)
        eqDot.setAttribute('cx', String(dotX))
        eqDot.setAttribute('cy', String(dotY))

        const typeNames: Record<string, string> = {
          bell: 'Bell',
          lowshelf: 'Low Shelf',
          highshelf: 'High Shelf',
          lowcut: 'Low Cut',
          highcut: 'High Cut',
          notch: 'Notch'
        }
        const freqText = currentFilter.freq >= 1000 ? (currentFilter.freq/1000).toFixed(1) + 'k' : Math.round(currentFilter.freq) + ''
        if (eqInfo) {
          eqInfo.textContent = `Filter: ${typeNames[currentFilter.type] || currentFilter.type} · ${freqText} Hz · ${currentFilter.gain.toFixed(1)} dB · Q=${currentFilter.q.toFixed(1)}`
        }

        updateSpectrum()
      }

      // ================================================================
      // 5. Обновление спектра
      // ================================================================
      function updateSpectrum() {
        if (!eqSpectrum) return

        const steps = 80
        const levels: number[] = []
        const pts2: string[] = []

        for (let i = 0; i <= steps; i++) {
          const logF = Math.log10(freqMin) + (i / steps) * (Math.log10(freqMax) - Math.log10(freqMin))
          const f = Math.pow(10, logF)
          let level = Math.random() * 0.1 + 0.05
          const tones = [80, 200, 500, 1000, 2000, 5000, 8000]
          for (const tone of tones) {
            const dist = Math.abs(Math.log10(f) - Math.log10(tone))
            if (dist < 0.3) {
              level += 0.2 * (1 - dist / 0.3) * (0.5 + 0.5 * Math.sin(time * 2 + i * 0.1))
            }
          }
          levels.push(Math.min(level, 0.5))
        }

        const eqLevels: number[] = []
        for (let i = 0; i <= steps; i++) {
          const logF = Math.log10(freqMin) + (i / steps) * (Math.log10(freqMax) - Math.log10(freqMin))
          const f = Math.pow(10, logF)
          const gain = calcFilter(currentFilter.type, f, currentFilter.freq, currentFilter.gain, currentFilter.q)
          const gainDb = Math.min(Math.max(gain, -20), 20)
          const gainLinear = Math.pow(10, gainDb / 20)
          eqLevels.push(levels[i] * gainLinear)
        }

        const maxLevel = Math.max(0.2, ...eqLevels) * 1.2

        for (let i = 0; i <= steps; i++) {
          const logF = Math.log10(freqMin) + (i / steps) * (Math.log10(freqMax) - Math.log10(freqMin))
          const f = Math.pow(10, logF)
          const x = left + ((Math.log10(f) - Math.log10(freqMin)) / (Math.log10(freqMax) - Math.log10(freqMin))) * (right - left)
          const level = eqLevels[i] / maxLevel
          const y = bottom - level * (bottom - top) * 0.55
          pts2.push(x.toFixed(1) + ',' + y.toFixed(1))
        }

        const fillPts = pts2.slice()
        fillPts.push(right + ',' + bottom)
        fillPts.push(left + ',' + bottom)
        eqSpectrum.setAttribute('points', fillPts.join(' '))
        eqSpectrum.setAttribute('opacity', '1')
      }

      // ================================================================
      // 6. Обновление из контролов
      // ================================================================
      function updateFromControls() {
        if (!freqSlider || !gainSlider || !qSlider) return

        const logMin = Math.log10(freqMin)
        const logMax = Math.log10(freqMax)
        const val = Math.min(Math.max(parseFloat(freqSlider.value), 0), 1)
        currentFilter.freq = Math.pow(10, logMin + val * (logMax - logMin))
        currentFilter.gain = parseFloat(gainSlider.value)
        currentFilter.q = parseFloat(qSlider.value)

        if (valFreq) {
          valFreq.textContent = currentFilter.freq >= 1000 ? (currentFilter.freq/1000).toFixed(1) + 'k Hz' : Math.round(currentFilter.freq) + ' Hz'
        }
        if (valGain) valGain.textContent = currentFilter.gain.toFixed(1) + ' dB'
        if (valQ) valQ.textContent = currentFilter.q.toFixed(1)

        updateCurve()
      }

      // ================================================================
      // 7. Анимация
      // ================================================================
      function animateLoop() {
        if (!isPlaying || isPaused) {
          animId = requestAnimationFrame(animateLoop)
          return
        }
        time += 0.02
        updateSpectrum()
        animId = requestAnimationFrame(animateLoop)
      }

      // ================================================================
      // 8. Кнопки и события
      // ================================================================
      // Фильтры
      filterBtns.forEach((btn) => {
        btn.addEventListener('click', function(this: HTMLElement) {
          const type = this.dataset.type
          if (type) {
            currentFilter.type = type
            filterBtns.forEach((b) => b.classList.remove('active'))
            this.classList.add('active')
            updateCurve()
          }
        })
      })

      // Play
      if (playBtn && pauseBtn && statusEl) {
        playBtn.addEventListener('click', function() {
          if (isPlaying) {
            isPaused = true
            playBtn.style.display = 'none'
            pauseBtn.style.display = 'flex'
            if (statusEl) statusEl.textContent = '⏸  Paused'
            if (animId) cancelAnimationFrame(animId)
          } else {
            isPlaying = true
            isPaused = false
            playBtn.style.display = 'none'
            pauseBtn.style.display = 'flex'
            if (statusEl) statusEl.textContent = '●  Running'
            if (animId) cancelAnimationFrame(animId)
            animateLoop()
          }
        })

        pauseBtn.addEventListener('click', function() {
          if (isPaused) {
            isPaused = false
            pauseBtn.textContent = '⏸ Pause'
            if (statusEl) statusEl.textContent = '●  Running'
            if (animId) cancelAnimationFrame(animId)
            animateLoop()
          } else {
            isPaused = true
            pauseBtn.textContent = '▶ Continue'
            if (statusEl) statusEl.textContent = '⏸  Paused'
            if (animId) cancelAnimationFrame(animId)
          }
        })

        resetBtn?.addEventListener('click', function() {
          isPlaying = false
          isPaused = false
          playBtn.style.display = 'flex'
          pauseBtn.style.display = 'none'
          pauseBtn.textContent = '⏸ Pause'
          if (statusEl) statusEl.textContent = '●  Stopped'
          if (animId) cancelAnimationFrame(animId)

          currentFilter = { type: 'bell', freq: 1000, gain: 0, q: 1 }
          filterBtns.forEach((b) => b.classList.remove('active'))
          const bellBtn = eqContainer.querySelector('.filter-btn[data-type="bell"]')
          if (bellBtn) bellBtn.classList.add('active')
          if (freqSlider) freqSlider.value = '0.5'
          if (gainSlider) gainSlider.value = '0'
          if (qSlider) qSlider.value = '1'
          updateFromControls()
        })

        flatBtn?.addEventListener('click', function() {
          currentFilter.gain = 0
          if (gainSlider) gainSlider.value = '0'
          updateFromControls()
        })
      }

      // Слайдеры
      freqSlider?.addEventListener('input', updateFromControls)
      gainSlider?.addEventListener('input', updateFromControls)
      qSlider?.addEventListener('input', updateFromControls)

      // ================================================================
      // 9. Drag & Drop точки
      // ================================================================
      let isDragging = false
      let dragStartX = 0, dragStartY = 0
      let dragOrigFreq = 0, dragOrigGain = 0

      if (eqDot) {
        eqDot.addEventListener('mousedown', function(e: Event) {
          const mouseEvent = e as MouseEvent
          isDragging = true
          dragStartX = mouseEvent.clientX
          dragStartY = mouseEvent.clientY
          dragOrigFreq = currentFilter.freq
          dragOrigGain = currentFilter.gain
          this.setAttribute('style', 'cursor:grabbing')
        })

        document.addEventListener('mousemove', function(e: MouseEvent) {
          if (!isDragging || !eqDot) return
          const rect = svg?.getBoundingClientRect()
          if (!rect) return
          const dx = (e.clientX - dragStartX) / rect.width * (right - left)
          const dy = (e.clientY - dragStartY) / rect.height * (bottom - top)

          const logF = Math.log10(dragOrigFreq) + dx / (right - left) * 3.5
          currentFilter.freq = Math.min(Math.max(Math.pow(10, logF), freqMin), freqMax)
          currentFilter.gain = Math.min(Math.max(dragOrigGain - dy / (bottom - top) * 40, -20), 20)

          const logMin = Math.log10(freqMin)
          const logMax = Math.log10(freqMax)
          const val = (Math.log10(currentFilter.freq) - logMin) / (logMax - logMin)
          if (freqSlider) freqSlider.value = String(Math.min(Math.max(val, 0), 1))
          if (gainSlider) gainSlider.value = String(currentFilter.gain)

          updateFromControls()
        })

        document.addEventListener('mouseup', function() {
          if (isDragging) {
            isDragging = false
            if (eqDot) eqDot.setAttribute('style', 'cursor:grab')
          }
        })
      }

      // ================================================================
      // 10. Инициализация
      // ================================================================
      if (freqSlider) freqSlider.value = '0.5'
      if (gainSlider) gainSlider.value = '0'
      if (qSlider) qSlider.value = '1'
      const bellBtn = eqContainer.querySelector('.filter-btn[data-type="bell"]')
      if (bellBtn) bellBtn.classList.add('active')
      updateFromControls()

      setTimeout(function() {
        if (!isPlaying) {
          isPlaying = true
          isPaused = false
          if (playBtn && pauseBtn && statusEl) {
            playBtn.style.display = 'none'
            pauseBtn.style.display = 'flex'
            statusEl.textContent = '●  Running'
          }
          animateLoop()
        }
      }, 500)

      console.log('✅ EQ Visualizer загружен!')
      setIsReady(true)
    }

    // Запускаем инициализацию после рендера
    const timer = setTimeout(initEQ, 100)

    return () => {
      clearTimeout(timer)
      if (animId) cancelAnimationFrame(animId)
    }
  }, [])

  // ================================================================
  // 11. Render — HTML из eq.html
  // ================================================================
  return (
    <div ref={containerRef}>
      <div className="eq-container" style={{
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '16px',
        padding: '16px 20px 20px',
        margin: '16px 0 24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        fontFamily: "'Montserrat', sans-serif",
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
        maxWidth: '860px',
        marginLeft: 'auto',
        marginRight: 'auto',
        position: 'relative',
        userSelect: 'none'
      }}>
        <style>{`
          .eq-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #fcf6ba, transparent);
            opacity: 0.25;
          }
          .eq-container .eq-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            flex-wrap: wrap;
            gap: 6px;
          }
          .eq-container .eq-header .brand {
            font-size: 0.65rem;
            font-weight: 700;
            color: #555;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .eq-container .eq-header .brand span { color: #fcf6ba; }
          .eq-container .eq-header .model {
            font-size: 0.7rem;
            font-weight: 700;
            color: #fff;
            background: rgba(255,255,255,0.04);
            padding: 2px 12px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.04);
          }
          .eq-container .eq-header .status {
            font-size: 0.5rem;
            color: #444;
            letter-spacing: 0.5px;
          }
          .eq-container .graph-wrap {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 6px;
            border: 1px solid rgba(255, 255, 255, 0.03);
            position: relative;
            margin-bottom: 10px;
          }
          .eq-container .graph-wrap .glabel {
            position: absolute;
            top: 8px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.45rem;
            color: #444;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            pointer-events: none;
            z-index: 2;
          }
          .eq-container .graph-wrap svg {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 6px;
            background: rgba(0, 0, 0, 0.1);
          }
          .eq-container .eq-filters {
            display: flex;
            gap: 6px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 8px;
          }
          .eq-container .eq-filters .filter-btn {
            padding: 4px 12px;
            border-radius: 50px;
            font-size: 0.55rem;
            font-weight: 600;
            border: 1px solid rgba(255,255,255,0.06);
            background: rgba(255,255,255,0.03);
            color: #888;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Montserrat', sans-serif;
          }
          .eq-container .eq-filters .filter-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
          .eq-container .eq-filters .filter-btn.active {
            border-color: #fcf6ba;
            color: #fcf6ba;
            background: rgba(245,197,66,0.08);
          }
          .eq-container .eq-controls {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 4px 12px;
            padding: 8px 10px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.02);
            margin-bottom: 8px;
          }
          .eq-container .eq-controls .c {
            display: flex;
            flex-direction: column;
            gap: 1px;
            padding: 2px 2px;
          }
          .eq-container .eq-controls .c .h {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .eq-container .eq-controls .c .h .n {
            font-size: 0.45rem;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .eq-container .eq-controls .c .h .v {
            font-size: 0.6rem;
            font-weight: 700;
            color: #fcf6ba;
            background: rgba(245,197,66,0.05);
            padding: 0 5px;
            border-radius: 6px;
            min-width: 40px;
            text-align: center;
          }
          .eq-container .eq-controls .c input[type="range"] {
            -webkit-appearance: none;
            width: 100%;
            height: 2px;
            border-radius: 2px;
            outline: none;
            background: rgba(255,255,255,0.07);
            margin: 2px 0 0;
            cursor: pointer;
          }
          .eq-container .eq-controls .c input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 11px;
            height: 11px;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid rgba(255,255,255,0.12);
            box-shadow: 0 0 8px rgba(0,0,0,0.3);
            transition: transform 0.15s;
          }
          .eq-container .eq-controls .c input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.12); }
          .eq-container .eq-controls .c input[type="range"]::-moz-range-thumb {
            width: 11px;
            height: 11px;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid rgba(255,255,255,0.12);
          }
          .eq-container .eq-controls .c.freq input[type="range"] { background: linear-gradient(to right, #4a9eff, rgba(255,255,255,0.07)); }
          .eq-container .eq-controls .c.freq input[type="range"]::-webkit-slider-thumb { background: #4a9eff; }
          .eq-container .eq-controls .c.freq input[type="range"]::-moz-range-thumb { background: #4a9eff; }
          .eq-container .eq-controls .c.gain input[type="range"] { background: linear-gradient(to right, #fcf6ba, rgba(255,255,255,0.07)); }
          .eq-container .eq-controls .c.gain input[type="range"]::-webkit-slider-thumb { background: #fcf6ba; }
          .eq-container .eq-controls .c.gain input[type="range"]::-moz-range-thumb { background: #fcf6ba; }
          .eq-container .eq-controls .c.q input[type="range"] { background: linear-gradient(to right, #50c878, rgba(255,255,255,0.07)); }
          .eq-container .eq-controls .c.q input[type="range"]::-webkit-slider-thumb { background: #50c878; }
          .eq-container .eq-controls .c.q input[type="range"]::-moz-range-thumb { background: #50c878; }
          .eq-container .eq-info {
            text-align: center;
            font-size: 0.55rem;
            color: #fcf6ba;
            font-weight: 600;
            padding: 4px 0;
            background: rgba(0,0,0,0.15);
            border-radius: 6px;
            margin-bottom: 8px;
          }
          .eq-container .eq-actions {
            display: flex;
            gap: 6px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 6px;
          }
          .eq-container .eq-actions .btn {
            padding: 4px 14px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.55rem;
            border: none;
            cursor: pointer;
            transition: all 0.25s;
            display: flex;
            align-items: center;
            gap: 4px;
            font-family: 'Montserrat', sans-serif;
          }
          .eq-container .eq-actions .btn.play {
            background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728);
            color: #000;
          }
          .eq-container .eq-actions .btn.play:hover { transform: scale(1.04); box-shadow: 0 4px 16px rgba(191,149,63,0.25); }
          .eq-container .eq-actions .btn.pause {
            background: rgba(74,158,255,0.12);
            color: #4a9eff;
            border: 1px solid rgba(74,158,255,0.08);
          }
          .eq-container .eq-actions .btn.pause:hover { background: rgba(74,158,255,0.2); }
          .eq-container .eq-actions .btn.reset {
            background: rgba(255,255,255,0.03);
            color: #777;
            border: 1px solid rgba(255,255,255,0.03);
          }
          .eq-container .eq-actions .btn.reset:hover { background: rgba(255,255,255,0.07); color: #fff; }
          .eq-container .eq-actions .btn.flat {
            background: rgba(255,255,255,0.03);
            color: #888;
            border: 1px solid rgba(255,255,255,0.03);
          }
          .eq-container .eq-actions .btn.flat:hover { background: rgba(255,255,255,0.07); color: #fff; }
          .eq-container .eq-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            padding: 4px 8px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.02);
            font-size: 0.45rem;
            color: #666;
          }
          .eq-container .eq-legend .it { display: flex; align-items: center; gap: 4px; }
          .eq-container .eq-legend .ln { display: inline-block; width: 14px; height: 2px; border-radius: 2px; }
          .eq-container .eq-legend .ln.gold { background: #fcf6ba; }
          .eq-container .eq-legend .ln.blue { background: #4a9eff; }
          .eq-container .eq-legend .ln.dash { background: transparent; border-top: 2px dashed rgba(255,255,255,0.1); height: 0; width: 14px; }
          @media (max-width: 768px) {
            .eq-container .eq-controls { grid-template-columns: 1fr 1fr; }
          }
          @media (max-width: 480px) {
            .eq-container .eq-controls { grid-template-columns: 1fr; }
          }
        `}</style>

        {/* ===== HEADER ===== */}
        <div className="eq-header">
          <div><span className="brand"><span>HH</span>Records</span><span className="model">Equalizer</span></div>
          <span className="status" id="eqStatus">●  Running</span>
        </div>

        {/* ===== SVG GRAPH ===== */}
        <div className="graph-wrap">
          <div className="glabel">Frequency Response</div>
          <svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" id="eqSvg">
            <rect width="800" height="460" fill="rgba(0,0,0,0.12)" rx="6"/>
            <g opacity="0.05">
              <line x1="60" y1="410" x2="760" y2="410" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="390" x2="760" y2="390" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="370" x2="760" y2="370" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="350" x2="760" y2="350" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="330" x2="760" y2="330" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="310" x2="760" y2="310" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="290" x2="760" y2="290" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="270" x2="760" y2="270" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="250" x2="760" y2="250" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="230" x2="760" y2="230" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="210" x2="760" y2="210" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="190" x2="760" y2="190" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="170" x2="760" y2="170" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="150" x2="760" y2="150" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="130" x2="760" y2="130" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="110" x2="760" y2="110" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="90" x2="760" y2="90" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="70" x2="760" y2="70" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="50" x2="760" y2="50" stroke="#fff" strokeWidth="0.5"/>
              <line x1="60" y1="410" x2="60" y2="50" stroke="#fff" strokeWidth="0.5"/>
              <line x1="140" y1="410" x2="140" y2="50" stroke="#fff" strokeWidth="0.5"/>
              <line x1="220" y1="410" x2="220" y2="50" stroke="#fff" strokeWidth="0.5"/>
              <line x1="300" y1="410" x2="300" y2="50" stroke="#fff" strokeWidth="0.5"/>
              <line x1="380" y1="410" x2="380" y2="50" stroke="#fff" strokeWidth="0.5"/>
              <line x1="460" y1="410" x2="460" y2="50" stroke="#fff" strokeWidth="0.5"/>
              <line x1="540" y1="410" x2="540" y2="50" stroke="#fff" strokeWidth="0.5"/>
              <line x1="620" y1="410" x2="620" y2="50" stroke="#fff" strokeWidth="0.5"/>
              <line x1="700" y1="410" x2="700" y2="50" stroke="#fff" strokeWidth="0.5"/>
              <line x1="760" y1="410" x2="760" y2="50" stroke="#fff" strokeWidth="0.5"/>
            </g>
            <line x1="60" y1="410" x2="760" y2="410" stroke="#444" strokeWidth="1.5"/>
            <line x1="60" y1="410" x2="60" y2="50" stroke="#444" strokeWidth="1.5"/>
            <polygon points="760,410 752,406 752,414" fill="#444"/>
            <polygon points="60,50 56,58 64,58" fill="#444"/>
            <g fill="#555" fontSize="8" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
              <text x="60" y="428">20</text><text x="140" y="428">50</text>
              <text x="220" y="428">100</text><text x="300" y="428">200</text>
              <text x="380" y="428">500</text><text x="460" y="428">1k</text>
              <text x="540" y="428">2k</text><text x="620" y="428">5k</text>
              <text x="700" y="428">10k</text><text x="760" y="428">20k</text>
              <text x="36" y="412">-20</text><text x="36" y="372">-10</text>
              <text x="36" y="312">0</text><text x="36" y="252">+10</text>
              <text x="36" y="192">+20</text><text x="36" y="132">+30</text>
              <text x="36" y="72">+40</text>
            </g>
            <text x="410" y="448" fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif">Frequency (Hz)</text>
            <text x="22" y="230" fill="#666" fontSize="8" textAnchor="middle" fontFamily="'Montserrat', sans-serif" transform="rotate(-90, 22, 230)">Gain (dB)</text>
            <line x1="60" y1="312" x2="760" y2="312" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4,4"/>
            <polygon id="eqSpectrum" points="" fill="rgba(74,158,255,0.05)" opacity="0"/>
            <polyline id="eqCurve" points="60,312 760,312" fill="none" stroke="#fcf6ba" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle id="eqDot" cx="410" cy="312" r="8" fill="#fcf6ba" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" style={{ cursor: 'grab' }}/>
            <g transform="translate(60, 16)">
              <rect x="0" y="0" width="10" height="10" fill="#fcf6ba" rx="2"/>
              <text x="14" y="9" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="'Montserrat', sans-serif">EQ Curve</text>
              <rect x="85" y="0" width="10" height="10" fill="rgba(74,158,255,0.08)" rx="2"/>
              <text x="99" y="9" fill="rgba(255,255,255,0.15)" fontSize="7" fontFamily="'Montserrat', sans-serif">Spectrum</text>
            </g>
          </svg>
        </div>

        {/* ===== FILTERS ===== */}
        <div className="eq-filters">
          <button className="filter-btn active" data-type="bell">Bell</button>
          <button className="filter-btn" data-type="lowshelf">Low Shelf</button>
          <button className="filter-btn" data-type="highshelf">High Shelf</button>
          <button className="filter-btn" data-type="lowcut">Low Cut</button>
          <button className="filter-btn" data-type="highcut">High Cut</button>
          <button className="filter-btn" data-type="notch">Notch</button>
        </div>

        {/* ===== CONTROLS ===== */}
        <div className="eq-controls">
          <div className="c freq">
            <div className="h"><span className="n">Frequency</span><span className="v" id="eqValFreq">1.0k Hz</span></div>
            <input type="range" id="eqFreq" min="0" max="1" value="0.5" step="0.001" />
          </div>
          <div className="c gain">
            <div className="h"><span className="n">Gain</span><span className="v" id="eqValGain">0.0 dB</span></div>
            <input type="range" id="eqGain" min="-20" max="20" value="0" step="0.5" />
          </div>
          <div className="c q">
            <div className="h"><span className="n">Q / Width</span><span className="v" id="eqValQ">1.0</span></div>
            <input type="range" id="eqQ" min="0.2" max="10" value="1" step="0.1" />
          </div>
        </div>

        {/* ===== INFO ===== */}
        <div className="eq-info" id="eqInfo">Filter: Bell · 1.0k Hz · 0.0 dB · Q=1.0</div>

        {/* ===== ACTIONS ===== */}
        <div className="eq-actions">
          <button className="btn play" id="eqPlayBtn">▶ Play</button>
          <button className="btn pause" id="eqPauseBtn" style={{ display: 'none' }}>⏸ Pause</button>
          <button className="btn reset" id="eqResetBtn">⟳ Reset</button>
          <button className="btn flat" id="eqFlatBtn">⬜ Flat</button>
        </div>

        {/* ===== LEGEND ===== */}
        <div className="eq-legend">
          <span className="it"><span className="ln gold"></span> EQ Curve</span>
          <span className="it"><span className="ln blue"></span> Spectrum</span>
          <span className="it"><span className="ln dash"></span> 0 dB</span>
          <span className="it">🖱️ Drag dot</span>
        </div>
      </div>
    </div>
  )
}

export default EQVisualizer
