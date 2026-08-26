// components/interactive/index.ts
import dynamic from 'next/dynamic'

export const EQVisualizer = dynamic(() => import('./EQVisualizer'), { ssr: false })

export const widgetMap: Record<string, any> = {
  EQVisualizer: EQVisualizer,
}

export function getWidget(name: string): any {
  return widgetMap[name] || null
}
