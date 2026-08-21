import { forwardRef, useMemo, useRef, useState, useLayoutEffect } from 'react'
import { useApp } from '@playcanvas/react/hooks'
import { Application, Entity } from '@playcanvas/react'
import { Camera, GSplat, Render, Script, Light } from '@playcanvas/react/components'
import { useSplat } from '@playcanvas/react/hooks'
import {
  Vec2,
  Vec3,
  ShaderMaterial,
  StandardMaterial,
  BLEND_NORMAL,
  SEMANTIC_POSITION,
  SEMANTIC_NORMAL,
  Layer,
  Script as PcScript,
} from 'playcanvas'
import { DevTransformWrapper } from '../DevTransformWrapper'

// @ts-expect-error No type definitions for this script
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs'

const SPLAT_POSITION: [number, number, number] = [6, -2, 3]
const CAMERA_POSITION: [number, number, number] = [0, 0, 2.2]
const GLASS_SPHERE_POSITION: [number, number, number] = [-5.5, -0.8, -2.5]
const GLASS_SPHERE_ROTATION: [number, number, number] = [0, 0, 0]
const GLASS_SPHERE_SCALE: [number, number, number] = [0.3, 0.3, 0.3]
const INNER_BOX_SCALE: [number, number, number] = [0.3, 0.3, 0.3]
const WALL_INITIAL_POSITION: [number, number, number] = [4.3, -0.4, -3.7]
const WALL_INITIAL_ROTATION: [number, number, number] = [91.4, 89.8, 0]
const WALL_INITIAL_SCALE: [number, number, number] = [8.7, 1, 5.7]

// A row of spheres along Z, 0.5 apart. Computed once at module scope (not on
// every render) since it only depends on the constants above — each tuple is
// a stable reference DevTransformWrapper can safely freeze on mount.
const GLASS_SPHERE_COUNT = 7
const GLASS_SPHERE_Z_STEP = 0.5
const GLASS_SPHERE_POSITIONS: [number, number, number][] = Array.from(
  { length: GLASS_SPHERE_COUNT },
  (_, i) => [
    GLASS_SPHERE_POSITION[0],
    GLASS_SPHERE_POSITION[1],
    GLASS_SPHERE_POSITION[2] + i * GLASS_SPHERE_Z_STEP,
  ],
)

// ── Rotation scripts ─────────────────────────────────────────────
// @playcanvas/react's <Script> component requires an actual `class extends
// Script` — a plain object with an `update` method silently fails its prop
// validation and falls back to a no-op script, so these must be real
// subclasses, not object literals.
class SphereRotator extends PcScript {
  static scriptName = 'sphereRotator'

  update(dt: number) {
    this.entity.rotate(0, 45 * dt, 0)
  }
}

class BoxRotator extends PcScript {
  static scriptName = 'boxRotator'

  update(dt: number) {
    // Continuous 360° spin around the vertical axis, so every side is shown in turn.
    this.entity.rotate(0, 90 * dt, 0)
  }
}

interface GlassSphereWithBoxProps {
  name: string
  camera: any
  position: [number, number, number]
  glassMaterial: any
  boxMaterial: any
  onGizmoDragStart?: () => void
  onTransformChange?: () => void
}

// One glass sphere + its spinning inner box. Extracted so the 7-instance row
// below shares a single definition instead of repeating the same JSX (and
// the same two materials — all instances bind the same ShaderMaterial/
// StandardMaterial GPU resources rather than each allocating their own).
const GlassSphereWithBox = forwardRef<any, GlassSphereWithBoxProps>(function GlassSphereWithBox(
  { name, camera, position, glassMaterial, boxMaterial, onGizmoDragStart, onTransformChange },
  ref,
) {
  return (
    <DevTransformWrapper
      ref={ref}
      name={name}
      camera={camera}
      position={position}
      rotation={GLASS_SPHERE_ROTATION}
      scale={GLASS_SPHERE_SCALE}
      onGizmoDragStart={onGizmoDragStart}
      onTransformChange={onTransformChange}
    >
      <Render type="sphere" material={glassMaterial} />
      <Script script={SphereRotator} />

      <Entity name="InnerBox" scale={INNER_BOX_SCALE}>
        <Render type="box" material={boxMaterial} />
        <Script script={BoxRotator} />
      </Entity>
    </DevTransformWrapper>
  )
})

