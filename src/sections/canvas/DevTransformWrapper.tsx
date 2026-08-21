import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useControls } from 'leva'
import { useApp } from '@playcanvas/react/hooks'
import { Entity } from '@playcanvas/react'
import {
  StandardMaterial,
  Gizmo as PcGizmoClass,
  TransformGizmo,
  TranslateGizmo,
  RotateGizmo,
  ScaleGizmo,
  type CameraComponent,
  type Entity as PcEntity,
  type Material,
  type MeshInstance,
  type RenderComponent,
} from 'playcanvas'

type Vec3Tuple = [number, number, number]
type GizmoMode = 'translate' | 'rotate' | 'scale'

export type DevTransform = {
  position: Vec3Tuple
  rotation: Vec3Tuple
  scale: Vec3Tuple
}

const roundTuple = ([x, y, z]: Vec3Tuple): Vec3Tuple => [
  Math.round(x * 10) / 10,
  Math.round(y * 10) / 10,
  Math.round(z * 10) / 10,
]

interface DevTransformWrapperProps {
  /** Leva folder label, entity name, and console-log label. Must be unique per instance. */
  name: string
  /** The camera the gizmo renders/projects through. */
  camera: CameraComponent | null | undefined
  /** Initial transform — read once on mount. After that the gizmo owns it; changing these
   *  props later will NOT move an already-mounted entity (drag it with the gizmo instead). */
  position?: Vec3Tuple
  rotation?: Vec3Tuple
  scale?: Vec3Tuple
  /** Material swapped onto every mesh instance in the subtree while dev mode is on, so
   *  invisible/transparent proxies (collision volumes, occluders, etc.) become visible.
   *  Defaults to a plain opaque grey StandardMaterial. */
  devMaterial?: Material
  /** Fires the instant a gizmo handle is grabbed (before any dragging happens). Use this to
   *  pause anything else that reacts to the same pointer drag — e.g. an orbit camera-controls
   *  script, which otherwise fights the gizmo for the same mouse movement (see DevGizmo below
   *  for why this can't just be done with onTransformChange alone). */
  onGizmoDragStart?: () => void
  /** Fires whenever the gizmo commits a change (drag release), with the entity's current
   *  local position/rotation/scale. Use this to feed the live transform elsewhere (e.g. an
   *  occlusion check) instead of driving it back through the position/rotation/scale props. */
  onTransformChange?: (transform: DevTransform) => void
  children?: ReactNode
}

/**
 * Wraps arbitrary 3D content (any children renderable inside a PlayCanvas <Entity>) with a
 * dev-mode transform gizmo, so its position/rotation/scale can be tuned visually in the
 * browser instead of by guessing coordinates. Toggle "Dev Mode" in the Leva panel (named after
 * `name`) to show the gizmo and force a visible material over the wrapped content; toggle it
 * off to return to normal rendering with the gizmo's final transform kept in place.
 */
