// app/encyclopedia/[slug]/page.tsx
import './page.css'

import { getArticle, getAllArticleSlugs } from '@/lib/articles'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'

// ===== МЕТАДАННЫЕ =====
// Временно пустой объект, будем заполнять по мере добавления статей
const metaMap: Record<string, any> = {
  // eq: eqMeta,  ← добавим позже
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const meta = metaMap[params.slug]
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

// ===== ВИДЖЕТЫ =====
// Временно пустой объект
const widgetMap: Record<string, any> = {
  // eq: EQWidget,  ← добавим позже
}

// ===== JSON-LD =====
function getJsonLd(slug: string) {
  const meta = metaMap[slug]
  if (!meta) return null

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

// ===== СТРАНИЦА =====
export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const article = getArticle(slug)

  if (!article) {
    notFound()
  }

  const Widget = widgetMap[slug]
  const jsonLd = getJsonLd(slug)

  return (
    <div className="article-container" id="main-content">
      {/* ===== JSON-LD ===== */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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

      {/* ===== НАВИГАЦИЯ ВНИЗУ ===== */}
      <nav className="bottom-nav">
        <Link href="/encyclopedia">← Назад к энциклопедии</Link>
        <Link href="/" className="bottom-home">🏠 На главную</Link>
        <a href="#top" className="back-to-top">↑ Наверх</a>
      </nav>
    </div>
  )
}
