// lib/articles/index.ts
import { ArticleData, ArticleMeta } from './types'

// ===== ИМПОРТ СТАТЕЙ =====
import { eq } from './data/eq'
import { compression } from './data/compression'
import { reverb } from './data/reverb'
import { delay } from './data/delay'
import { stereo } from './data/stereo'
import { saturation } from './data/saturation'
import { limiter } from './data/limiter'  // ← ДОБАВЛЕНО

// ===== ИМПОРТ МЕТАДАННЫХ =====
import { eqMeta } from './metadata/eq'
import { compressionMeta } from './metadata/compression'
import { reverbMeta } from './metadata/reverb'
import { delayMeta } from './metadata/delay'
import { stereoMeta } from './metadata/stereo'
import { saturationMeta } from './metadata/saturation'
import { limiterMeta } from './metadata/limiter'  // ← ДОБАВЛЕНО

// ===== РЕЕСТРЫ =====
export const ARTICLES: Record<string, ArticleData> = {
  eq,
  compression,
  reverb,
  delay,
  stereo,
  saturation,
  limiter,  // ← ДОБАВЛЕНО
}

export const METADATA: Record<string, ArticleMeta> = {
  eq: eqMeta,
  compression: compressionMeta,
  reverb: reverbMeta,
  delay: delayMeta,
  stereo: stereoMeta,
  saturation: saturationMeta,
  limiter: limiterMeta,  // ← ДОБАВЛЕНО
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
