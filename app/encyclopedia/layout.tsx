// app/encyclopedia/layout.tsx
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

// MICRODATA для BreadcrumbList
const jsonLdBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    { '@type': 'ListItem', 'position': 1, 'name': 'Главная', 'item': 'https://hiphoprecords.ru/' },
    { '@type': 'ListItem', 'position': 2, 'name': 'Энциклопедия', 'item': 'https://hiphoprecords.ru/encyclopedia/' },
  ],
}

export default function EncyclopediaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      {children}
    </>
  )
}
