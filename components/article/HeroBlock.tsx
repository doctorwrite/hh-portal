// components/article/HeroBlock.tsx

interface HeroBlockProps {
  badge: string
  title: string
  subtitle: string
  tags: string[]
}

const HeroBlock: React.FC<HeroBlockProps> = ({ badge, title, subtitle, tags }) => {
  return (
    <div style={{ textAlign: 'center', padding: '0 0 10px' }}>
      {/* ===== BADGE ===== */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(245,197,66,0.06)',
          border: '1px solid rgba(245,197,66,0.08)',
          borderRadius: '50px',
          padding: '4px 16px 4px 8px',
          marginBottom: '16px',
          fontSize: '0.75rem',
          color: '#fcf6ba',
        }}
      >
        <span style={{ fontSize: '1rem' }}>🎛️</span>
        <span>{badge}</span>
      </div>

      {/* ===== ЗАГОЛОВОК ===== */}
      <h1
        style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3rem)',
          fontWeight: 700,
          lineHeight: 1.2,
          margin: '0 0 12px 0',
          color: '#fff',
        }}
      >
        {title}
      </h1>

      {/* ===== ПОДЗАГОЛОВОК ===== */}
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '1.05rem',
          maxWidth: '700px',
          margin: '0 auto 16px',
          lineHeight: 1.6,
        }}
      >
        {subtitle}
      </p>

      {/* ===== ТЕГИ ===== */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: '4px',
        }}
      >
        {tags.map((tag, index) => (
          <span
            key={index}
            style={{
              background: 'rgba(245,197,66,0.06)',
              color: '#fcf6ba',
              padding: '5px 18px',
              borderRadius: '50px',
              fontSize: '0.78rem',
              border: '1px solid rgba(245,197,66,0.06)',
              transition: 'all 0.3s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(245,197,66,0.12)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(245,197,66,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(245,197,66,0.06)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export default HeroBlock