export const DevTransformWrapper = forwardRef<PcEntity, DevTransformWrapperProps>(function DevTransformWrapper(
  { name, camera, position, rotation, scale, devMaterial, onGizmoDragStart, onTransformChange, children },
  forwardedRef,
) {
  const app = useApp()
  const [entity, setEntity] = useState<PcEntity | null>(null)
  // The exposed ref can genuinely be null before the wrapped <Entity> mounts — same as
  // @playcanvas/react's own <Entity ref> — consumers already guard for that.
  useImperativeHandle(forwardedRef, () => entity as PcEntity, [entity])

  // Frozen on first render — after mount, the gizmo (not React) owns the transform. Passing a
  // fresh array here on every re-render would make @playcanvas/react's <Entity> snap the
  // entity straight back to it and silently undo whatever the gizmo just did.
  const initialPosition = useRef<Vec3Tuple>(position ?? [0, 0, 0]).current
  const initialRotation = useRef<Vec3Tuple>(rotation ?? [0, 0, 0]).current
  const initialScale = useRef<Vec3Tuple>(scale ?? [1, 1, 1]).current

  const { devMode, gizmoMode } = useControls(name, {
    devMode: { value: false, label: 'Dev Mode' },
    gizmoMode: { value: 'translate', options: ['translate', 'rotate', 'scale'], label: 'Gizmo Mode' },
  })

  const fallbackDevMaterial = useMemo(() => {
    if (!app) return undefined
    const mat = new StandardMaterial()
    mat.diffuse.set(0.6, 0.65, 0.7)
    mat.opacity = 1
    mat.update()
    return mat
  }, [app])

  const devMaterialToUse = devMaterial ?? fallbackDevMaterial

  // Swap every mesh instance under this entity onto the dev material while Dev Mode is on, so
  // invisible/transparent wrapped content (like an occluder proxy) shows its true proportions.
  // Content added asynchronously (e.g. a <Gltf> that's still loading) is picked up on later
  // frames via the 'update' scan below, then everything is restored on the way out.
  useLayoutEffect(() => {
    if (!devMode || !entity || !app || !devMaterialToUse) return

    const originalMaterials = new Map<MeshInstance, Material | null>()

    const scanAndOverride = () => {
      const renderComponents = entity.findComponents('render') as RenderComponent[]
      renderComponents.forEach((rc) => {
        rc.meshInstances.forEach((mi) => {
          if (!originalMaterials.has(mi)) {
            originalMaterials.set(mi, mi.material)
            mi.material = devMaterialToUse
          }
        })
      })
    }

    scanAndOverride()
    app.on('update', scanAndOverride)

    return () => {
      app.off('update', scanAndOverride)
      originalMaterials.forEach((mat, mi) => {
        if (mat) mi.material = mat
      })
    }
  }, [devMode, entity, app, devMaterialToUse])

  const handleGizmoCommit = () => {
    if (!entity) return
    const transform: DevTransform = {
      position: entity.getPosition().toArray() as Vec3Tuple,
      rotation: entity.getEulerAngles().toArray() as Vec3Tuple,
      scale: entity.getLocalScale().toArray() as Vec3Tuple,
    }
    // Logged rounded to one decimal so it's easy to read and paste elsewhere; the full-precision
    // transform is still what's passed to onTransformChange for anything that needs it exact.
    console.info(`[DevTransformWrapper:${name}]`, {
      position: roundTuple(transform.position),
      rotation: roundTuple(transform.rotation),
      scale: roundTuple(transform.scale),
    })
    onTransformChange?.(transform)
  }

  return (
    <>
      <Entity ref={setEntity} name={name} position={initialPosition} rotation={initialRotation} scale={initialScale}>
        {children}
      </Entity>

      {devMode && camera && entity && (
        <DevGizmo
          camera={camera}
          nodes={[entity]}
          mode={gizmoMode as GizmoMode}
          onDragStart={onGizmoDragStart}
          onDragEnd={handleGizmoCommit}
        />
      )}
    </>
  )
})

interface DevGizmoProps {
  camera: CameraComponent
  nodes: PcEntity[]
  mode: GizmoMode
  onDragStart?: () => void
  onDragEnd: () => void
}

/**
 * Renders the actual translate/rotate/scale handles. @playcanvas/react ships a <Gizmo>
 * component that does this too, but it only exposes a drag-end callback — and an orbit
 * camera-controls script (e.g. playcanvas/scripts/esm/camera-controls.mjs) reads raw pointer
 * movement off the same canvas independently of the gizmo, so it happily orbits the camera
 * for the exact same drag that's supposed to be moving the gizmo handle. The only way to stop
 * that is to pause the camera script for the duration of the drag, which needs a drag-START
 * signal too — TransformGizmo fires one ('transform:start'), but the library's wrapper doesn't
 * surface it. This is that same ~30-line wrapper, with the start event also hooked up.
 */
function DevGizmo({ camera, nodes, mode, onDragStart, onDragEnd }: DevGizmoProps) {
  const app = useApp()
  const layer = useMemo(() => PcGizmoClass.createLayer(app), [app])

  // Kept in refs (not deps) so the gizmo instance isn't torn down and recreated — and a drag
  // isn't interrupted mid-flight — just because a parent re-render passed new callbacks.
  const onDragStartRef = useRef(onDragStart)
  onDragStartRef.current = onDragStart
  const onDragEndRef = useRef(onDragEnd)
  onDragEndRef.current = onDragEnd

  useLayoutEffect(() => {
    let gizmo
    switch (mode) {
      case 'rotate':
        gizmo = new RotateGizmo(camera, layer)
        break
      case 'scale':
        gizmo = new ScaleGizmo(camera, layer)
        break
      default:
        gizmo = new TranslateGizmo(camera, layer)
        break
    }

    const handleStart = () => onDragStartRef.current?.()
    const handleEnd = () => onDragEndRef.current()
    gizmo.on(TransformGizmo.EVENT_TRANSFORMSTART, handleStart)
    gizmo.on(TransformGizmo.EVENT_TRANSFORMEND, handleEnd)

    gizmo.attach(nodes)

    return () => {
      gizmo.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, layer, mode])

  return null
}
