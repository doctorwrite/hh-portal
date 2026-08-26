// components/article/RelatedTerms.tsx

interface RelatedTerm {
  slug: string
  icon: string
  label: string
}

interface RelatedTermsProps {
  items: RelatedTerm[]
}

const RelatedTerms: React.FC<RelatedTermsProps> = ({ items }) => {
  return (
    <div style={{ margin: '16px 0' }}>
      <h3
        style={{
          color: '#fcf6ba',
          fontSize: '0.9rem',
          fontWeight: 700,
          marginBottom: '12px',
        }}
      >
        📌 Похожие термины
      </h3>
      <div
        className="related-terms"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        {items.map((item) => (
          <a
            key={item.slug}
            href={`/encyclopedia/${item.slug}`}
            style={{
              background: 'rgba(245, 197, 66, 0.06)',
              color: '#fcf6ba',
              padding: '8px 20px',
              borderRadius: '50px',
              fontSize: '0.85rem',
              border: '1px solid rgba(245, 197, 66, 0.08)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              textDecoration: 'none',
            }}
          >
            {item.icon} {item.label}
          </a>
        ))}
      </div>
    </div>
  )
}

export default RelatedTerms
