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
        // Динамический импорт главного файла
        const module = await import('@/modules/eq/src/main.js')
        const EQWidget = module.default || module

        if (EQWidget) {
          const widget = new EQWidget(containerRef.current, { theme })
          widgetRef.current = widget
          console.log('🎛️ EQ Visualizer загружен!')
        }
      } catch (error) {
        console.error('Ошибка загрузки эквалайзера:', error)
        // Показываем заглушку при ошибке
        if (containerRef.current) {
          containerRef.current.innerHTML = `
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
              <div style="font-size: 0.8rem; margin-top: 4px; color: #666;">Не удалось загрузить виджет</div>
            </div>
          `
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

export default EQVisualizer
