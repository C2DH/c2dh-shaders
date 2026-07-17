import { SplatMesh, SparkRenderer } from '@sparkjsdev/spark'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CubeCamera, MeshRefractionMaterial, OrbitControls, Stats } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import { FrontSide, Group } from 'three'

const IS_DEV = import.meta.env.DEV
const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox')

function ClassicMeshOverlay() {
  const groupRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return

    const t = clock.elapsedTime

    groupRef.current.rotation.y = t * 0.3
    groupRef.current.rotation.x = t * 0.1
  })

  return (
    <CubeCamera resolution={512} frames={Infinity}>
      {(envMap) => (
        <group ref={groupRef} position={[0, -0.2, 0]}>
          <mesh scale={0.65}>
            <boxGeometry args={[0.24, 0.24, 0.24]} />
            <meshPhysicalMaterial
              color="#f8d56a"
              roughness={0.25}
              metalness={0.05}
              clearcoat={0.35}
              clearcoatRoughness={0.2}
            />
          </mesh>
          <mesh renderOrder={2}>
            <sphereGeometry args={[0.32, 32, 32]} />
            <MeshRefractionMaterial
              envMap={envMap}
              color="#dff5ff"
              ior={1.18}
              bounces={2}
              fresnel={1.5}
              aberrationStrength={0.01}
              side={FrontSide}
              transparent
              opacity={0.3}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </CubeCamera>
  )
}

function RadioOfLuxembourgScene() {
  const { scene, gl } = useThree()

  const sparkRenderer = useMemo(() => {
    return new SparkRenderer({
      renderer: gl,
      view: {
        sort32: !isFirefox,
      },
    })
  }, [gl])

  const splat = useMemo(() => {
    const mesh = new SplatMesh({
      url: '/gs/radio_of_luxembourg.sog',
    })

    mesh.rotation.x = Math.PI
    mesh.position.set(6, -2, 3)

    // Static transform
    mesh.updateMatrix()
    mesh.matrixAutoUpdate = false

    return mesh
  }, [])

  useEffect(() => {
    scene.add(sparkRenderer)
    scene.add(splat)

    void Promise.resolve(splat.initialized).catch(console.error)

    return () => {
      scene.remove(splat)
      scene.remove(sparkRenderer)

      splat.dispose()
    }
  }, [scene, sparkRenderer, splat])

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[1.5, 2, 2]} intensity={1.1} color="#fff6df" />

      <ClassicMeshOverlay />
    </>
  )
}

export function RadioOfLuxembourg() {
  return (
    <Canvas
      camera={{
        position: [0, 0, 2.2],
        fov: 22,
      }}
      dpr={Math.min(window.devicePixelRatio, 1.25)}
      gl={{
        powerPreference: 'high-performance',
        antialias: false,
        alpha: false,
        stencil: false,
        preserveDrawingBuffer: false,
        logarithmicDepthBuffer: false,
      }}
    >
      <color attach="background" args={['black']} />

      <RadioOfLuxembourgScene />

      <OrbitControls enableDamping={false} makeDefault />

      {IS_DEV && <Stats className="ml-[calc(50%-40px)]" />}
    </Canvas>
  )
}
