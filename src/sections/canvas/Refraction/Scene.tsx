import CylinderArray from './CylinderArray'
import ColorSphere from './ColorSphere'
import Lights from './Lights'

export default function Scene() {
  return (
    <>
      <Lights />

      <ColorSphere position={[0, 0, -50]} scale={[30, 30, 30]} color="#0B29FF" />
      <ColorSphere position={[-3.5, 0, -50]} scale={[30, 30, 30]} color="#82979D" />
      <ColorSphere position={[3, 1, -50]} scale={[30, 30, 30]} color="#254051" />
      <ColorSphere position={[5, 1, -50]} scale={[30, 30, 30]} color="#FFB9C0" />
      <ColorSphere position={[5, 3, -50]} scale={[30, 30, 30]} color="#FFFFFF" />

      <CylinderArray count={80} spacing={0.35} />
    </>
  )
}
