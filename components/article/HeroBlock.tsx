// components/article/HeroBlock.tsx

interface HeroBlockProps {
  badge: string
  title: string
  subtitle: string
  tags: string[]
}

const HeroBlock: React.FC<HeroBlockProps> = ({
  badge,
  title,
  subtitle,
  tags,
}) => {
  return (
    <>
      {/* ===== BADGE ОТДЕЛЬНО ===== */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(245,197,66,0.06)',
          border: '1px solid rgba(245,197,66,0.08)',
          borderRadius: '50px',
          padding: '4px 16px 4px 8px',
          fontSize: '0.75rem',
          color: '#fcf6ba'
        }}>
          <span style={{ fontSize: '1rem' }}>🎛️</span>
          <span>{badge}</span>
        </div>
      </div>

      {/* ===== ОСНОВНОЙ БЛОК ===== */}
      <div className="hero-article" style={{ textAlign: 'center', padding: '0 0 20px' }}>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
          fontWeight: 700,
          lineHeight: 1.2,
          margin: '0 0 12px 0',
          color: '#fff'
        }}>
          {title}
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.05rem',
          maxWidth: '700px',
          margin: '0 auto 12px'
        }}>
          {subtitle}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {tags.map((tag, index) => (
            <span key={index} style={{
              background: 'rgba(245,197,66,0.06)',
              color: '#fcf6ba',
              padding: '4px 16px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              border: '1px solid rgba(245,197,66,0.06)'
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}

export default HeroBlock
