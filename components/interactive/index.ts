// components/interactive/index.ts
import dynamic from 'next/dynamic'

// ===== ВИДЖЕТЫ СТАТЕЙ =====
export const EQVisualizer = dynamic(() => import('./EQVisualizer'), { ssr: false })

// ===== КАРТА ВИДЖЕТОВ ПО ИМЕНИ =====
export const widgetMap: Record<string, any> = {
  EQVisualizer: EQVisualizer,
}

// ===== ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ВИДЖЕТА ПО ИМЕНИ =====
export function getWidget(name: string): any {
  return widgetMap[name] || null
}
