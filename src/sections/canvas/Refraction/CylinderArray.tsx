import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { InstancedMesh } from 'three'
import GlassCylinderMaterial from './GlassCylinderMaterial'

type Props = {
  count: number
  spacing: number
}

export default function CylinderArray({ count, spacing }: Props) {
  const meshRef = useRef<InstancedMesh>(null!)

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useMemo(() => {
    if (!meshRef.current) return

    for (let i = 0; i < count; i++) {
      const x = (i - count / 2) * spacing

      dummy.position.set(x, 0, 0)
      dummy.updateMatrix()

      meshRef.current.setMatrixAt(i, dummy.matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  }, [count, spacing, dummy])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <cylinderGeometry args={[0.4, 0.4, 20, 64]} />

      {/* IMPORTANT: must be instance-compatible material */}
      <GlassCylinderMaterial />
    </instancedMesh>
  )
}
