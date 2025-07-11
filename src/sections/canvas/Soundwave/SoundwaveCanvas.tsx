import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import * as THREE from 'three'
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
import { exportToGLTF } from './threeExportUtils'
// import { SoundMesh } from '../../../components/SoundMesh'

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
  useSavedData?: boolean // New prop to control data source
}

// interface AudioFrame {
//   time: number
//   frequencyData: number[]
// }

// Add this interface for the ref
interface LineVisualizerRef {
  exportToGLTF: () => void
  exportFrequencyData: () => void
  renderSavedFrequencyData: () => void
}

const LineVisualizer = forwardRef<LineVisualizerRef, LineVisualizerProps>(
  ({ songUrl, setDuration, setCurrentTime, duration, audioStarted, useSavedData = false }, ref) => {
    const [savedFrequencyData, setSavedFrequencyData] = useState<Uint8Array[]>([]) // New state for saved
    const [loadedFrequencyData, setLoadedFrequencyData] = useState<number[][]>([]) // State for loaded data
    const [currentDataIndex, setCurrentDataIndex] = useState<number>(0) // Track current data index
    const [isPlayingData, setIsPlayingData] = useState<boolean>(false) // Track if we're playing saved data

    const linesRef = useRef<THREE.Group>(null)
    const soundRef = useRef<THREE.Audio | null>(null)
    const analyserRef = useRef<THREE.AudioAnalyser | null>(null)
    const lastRef = useRef<number>(0)
    const startTimeRef = useRef<number>(0) // Track start time for saved data playback
    const cropArea = -80 // Adjust this value to set the crop area
    const lineNumber = 100 // Number of lines to visualize
    const { camera } = useThree() // Get camera from useThree hook

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
        if (audioStarted === true && !useSavedData) {
          audio.play() // Play audio only if audioStarted is true and not using saved data
        }

        const analyser = new AudioAnalyser(audio, 128)
        analyserRef.current = analyser
        // Get duration from the audio buffer
        const audioDuration = buffer.duration
        setDuration(audioDuration)
        console.log(`Audio duration: ${audioDuration} seconds`)
      })
    }, [songUrl, setDuration, audioStarted, camera, useSavedData]) // Add useSavedData to dependencies

    // Load saved frequency data when component mounts or when useSavedData changes
    useEffect(() => {
      if (useSavedData) {
        loadFrequencyDataFromFile()
      }
    }, [useSavedData])

    // Start playing saved data when audioStarted is true and we're using saved data
    useEffect(() => {
      if (audioStarted && useSavedData && loadedFrequencyData.length > 0) {
        setIsPlayingData(true)
        setCurrentDataIndex(0)
        startTimeRef.current = performance.now()
      }
    }, [audioStarted, useSavedData, loadedFrequencyData])

    useFrame(({ clock }) => {
      const now = clock.getElapsedTime() * 1000 // convert to ms

      if (useSavedData && isPlayingData) {
        // Handle saved data playback
        const elapsedTime = (performance.now() - startTimeRef.current) / 1000 // Convert to seconds
        setCurrentTime(elapsedTime)

        // Calculate how many data points should have been processed by now
        const expectedIndex = Math.floor(elapsedTime / (duration / lineNumber))

        if (expectedIndex > currentDataIndex && currentDataIndex < loadedFrequencyData.length) {
          // Process all missed frames
          for (
            let i = currentDataIndex;
            i < Math.min(expectedIndex, loadedFrequencyData.length);
            i++
          ) {
            const dataArray = new Uint8Array(loadedFrequencyData[i])
            moveLines()
            addLine(dataArray, false) // Don't save this data again
          }
          setCurrentDataIndex(expectedIndex)
        }

        // Stop when we've processed all data
        if (currentDataIndex >= loadedFrequencyData.length) {
          setIsPlayingData(false)
        }
      } else if (!useSavedData) {
        // Handle live audio data (original logic)
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

            console.log('Frequency data:', data) // Debugging frequency data

            if (soundRef.current?.isPlaying) {
              const currentPlayTime = soundRef.current.context.currentTime
              const adjustedTime = duration > 0 ? currentPlayTime % duration : currentPlayTime

              if (adjustedTime < duration) {
                moveLines()
                addLine(data, true) // Save this data
              }
            }
          }
        }
      }
    })

    const exportSavedFrequencyData = () => {
      const dataForExport = savedFrequencyData.map((arr) => Array.from(arr))
      const jsonData = JSON.stringify(dataForExport, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'saved_frequency_data.json'
      link.click()
      URL.revokeObjectURL(url)
    }

    const loadFrequencyData = async (filePath: string) => {
      try {
        const response = await fetch(filePath)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        return data // This will be an array of arrays
      } catch (error) {
        console.error('Error loading frequency data:', error)
        return null
      }
    }

    const loadFrequencyDataFromFile = async () => {
      const frequencyData = await loadFrequencyData('data/saved_frequency_data.json')
      if (frequencyData) {
        setLoadedFrequencyData(frequencyData)
        console.log('Loaded frequency data:', frequencyData.length, 'frames')
      }
    }

    const renderSavedFrequencyData = async () => {
      const frequencyData = await loadFrequencyData('data/saved_frequency_data.json')
      if (frequencyData) {
        frequencyData.forEach((arr: number[]) => {
          const fftValues = new Uint8Array(arr)
          addLine(fftValues, false) // Don't save this data again
        })
      }
    }

    const addLine = (fftValues?: Uint8Array, shouldSave: boolean = true) => {
      if (!linesRef.current) return

      // If fftValues is not provided, return early
      if (!fftValues) return

      // Store the data if it's coming from the audio analyzer and shouldSave is true
      if (fftValues instanceof Uint8Array && shouldSave) {
        setSavedFrequencyData((prev) => [...prev, new Uint8Array(fftValues)]) // Store the data
      }

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

    // Replace the old exportToGLTF function with this:
    const handleExportToGLTF = () => {
      if (!linesRef.current) return
      return exportToGLTF(linesRef.current, 'soundwave-visualization.gltf')
    }

    // Expose the export function to parent
    useImperativeHandle(ref, () => ({
      exportToGLTF: handleExportToGLTF,
      exportFrequencyData: exportSavedFrequencyData,
      renderSavedFrequencyData, // Expose the render function
    }))

    return <group ref={linesRef} />
  },
)

