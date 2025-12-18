import { FC, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    FNF_cube_web: THREE.Mesh
    Front_lid_web: THREE.Mesh
    Text_web: THREE.Mesh
  }
  materials: {
    [key: string]: THREE.Material
  }
}

const FnrCubeModel: FC<{ scale?: number }> = ({ scale }) => {
  const { nodes, materials } = useGLTF('./glb/FNR_Cube.glb') as GLTFResult

  return (
    <group dispose={null} scale={scale} position={[0, -0.5, 0]} rotation={[0, Math.PI / 1, 0]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.FNF_cube_web.geometry}
        material={materials['bronze.001']}
        position={[0.08, 2.607, -0.112]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Front_lid_web.geometry}
        material={materials['Black.001']}
        position={[0.02, 3.517, -1.846]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Text_web.geometry}
        material={materials.white}
        position={[-0.063, 1.444, -2.732]}
        rotation={[Math.PI / 2, 0, -Math.PI]}
      />
    </group>
  )
}

useGLTF.preload('./glb/FNR_Cube.glb')

const FnrAward: FC = () => {
  return (
    <Canvas camera={{ position: [0, 1, 3], fov: 45 }} shadows>
      <color attach="background" args={['black']} />
      {/* <ambientLight intensity={0.5} /> */}
      <pointLight
        intensity={20}
        position={[3, 3, 2]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001} // tweak between -0.0001 and -0.005
      />

      <Suspense fallback={null}>
        <FnrCubeModel scale={0.2} />
        <Environment
          preset="apartment"
          environmentIntensity={0.7}
          environmentRotation={[Math.PI / 0.1, 0, 0]}
        />
      </Suspense>

      <OrbitControls />
    </Canvas>
  )
}

export default FnrAward
