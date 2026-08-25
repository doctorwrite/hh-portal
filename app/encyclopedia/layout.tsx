// app/encyclopedia/layout.tsx
import './page.css'  // ← ДОБАВЛЕНО!

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Энциклопедия звукозаписи — 50+ статей по сведению, мастерингу и оборудованию | HHRecords',
  description: 'Полная энциклопедия звукозаписи: 50+ статей по эквализации, компрессии, реверберации, сведению, мастерингу, оборудованию и вокалу. Создано для музыкантов и звукорежиссёров.',
  keywords: 'энциклопедия звукозаписи, сведение, мастеринг, эквализация, компрессия, реверберация, студия звукозаписи Красноярск',
  openGraph: {
    title: 'Энциклопедия звукозаписи — 50+ статей для музыкантов и звукорежиссёров | HHRecords',
    description: 'Полный гид по звукозаписи: эквализация, компрессия, реверберация, сведение, мастеринг, оборудование, вокал. 50+ статей с примерами и советами.',
    url: 'https://hiphoprecords.ru/encyclopedia',
    images: [{ url: '/images/og-encyclopedia.webp', width: 1200, height: 630, alt: 'Энциклопедия звукозаписи HHRecords' }],
  },
  alternates: {
    canonical: 'https://hiphoprecords.ru/encyclopedia',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// ===== МИКРОРАЗМЕТКА =====

// 1. BreadcrumbList
const jsonLdBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    { '@type': 'ListItem', 'position': 1, 'name': 'Главная', 'item': 'https://hiphoprecords.ru/' },
    { '@type': 'ListItem', 'position': 2, 'name': 'Энциклопедия', 'item': 'https://hiphoprecords.ru/encyclopedia/' },
  ],
}

// 2. CollectionPage
const jsonLdCollection = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  'name': 'Энциклопедия звукозаписи HHRecords',
  'description': 'Полная энциклопедия звукозаписи: 50+ статей по сведению, мастерингу, эквализации, компрессии, реверберации, оборудованию и вокалу.',
  'url': 'https://hiphoprecords.ru/encyclopedia/',
  'about': {
    '@type': 'Thing',
    'name': 'Звукозапись',
  },
  'author': {
    '@type': 'Organization',
    'name': 'HHRecords',
    'url': 'https://hiphoprecords.ru',
  },
  'publisher': {
    '@type': 'Organization',
    'name': 'HHRecords',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://hiphoprecords.ru/images/logo.webp',
    },
  },
  'mainEntity': {
    '@type': 'ItemList',
    'itemListElement': [
      // Будет заполнено динамически на клиенте или в page.tsx
    ],
  },
}

// 3. ItemList (все 45 статей)
const getAllArticles = () => {
  const sections = [
    { id: 'basics', articles: ['eq', 'compression', 'reverb', 'delay', 'stereo', 'saturation', 'limiter'] },
    { id: 'gear', articles: ['audio-interface', 'midi', 'vst', 'sample', 'monitors', 'midi-controller'] },
    { id: 'technical', articles: ['bit-depth', 'sample-rate', 'lufs', 'bitrate', 'filter', 'clipping', 'phase'] },
    { id: 'processes', articles: ['mixing', 'mastering', 'tracking', 'editing', 'automation', 'prepare-tracks', 'vocal-mix-minus', 'parallel-compression', 'sidechain', 'depth-width', 'recording-mistakes'] },
    { id: 'vocal', articles: ['eq-vocal', 'rap-vocal', 'vocal-processing', 'rock-guitar', 'bass-mixing', 'harmonics'] },
    { id: 'cases', articles: ['philosophy', 'gear-case', 'case1', 'case2', 'case3', 'case4', 'case5', 'case6'] },
  ]
  return sections.flatMap(s => s.articles)
}

const allArticles = getAllArticles()
const jsonLdItemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  'itemListElement': allArticles.map((id, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': id,
    'url': `https://hiphoprecords.ru/encyclopedia/${id}`,
  })),
}

export default function EncyclopediaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCollection) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
      />
      {children}
    </>
  )
}