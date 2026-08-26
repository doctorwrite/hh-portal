// components/interactive/EQVisualizer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

interface EQVisualizerProps {
  theme?: 'dark' | 'light'
}

const EQVisualizer: React.FC<EQVisualizerProps> = ({ theme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const animIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const eqContainer = container.querySelector('.eq-container')
    if (!eqContainer) return

    // ===== DOM-элементы =====
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

    // ===== Константы =====
    const left = 60, right = 760, top = 50, bottom = 410
    const freqMin = 20, freqMax = 20000

    let currentFilter = { type: 'bell', freq: 1000, gain: 0, q: 1 }
    let isPlaying = false, isPaused = false, time = 0

    // ===== Функция расчета фильтра =====
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

    // ===== Обновление кривой =====
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

    // ===== Обновление спектра =====
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

    // ===== Обновление из контролов =====
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

    // ===== Анимация =====
    function animateLoop() {
      if (!isPlaying || isPaused) {
        animIdRef.current = requestAnimationFrame(animateLoop)
        return
      }
      time += 0.02
      updateSpectrum()
      animIdRef.current = requestAnimationFrame(animateLoop)
    }

    // ===== Кнопки =====
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

    if (playBtn && pauseBtn && statusEl) {
      playBtn.addEventListener('click', function() {
        if (isPlaying) {
          isPaused = true
          playBtn.style.display = 'none'
          pauseBtn.style.display = 'flex'
          if (statusEl) statusEl.textContent = '⏸  Paused'
          if (animIdRef.current) cancelAnimationFrame(animIdRef.current)
        } else {
          isPlaying = true
          isPaused = false
          playBtn.style.display = 'none'
          pauseBtn.style.display = 'flex'
          if (statusEl) statusEl.textContent = '●  Running'
          if (animIdRef.current) cancelAnimationFrame(animIdRef.current)
          animateLoop()
        }
      })

      pauseBtn.addEventListener('click', function() {
        if (isPaused) {
          isPaused = false
          pauseBtn.textContent = '⏸ Pause'
          if (statusEl) statusEl.textContent = '●  Running'
          if (animIdRef.current) cancelAnimationFrame(animIdRef.current)
          animateLoop()
        } else {
          isPaused = true
          pauseBtn.textContent = '▶ Continue'
          if (statusEl) statusEl.textContent = '⏸  Paused'
          if (animIdRef.current) cancelAnimationFrame(animIdRef.current)
        }
      })

      resetBtn?.addEventListener('click', function() {
        isPlaying = false
        isPaused = false
        playBtn.style.display = 'flex'
        pauseBtn.style.display = 'none'
        pauseBtn.textContent = '⏸ Pause'
        if (statusEl) statusEl.textContent = '●  Stopped'
        if (animIdRef.current) cancelAnimationFrame(animIdRef.current)

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

    freqSlider?.addEventListener('input', updateFromControls)
    gainSlider?.addEventListener('input', updateFromControls)
    qSlider?.addEventListener('input', updateFromControls)

    // =====
