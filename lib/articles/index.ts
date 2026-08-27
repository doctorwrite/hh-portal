// components/interactive/index.ts
import dynamic from 'next/dynamic'

// ===== ВИДЖЕТЫ =====
export const EQVisualizer = dynamic(
  () => import('./EQVisualizer'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          minHeight: '200px',
          color: '#888',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎛️</div>
        <p style={{ fontSize: '0.9rem' }}>Загрузка эквалайзера...</p>
      </div>
    ),
  }
)

export const CompressorWidget = dynamic(
  () => import('./CompressorWidget'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          minHeight: '200px',
          color: '#888',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎚️</div>
        <p style={{ fontSize: '0.9rem' }}>Загрузка компрессора...</p>
      </div>
    ),
  }
)

export const ReverbWidget = dynamic(
  () => import('./ReverbWidget'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          minHeight: '200px',
          color: '#888',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌊</div>
        <p style={{ fontSize: '0.9rem' }}>Загрузка ревербератора...</p>
      </div>
    ),
  }
)

export const DelayWidget = dynamic(
  () => import('./DelayWidget'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          minHeight: '200px',
          color: '#888',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
        <p style={{ fontSize: '0.9rem' }}>Загрузка дилея...</p>
      </div>
    ),
  }
)

// ===== КАРТА ВИДЖЕТОВ ДЛЯ СТАТЕЙ =====
export const widgetMap: Record<string, any> = {
  EQVisualizer,
  CompressorWidget,
  ReverbWidget,
  DelayWidget,
}

// ===== ПОЛУЧЕНИЕ ВИДЖЕТА ПО ИМЕНИ =====
export function getWidget(name: string): any {
  return widgetMap[name] || null
}

// ===== СПИСОК ВСЕХ ДОСТУПНЫХ ВИДЖЕТОВ =====
export const availableWidgets = Object.keys(widgetMap)
