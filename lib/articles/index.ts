// lib/articles/index.ts
import { ArticleData, ArticleMeta } from './types'

// ===== РЕЕСТРЫ =====
export const ARTICLES: Record<string, ArticleData> = {}
export const METADATA: Record<string, ArticleMeta> = {}

// ===== АВТОМАТИЧЕСКАЯ ЗАГРУЗКА (ТОЛЬКО НА СЕРВЕРЕ) =====
try {
  // fs и path доступны только на сервере
  const fs = require('fs')
  const path = require('path')
  
  const dataDir = path.join(process.cwd(), 'lib/articles/data')
  
  // Проверяем, существует ли папка
  if (fs.existsSync(dataDir)) {
    const dataFiles = fs.readdirSync(dataDir).filter((f: string) => f.endsWith('.ts') && f !== '_template.ts')
    
    for (const file of dataFiles) {
      const slug = file.replace('.ts', '')
      try {
        const module = require(`./data/${slug}`)
        const article = module[slug] || module.default
        if (article) {
          ARTICLES[slug] = article
        }
      } catch (e) {
        // ошибка загрузки отдельной статьи — пропускаем
      }
    }
  }
} catch (e) {
  // На клиенте или при сборке — просто игнорируем
}

// ===== ЗАГРУЗКА МЕТАДАННЫХ =====
try {
  const fs = require('fs')
  const path = require('path')
  
  const metaDir = path.join(process.cwd(), 'lib/articles/metadata')
  
  if (fs.existsSync(metaDir)) {
    const metaFiles = fs.readdirSync(metaDir).filter((f: string) => f.endsWith('.ts') && f !== '_template.ts')
    
    for (const file of metaFiles) {
      const slug = file.replace('.ts', '')
      try {
        const module = require(`./metadata/${slug}`)
        const meta = module[slug + 'Meta'] || module.default
        if (meta) {
          METADATA[slug] = meta
        }
      } catch (e) {
        // метаданные не обязательны
      }
    }
  }
} catch (e) {
  // папка metadata может не существовать
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
