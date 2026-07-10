import { MeshTransmissionMaterial } from '@react-three/drei'

export default function GlassCylinderMaterial() {
  return (
    <MeshTransmissionMaterial
      thickness={4.0} // 6.0 was extreme, contributes to shader cost too
      transmission={1.2} // must be ≤1 — the shader clamps this internally anyway
      roughness={0.4} // lower roughness = less blur sampling needed
      ior={1.5}
      chromaticAberration={1} // default is 0.03 — 60 was ~2000x default, no perf benefit, just artifacts
      distortion={0}
      distortionScale={0} // default is 0.5 — 80 was pushing sample coords way out of range
      temporalDistortion={0} // see note below
      resolution={128} // <-- biggest win: was fullscreen, now a fixed small buffer
      samples={1} // <-- second biggest win: was 6
      backside={false}
    />
  )
}
