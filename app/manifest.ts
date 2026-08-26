// app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HHRecords — Студия звукозаписи в Красноярске',
    short_name: 'HHRecords',
    description: 'Профессиональная студия звукозаписи. Запись вокала, сведение, мастеринг. Оборудование Neumann, Focal, Apollo.',
    start_url: '/',
    display: 'standalone',
    background_color: '#08080a',
    theme_color: '#f5c542',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',  // ← ИСПРАВЛЕНО: было 'any maskable'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',  // ← ИСПРАВЛЕНО: было 'any maskable'
      },
    ],
  }
}
