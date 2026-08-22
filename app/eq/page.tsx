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
          // Загружаем стили эквалайзера
          await import('@/modules/eq/src/styles.css')
          
          // Импортируем класс EQWidget
          const { default: EQWidget } = await import('@/modules/eq/src/ui/EQWidget.js')
          
          // Создаём экземпляр эквалайзера
          const widget = new EQWidget(containerRef.current, { theme: 'dark' })
          widgetRef.current = widget
          
          // Сохраняем в глобальную переменную
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
        try {
          widgetRef.current.destroy()
        } catch (e) {}
        widgetRef.current = null
      }
      if ((window as any).__eq) {
        ;(window as any).__eq = null
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
