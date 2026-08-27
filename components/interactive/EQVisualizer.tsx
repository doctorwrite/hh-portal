// components/interactive/EQVisualizer.tsx
'use client'

import { useEffect, useRef } from 'react'

interface EQVisualizerProps {
  theme?: 'dark' | 'light'
}

const EQVisualizer: React.FC<EQVisualizerProps> = ({ theme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<any>(null)

  useEffect(() => {
    const loadEQ = async () => {
      if (!containerRef.current) return

      try {
        const module = await import('@/modules/eq/src/main.js')
        
        // Проверяем разные варианты экспорта
        let EQWidget = module.default || module.EQWidget || module
        
        if (typeof EQWidget === 'function') {
          const widget = new EQWidget(containerRef.current, { theme })
          widgetRef.current = widget
          console.log('🎛️ EQ Visualizer загружен!')
        } else {
          console.warn('EQWidget не найден в модуле')
          showFallback(containerRef.current, 'Не удалось загрузить виджет')
        }
      } catch (error) {
        console.error('Ошибка загрузки эквалайзера:', error)
        if (containerRef.current) {
          showFallback(containerRef.current, 'Ошибка загрузки')
        }
      }
    }

    loadEQ()

    return () => {
      if (widgetRef.current && typeof widgetRef.current.destroy === 'function') {
        widgetRef.current.destroy()
      }
      widgetRef.current = null
    }
  }, [theme])

  return <div ref={containerRef} id="eqContainer" style={{ width: '100%', minHeight: '400px' }} />
}

// ===== ЗАГЛУШКА =====
function showFallback(container: HTMLElement, message: string) {
  container.innerHTML = `
    <div style="
      background: rgba(0,0,0,0.3);
      border-radius: 16px;
      padding: 40px 20px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.05);
      color: #888;
    ">
      <div style="font-size: 3rem; margin-bottom: 12px;">🎛️</div>
      <div style="font-size: 1rem; font-weight: 600; color: #aaa;">Интерактивный эквалайзер</div>
      <div style="font-size: 0.8rem; margin-top: 4px; color: #666;">${message}</div>
    </div>
  `
}

export default EQVisualizer
