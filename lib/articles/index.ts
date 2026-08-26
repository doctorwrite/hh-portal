// lib/articles/index.ts
import { ArticleData, ArticleMeta } from './types'

// ===== ИМПОРТ СТАТЕЙ =====
import { eq } from './data/eq'

// ===== ИМПОРТ МЕТАДАННЫХ =====
import { eqMeta } from './metadata/eq'

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

export function getAllArticles(): { slug: string; data: ArticleData; meta: ArticleMeta }[] {
  return Object.keys(ARTICLES).map((slug) => ({
    slug,
    data: ARTICLES[slug],
    meta: METADATA[slug],
  }))
}
