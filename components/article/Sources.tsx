// components/article/Sources.tsx

interface Source {
  url: string
  label: string
}

interface SourcesProps {
  items: Source[]
}

const Sources: React.FC<SourcesProps> = ({ items }) => {
  return (
    <div className="bottom-links" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 0,
      margin: '20px 0 0',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '14px',
      border: '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden'
    }}>
      <div className="sources" style={{ padding: '16px 20px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ color: '#fcf6ba', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
          📚 Источники
        </h3>
        <div className="links" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
          {items.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                transition: 'color 0.3s',
                textDecoration: 'underline',
                textUnderlineOffset: '2px'
              }}
            >
              {source.label}
            </a>
          ))}
        </div>
      </div>
      <div className="terms" style={{ padding: '16px 20px' }}>
        <h3 style={{ color: '#fcf6ba', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
          📌 Похожие термины
        </h3>
        <div className="tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {/* Это пустой блок — похожие термины уже выведены отдельно */}
          <span style={{ fontSize: '0.75rem', color: '#666' }}>См. блок "Похожие термины" выше</span>
        </div>
      </div>
    </div>
  )
}

export default Sources