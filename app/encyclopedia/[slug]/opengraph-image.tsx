// app/encyclopedia/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { getArticle } from '@/lib/articles/data'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug)

  return new ImageResponse(
    (
      <div
        style={{
          background: '#08080a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* ===== ЗОЛОТАЯ ЛИНИЯ ===== */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #bf953f, #fcf6ba, #b38728)',
          }}
        />

        {/* ===== НАЗВАНИЕ САЙТА (МЕЛКИМ) ===== */}
        <div
          style={{
            fontSize: 24,
            color: '#6a6a75',
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          HHRecords • Энциклопедия звукозаписи
        </div>

        {/* ===== ЗАГОЛОВОК СТАТЬИ ===== */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            maxWidth: '90%',
            lineHeight: 1.2,
          }}
        >
          {article?.title || 'Статья о звукозаписи'}
        </div>

        {/* ===== ЗОЛОТАЯ ЛИНИЯ ВНИЗУ ===== */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #bf953f, #fcf6ba, #b38728)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}