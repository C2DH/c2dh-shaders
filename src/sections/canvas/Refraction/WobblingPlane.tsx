/**
 * WobblingPlane.tsx
 *
 * Dependencies:
 *   npm install @react-three/fiber @react-three/drei three leva
 *   npm install --save-dev @types/three
 *
 * Drop inside an existing <Canvas frameloop="always">:
 *   <Canvas frameloop="always" camera={{ position: [0, 0, 10], fov: 70 }}>
 *     <WobblingPlane />
 *   </Canvas>
 *
 * GLSL: Vite + vite-plugin-glsl  →  import x from './X.glsl?raw'
 *       webpack                  →  import x from '!!raw-loader!./X.glsl'
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'

import vertexShader from './Vertex.glsl?raw'
import fragmentShader from './Colour.glsl?raw'

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_STOPS = 8 // must match #define MAX_STOPS in Colour.glsl

type Stop = { colour: string; position: number }

// ── Default mountain palette ───────────────────────────────────────────────────
const DEFAULT_STOPS: Stop[] = [
  { colour: '#000000', position: 0.2 }, // snow  (elevation high → t ≈ 1)
  { colour: '#254051', position: 0.49 }, // rock
  { colour: '#82979D', position: 0.54 }, // alpine green
  { colour: '#FFB9C0', position: 0.56 }, // forest (elevation low → t ≈ 0)
]

// ── Gradient helpers ───────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const c = new THREE.Color(hex)
  return [c.r, c.g, c.b]
}

/**
 * Produce the flat typed arrays that Three.js needs for vec3[] / float[] uniforms.
 * Key rule: NEVER pass Color objects or JS object arrays for array uniforms —
 * Three.js will not auto-convert them when assigned imperatively in useFrame.
 */
function buildGradientArrays(stops: Stop[]) {
  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const last = sorted[sorted.length - 1] ?? { colour: '#000000', position: 1 }

  const colourFlat = new Float32Array(MAX_STOPS * 3)
  const posFlat = new Float32Array(MAX_STOPS)

  for (let i = 0; i < MAX_STOPS; i++) {
    const s = sorted[i] ?? last
    const [r, g, b] = hexToRgb(s.colour)
    colourFlat[i * 3] = r
    colourFlat[i * 3 + 1] = g
    colourFlat[i * 3 + 2] = b
    posFlat[i] = s.position
  }

  return { colourFlat, posFlat }
}

// ── Shader material ────────────────────────────────────────────────────────────
// Initialise with the default palette so frame 0 is already coloured.
const { colourFlat: initColours, posFlat: initPos } = buildGradientArrays(DEFAULT_STOPS)

const WobbleMaterial = shaderMaterial(
  {
    uTime: 0,
    uWobblePower: 0.4,
    uNoiseScale: 1.2,
    uNoiseSpeed: 0.15,
    uSeed: 0,
    uColours: initColours, // Float32Array — correct type for vec3[]
    uStops: initPos, // Float32Array — correct type for float[]
    uStopCount: DEFAULT_STOPS.length,
    uColourBlend: 1.0,
  },
  vertexShader,
  fragmentShader,
)

extend({ WobbleMaterial })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      wobbleMaterial: any
    }
  }
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function WobblingPlane() {
  const matRef = useRef<any>(null)
  const { viewport, invalidate } = useThree()

  // ── Wobble controls ──────────────────────────────────────────────────────────
  const { wobblePower, noiseScale, seed } = useControls('Wobble', {
    wobblePower: { value: 10, min: 0, max: 15, step: 0.01, label: 'Power' },
    noiseScale: { value: 0.02, min: 0.01, max: 5, step: 0.01, label: 'Scale' },
    seed: { value: 0, min: 0, max: 9999, step: 1, label: 'Seed' },
  })

  // ── Colour / gradient controls ───────────────────────────────────────────────
  const { colourBlend, stopCount } = useControls('Gradient', {
    colourBlend: {
      value: 0.95,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Colour source (0 = UV·y, 1 = elevation)',
    },
    stopCount: { value: 4, min: 2, max: 4, step: 1, label: 'Active stops' },
  })

  const stop1 = useControls('Stop 1 – peak', {
    colour: { value: DEFAULT_STOPS[0].colour },
    position: { value: DEFAULT_STOPS[0].position, min: 0, max: 1, step: 0.01 },
  })
  const stop2 = useControls('Stop 2', {
    colour: { value: DEFAULT_STOPS[1].colour },
    position: { value: DEFAULT_STOPS[1].position, min: 0, max: 1, step: 0.01 },
  })
  const stop3 = useControls('Stop 3', {
    colour: { value: DEFAULT_STOPS[2].colour },
    position: { value: DEFAULT_STOPS[2].position, min: 0, max: 1, step: 0.01 },
  })
  const stop4 = useControls('Stop 4 – valley', {
    colour: { value: DEFAULT_STOPS[3].colour },
    position: { value: DEFAULT_STOPS[3].position, min: 0, max: 1, step: 0.01 },
  })

  // ── Flat arrays rebuild when any stop changes ────────────────────────────────
  const { colourFlat, posFlat } = useMemo(() => {
    const active: Stop[] = [
      { colour: stop1.colour, position: stop1.position },
      { colour: stop2.colour, position: stop2.position },
      { colour: stop3.colour, position: stop3.position },
      { colour: stop4.colour, position: stop4.position },
    ].slice(0, stopCount)

    return buildGradientArrays(active)
  }, [
    stopCount,
    stop1.colour,
    stop1.position,
    stop2.colour,
    stop2.position,
    stop3.colour,
    stop3.position,
    stop4.colour,
    stop4.position,
  ])

  // ── Seed initial uniforms on mount (fixes frameloop="demand" first frame) ────
  useEffect(() => {
    const m = matRef.current
    if (!m) return
    m.uColours = colourFlat
    m.uStops = posFlat
    m.uStopCount = stopCount
    m.uColourBlend = colourBlend
    m.uWobblePower = wobblePower
    m.uNoiseScale = noiseScale
    m.uSeed = seed
    invalidate() // request a render even in demand mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Per-frame update ─────────────────────────────────────────────────────────
  useFrame(() => {
    const m = matRef.current
    if (!m) return

    // uTime is fixed at 0 — noise shape is controlled by seed only.
    m.uTime = 0
    m.uWobblePower = wobblePower
    m.uNoiseScale = noiseScale
    m.uSeed = seed
    m.uStopCount = stopCount
    m.uColourBlend = colourBlend
    m.uColours = colourFlat
    m.uStops = posFlat
  })

  return (
    <mesh position={[0, 0, -6]} scale={[2, 2, 1]}>
      {/*
        viewport.width/height fills the canvas at any resolution.
        256 segments give enough vertices for smooth noise displacement.
      */}
      <planeGeometry args={[viewport.width, viewport.height, 64, 64]} />
      <wobbleMaterial ref={matRef} side={THREE.DoubleSide} />
    </mesh>
  )
}
