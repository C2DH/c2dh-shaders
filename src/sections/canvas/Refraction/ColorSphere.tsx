import { MeshStandardMaterialProps } from '@react-three/fiber'

type Props = {
  position?: [number, number, number]
  scale?: [number, number, number]
  color?: MeshStandardMaterialProps['color']
}

export default function ColorSphere({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  color = '#ff3366',
}: Props) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[0.8, 64, 64]} />
      <meshStandardMaterial color={color} metalness={0.2} roughness={0.1} />
    </mesh>
  )
}
