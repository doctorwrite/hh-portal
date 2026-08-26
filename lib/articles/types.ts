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
    badge: string
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

  // Применение в жанрах
  genreTable?: {
    title: string
    rows: {
      genre: string
      boost: string
      cut: string
    }[]
    note: string
  }

  // Быстрый старт
  quickStart?: {
    title: string
    steps: string[]
  }

  // Чек-лист
  checklist?: {
    title: string
    items: {
      id: string
      text: string
      hint: string
    }[]
    storageKey: string
  }

  // Вопросы от читателей
  userQuestions?: {
    title: string
    items: {
      question: string
      answer: string
    }[]
  }

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