function RadioOfLuxembourgScene() {
  const { asset } = useSplat('/gs/radio_of_luxembourg.sog')
  const app = useApp()

  // State (not a ref) because it's also read directly during render below to
  // pass the camera into <DevTransformWrapper> — a plain ref wouldn't trigger
  // the re-render needed to pick that up once the camera entity mounts.
  const [cameraEntity, setCameraEntity] = useState<any>(null)
  const sphereEntityRefs = useRef<any[]>([])
  const wallEntityRef = useRef<any>(null)
  const cameraControlsRef = useRef<any>(null)

  // The orbit camera-controls script reads raw mouse movement off the same canvas
  // independently of any gizmo, so without pausing it, it orbits the camera for the
  // same drag that's meant to be moving a gizmo handle. Movement during the drag
  // keeps accumulating in the script's internal input source even while disabled
  // (it only stops being *read*, not *recorded*), so the backlog has to be drained
  // before re-enabling, or the whole drag's worth of movement applies as one jump.
  const pauseCameraControls = () => {
    if (cameraControlsRef.current) {
      cameraControlsRef.current.enabled = false
    }
  }
  const resumeCameraControls = () => {
    const controls = cameraControlsRef.current
    if (controls) {
      controls._desktopInput?.read?.()
      controls.enabled = true
    }
  }

  // ── Wall-occluder dummy. The real wall is splat geometry with no accessible
  //     collision/depth data (see the effect below for why), so this plane is
  //     a stand-in the sphere is tested against — position/rotate/scale it via
  //     the "Wall Occluder" dev-mode gizmo (DevTransformWrapper, below) until
  //     it sits exactly inside the real dividing wall in the splat scene. It's
  //     permanently invisible in normal mode; dev mode makes it visible so it
  //     can be lined up. The occlusion test reads wallEntityRef's live
  //     transform every frame (see pickSide below) rather than a stored
  //     Euler-angle snapshot — WALL_INITIAL_ROTATION's ~90° Y-pitch sits right
  //     next to gimbal lock, where reconstructing a quaternion from stored
  //     Euler angles amplifies tiny numeric noise into a meaningfully wrong
  //     orientation, corrupting the rectangle test.
  const wallOccluderMaterial = useMemo(() => {
    if (!app) return undefined
    const mat = new StandardMaterial()
    mat.opacity = 0
    mat.blendType = BLEND_NORMAL
    // Purely a visual/alignment aid — the occlusion check is plain JS math
    // reading the wall entity's live transform, not the GPU depth buffer —
    // so this must never write depth, or a permanently-mounted invisible
    // plane sitting inside the real wall could silently punch holes in
    // splat compositing.
    mat.depthWrite = false
    mat.update()
    return mat
  }, [app])

  const blueBoxMaterial = useMemo(() => {
    if (!app) return undefined
    const mat = new StandardMaterial()
    mat.diffuse.set(0.15, 0.35, 0.95)
    mat.update()
    return mat
  }, [app])

  const glassMaterial = useMemo(() => {
    if (!app) return undefined

    const mat = new ShaderMaterial({
      uniqueName: 'GlassFresnel360',
      attributes: {
        aPosition: SEMANTIC_POSITION,
        aNormal: SEMANTIC_NORMAL,
      },
      vertexGLSL: `
                attribute vec3 aPosition;
                attribute vec3 aNormal;
                uniform mat4 matrix_model;
                uniform mat4 matrix_viewProjection;
                varying vec3 vNormal;
                varying vec3 vPositionW;

                void main() {
                    vec4 worldPos = matrix_model * vec4(aPosition, 1.0);
                    vPositionW = worldPos.xyz;
                    vNormal = mat3(matrix_model) * aNormal;
                    gl_Position = matrix_viewProjection * worldPos;
                }
            `,
      fragmentGLSL: `
                precision highp float;
                varying vec3 vNormal;
                varying vec3 vPositionW;
                uniform vec3 view_position;
                uniform float uFresnelPower;
                uniform float uEdgeIntensity;
                uniform vec3 uCenterColor;
                uniform vec3 uEdgeColor;

                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(view_position - vPositionW);

                    // ← CHANGED: abs() makes the effect symmetric for back faces too
                    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), uFresnelPower);
                    vec3 color = mix(uCenterColor, uEdgeColor, fresnel);

                    // Subtle specular highlight
                    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
                    vec3 halfDir = normalize(viewDir + lightDir);
                    float spec = pow(max(dot(normal, halfDir), 0.0), 256.0);
                    color += vec3(spec * 0.5);

                    float alpha = fresnel * uEdgeIntensity;

                    // Discard fully-transparent center
                    if (alpha < 0.02) discard;

                    gl_FragColor = vec4(color, alpha);
                }
            `,
    })

    mat.blendType = BLEND_NORMAL
    mat.depthWrite = false
    mat.cull = 0 // ← CHANGED: CULLFACE_NONE (0) so both sides render

    mat.setParameter('uFresnelPower', 1.8)
    mat.setParameter('uEdgeIntensity', 0.85)
    mat.setParameter('uCenterColor', [0.53, 0.8, 1.0])
    mat.setParameter('uEdgeColor', [1.0, 1.0, 1.0])

    mat.update()
    return mat
  }, [app])

  // ── Keep the sphere visible and correctly composited against the splat
  //     cloud as the camera orbits.
  //
  //     Both the sphere and the splats default into World's transparent
  //     sub-layer, which sorts back-to-front at whole-object granularity —
  //     comparing "sphere center distance" against "splat cloud distance" as
  //     two single objects, not per-pixel. Because the splat cloud is a
  //     dense, room-covering point cloud, losing that sort swaps the ENTIRE
  //     splat cloud in front of the sphere, hiding it completely for about
  //     half of any camera orbit (a hard on/off flip, not a gradual reveal).
  //
  //     Fix: pull the sphere into its own "GlassInFront" layer pinned right
  //     after World's transparent sub-layer, so it always composites on top
  //     of the splats via a fixed layer-pass order rather than a per-object
  //     distance sort — no flip is possible. (An earlier version also tried
  //     a "GlassBehind" layer picked by comparing camera distance to the
  //     sphere vs. to the wall, meant to let the splats cover the sphere when
  //     it should be behind them — but the camera orbits close to the splat
  //     cloud while the sphere sits far off to the side, so that comparison
  //     almost always picked "behind," burying the sphere under the splats'
  //     blanket density regardless of camera angle. Removed — see the note
  //     in pickSide below for how "should be hidden" is decided instead.)
  //
  //     Real per-pixel occlusion by an actual wall between the camera and
  //     the sphere isn't possible via depth testing — GSplat fragments
  //     depth-test but never depth-write, so there's no depth buffer content
  //     from the splats to test the sphere against. Instead, a plain math
  //     plane (positioned via the "Wall Occluder" dev gizmo) stands in for
  //     the real wall, read live off its entity every frame — but it's
  //     tested as a bounded rectangle (its actual width/height), not an
  //     infinite plane: the camera-sphere line only counts as blocked if it
  //     crosses the plane *and* that crossing point falls within the wall's
  //     panel. An infinite-plane test would otherwise split the entire scene
  //     into two halves off the wall's own edges, hiding the sphere even
  //     when the camera can clearly see around the wall's actual extent.
  useLayoutEffect(() => {
    if (!app || !glassMaterial || !cameraEntity) {
      return
    }

    const wallNormal = new Vec3()
    const wallRight = new Vec3()
    const wallForward = new Vec3()
    const wallToCam = new Vec3()
    const wallToSphere = new Vec3()
    const crossingLocal = new Vec3()
    const UP = new Vec3(0, 1, 0)
    const RIGHT = new Vec3(1, 0, 0)
    const FORWARD = new Vec3(0, 0, 1)

    let glassInFrontLayer: InstanceType<typeof Layer> | null = null

    const setupLayers = () => {
      if (glassInFrontLayer) return true

      const layers = app.scene.layers
      const worldLayer = layers.getLayerByName('World')
      let worldTransparentIndex = -1
      if (worldLayer) {
        for (let i = 0; i < layers.layerList.length; i++) {
          if (layers.layerList[i] === worldLayer && layers.subLayerList[i] === true) {
            worldTransparentIndex = i
            break
          }
        }
      }

      glassInFrontLayer = layers.getLayerByName('GlassInFront')
      if (!glassInFrontLayer) {
        glassInFrontLayer = new Layer({ name: 'GlassInFront' })
        if (worldTransparentIndex !== -1) {
          layers.insertTransparent(glassInFrontLayer, worldTransparentIndex + 1)
        } else {
          layers.pushTransparent(glassInFrontLayer)
        }
      }

      const cam = cameraEntity.camera
      if (cam) {
        const ids = cam.layers ?? []
        if (!ids.includes(glassInFrontLayer.id)) {
          cam.layers = [...ids, glassInFrontLayer.id]
        }
      }

      return true
    }

    const pickSide = () => {
      if (!setupLayers() || !glassInFrontLayer) return

      const camPos = cameraEntity.getPosition()
      const wallEntity = wallEntityRef.current

      // Wall axes/camera-side are the same for every sphere this frame, so
      // they're computed once here rather than per-instance inside the loop
      // below — with 7 spheres that's a ~7x reduction in the per-frame
      // transformVector/dot work for this part of the check.
      let wallReady = false
      let wallPosX = 0
      let wallPosY = 0
      let wallPosZ = 0
      let wallHalfWidth = 0
      let wallHalfHeight = 0
      let camSide = 0
      if (wallEntity) {
        const wallPos = wallEntity.getPosition()
        const wallScale = wallEntity.getLocalScale()
        const wallRot = wallEntity.getRotation()
        wallRot.transformVector(UP, wallNormal)
        wallRot.transformVector(RIGHT, wallRight)
        wallRot.transformVector(FORWARD, wallForward)
        wallPosX = wallPos.x
        wallPosY = wallPos.y
        wallPosZ = wallPos.z
        wallHalfWidth = wallScale.x / 2
        wallHalfHeight = wallScale.z / 2
        wallToCam.set(camPos.x - wallPosX, camPos.y - wallPosY, camPos.z - wallPosZ)
        camSide = wallToCam.dot(wallNormal)
        wallReady = true
      }

      for (const sphereEntity of sphereEntityRefs.current) {
        if (!sphereEntity) continue
        const renderComp = sphereEntity.render
        if (!renderComp) continue

        // Wall occlusion: hide this sphere only if the camera-sphere line
        // crosses the plane *within the wall's actual panel bounds*. Reads
        // the wall entity's live world transform every frame instead of a
        // stored Euler-angle snapshot — see the comment above
        // wallOccluderMaterial for why the Euler round-trip was itself a bug.
        let occluded = false
        if (wallReady) {
          const spherePos = sphereEntity.getPosition()
          wallToSphere.set(spherePos.x - wallPosX, spherePos.y - wallPosY, spherePos.z - wallPosZ)
          const sphereSide = wallToSphere.dot(wallNormal)

          if (camSide * sphereSide < 0) {
            // The segment crosses the plane's infinite extension — find
            // exactly where, then check the point falls inside the wall's
            // rectangle.
            const t = camSide / (camSide - sphereSide)
            crossingLocal.set(
              wallToCam.x + t * (wallToSphere.x - wallToCam.x),
              wallToCam.y + t * (wallToSphere.y - wallToCam.y),
              wallToCam.z + t * (wallToSphere.z - wallToCam.z),
            )
            const localX = crossingLocal.dot(wallRight)
            const localY = crossingLocal.dot(wallForward)
            occluded = Math.abs(localX) <= wallHalfWidth && Math.abs(localY) <= wallHalfHeight
          }
        }

        renderComp.enabled = !occluded
        if (occluded) continue

        // The wall test above is the scene's only real obstruction, so once
        // a sphere clears it, it always belongs in front of the splat
        // cloud's general volumetric density — GlassInFront is a dedicated
        // layer pass pinned after World's transparent sub-layer, so this is
        // a fixed compositing order, not a per-object distance sort (which
        // is what caused the original 180°-orbit flip). A distance-based
        // front/behind pick was tried here previously, but the camera
        // orbits close to the splat cloud while the spheres sit far off to
        // the side, so "distance to sphere" was almost always greater than
        // "distance to wall" — permanently routing the spheres behind the
        // splats' blanket density and hiding them regardless of camera angle.
        if (renderComp.layers[0] !== glassInFrontLayer.id) {
          renderComp.layers = [glassInFrontLayer.id]
        }
      }
    }

    app.on('update', pickSide)
    return () => {
      app.off('update', pickSide)
    }
  }, [app, glassMaterial, cameraEntity])

  return (
    <>
      <Entity name="light" rotation={[45, 45, 0]}>
        <Light type="directional" intensity={1.5} />
      </Entity>

      <Entity ref={setCameraEntity} name="camera" position={CAMERA_POSITION}>
        <Camera fov={22} clearColor="#000000" />
        <Script
          ref={cameraControlsRef}
          script={CameraControls}
          focusPoint={new Vec3(...SPLAT_POSITION)}
          // Free-fly mode: WASD/arrow keys move, mouse look rotates — no
          // orbit, so pitch/yaw aren't clamped to a downward-looking range
          // the way the old orbit tuning had them.
          pitchRange={new Vec2(-89, 89)}
          yawRange={new Vec2(-360, 360)}
          rotateSpeed={0.2}
          rotateDamping={0.98}
          moveSpeed={4}
          moveFastSpeed={10}
          moveSlowSpeed={1.5}
          enableOrbit={false}
          enableFly={true}
        />
      </Entity>

      {GLASS_SPHERE_POSITIONS.map((position, i) => (
        <GlassSphereWithBox
          key={i}
          ref={(el: any) => {
            sphereEntityRefs.current[i] = el
          }}
          name={`Sphere ${i + 1}`}
          camera={cameraEntity?.camera}
          position={position}
          glassMaterial={glassMaterial}
          boxMaterial={blueBoxMaterial}
          onGizmoDragStart={pauseCameraControls}
          onTransformChange={resumeCameraControls}
        />
      ))}

      {asset && (
        <Entity name="radio-of-luxembourg" position={SPLAT_POSITION} rotation={[180, 0, 0]}>
          <GSplat asset={asset} />
        </Entity>
      )}

      {wallOccluderMaterial && (
        <DevTransformWrapper
          ref={wallEntityRef}
          name="Wall Occluder"
          camera={cameraEntity?.camera}
          position={WALL_INITIAL_POSITION}
          rotation={WALL_INITIAL_ROTATION}
          scale={WALL_INITIAL_SCALE}
          onGizmoDragStart={pauseCameraControls}
          onTransformChange={resumeCameraControls}
        >
          <Render type="plane" material={wallOccluderMaterial} />
        </DevTransformWrapper>
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
