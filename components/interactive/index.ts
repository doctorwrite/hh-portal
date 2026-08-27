// components/interactive/index.ts
import dynamic from 'next/dynamic'

export const EQVisualizer = dynamic(() => import('./EQVisualizer'), { ssr: false })

export const CompressorWidget = dynamic(() => import('./CompressorWidget'), { ssr: false })

export const ReverbWidget = dynamic(() => import('./ReverbWidget'), { ssr: false })

export const DelayWidget = dynamic(() => import('./DelayWidget'), { ssr: false })

export const StereoWidget = dynamic(() => import('./StereoWidget'), { ssr: false })  // ← ДОБАВЛЕНО

export const widgetMap: Record<string, any> = {
  EQVisualizer: EQVisualizer,
  CompressorWidget: CompressorWidget,
  ReverbWidget: ReverbWidget,
  DelayWidget: DelayWidget,
  StereoWidget: StereoWidget,  // ← ДОБАВЛЕНО
}

export function getWidget(name: string): any {
  return widgetMap[name] || null
}
