// components/interactive/EQVisualizer.tsx
'use client'

const EQVisualizer = () => {
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '16px',
      padding: '40px 20px',
      margin: '16px 0',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.05)',
      color: '#888'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎛️</div>
      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#aaa' }}>Интерактивный эквалайзер</div>
      <div style={{ fontSize: '0.8rem', marginTop: '4px', color: '#666' }}>Виджет будет добавлен позже</div>
    </div>
  )
}

export default EQVisualizer
