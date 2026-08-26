// lib/articles/index.ts
import { ArticleData, ArticleMeta } from './types'

// ===== СТАТЬИ (будем добавлять по мере создания) =====
// import { eq } from './data/eq'
// import { compression } from './data/compression'
// ... и так далее

// ===== МЕТАДАННЫЕ (будем добавлять по мере создания) =====
// import { eqMeta } from './metadata/eq'
// import { compressionMeta } from './metadata/compression'
// ... и так далее

// ===== РЕЕСТР СТАТЕЙ =====
export const ARTICLES: Record<string, ArticleData> = {
  // eq: eq,
  // compression: compression,
  // ... и так далее
}

// ===== РЕЕСТР МЕТАДАННЫХ =====
export const METADATA: Record<string, ArticleMeta> = {
  // eq: eqMeta,
  // compression: compressionMeta,
  // ... и так далее
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
