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
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center',
      }}
    >
      Обновлено: {dateModified} • Автор: {author} •
      <a href="https://hiphoprecords.ru" style={{ color: '#fcf6ba' }}>
        HHRecords — студия звукозаписи в Красноярске
      </a>
    </div>
  )
}

export default ArticleMeta
