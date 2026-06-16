import CylinderArray from './CylinderArray'
import ColorSphere from './ColorSphere'
import Lights from './Lights'

export default function Scene() {
  return (
    <>
      <Lights />

      <ColorSphere position={[0, 0, -2.5]} scale={[3, 3, 3]} />
      <ColorSphere position={[-3.5, 0, -2.5]} scale={[2, 2, 2]} color="#3366ff" />
      <ColorSphere position={[3, 1, -2.5]} scale={[1.5, 1.5, 1.5]} color="orange" />

      <CylinderArray count={20} spacing={0.75} />
    </>
  )
}
