// components/interactive/EQVisualizer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

interface EQVisualizerProps {
  theme?: 'dark' | 'light'
}

const EQVisualizer: React.FC<EQVisualizerProps> = ({ theme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // ===== ИНИЦИАЛИЗАЦИЯ ВИДЖЕТА =====
    const initWidget = () => {
      if (!containerRef.current) return

      // Здесь будет код из eq.html (виджет)
      // Пока просто заглушка
      console.log('🎛️ EQ Visualizer загружен!')
      setIsLoaded(true)
    }

    initWidget()

    return () => {
      // Очистка
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className="eq-visualizer-wrapper"
      style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        margin: '16px 0',
        border: '1px solid rgba(255,255,255,0.05)',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#888'
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎛️</div>
      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#aaa' }}>Интерактивный эквалайзер</div>
      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Виджет будет добавлен позже</div>
      {!isLoaded && (
        <div style={{ fontSize: '0.7rem', marginTop: '8px', color: '#555' }}>Загрузка...</div>
      )}
    </div>
  )
}

export default EQVisualizer