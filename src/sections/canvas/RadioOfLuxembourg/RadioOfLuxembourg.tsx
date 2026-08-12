import { Application, Entity } from '@playcanvas/react'
import { Camera, GSplat, Render, Script, Light } from '@playcanvas/react/components'
import { useSplat, useMaterial } from '@playcanvas/react/hooks'
import { Vec2, Vec3 } from 'playcanvas'

// @ts-expect-error No type definitions for this script
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs'

const SPLAT_POSITION: [number, number, number] = [0, 0, 0]
const CAMERA_POSITION: [number, number, number] = [0, 0, 0]

function RadioOfLuxembourgScene() {
  const { asset } = useSplat('/gs/radio_of_luxembourg.sog')
  const sphereMaterial = useMaterial({ diffuse: '#ff3333', metalness: 0.3, gloss: 0.4 })

  return (
    <>
      {/* Lighting so the sphere is visible */}
      <Entity name="light" rotation={[45, 45, 0]}>
        <Light type="directional" intensity={1.5} />
      </Entity>

      <Entity name="camera" position={CAMERA_POSITION}>
        <Camera fov={50} clearColor="#000000" />
        <Script
          script={CameraControls}
          focusPoint={new Vec3(...SPLAT_POSITION)}
          zoomRange={new Vec2(0.5, 40)}
          pitchRange={new Vec2(-90, -5)}
          yawRange={new Vec2(-360, 360)}
          rotateSpeed={0.2}
          zoomSpeed={0.001}
          rotateDamping={0.98}
          zoomDamping={0.98}
          enableOrbit={true}
          enableFly={false}
          enablePan={true}
        />
      </Entity>

      {/* Mesh sphere placed inside the splat scene */}
      <Entity name="sphere" position={[-4, 2, -2]} scale={[0.25, 0.25, 0.25]}>
        <Render type="sphere" material={sphereMaterial} />
      </Entity>

      {asset && (
        <Entity name="radio-of-luxembourg" position={SPLAT_POSITION} rotation={[180, 0, 0]}>
          <GSplat asset={asset} />
        </Entity>
      )}
    </>
  )
}

export function RadioOfLuxembourg() {
  return (
    <Application
      graphicsDeviceOptions={{
        antialias: false,
        powerPreference: 'high-performance',
      }}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <RadioOfLuxembourgScene />
    </Application>
  )
}
