import { SplatMesh, SparkRenderer } from '@sparkjsdev/spark'
import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'

const IS_DEV = import.meta.env.DEV

function GaussianSplattingScene() {
  const { scene, gl } = useThree()

  useEffect(() => {
    // Explicitly create SparkRenderer for GPU-accelerated splat sorting/rendering
    // and proper lifecycle management (auto-created one is never cleaned up).
    const sparkRenderer = new SparkRenderer({
      renderer: gl,
      view: { sort32: true }, // 32-bit GPU radix sort for higher precision
    })
    scene.add(sparkRenderer)

    const splat = new SplatMesh({ url: '/gs/front.sog' })
    splat.rotation.x = Math.PI
    scene.add(splat)

    void Promise.resolve(splat.initialized).catch((err: unknown) => {
      console.error('[GaussianSplatting] Failed to load splat:', err)
    })

    return () => {
      scene.remove(splat)
      scene.remove(sparkRenderer)
      splat.dispose()
    }
  }, [scene, gl])

  return null
}

export function GaussianSplatting() {
  return (
    <Canvas
      camera={{ position: [0, 0, 2], fov: 20 }}
      dpr={[1, 1.5]}
      gl={{ powerPreference: 'high-performance', antialias: false, alpha: false, stencil: false }}
    >
      <color attach="background" args={['black']} />
      <GaussianSplattingScene />
      <OrbitControls />
      {IS_DEV && <Stats className="ml-[calc(50%-40px)]" />}
    </Canvas>
  )
}
