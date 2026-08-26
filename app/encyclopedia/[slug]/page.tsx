// app/encyclopedia/[slug]/page.tsx
import './page.css'

import { getArticle, getMetadata, getAllArticleSlugs } from '@/lib/articles'
import { getWidget } from '@/components/interactive'
import ArticleLayout from '@/components/article/ArticleLayout'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

// ===== МЕТАДАННЫЕ =====
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const meta = getMetadata(params.slug)

  if (!meta) {
    return {
      title: 'Статья не найдена | HHRecords',
      description: 'Запрашиваемая статья не найдена в энциклопедии звукозаписи HHRecords.',
    }
  }

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://hiphoprecords.ru/encyclopedia/${params.slug}`,
      images: [{ url: meta.ogImage, width: 1200, height: 630 }],
      type: 'article',
      publishedTime: meta.datePublished,
      authors: [meta.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [meta.ogImage],
    },
    alternates: {
      canonical: `https://hiphoprecords.ru/encyclopedia/${params.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// ===== ГЕНЕРАЦИЯ СТАТИЧЕСКИХ СТРАНИЦ =====
export async function generateStaticParams() {
  const slugs = getAllArticleSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

// ===== JSON-LD =====
function getJsonLd(slug: string, article: any, meta: any) {
  if (!meta || !article) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: meta.title,
    description: meta.description,
    author: {
      '@type': 'Organization',
      name: 'HHRecords',
      url: 'https://hiphoprecords.ru',
    },
    publisher: {
      '@type': 'Organization',
      name: 'HHRecords',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hiphoprecords.ru/favicon.ico',
      },
    },
    datePublished: meta.datePublished,
    dateModified: meta.dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://hiphoprecords.ru/encyclopedia/${slug}`,
    },
    about: {
      '@type': 'Thing',
      name: meta.category,
    },
    keywords: meta.keywords.join(', '),
  }
}

function getBreadcrumbJsonLd(slug: string, article: any) {
  if (!article) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Главная',
        item: 'https://hiphoprecords.ru/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Энциклопедия',
        item: 'https://hiphoprecords.ru/encyclopedia/',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://hiphoprecords.ru/encyclopedia/${slug}`,
      },
    ],
  }
}

function getFaqJsonLd(qa: any[]) {
  if (!qa || qa.length === 0) return null

  const faqItems = qa.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer.replace(/<[^>]+>/g, '').trim(),
    },
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  }
}

// ===== СТРАНИЦА =====
export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const article = getArticle(slug)
  const meta = getMetadata(slug)

  if (!article || !meta) {
    notFound()
  }

  // ===== ПОЛУЧАЕМ ВИДЖЕТ =====
  const Widget = getWidget(article.widget || '')

  const jsonLd = getJsonLd(slug, article, meta)
  const breadcrumbJsonLd = getBreadcrumbJsonLd(slug, article)
  const faqJsonLd = getFaqJsonLd(article.qa)

  return (
    <div className="article-container" id="main-content">
      {/* ===== JSON-LD ===== */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}

      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* ===== ХЛЕБНЫЕ КРОШКИ ===== */}
      <div className="breadcrumb">
        <a href="/">Главная</a>
        <span className="sep">›</span>
        <a href="/encyclopedia">Энциклопедия</a>
        <span className="sep">›</span>
        <span className="current">{article.title}</span>
      </div>

      {/* ===== СОДЕРЖАНИЕ СТАТЬИ ===== */}
      <ArticleLayout
        title={article.title}
        meta={{
          dateModified: meta.dateModified,
          author: meta.author,
        }}
        hero={{
          badge: article.hero.badge || 'Энциклопедия звукозаписи',
          subtitle: article.hero.subtitle,
          tags: article.hero.tags,
        }}
        toc={article.toc}
        quickAnswer={article.quickAnswer}
        qa={article.qa}
        glossary={article.glossary}
        tip={article.tip}
        relatedTerms={article.relatedTerms}
        sources={article.sources}
        genreTable={article.genreTable}
        quickStart={article.quickStart}
        checklist={article.checklist}
        userQuestions={article.userQuestions}
        widget={Widget ? <Widget /> : undefined}
        url={`https://hiphoprecords.ru/encyclopedia/${slug}`}
      />

      {/* ===== НАВИГАЦИЯ ===== */}
      <nav
        className="bottom-nav"
        style={{
          display: 'flex',
          gap: '12px',
          padding: '16px 0',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginTop: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <a
          href="/encyclopedia"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 24px',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#fff',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            textDecoration: 'none',
            transition: 'all 0.3s',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          }}
        >
          ← Назад к энциклопедии
        </a>
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 24px',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#fff',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            textDecoration: 'none',
            transition: 'all 0.3s',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          }}
        >
          🏠 На главную
        </a>
        <a
          href="#top"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 24px',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#fff',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            textDecoration: 'none',
            transition: 'all 0.3s',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          }}
        >
          ↑ Наверх
        </a>
      </nav>
    </div>
  )
}
