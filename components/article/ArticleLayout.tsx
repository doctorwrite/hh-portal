// components/article/ArticleLayout.tsx

import ArticleMeta from './ArticleMeta'
import HeroBlock from './HeroBlock'
import TOC from './TOC'
import QuickAnswer from './QuickAnswer'
import QABlock from './QABlock'
import Glossary from './Glossary'
import TipBlock from './TipBlock'
import RelatedTerms from './RelatedTerms'
import Sources from './Sources'
import BrandBlock from './BrandBlock'
import ShareButtons from './ShareButtons'

interface ArticleLayoutProps {
  // Данные статьи
  title: string
  meta: {
    dateModified: string
    author: string
  }
  hero: {
    badge: string
    subtitle: string
    tags: string[]
  }
  toc: { id: string; label: string }[]
  quickAnswer: string
  qa: { id: string; question: string; answer: string }[]
  glossary: { term: string; definition: string }[]
  tip: string
  relatedTerms: { slug: string; icon: string; label: string }[]
  sources: { url: string; label: string }[]
  // Виджет
  widget?: React.ReactNode
  // URL для поделиться
  url: string
}

const ArticleLayout: React.FC<ArticleLayoutProps> = ({
  title,
  meta,
  hero,
  toc,
  quickAnswer,
  qa,
  glossary,
  tip,
  relatedTerms,
  sources,
  widget,
  url,
}) => {
  return (
    <div className="article-content">
      {/* Мета-информация */}
      <ArticleMeta
        dateModified={meta.dateModified}
        author={meta.author}
      />

      {/* Hero-блок */}
      <HeroBlock
        badge={hero.badge}
        title={title}
        subtitle={hero.subtitle}
        tags={hero.tags}
      />

      {/* Оглавление */}
      <TOC items={toc} />

      {/* Краткий ответ */}
      <QuickAnswer text={quickAnswer} />

      {/* Виджет */}
      {widget && (
        <div style={{ margin: '16px 0 24px' }}>
          {widget}
        </div>
      )}

      {/* Вопросы и ответы */}
      <QABlock items={qa} />

      {/* Применение в жанрах — показывается только для EQ */}
      {/* Этот блок уникальный для каждой статьи, поэтому рендерится в данных, а не здесь */}

      {/* Микро-глоссарий */}
      <Glossary items={glossary} />

      {/* Совет от звукорежиссёра */}
      <TipBlock text={tip} />

      {/* Похожие термины */}
      <RelatedTerms items={relatedTerms} />

      {/* Источники */}
      <Sources items={sources} />

      {/* Брендовый блок */}
      <BrandBlock />

      {/* Поделиться */}
      <ShareButtons url={url} />
    </div>
  )
}

export default ArticleLayout