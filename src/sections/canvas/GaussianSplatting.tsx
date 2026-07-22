import { SplatMesh, SparkRenderer } from '@sparkjsdev/spark'
import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'

const IS_DEV = import.meta.env.DEV

// Detect Firefox for performance optimizations
const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox')

function GaussianSplattingScene() {
  const { scene, gl } = useThree()

  useEffect(() => {
    // Explicitly create SparkRenderer and attach it to scene root.
    const sparkRenderer = new SparkRenderer({
      renderer: gl,
      // In Spark 2.x sort32 is always used; throttle sort cadence on Firefox.
      minSortIntervalMs: isFirefox ? 24 : 0,
    })
    scene.add(sparkRenderer)

    const splat = new SplatMesh({ url: '/gs/fom.sog' })
    splat.rotation.x = Math.PI
    scene.add(splat)

    void Promise.resolve(splat.initialized).catch((err: unknown) => {
      console.error('[GaussianSplatting] Failed to load splat:', err)
    })

    return () => {
      scene.remove(splat)
      scene.remove(sparkRenderer)
      splat.dispose()
      sparkRenderer.dispose()
    }
  }, [scene, gl])

  return null
}

export function GaussianSplatting() {
  return (
    <Canvas
      camera={{ position: [0, 0, 2], fov: 20 }}
      dpr={isFirefox ? [1, 1] : [1, 1.5]}
      gl={{
        powerPreference: 'high-performance',
        antialias: false,
        alpha: false,
        stencil: false,
        // Firefox-specific optimizations
        ...(isFirefox && { logarithmicDepthBuffer: false }),
      }}
    >
      <color attach="background" args={['black']} />
      <GaussianSplattingScene />
      <OrbitControls />
      {IS_DEV && <Stats className="ml-[calc(50%-40px)]" />}
    </Canvas>
  )
}
