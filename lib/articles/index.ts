// lib/articles/index.ts
import { ArticleData, ArticleMeta } from './types'

// ===== ИМПОРТ СТАТЕЙ =====
import { eq } from './data/eq'
import { compression } from './data/compression'

// ===== ИМПОРТ МЕТАДАННЫХ =====
// import { eqMeta } from './metadata/eq'  // позже
// import { compressionMeta } from './metadata/compression'  // позже

// ===== ВРЕМЕННЫЕ МЕТАДАННЫЕ =====
const eqMeta: ArticleMeta = {
  title: 'Эквализация (EQ) — что это? Полное определение, виды, применение, советы',
  description: 'Эквализация — это регулировка частот звука. Узнайте, как работает EQ, какие бывают типы эквалайзеров.',
  keywords: ['эквализация', 'eq', 'частоты', 'сведение', 'мастеринг', 'аудио'],
  datePublished: '2025-07-08',
  dateModified: '2026-07-22',
  author: 'Звукорежиссёр HHRecords',
  ogImage: '/images/og/eq-og-image.webp',
  category: 'Основы звукозаписи',
  section: 'basics',
}

const compressionMeta: ArticleMeta = {
  title: 'Компрессия в музыке — что это? Полное руководство по компрессорам',
  description: 'Компрессия — это сжатие динамического диапазона звука. Узнайте, как работает компрессор, какие бывают типы, настройка параметров и примеры использования.',
  keywords: ['компрессия', 'компрессор', 'сжатие аудио', 'динамический диапазон', 'сведение', 'мастеринг'],
  datePublished: '2025-07-08',
  dateModified: '2026-07-22',
  author: 'Звукорежиссёр HHRecords',
  ogImage: '/images/og/compression-og-image.webp',
  category: 'Основы звукозаписи',
  section: 'basics',
}

// ===== РЕЕСТРЫ =====
export const ARTICLES: Record<string, ArticleData> = {
  eq: eq,
  compression: compression,
}

export const METADATA: Record<string, ArticleMeta> = {
  eq: eqMeta,
  compression: compressionMeta,
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
