// app/encyclopedia/[slug]/page.tsx
import { getArticle, getAllArticleSlugs } from '@/lib/articles/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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

  // Если статьи нет — показываем 404
  if (!article) {
    notFound()
  }

  return (
    <div className="article-container">
      <div className="breadcrumb">
        <Link href="/">Главная</Link>
        <span className="sep">›</span>
        <Link href="/encyclopedia">Энциклопедия</Link>
        <span className="sep">›</span>
        <span className="current">{article.title}</span>
      </div>

      <div className="article-content">
        <h1>{article.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
        
        <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <Link href="/encyclopedia" className="btn btn-outline">
            ← Назад к энциклопедии
          </Link>
        </div>
      </div>
    </div>
  )
}
