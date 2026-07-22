import { SplatMesh, SparkRenderer } from '@sparkjsdev/spark'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

import { CubeCamera, OrbitControls, Stats } from '@react-three/drei'

import { useEffect, useRef } from 'react'
import { Group, DoubleSide } from 'three'

import './Shaders/GlassSphereMaterial'

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
    <CubeCamera resolution={64} frames={1}>
      {(envMap) => (
        <group ref={groupRef} position={[0, -0.2, 0]}>
          <mesh scale={0.65}>
            <boxGeometry args={[0.24, 0.24, 0.24]} />

            <meshStandardMaterial color="#fff000" roughness={0.5} metalness={0} />
          </mesh>

          <mesh renderOrder={1}>
            <sphereGeometry args={[0.32, 24, 24]} />

            {/* @ts-expect-error Custom R3F material is registered via side-effect import */}
            <glassSphereMaterial
              envMap={envMap}
              useEnvMap={true}
              fresnelPower={1} // broad glow, unchanged
              rimWidth={0.8} // unchanged
              reflectionFresnelPower={8.0} // NEW — keeps reflections pinned to the true edge
              reflectionStrength={1}
              rimColor="#ffffff"
              opacity={0.85}
              transparent={true}
              depthTest={true}
              depthWrite={false}
              renderOrder={1}
              alphaTest={0.0}
            />
          </mesh>
        </group>
      )}
    </CubeCamera>
  )
}

function RadioDepthProxy() {
  return (
    <mesh position={[4, 0, 0]} rotation={[0, Math.PI / 2, 0]} renderOrder={0}>
      <planeGeometry args={[4, 4]} />

      <meshBasicMaterial
        transparent={true}
        opacity={0}
        depthWrite={true}
        depthTest
        colorWrite={false}
        // side={DoubleSide}
      />
    </mesh>
  )
}

function RadioOfLuxembourgScene() {
  const { scene, gl } = useThree()

  useEffect(() => {
    const sparkRenderer = new SparkRenderer({
      renderer: gl,

      // Spark 2.x: depth behavior is configured directly on the renderer.
      transparent: true,
      depthTest: true,
    })

    const splat = new SplatMesh({
      url: '/gs/radio_of_luxembourg.sog',
    })

    splat.rotation.x = Math.PI
    splat.position.set(6, -2, 3)

    splat.updateMatrix()
    splat.matrixAutoUpdate = false

    scene.add(sparkRenderer)
    scene.add(splat)

    void Promise.resolve(splat.initialized).catch(console.error)

    return () => {
      scene.remove(splat)
      scene.remove(sparkRenderer)

      splat.dispose()
      sparkRenderer.dispose()
    }
  }, [scene, gl])

  return (
    <>
      <ambientLight intensity={0.45} />

      <directionalLight position={[1.5, 2, 2]} intensity={1.1} color="#fff6df" />

      <RadioDepthProxy />

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
      dpr={Math.min(window.devicePixelRatio, isFirefox ? 1.25 : 1.5)}
      gl={{
        powerPreference: 'high-performance',

        antialias: true,

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
