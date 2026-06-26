import { TransformControls } from '@react-three/drei'
import { MeshStandardMaterialProps } from '@react-three/fiber'
import { useState, useCallback } from 'react'
import { Mesh } from 'three'
import { useControls } from 'leva'

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
  const [mesh, setMesh] = useState<Mesh | null>(null)

  const { showControls, mode } = useControls({
    showControls: {
      value: true,
      label: 'Show Transform Controls',
    },
    mode: {
      value: 'translate',
      options: ['translate', 'scale'],
      label: 'Gizmo Mode',
    },
  })

  const refCallback = useCallback((node: Mesh | null) => {
    if (node) setMesh(node)
  }, [])

  return (
    <>
      <mesh ref={refCallback} position={position} scale={scale}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
      </mesh>

      {mesh && showControls && (
        <TransformControls object={mesh} mode={mode as 'translate' | 'scale'} />
      )}
    </>
  )
}
