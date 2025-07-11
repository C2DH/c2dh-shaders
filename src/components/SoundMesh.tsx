import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'
import * as THREE from 'three'

// Define the GLTF structure based on your model
interface GLTFResult {
  nodes: {
    soundMesh: THREE.Mesh
  }
  materials: {
    material: THREE.Material
  }
}

// Define props interface extending GroupProps for three.js group properties
interface ModelProps extends GroupProps {
  // Add any additional props you might need
}

export function SoundMesh(props: ModelProps) {
  const { nodes, materials } = useGLTF('/soundMesh.glb') as unknown as GLTFResult
  
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.soundMesh.geometry}
        material={materials.material}
      />
    </group>
  )
}

useGLTF.preload('/soundMesh.glb')