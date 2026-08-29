// lib/articles/index.ts
import { ArticleData, ArticleMeta } from './types'

// ===== ИМПОРТ СТАТЕЙ =====
import { eq } from './data/eq'
import { compression } from './data/compression'
import { reverb } from './data/reverb'
import { delay } from './data/delay'
import { stereo } from './data/stereo'
import { saturation } from './data/saturation'
import { limiter } from './data/limiter'
import { audioInterface } from './data/audio-interface'
import { midi } from './data/midi'
import { vst } from './data/vst'
import { sample } from './data/sample'
import { monitors } from './data/monitors'
import { midiController } from './data/midi-controller'
import { bitDepth } from './data/bit-depth'
import { sampleRate } from './data/sample-rate'
import { lufs } from './data/lufs'
import { bitrate } from './data/bitrate'
import { filter } from './data/filter'
import { clipping } from './data/clipping'
import { phase } from './data/phase'
import { mixing } from './data/mixing'
import { mastering } from './data/mastering'
import { tracking } from './data/tracking'
import { editing } from './data/editing'
import { automation } from './data/automation'
import { prepareTracks } from './data/prepare-tracks'
import { vocalMixMinus } from './data/vocal-mix-minus'
import { parallelCompression } from './data/parallel-compression'
import { sidechain } from './data/sidechain'
import { depthWidth } from './data/depth-width'
import { recordingMistakes } from './data/recording-mistakes'
import { eqVocal } from './data/eq-vocal'
import { rapVocal } from './data/rap-vocal'
import { vocalProcessing } from './data/vocal-processing'
import { rockGuitar } from './data/rock-guitar'
import { bassMixing } from './data/bass-mixing'
import { harmonics } from './data/harmonics'
import { philosophy } from './data/philosophy'
import { gearCase } from './data/gear-case'
import { case1 } from './data/case1'
import { case2 } from './data/case2'
import { case3 } from './data/case3'
import { case4 } from './data/case4'

// ===== ИМПОРТ МЕТАДАННЫХ =====
import { eqMeta } from './metadata/eq'
import { compressionMeta } from './metadata/compression'
import { reverbMeta } from './metadata/reverb'
import { delayMeta } from './metadata/delay'
import { stereoMeta } from './metadata/stereo'
import { saturationMeta } from './metadata/saturation'
import { limiterMeta } from './metadata/limiter'
import { audioInterfaceMeta } from './metadata/audio-interface'
import { midiMeta } from './metadata/midi'
import { vstMeta } from './metadata/vst'
import { sampleMeta } from './metadata/sample'
import { monitorsMeta } from './metadata/monitors'
import { midiControllerMeta } from './metadata/midi-controller'
import { bitDepthMeta } from './metadata/bit-depth'
import { sampleRateMeta } from './metadata/sample-rate'
import { lufsMeta } from './metadata/lufs'
import { bitrateMeta } from './metadata/bitrate'
import { filterMeta } from './metadata/filter'
import { clippingMeta } from './metadata/clipping'
import { phaseMeta } from './metadata/phase'
import { mixingMeta } from './metadata/mixing'
import { masteringMeta } from './metadata/mastering'
import { trackingMeta } from './metadata/tracking'
import { editingMeta } from './metadata/editing'
import { automationMeta } from './metadata/automation'
import { prepareTracksMeta } from './metadata/prepare-tracks'
import { vocalMixMinusMeta } from './metadata/vocal-mix-minus'
import { parallelCompressionMeta } from './metadata/parallel-compression'
import { sidechainMeta } from './metadata/sidechain'
import { depthWidthMeta } from './metadata/depth-width'
import { recordingMistakesMeta } from './metadata/recording-mistakes'
import { eqVocalMeta } from './metadata/eq-vocal'
import { rapVocalMeta } from './metadata/rap-vocal'
import { vocalProcessingMeta } from './metadata/vocal-processing'
import { rockGuitarMeta } from './metadata/rock-guitar'
import { bassMixingMeta } from './metadata/bass-mixing'
import { harmonicsMeta } from './metadata/harmonics'
import { philosophyMeta } from './metadata/philosophy'
import { gearCaseMeta } from './metadata/gear-case'
import { case1Meta } from './metadata/case1'
import { case2Meta } from './metadata/case2'
import { case3Meta } from './metadata/case3'
import { case4Meta } from './metadata/case4'

