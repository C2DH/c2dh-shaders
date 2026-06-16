import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import { OrbitControls } from '@react-three/drei'

export default function SceneCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
      <color attach="background" args={['black']} />
      <Scene />
      <OrbitControls enableDamping enablePan={false} minDistance={3} maxDistance={10} />
    </Canvas>
  )
}
