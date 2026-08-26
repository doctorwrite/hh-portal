// app/encyclopedia/[slug]/page.tsx
import './page.css'

import { getArticle, getAllArticleSlugs } from '@/lib/articles/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'

// ===== ГЕНЕРАЦИЯ МЕТАДАННЫХ =====
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = getArticle(params.slug)
  
  if (!article) {
    return {
      title: 'Статья не найдена | HHRecords',
      description: 'Запрашиваемая статья не найдена в энциклопедии звукозаписи HHRecords.',
    }
  }

  return {
    title: `${article.title} | HHRecords`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://hiphoprecords.ru/encyclopedia/${params.slug}`,
      siteName: 'HHRecords',
      images: [
        {
          url: `https://hiphoprecords.ru/encyclopedia/${params.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: 'article',
      publishedTime: new Date().toISOString(),
      authors: ['HHRecords'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [`https://hiphoprecords.ru/encyclopedia/${params.slug}/opengraph-image`],
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

// ===== СТРАНИЦА СТАТЬИ =====
export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const article = getArticle(slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="article-container" id="main-content">
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

      {/* ===== НАВИГАЦИЯ ВНИЗУ ===== */}
      <nav className="bottom-nav">
        <Link href="/encyclopedia">← Назад к энциклопедии</Link>
        <Link href="/" className="bottom-home">🏠 На главную</Link>
        <a href="#top" className="back-to-top">↑ Наверх</a>
      </nav>
    </div>
  )
}
