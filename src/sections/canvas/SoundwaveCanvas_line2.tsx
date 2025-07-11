import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import * as THREE from 'three'
// import { Line2 } from 'three/examples/jsm/lines/Line2.js'
// import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
// import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import {
  AudioListener,
  Audio,
  AudioAnalyser,
  AudioLoader,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  BufferGeometry,
  BufferAttribute,
  LineBasicMaterial,
  Line,
  Group,
} from 'three'
import { SoundMesh } from '../../components/SoundMesh'

// Extend THREE for R3F
extend({
  Group,
  AudioListener,
  Audio,
  AudioAnalyser,
  AudioLoader,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  BufferGeometry,
  BufferAttribute,
  LineBasicMaterial,
  Line,
  GLTFExporter,
}) // Line2, LineMaterial, LineGeometry - place back for Line2 usage

interface LineVisualizerProps {
  songUrl: string
  setDuration: (duration: number) => void
  setCurrentTime: (time: number) => void // Add this line
  duration: number // Add this line
  onExport?: () => void // Add this for triggering export
  audioStarted?: boolean // Add this prop to control audio start
}

interface AudioFrame {
  time: number
  frequencyData: number[]
}

// Add this interface for the ref
interface LineVisualizerRef {
  exportToGLTF: () => void
  exportFrequencyData: () => void
}

