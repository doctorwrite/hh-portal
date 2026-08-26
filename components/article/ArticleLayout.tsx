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
  widget,
  url,
}) => {
  return (
    <div className="article-content">
      <HeroBlock
        badge={hero.badge}
        title={title}
        subtitle={hero.subtitle}
        tags={hero.tags}
      />

      <ArticleMeta
        dateModified={meta.dateModified}
        author={meta.author}
      />

      <TOC items={toc} />
      <QuickAnswer text={quickAnswer} />

      {widget && <div style={{ margin: '16px 0 24px' }}>{widget}</div>}

      <QABlock items={qa} />
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
