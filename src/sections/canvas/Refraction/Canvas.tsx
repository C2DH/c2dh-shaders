import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import { OrbitControls, Stats } from '@react-three/drei'

const IS_DEV = import.meta.env.DEV

export default function SceneCanvas() {
  return (
    <Canvas dpr={[1, 1.5]} frameloop="demand" camera={{ position: [0, 0, 6], fov: 45 }}>
      <color attach="background" args={['black']} />
      <Scene />
      <OrbitControls enableDamping enablePan={false} minDistance={3} maxDistance={20} />
      {IS_DEV && <Stats className="ml-[calc(50%-40px)]" />}
    </Canvas>
  )
}