const LineVisualizer = forwardRef<LineVisualizerRef, LineVisualizerProps>(
  ({ songUrl, setDuration, setCurrentTime, duration, audioStarted }, ref) => {
    const [audioFrames, setAudioFrames] = useState<AudioFrame[]>([])
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
    const [frequencyDataCollection, setFrequencyDataCollection] = useState<Uint8Array[]>([])
    const [preloadedFFTData, setPreloadedFFTData] = useState<Uint8Array[] | null>(null)
    const [usingPreloadedData, setUsingPreloadedData] = useState(false)
    const [preloadedDataIndex, setPreloadedDataIndex] = useState(0)

    const linesRef = useRef<THREE.Group>(null)
    const soundRef = useRef<THREE.Audio | null>(null)
    const analyserRef = useRef<THREE.AudioAnalyser | null>(null)
    const lastRef = useRef<number>(0)
    const cropArea = -80 // Adjust this value to set the crop area
    const lineNumber = 100 // Number of lines to visualize
    const { camera } = useThree() // Get camera from useThree hook

    // Pre-analyze audio data
    const analyzeAudioData = async (audioBuffer: AudioBuffer) => {
      setIsAnalyzing(true)
      console.log('Starting audio analysis...')

      const frames: AudioFrame[] = []
      const frameInterval = duration / lineNumber // 200ms intervals (same as your original)
      // const totalFrames = Math.floor(Math.min(duration, audioBuffer.duration) / frameInterval) // 15 seconds max

      // Analyze audio at regular intervals
      for (let i = 0; i < frameInterval; i++) {
        const time = i * frameInterval
        const sampleIndex = Math.floor(time * audioBuffer.sampleRate)

        // Get frequency data at this time point
        const frequencyData = new Uint8Array(30)
        const channelData = audioBuffer.getChannelData(0)

        // Simple frequency analysis simulation
        for (let j = 0; j < 30; j++) {
          const startSample = Math.floor(sampleIndex + j * 1024)
          const endSample = Math.min(startSample + 1024, channelData.length)

          if (startSample < channelData.length) {
            let sum = 0
            for (let k = startSample; k < endSample; k++) {
              sum += Math.abs(channelData[k])
            }
            frequencyData[j] = Math.min(255, sum * 1000) // Scale to 0-255 range
          }
        }

        frames.push({
          time,
          frequencyData: Array.from(frequencyData),
        })
      }

      setAudioFrames(frames)
      setIsAnalyzing(false)
    }

    // Audio setup
    useEffect(() => {
      const listener = new AudioListener()
      camera.add(listener) // FIX: Attach listener to camera

      const audio = new Audio(listener)
      soundRef.current = audio

      const loader = new AudioLoader()
      loader.load(songUrl, (buffer) => {
        audio.setBuffer(buffer)
        audio.setLoop(false)
        audio.setVolume(1)
        if (audioStarted === true) {
          audio.play() // Play audio only if audioStarted is true
        }

        const analyser = new AudioAnalyser(audio, 128)
        analyserRef.current = analyser
        // Get duration from the audio buffer
        const audioDuration = buffer.duration
        setDuration(audioDuration)
        console.log(`Audio duration: ${audioDuration} seconds`)
      })
    }, [songUrl, setDuration, audioStarted, camera]) // Add camera to dependencies

    useFrame(({ clock }) => {
      const now = clock.getElapsedTime() * 1000 // convert to ms

      if (soundRef.current && soundRef.current.isPlaying) {
        let currentPlayTime = soundRef.current.context.currentTime
        if (duration > 0 && currentPlayTime > duration) {
          currentPlayTime = currentPlayTime % duration
        }
        setCurrentTime(currentPlayTime)

        if (currentPlayTime >= duration) {
          soundRef.current.stop()
        }
      }

      if (!lastRef.current || now - lastRef.current >= (duration / lineNumber) * 1000) {
        lastRef.current = now

        if (analyserRef.current) {
          // Use live data
          const data = analyserRef.current.getFrequencyData()
          setFrequencyDataCollection((prev) => [...prev, new Uint8Array(data)])

          if (soundRef.current?.isPlaying) {
            const currentPlayTime = soundRef.current.context.currentTime
            const adjustedTime = duration > 0 ? currentPlayTime % duration : currentPlayTime

            if (adjustedTime < duration) {
              moveLines()
              addLine(data)
            }
          }
        }
      }
    })

    // const addLine = (fftValues: Uint8Array) => {
    //   if (!linesRef.current) return

    //   const planeWidth = 50;
    //   const centerOffset = cropArea / 2; // Center the visualization properly

    //   const planeGeometry = new PlaneGeometry(planeWidth - 1, 1, planeWidth - 1, 1)

    //   const plane = new Mesh(
    //     planeGeometry,
    //     new MeshBasicMaterial({
    //       color: 0x000000,
    //       wireframe: false,
    //       transparent: false,
    //     })
    //   )

    //   // Create LineGeometry for Line2 (not BufferGeometry)
    //   const lineGeometry = new LineGeometry()
    //   const linePoints: number[] = []

    //   for (let i = 0; i < planeWidth; i++) {
    //     let y = 0
    //     if (i >= 0 && i < 50) {
    //       y += fftValues[50 - i]
    //     }
    //     y = Math.pow(y, 0.6)

    //     // Line2 expects points as [x, y, z, x, y, z, ...]
    //     linePoints.push(
    //       planeGeometry.attributes.position.array[3 * i], // x - centered
    //       y, // y - with audio data
    //       planeGeometry.attributes.position.array[3 * i + 2] - centerOffset// z
    //     )
    //   }

    //   // Set positions for LineGeometry
    //   lineGeometry.setPositions(linePoints)

    //   const lineMaterial = new LineMaterial({
    //     color: '#a938ff',
    //     // linewidth: 2, // This actually works with Line2!
    //     transparent: true,
    //     opacity: 1,
    //   })

    //   // Set resolution for proper line rendering
    //   lineMaterial.resolution.set(size.width, size.height)

    //   const line = new Line2(lineGeometry, lineMaterial)

    const exportFrequencyData = () => {
      const dataForExport = frequencyDataCollection.map((arr) => Array.from(arr))
      const jsonData = JSON.stringify(dataForExport, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'frequency_data.json'
      link.click()
      URL.revokeObjectURL(url)
    }

    // Replace the addLine function with this version using THREE.Line:
    const addLine = (fftValues: Uint8Array) => {
      if (!linesRef.current) return

      const planeWidth = 50
      const centerOffset = cropArea / 2

      // Create BufferGeometry for regular THREE.Line
      const lineGeometry = new BufferGeometry()
      const linePoints: number[] = []

      for (let i = 0; i < planeWidth; i++) {
        let y = 0
        if (i >= 0 && i < 50) {
          y += fftValues[50 - i]
        }
        y = Math.pow(y, 0.45)

        // Regular Line expects points as [x, y, z, x, y, z, ...]
        linePoints.push(
          (i - planeWidth / 2) * 1, // x - spread out the points
          y, // y - with audio data
          -centerOffset, // z - consistent z position
        )
      }

      // Set positions for BufferGeometry
      lineGeometry.setAttribute('position', new BufferAttribute(new Float32Array(linePoints), 3))

      console.log('Line points:', linePoints) // Debugging line points

      // Use LineBasicMaterial instead of LineMaterial
      const lineMaterial = new LineBasicMaterial({
        color: '#a938ff',
        transparent: true,
        opacity: 1,
      })
      // Create regular THREE.Line
      const line = new Line(lineGeometry, lineMaterial)

      // Create a group to hold the line (instead of adding to plane)
      const lineGroup = new Group()
      lineGroup.add(line)

      linesRef.current.add(lineGroup)
    }
    //Line2
    // const moveLines = () => {
    //   if (!linesRef.current) return
    //   const lineSpeed = 1; // Adjust this value to control speed (higher = faster)

    //   const planesToRemove: THREE.Mesh[] = []

    //   linesRef.current.children.forEach((plane) => {
    //     const mesh = plane as THREE.Mesh

    //     // Move the entire plane object instead of individual vertices
    //     mesh.position.z -= lineSpeed

    //     // Check if plane should be removed
    //     if (mesh.position.z <= cropArea) {
    //       planesToRemove.push(mesh)
    //     }
    //   })

    //   planesToRemove.forEach((plane) => linesRef.current?.remove(plane))
    // }

    const moveLines = () => {
      if (!linesRef.current) return
      const lineDistance = (cropArea / lineNumber) * -1 // Adjust this value to control speed (higher = faster)

      const linesToRemove: THREE.Group[] = []
      linesRef.current.children.forEach((lineGroup) => {
        const group = lineGroup as THREE.Group

        // Move the entire line group
        group.position.z -= lineDistance

        // Check if line should be removed
        if (group.position.z <= cropArea) {
          linesToRemove.push(group)
        }
      })

      linesToRemove.forEach((group) => linesRef.current?.remove(group))
    }

    const exportToGLTF = () => {
      if (!linesRef.current) return

      const exporter = new GLTFExporter()

      exporter.parse(
        linesRef.current, // The group containing all your lines
        (gltf) => {
          // Create and download the file
          const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'visualization.gltf'
          link.click()
          URL.revokeObjectURL(url)
        },
        (error) => {
          console.error('Error exporting GLTF:', error)
        },
        {
          binary: false, // Set to true if you want .glb format instead
          embedImages: true,
          includeCustomExtensions: true,
        },
      )
    }

    // Expose the export function to parent
    useImperativeHandle(ref, () => ({
      exportToGLTF,
      exportFrequencyData,
    }))

    return <group ref={linesRef} />
  },
)

const SoundwaveCanvas: React.FC = () => {
  const lineVisualizerRef = useRef<LineVisualizerRef>(null)
  const [dimension, setDimension] = useState(
    Math.min(window.innerHeight / 1.5, window.innerWidth / 1.5),
  )
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [audioStarted, setAudioStarted] = useState<boolean>(false)

  const handleExport = () => {
    if (lineVisualizerRef.current) {
      lineVisualizerRef.current.exportToGLTF()
    }
  }

  const startAudio = () => {
    setAudioStarted(true)
    // Then trigger the audio loading
  }

  useEffect(() => {
    const handleResize = () => {
      setDimension(Math.min(window.innerHeight / 1.5, window.innerWidth / 1.5))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [duration])

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className="absolute text-white top-0 z-10 flex flex-col">
        <span>Duration: {duration.toFixed(2)}s</span>
        <span>Current Time: {currentTime.toFixed(2)}s</span>
        <button
          onClick={handleExport}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
        >
          Export GLTF
        </button>
        <button
          onClick={startAudio}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
        >
          Start audio
        </button>
        <button
          onClick={() => lineVisualizerRef.current?.exportFrequencyData()}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
        >
          Export Frequency Data
        </button>
      </div>
      <Canvas gl={{ antialias: true }}>
        <ambientLight intensity={10} />
        <directionalLight position={[0, 10, 5]} intensity={5} />
        <PerspectiveCamera makeDefault position={[-35, 50, 90]} />
        {/* <SoundMesh position={[0, 0, 1]} scale={[1, 1, 1]} /> */}
        <OrbitControls
          // minPolarAngle={Math.PI / 2}
          // maxPolarAngle={Math.PI / 2}
          makeDefault
          // autoRotate
          // autoRotateSpeed={0.5}
        />
        <color attach="background" args={['black']} />
        {/* <gridHelper args={[20, 20, 0x444444, 0x222222]} /> */}
        <LineVisualizer
          ref={lineVisualizerRef}
          songUrl="/audio/Hungary.mp3"
          setDuration={setDuration}
          setCurrentTime={setCurrentTime}
          duration={duration}
          audioStarted={audioStarted}
        />
      </Canvas>
    </div>
  )
}

export default SoundwaveCanvas
