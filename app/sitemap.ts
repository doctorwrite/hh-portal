// app/sitemap.ts
import { getAllArticleSlugs } from '@/lib/articles/data'

export default async function sitemap() {
  const baseUrl = 'https://hiphoprecords.ru'

  // ===== СТАТИЧЕСКИЕ СТРАНИЦЫ =====
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/encyclopedia`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/eq`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  // ===== СТАТЬИ (ДИНАМИЧЕСКИЕ) =====
  const slugs = getAllArticleSlugs()
  const articles = slugs.map((slug) => ({
    url: `${baseUrl}/encyclopedia/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...routes, ...articles]
}