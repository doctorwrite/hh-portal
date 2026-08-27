// lib/articles/index.ts
import fs from 'fs'
import path from 'path'
import { ArticleData, ArticleMeta } from './types'

// ===== ПУТИ =====
const dataDir = path.join(process.cwd(), 'lib/articles/data')
const metaDir = path.join(process.cwd(), 'lib/articles/metadata')

// ===== РЕЕСТРЫ =====
export const ARTICLES: Record<string, ArticleData> = {}
export const METADATA: Record<string, ArticleMeta> = {}

// ===== ЗАГРУЗКА СТАТЕЙ =====
try {
  const dataFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts') && f !== '_template.ts')
  
  for (const file of dataFiles) {
    const slug = file.replace('.ts', '')
    try {
      // Используем require для динамической загрузки
      const module = require(`./data/${slug}`)
      // Ищем экспорт: либо module[slug], либо module.default
      const article = module[slug] || module.default
      if (article) {
        ARTICLES[slug] = article
      } else {
        console.warn(`⚠️ В файле ${file} не найден экспорт для "${slug}"`)
      }
    } catch (e) {
      console.warn(`⚠️ Не удалось загрузить статью: ${slug}`, e)
    }
  }
} catch (e) {
  console.warn('⚠️ Папка data не найдена или пуста')
}

// ===== ЗАГРУЗКА МЕТАДАННЫХ =====
try {
  const metaFiles = fs.readdirSync(metaDir).filter(f => f.endsWith('.ts') && f !== '_template.ts')
  
  for (const file of metaFiles) {
    const slug = file.replace('.ts', '')
    try {
      const module = require(`./metadata/${slug}`)
      // Ищем: либо module[slug + 'Meta'], либо module.default
      const meta = module[slug + 'Meta'] || module.default
      if (meta) {
        METADATA[slug] = meta
      }
    } catch (e) {
      // Метаданные не обязательны — пропускаем
    }
  }
} catch (e) {
  // Папка metadata может не существовать
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

// ===== ВЫВОД В КОНСОЛЬ ДЛЯ ОТЛАДКИ =====
if (process.env.NODE_ENV !== 'production') {
  console.log(`📚 Загружено статей: ${Object.keys(ARTICLES).length}`)
  console.log(`📋 Загружено метаданных: ${Object.keys(METADATA).length}`)
}
