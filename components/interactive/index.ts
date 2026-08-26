// components/interactive/index.ts
import dynamic from 'next/dynamic'

// ===== ВИДЖЕТЫ =====
export const EQVisualizer = dynamic(() => import('./EQVisualizer'), { ssr: false })

// ===== КАРТА ДЛЯ ПОДКЛЮЧЕНИЯ ПО SLUG =====
export const widgetMap: Record<string, any> = {
  eq: EQVisualizer,
}

// ===== ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ВИДЖЕТА =====
export function getWidget(slug: string): any {
  return widgetMap[slug] || null
}
