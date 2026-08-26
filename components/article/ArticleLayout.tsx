// components/article/ArticleLayout.tsx

import { Suspense, lazy } from 'react'
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

// Ленивая загрузка тяжёлых/клиентских компонентов
const GenreTable = lazy(() => import('./GenreTable'))
const QuickStart = lazy(() => import('./QuickStart'))
const Checklist = lazy(() => import('./Checklist'))
const UserQuestions = lazy(() => import('./UserQuestions'))

// Компонент загрузки
const LoadingFallback = () => (
  <div
    style={{
      padding: '20px',
      textAlign: 'center',
      color: '#666',
      fontSize: '0.85rem',
    }}
  >
    Загрузка...
  </div>
)

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
      <ArticleMeta dateModified={meta.dateModified} author={meta.author} />
      <HeroBlock badge={hero.badge} title={title} subtitle={hero.subtitle} tags={hero.tags} />
      <TOC items={toc} />
      <QuickAnswer text={quickAnswer} />

      {widget && <div style={{ margin: '16px 0 24px' }}>{widget}</div>}

      <QABlock items={qa} />

      {/* Ленивая загрузка новых компонентов */}
      {genreTable && (
        <Suspense fallback={<LoadingFallback />}>
          <GenreTable title={genreTable.title} rows={genreTable.rows} note={genreTable.note} />
        </Suspense>
      )}

      {quickStart && (
        <Suspense fallback={<LoadingFallback />}>
          <QuickStart title={quickStart.title} steps={quickStart.steps} />
        </Suspense>
      )}

      {checklist && (
        <Suspense fallback={<LoadingFallback />}>
          <Checklist title={checklist.title} items={checklist.items} storageKey={checklist.storageKey} />
        </Suspense>
      )}

      {userQuestions && (
        <Suspense fallback={<LoadingFallback />}>
          <UserQuestions title={userQuestions.title} items={userQuestions.items} />
        </Suspense>
      )}

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