const SoundwaveCanvas: React.FC = () => {
  const lineVisualizerRef = useRef<LineVisualizerRef>(null)
  const [, setDimension] = useState(Math.min(window.innerHeight / 1.5, window.innerWidth / 1.5))
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [audioStarted, setAudioStarted] = useState<boolean>(false)
  const [useSavedData, setUseSavedData] = useState<boolean>(false) // New state to control data source

  const handleExport = () => {
    if (lineVisualizerRef.current) {
      lineVisualizerRef.current.exportToGLTF()
    }
  }

  const startAudio = () => {
    setAudioStarted(true)
    setUseSavedData(true) // Use saved data when starting audio
  }

  const startLiveAudio = () => {
    setAudioStarted(true)
    setUseSavedData(false) // Use live audio data
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
        alignItems: 'left',
      }}
    >
      <div className="absolute text-white top-5 z-2 flex flex-col">
        <span>Duration: {duration.toFixed(2)}s</span>
        <span>Current Time: {currentTime.toFixed(2)}s</span>
        <span>Mode: {useSavedData ? 'Saved Data' : 'Live Audio'}</span>
        <button
          onClick={handleExport}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 mt-2 rounded-[0px!important]"
        >
          Export GLTF
        </button>
        <button
          onClick={startAudio}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 mt-2 rounded-[0px!important]"
        >
          Start with Saved Data
        </button>
        <button
          onClick={startLiveAudio}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 mt-2 rounded-[0px!important]"
        >
          Start with Live Audio
        </button>
        <button
          onClick={() => lineVisualizerRef.current?.exportFrequencyData()}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 mt-2 rounded-[0px!important]"
        >
          Export Saved Frequency Data
        </button>
        {/* <button
          onClick={() => lineVisualizerRef.current?.renderSavedFrequencyData()}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 mt-2 rounded-[0px!important]"
        >
          Load Saved Frequency Data
        </button> */}
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
          useSavedData={useSavedData}
        />
      </Canvas>
    </div>
  )
}

export default SoundwaveCanvas
