// components/article/ArticleMeta.tsx

interface ArticleMetaProps {
  dateModified: string
  author: string
}

const ArticleMeta: React.FC<ArticleMetaProps> = ({ dateModified, author }) => {
  return (
    <div
      className="meta"
      style={{
        color: '#888',
        fontSize: '0.85rem',
        marginTop: '4px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center',
        lineHeight: 1.6,
      }}
    >
      Обновлено: <strong style={{ color: '#aaa' }}>{dateModified}</strong> • 
      Автор: <strong style={{ color: '#aaa' }}>{author}</strong> •
      <a
        href="https://hiphoprecords.ru"
        style={{
          color: '#fcf6ba',
          textDecoration: 'none',
          transition: 'color 0.3s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#fcf6ba' }}
      >
        HHRecords — студия звукозаписи в Красноярске
      </a>
    </div>
  )
}

export default ArticleMeta
