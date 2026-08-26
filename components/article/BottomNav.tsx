// components/article/BottomNav.tsx
'use client'

const BottomNav: React.FC = () => {
  return (
    <nav
      className="bottom-nav"
      style={{
        display: 'flex',
        gap: '12px',
        padding: '16px 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        marginTop: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <a
        href="/encyclopedia"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 24px',
          borderRadius: '50px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#fff',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          textDecoration: 'none',
          transition: 'all 0.3s',
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
        }}
      >
        ← Назад к энциклопедии
      </a>
      <a
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 24px',
          borderRadius: '50px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#fff',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          textDecoration: 'none',
          transition: 'all 0.3s',
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
        }}
      >
        🏠 На главную
      </a>
      <a
        href="#top"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 24px',
          borderRadius: '50px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#fff',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          textDecoration: 'none',
          transition: 'all 0.3s',
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
        }}
      >
        ↑ Наверх
      </a>
    </nav>
  )
}

export default BottomNav