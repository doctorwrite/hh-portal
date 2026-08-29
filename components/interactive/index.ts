// components/interactive/index.ts
import dynamic from 'next/dynamic'

export const EQVisualizer = dynamic(() => import('./EQVisualizer'), { ssr: false })

export const CompressorWidget = dynamic(() => import('./CompressorWidget'), { ssr: false })

export const ReverbWidget = dynamic(() => import('./ReverbWidget'), { ssr: false })

export const DelayWidget = dynamic(() => import('./DelayWidget'), { ssr: false })

export const StereoWidget = dynamic(() => import('./StereoWidget'), { ssr: false })

export const SaturationWidget = dynamic(() => import('./SaturationWidget'), { ssr: false })

export const LimiterWidget = dynamic(() => import('./LimiterWidget'), { ssr: false })

export const AudioInterfaceWidget = dynamic(() => import('./AudioInterfaceWidget'), { ssr: false })

export const MIDIWidget = dynamic(() => import('./MIDIWidget'), { ssr: false })

export const VSTWidget = dynamic(() => import('./VSTWidget'), { ssr: false })

export const SampleWidget = dynamic(() => import('./SampleWidget'), { ssr: false })

export const MonitorsWidget = dynamic(() => import('./MonitorsWidget'), { ssr: false })

export const MIDIControllerWidget = dynamic(() => import('./MIDIControllerWidget'), { ssr: false })

export const BitDepthWidget = dynamic(() => import('./BitDepthWidget'), { ssr: false })

export const SampleRateWidget = dynamic(() => import('./SampleRateWidget'), { ssr: false })

export const LUFSWidget = dynamic(() => import('./LUFSWidget'), { ssr: false })

export const BitrateWidget = dynamic(() => import('./BitrateWidget'), { ssr: false })

export const FilterWidget = dynamic(() => import('./FilterWidget'), { ssr: false })

export const ClippingWidget = dynamic(() => import('./ClippingWidget'), { ssr: false })

export const PhaseWidget = dynamic(() => import('./PhaseWidget'), { ssr: false })

export const MixingWidget = dynamic(() => import('./MixingWidget'), { ssr: false })

export const MasteringWidget = dynamic(() => import('./MasteringWidget'), { ssr: false })

export const TrackingWidget = dynamic(() => import('./TrackingWidget'), { ssr: false })

export const EditingWidget = dynamic(() => import('./EditingWidget'), { ssr: false })

export const AutomationWidget = dynamic(() => import('./AutomationWidget'), { ssr: false })

export const SessionPrepWidget = dynamic(() => import('./SessionPrepWidget'), { ssr: false })

export const VocalMixMinusWidget = dynamic(() => import('./VocalMixMinusWidget'), { ssr: false })

export const ParallelCompressionWidget = dynamic(() => import('./ParallelCompressionWidget'), { ssr: false })

export const SidechainWidget = dynamic(() => import('./SidechainWidget'), { ssr: false })

export const DepthWidthWidget = dynamic(() => import('./DepthWidthWidget'), { ssr: false })

export const RecordingMistakesWidget = dynamic(() => import('./RecordingMistakesWidget'), { ssr: false })

export const VocalEQWidget = dynamic(() => import('./VocalEQWidget'), { ssr: false })

export const RapVocalWidget = dynamic(() => import('./RapVocalWidget'), { ssr: false })

export const VocalProcessingWidget = dynamic(() => import('./VocalProcessingWidget'), { ssr: false })

export const RockMetalWidget = dynamic(() => import('./RockMetalWidget'), { ssr: false })

export const BassMixingWidget = dynamic(() => import('./BassMixingWidget'), { ssr: false })

export const HarmonicsWidget = dynamic(() => import('./HarmonicsWidget'), { ssr: false })

export const widgetMap: Record<string, any> = {
  EQVisualizer: EQVisualizer,
  CompressorWidget: CompressorWidget,
  ReverbWidget: ReverbWidget,
  DelayWidget: DelayWidget,
  StereoWidget: StereoWidget,
  SaturationWidget: SaturationWidget,
  LimiterWidget: LimiterWidget,
  AudioInterfaceWidget: AudioInterfaceWidget,
  MIDIWidget: MIDIWidget,
  VSTWidget: VSTWidget,
  SampleWidget: SampleWidget,
  MonitorsWidget: MonitorsWidget,
  MIDIControllerWidget: MIDIControllerWidget,
  BitDepthWidget: BitDepthWidget,
  SampleRateWidget: SampleRateWidget,
  LUFSWidget: LUFSWidget,
  BitrateWidget: BitrateWidget,
  FilterWidget: FilterWidget,
  ClippingWidget: ClippingWidget,
  PhaseWidget: PhaseWidget,
  MixingWidget: MixingWidget,
  MasteringWidget: MasteringWidget,
  TrackingWidget: TrackingWidget,
  EditingWidget: EditingWidget,
  AutomationWidget: AutomationWidget,
  SessionPrepWidget: SessionPrepWidget,
  VocalMixMinusWidget: VocalMixMinusWidget,
  ParallelCompressionWidget: ParallelCompressionWidget,
  SidechainWidget: SidechainWidget,
  DepthWidthWidget: DepthWidthWidget,
  RecordingMistakesWidget: RecordingMistakesWidget,
  VocalEQWidget: VocalEQWidget,
  RapVocalWidget: RapVocalWidget,
  VocalProcessingWidget: VocalProcessingWidget,
  RockMetalWidget: RockMetalWidget,
  BassMixingWidget: BassMixingWidget,
  HarmonicsWidget: HarmonicsWidget,
}

export function getWidget(name: string): any {
  return widgetMap[name] || null
}
