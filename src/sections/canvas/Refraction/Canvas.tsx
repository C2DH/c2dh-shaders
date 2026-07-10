import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import { Stats, OrbitControls } from '@react-three/drei'
import WobblingPlane from './WobblingPlane'

const IS_DEV = import.meta.env.DEV

export default function SceneCanvas() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 10], fov: 70 }}>
      <color attach="background" args={['black']} />
      <Scene />
      <WobblingPlane />
      <OrbitControls enableDamping enablePan={false} minDistance={3} maxDistance={20} />
      {IS_DEV && <Stats className="ml-[calc(50%-40px)]" />}
    </Canvas>
  )
}
