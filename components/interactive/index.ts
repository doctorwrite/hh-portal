// components/interactive/index.ts
import dynamic from 'next/dynamic'

// ===== КОМПОНЕНТ ЗАГРУЗКИ =====
const LoadingFallback = () => (
  <div
    style={{
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '16px',
      padding: '40px 20px',
      margin: '16px 0',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.05)',
      color: '#888',
      minHeight: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    }}
  >
    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎛️</div>
    <div style={{ fontSize: '0.9rem', color: '#666' }}>Загрузка эквалайзера...</div>
  </div>
)

// ===== ВИДЖЕТЫ СТАТЕЙ (только клиент) =====
export const EQVisualizer = dynamic(() => import('./EQVisualizer'), {
  ssr: false,
  loading: LoadingFallback,
})

// ===== КАРТА ВИДЖЕТОВ ПО ИМЕНИ =====
export const widgetMap: Record<string, any> = {
  EQVisualizer: EQVisualizer,
}

// ===== ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ВИДЖЕТА ПО ИМЕНИ =====
export function getWidget(name: string): any {
  return widgetMap[name] || null
}
