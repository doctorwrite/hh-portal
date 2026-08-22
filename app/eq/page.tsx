// app/eq/page.tsx
'use client'

import { useEffect, useRef } from 'react'

export default function EQPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<any>(null)

  useEffect(() => {
    const loadEQ = async () => {
      if (containerRef.current && !widgetRef.current) {
        try {
          // 1. Загружаем стили
          await import('@/modules/eq/src/styles.css')
          
          // 2. Импортируем ВЕСЬ модуль
          const EQModule = await import('@/modules/eq/src/ui/EQWidget.js')
          
          // 3. Берём класс — он может быть экспортирован как default, или как поле
          const EQWidget = EQModule.default || EQModule.EQWidget
          
          if (!EQWidget) {
            throw new Error('EQWidget не найден в модуле')
          }
          
          // 4. Создаём экземпляр
          const widget = new EQWidget(containerRef.current, { theme: 'dark' })
          widgetRef.current = widget
          
          ;(window as any).__eq = widget
          
          console.log('🎛️ HHRecords EQ Pro загружен!')
        } catch (error) {
          console.error('❌ Ошибка загрузки эквалайзера:', error)
        }
      }
    }

    loadEQ()

    return () => {
      if (widgetRef.current) {
        try { widgetRef.current.destroy() } catch (e) {}
        widgetRef.current = null
      }
    }
  }, [])

  return (
    <div className="eq-page">
      <div className="eq-page-title">
        <span>🎛️ HHRecords EQ Pro</span>
      </div>
      <div ref={containerRef} className="hh-eq-container" />
    </div>
  )
}
