// app/encyclopedia/[slug]/page.tsx
import './page.css'

import { getArticle, getMetadata, getAllArticleSlugs } from '@/lib/articles'
import { notFound } from 'next/navigation'
import Link from 'next/link'
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

// ===== ВИДЖЕТЫ (будем добавлять по мере создания) =====
// import { EQWidget } from '@/components/interactive'

const widgetMap: Record<string, any> = {
  // eq: EQWidget,
  // compression: CompressorWidget,
  // ... и так далее
}

// ===== JSON-LD: TechArticle =====
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

// ===== JSON-LD: BreadcrumbList =====
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

// ===== JSON-LD: FAQPage =====
function getFaqJsonLd(content: string) {
  if (!content) return null

  const qaBlocks = content.match(/<div class="qa-block"[^>]*>([\s\S]*?)<\/div>/g) || []
  const faqItems = qaBlocks
    .map((block: string) => {
      const questionMatch = block.match(/<h3[^>]*>.*?<span[^>]*>.*?<\/span>\s*([^<]+)<\/h3>/)
      const answerMatch = block.match(/<div class="answer">([\s\S]*?)<\/div>/)
      if (questionMatch && answerMatch) {
        return {
          '@type': 'Question',
          name: questionMatch[1].trim(),
          acceptedAnswer: {
            '@type': 'Answer',
            text: answerMatch[1].replace(/<[^>]+>/g, '').trim(),
          },
        }
      }
      return null
    })
    .filter(Boolean)

  if (faqItems.length === 0) return null

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

  const Widget = widgetMap[slug]
  const jsonLd = getJsonLd(slug, article, meta)
  const breadcrumbJsonLd = getBreadcrumbJsonLd(slug, article)
  const faqJsonLd = getFaqJsonLd(article.content)

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
        <Link href="/">Главная</Link>
        <span className="sep">›</span>
        <Link href="/encyclopedia">Энциклопедия</Link>
        <span className="sep">›</span>
        <span className="current">{article.title}</span>
      </div>

      {/* ===== СОДЕРЖАНИЕ СТАТЬИ ===== */}
      <div className="article-content">
        <h1>{article.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      {/* ===== ВИДЖЕТ ===== */}
      {Widget && (
        <div className="widget-wrapper">
          <Widget />
        </div>
      )}

      {/* ===== НАВИГАЦИЯ ===== */}
      <nav className="bottom-nav">
        <Link href="/encyclopedia">← Назад к энциклопедии</Link>
        <Link href="/" className="bottom-home">🏠 На главную</Link>
        <a href="#top" className="back-to-top">↑ Наверх</a>
      </nav>
    </div>
  )
}
