// lib/articles/index.ts
import { ArticleData } from './types'

// ===== ВРЕМЕННО: ПУСТОЙ ОБЪЕКТ =====
// Сюда будем добавлять статьи по мере создания
export const ARTICLES: Record<string, ArticleData> = {
  // eq: eq,        ← добавим позже
  // compression: compression,  ← добавим позже
  // ... и так далее
}

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ СО СТАТЬЯМИ =====
export function getArticle(slug: string): ArticleData | undefined {
  return ARTICLES[slug]
}

export function getAllArticleSlugs(): string[] {
  return Object.keys(ARTICLES)
}