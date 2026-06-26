import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { InstancedMesh } from 'three'
import { useRoundedBoxGeometry } from './RoundedBoxGeometry'
import GlassCylinderMaterial from './GlassCylinderMaterial'

type Props = {
  count: number
  spacing: number
  shape?: 'cylinder' | 'box'
}

export default function ShapeArray({ count, spacing }: Props) {
  const meshRef = useRef<InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const geometry = useRoundedBoxGeometry({
    size: 0.4,
    radius: 0.05,
    smoothness: 3,
    height: 20,
  })

  useEffect(() => {
    if (!meshRef.current) return

    for (let i = 0; i < count; i++) {
      dummy.position.set((i - (count - 1) / 2) * spacing, 0, 0)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.computeBoundingSphere()
  }, [count, spacing, dummy])

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
      <GlassCylinderMaterial />
    </instancedMesh>
  )
}
