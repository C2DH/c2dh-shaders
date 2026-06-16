import { MeshTransmissionMaterial } from '@react-three/drei'

export default function GlassCylinderMaterial() {
  return (
    <MeshTransmissionMaterial
      thickness={2.0}
      transmission={1}
      roughness={0.2}
      ior={2.5}
      chromaticAberration={0.02}
      distortion={1}
      distortionScale={100}
      temporalDistortion={0.1}
    />
  )
}
