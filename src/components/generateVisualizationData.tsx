// src/utils/generateVisualizationData.ts
import { AudioLoader } from 'three'

interface AudioFrame {
  time: number
  frequencyData: number[]
}

interface SavedVisualizationData {
  version: string
  frames: AudioFrame[]
  metadata: {
    songUrl: string
    duration: number
    createdAt: string
  }
}

// Update your generateVisualizationData.ts
export const generateVisualizationData = async (
  songUrl: string,
  audioBuffer: AudioBuffer,
): Promise<SavedVisualizationData> => {
  const frames: AudioFrame[] = []
  const frameInterval = 0.2
  const totalFrames = Math.floor(Math.min(15, audioBuffer.duration) / frameInterval)

  // Create an offline audio context for analysis
  const offlineCtx = new OfflineAudioContext(
    1, // channels
    audioBuffer.length, // length
    audioBuffer.sampleRate, // sample rate
  )

  // Create an analyser node
  const analyser = offlineCtx.createAnalyser()
  analyser.fftSize = 256

  // Create a buffer source
  const bufferSource = offlineCtx.createBufferSource()
  bufferSource.buffer = audioBuffer
  bufferSource.connect(analyser)
  analyser.connect(offlineCtx.destination)
  bufferSource.start()

  // Process frames
  for (let i = 0; i < totalFrames; i++) {
    const time = i * frameInterval

    // Get frequency data at this time point
    const frequencyData = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(frequencyData)

    // Take only the first 50 frequency bins
    const limitedData = Array.from(frequencyData.slice(0, 50))

    frames.push({
      time,
      frequencyData: limitedData,
    })
  }

  return {
    version: '1.0',
    frames,
    metadata: {
      songUrl,
      duration: audioBuffer.duration,
      createdAt: new Date().toISOString(),
    },
  }
}
