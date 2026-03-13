import { SplatMesh } from '@sparkjsdev/spark'
import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function GaussianSplattingScene() {
  const { scene } = useThree()

  useEffect(() => {
    const splat = new SplatMesh({ url: '/gs/test.sog' })
    splat.rotation.x = Math.PI
    // splat.position.set(0, -1, 0)
    // splat.rotation.y = Math.PI / 2
    scene.add(splat)

    void Promise.resolve(splat.initialized).catch((err: unknown) => {
      console.error('[GaussianSplatting] Failed to load splat:', err)
    })

    return () => {
      scene.remove(splat)
      splat.dispose()
    }
  }, [scene])

  return null
}

export function GaussianSplatting() {
  return (
    <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
      <color attach="background" args={['black']} />
      <GaussianSplattingScene />
      <OrbitControls />
    </Canvas>
  )
}
