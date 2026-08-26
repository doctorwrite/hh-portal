// lib/articles/types.ts

export interface ArticleData {
  title: string
  description: string
  content: string
  slug?: string
}

export interface ArticleMeta {
  title: string
  description: string
  keywords: string[]
  datePublished: string
  dateModified: string
  author: string
  ogImage: string
  category: string
  section: string
  sources?: string[]
  widget?: string
}