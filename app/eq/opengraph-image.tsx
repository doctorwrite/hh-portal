// app/eq/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

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

        {/* ===== ИКОНКА ===== */}
        <div
          style={{
            fontSize: 80,
            marginBottom: 20,
          }}
        >
          🎛️
        </div>

        {/* ===== ЗАГОЛОВОК ===== */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728)',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: 2,
          }}
        >
          Онлайн-эквалайзер
        </div>

        {/* ===== ПОДЗАГОЛОВОК ===== */}
        <div
          style={{
            fontSize: 24,
            color: '#c8c8d0',
            marginTop: 10,
            letterSpacing: 2,
          }}
        >
          Профессиональная обработка звука в браузере
        </div>

        {/* ===== ЗОЛОТАЯ ЛИНИЯ ===== */}
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