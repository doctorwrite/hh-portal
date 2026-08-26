// app/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'HHRecords — Студия звукозаписи в Красноярске'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
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
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* ===== ЗОЛОТАЯ ЛИНИЯ СВЕРХУ ===== */}
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

        {/* ===== ЛОГОТИП (БОЛЬШАЯ БУКВА H) ===== */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 10,
            letterSpacing: 4,
          }}
        >
          HHRecords
        </div>

        {/* ===== ПОДЗАГОЛОВОК ===== */}
        <div
          style={{
            fontSize: 32,
            color: '#c8c8d0',
            letterSpacing: 6,
            textTransform: 'uppercase',
          }}
        >
          Студия звукозаписи
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

        {/* ===== ТЕКСТ ВНИЗУ ===== */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 18,
            color: '#6a6a75',
            letterSpacing: 2,
          }}
        >
          Красноярск • Запись вокала • Сведение • Мастеринг
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}