// lib/articles/index.ts
import { ArticleData, ArticleMeta } from './types'

// ===== АВТОМАТИЧЕСКИЙ ИМПОРТ ВСЕХ СТАТЕЙ =====
const dataModules = import.meta.glob('./data/*.ts', { eager: true })

export const ARTICLES: Record<string, ArticleData> = {}

for (const [path, module] of Object.entries(dataModules)) {
  const slug = path.split('/').pop()?.replace('.ts', '') || ''
  if (slug) {
    const article = (module as any)[slug] || (module as any).default
    if (article) {
      ARTICLES[slug] = article
    }
  }
}

// ===== МЕТАДАННЫЕ (если есть) =====
export const METADATA: Record<string, ArticleMeta> = {}

try {
  const metaModules = import.meta.glob('./metadata/*.ts', { eager: true })
  for (const [path, module] of Object.entries(metaModules)) {
    const slug = path.split('/').pop()?.replace('.ts', '') || ''
    if (slug) {
      const meta = (module as any)[slug + 'Meta'] || (module as any).default
      if (meta) {
        METADATA[slug] = meta
      }
    }
  }
} catch (e) {
  // метаданных может не быть
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