// ===== РЕЕСТРЫ =====
export const ARTICLES: Record<string, ArticleData> = {
  eq,
  compression,
  reverb,
  delay,
  stereo,
  saturation,
  limiter,
  'audio-interface': audioInterface,
  'midi': midi,
  'vst': vst,
  'sample': sample,
  'monitors': monitors,
  'midi-controller': midiController,
  'bit-depth': bitDepth,
  'sample-rate': sampleRate,
  'lufs': lufs,
  'bitrate': bitrate,
  'filter': filter,
  'clipping': clipping,
  'phase': phase,
  'mixing': mixing,
  'mastering': mastering,
  'tracking': tracking,
  'editing': editing,
  'automation': automation,
  'prepare-tracks': prepareTracks,
  'vocal-mix-minus': vocalMixMinus,
  'parallel-compression': parallelCompression,
  'sidechain': sidechain,
  'depth-width': depthWidth,
  'recording-mistakes': recordingMistakes,
  'eq-vocal': eqVocal,
  'rap-vocal': rapVocal,
  'vocal-processing': vocalProcessing,
  'rock-guitar': rockGuitar,
  'bass-mixing': bassMixing,
  'harmonics': harmonics,
  'philosophy': philosophy,
  'gear-case': gearCase,
  'case1': case1,
  'case2': case2,
  'case3': case3,
  'case4': case4,
}

export const METADATA: Record<string, ArticleMeta> = {
  eq: eqMeta,
  compression: compressionMeta,
  reverb: reverbMeta,
  delay: delayMeta,
  stereo: stereoMeta,
  saturation: saturationMeta,
  limiter: limiterMeta,
  'audio-interface': audioInterfaceMeta,
  'midi': midiMeta,
  'vst': vstMeta,
  'sample': sampleMeta,
  'monitors': monitorsMeta,
  'midi-controller': midiControllerMeta,
  'bit-depth': bitDepthMeta,
  'sample-rate': sampleRateMeta,
  'lufs': lufsMeta,
  'bitrate': bitrateMeta,
  'filter': filterMeta,
  'clipping': clippingMeta,
  'phase': phaseMeta,
  'mixing': mixingMeta,
  'mastering': masteringMeta,
  'tracking': trackingMeta,
  'editing': editingMeta,
  'automation': automationMeta,
  'prepare-tracks': prepareTracksMeta,
  'vocal-mix-minus': vocalMixMinusMeta,
  'parallel-compression': parallelCompressionMeta,
  'sidechain': sidechainMeta,
  'depth-width': depthWidthMeta,
  'recording-mistakes': recordingMistakesMeta,
  'eq-vocal': eqVocalMeta,
  'rap-vocal': rapVocalMeta,
  'vocal-processing': vocalProcessingMeta,
  'rock-guitar': rockGuitarMeta,
  'bass-mixing': bassMixingMeta,
  'harmonics': harmonicsMeta,
  'philosophy': philosophyMeta,
  'gear-case': gearCaseMeta,
  'case1': case1Meta,
  'case2': case2Meta,
  'case3': case3Meta,
  'case4': case4Meta,
}

// ===== ФУНКЦИИ =====
export function getArticle(slug: string): ArticleData | undefined {
  return ARTICLES[slug]
}

export function getMetadata(slug: string): ArticleMeta | undefined {
  return METADATA[slug]
}

export function getAllArticleSlugs(): string[] {
  return Object.keys(ARTICLES)
}
