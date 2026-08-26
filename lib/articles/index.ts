// lib/articles/index.ts
import { ArticleData, ArticleMeta } from './types'

// ===== ИМПОРТ СТАТЕЙ =====
import { eq } from './data/eq'

// ===== ИМПОРТ МЕТАДАННЫХ =====
// import { eqMeta } from './metadata/eq'  // пока закомментировано, позже добавим

// ===== ВРЕМЕННЫЕ МЕТАДАННЫЕ (пока нет metadata файлов) =====
const eqMeta: ArticleMeta = {
  title: 'Эквализация (EQ) — что это? Полное определение, виды, применение, советы',
  description: 'Эквализация — это регулировка частот звука. Узнайте, как работает EQ, какие бывают типы эквалайзеров.',
  keywords: ['эквализация', 'eq', 'частоты', 'сведение', 'мастеринг', 'аудио'],
  datePublished: '2025-07-08',
  dateModified: '2026-07-22',
  author: 'HHRecords',
  ogImage: '/images/og/eq-og-image.webp',
  category: 'Основы звукозаписи',
  section: 'basics',
}

// ===== РЕЕСТР СТАТЕЙ =====
export const ARTICLES: Record<string, ArticleData> = {
  eq: eq,
}

// ===== РЕЕСТР МЕТАДАННЫХ =====
export const METADATA: Record<string, ArticleMeta> = {
  eq: eqMeta,
}

// ===== ФУНКЦИИ =====
export function getArticle(slug: string): ArticleData | undefined {
  return ARTICLES[slug]
}

export function getMetadata(slug: string): ArticleMeta | undefined {
  return METADATA[slug]
}

export function getAllArticleSlugs(): string[] {
  return Object.keys(ARTICLES)
}
