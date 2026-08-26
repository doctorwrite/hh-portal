// components/article/ArticleMeta.tsx

interface ArticleMetaProps {
  datePublished: string
  dateModified: string
  author: string
}

const ArticleMeta: React.FC<ArticleMetaProps> = ({
  datePublished,
  dateModified,
  author,
}) => {
  return (
    <div className="meta">
      Обновлено: {dateModified} • Автор: {author} •
      <a href="https://hiphoprecords.ru">HHRecords — студия звукозаписи</a>
    </div>
  )
}

export default ArticleMeta