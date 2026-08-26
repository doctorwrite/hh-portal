// lib/articles/types.ts

// ===== МЕТАДАННЫЕ СТАТЬИ =====
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

// ===== ДАННЫЕ СТАТЬИ =====
export interface ArticleData {
  // Основное
  title: string
  description: string

  // Hero-блок
  hero: {
    subtitle: string
    tags: string[]
  }

  // Оглавление
  toc: {
    id: string
    label: string
  }[]

  // Краткий ответ
  quickAnswer: string

  // Вопросы и ответы
  qa: {
    id: string
    question: string
    answer: string
  }[]

  // Микро-глоссарий
  glossary: {
    term: string
    definition: string
  }[]

  // Совет от звукорежиссёра
  tip: string

  // Похожие термины
  relatedTerms: {
    slug: string
    icon: string
    label: string
  }[]

  // Источники
  sources: {
    url: string
    label: string
  }[]

  // Название виджета (из реестра components/interactive)
  widget?: string
}
