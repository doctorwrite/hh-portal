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

// ===== ВСЕ КЛИЕНТСКИЕ КОМПОНЕНТЫ — ТОЛЬКО НА КЛИЕНТЕ =====
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
  genreTable?: { title: string; rows: { genre: string; boost: string; cut: string }[]; note: string }
  quickStart?: { title: string; steps: string[] }
  checklist?: { title: string; items: { id: string; text: string; hint: string }[]; storageKey: string }
  userQuestions?: { title: string; items: { question: string; answer: string }[] }
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
      {/* ===== СТАТИЧЕСКИЕ КОМПОНЕНТЫ (SSR) ===== */}
      <ArticleMeta dateModified={meta.dateModified} author={meta.author} />
      <HeroBlock badge={hero.badge} title={title} subtitle={hero.subtitle} tags={hero.tags} />
      <TOC items={toc} />
      <QuickAnswer text={quickAnswer} />

      {/* ===== ВИДЖЕТ (SSR ОТКЛЮЧЁН ЧЕРЕЗ dynamic) ===== */}
      {widget && <div style={{ margin: '16px 0 24px' }}>{widget}</div>}

      {/* ===== QA БЛОКИ (SSR) ===== */}
      <QABlock items={qa} />

      {/* ===== ВСЕ НОВЫЕ КОМПОНЕНТЫ — ТОЛЬКО НА КЛИЕНТЕ (ssr: false) ===== */}
      {genreTable && <GenreTable title={genreTable.title} rows={genreTable.rows} note={genreTable.note} />}
      {quickStart && <QuickStart title={quickStart.title} steps={quickStart.steps} />}
      {checklist && <Checklist title={checklist.title} items={checklist.items} storageKey={checklist.storageKey} />}
      {userQuestions && <UserQuestions title={userQuestions.title} items={userQuestions.items} />}

      {/* ===== СТАТИЧЕСКИЕ КОМПОНЕНТЫ (SSR) ===== */}
      <Glossary items={glossary} />
      <TipBlock text={tip} />
      <RelatedTerms items={relatedTerms} />
      <Sources items={sources} />
      <BrandBlock />
      <ShareButtons url={url} />
    </div>
  )
}

export default ArticleLayout
