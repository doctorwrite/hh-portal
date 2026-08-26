// components/article/ArticleLayout.tsx

import dynamic from 'next/dynamic'
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

// ===== КЛИЕНТСКИЕ КОМПОНЕНТЫ (ТОЛЬКО НА КЛИЕНТЕ) =====
const GenreTable = dynamic(() => import('./GenreTable'), { ssr: false })
const QuickStart = dynamic(() => import('./QuickStart'), { ssr: false })
const Checklist = dynamic(() => import('./Checklist'), { ssr: false })
const UserQuestions = dynamic(() => import('./UserQuestions'), { ssr: false })

interface ArticleLayoutProps {
  title: string
  meta: { dateModified: string; author: string }
  hero: { badge: string; subtitle: string; tags: string[] }
  toc: { id: string; label: string }[]
  quickAnswer: string
  qa: { id: string; question: string; answer: string }[]
  glossary: { term: string; definition: string }[]
  tip: string
  relatedTerms: { slug: string; icon: string; label: string }[]
  sources: { url: string; label: string }[]
  genreTable?: any
  quickStart?: any
  checklist?: any
  userQuestions?: any
  widget?: React.ReactNode
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
  genreTable,
  quickStart,
  checklist,
  userQuestions,
  widget,
  url,
}) => {
  return (
    <div className="article-content">
      {/* ===== 1. HERO ===== */}
      <HeroBlock
        badge={hero.badge}
        title={title}
        subtitle={hero.subtitle}
        tags={hero.tags}
      />

      {/* ===== 2. МЕТА ===== */}
      <ArticleMeta
        dateModified={meta.dateModified}
        author={meta.author}
      />

      {/* ===== 3. ОГЛАВЛЕНИЕ ===== */}
      <TOC items={toc} />

      {/* ===== 4. КРАТКИЙ ОТВЕТ ===== */}
      <QuickAnswer text={quickAnswer} />

      {/* ===== 5. ВИДЖЕТ ===== */}
      {widget && <div style={{ margin: '16px 0 24px' }}>{widget}</div>}

      {/* ===== 6. ВОПРОСЫ ===== */}
      <QABlock items={qa} />

      {/* ===== 7. ПРИМЕНЕНИЕ В ЖАНРАХ ===== */}
      {genreTable && <GenreTable title={genreTable.title} rows={genreTable.rows} note={genreTable.note} />}

      {/* ===== 8. БЫСТРЫЙ СТАРТ ===== */}
      {quickStart && <QuickStart title={quickStart.title} steps={quickStart.steps} />}

      {/* ===== 9. ЧЕК-ЛИСТ ===== */}
      {checklist && <Checklist title={checklist.title} items={checklist.items} storageKey={checklist.storageKey} />}

      {/* ===== 10. ВОПРОСЫ ОТ КЛИЕНТОВ ===== */}
      {userQuestions && <UserQuestions title={userQuestions.title} items={userQuestions.items} />}

      {/* ===== 11. ГЛОССАРИЙ ===== */}
      <Glossary items={glossary} />

      {/* ===== 12. СОВЕТ ОТ ЗВУКОРЕЖИССЁРА ===== */}
      <TipBlock text={tip} />

      {/* ===== 13. ПОХОЖИЕ ТЕРМИНЫ ===== */}
      <RelatedTerms items={relatedTerms} />

      {/* ===== 14. ИСТОЧНИКИ ===== */}
      <Sources items={sources} />

      {/* ===== 15. БРЕНДОВЫЙ БЛОК ===== */}
      <BrandBlock />

      {/* ===== 16. ПОДЕЛИТЬСЯ ===== */}
      <ShareButtons url={url} />
    </div>
  )
}

export default ArticleLayout
