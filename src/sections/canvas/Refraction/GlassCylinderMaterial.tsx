import { MeshTransmissionMaterial } from '@react-three/drei'

export default function GlassCylinderMaterial() {
  return (
    <MeshTransmissionMaterial
      thickness={6.0}
      transmission={1.15}
      roughness={0.4}
      ior={1.5}
      chromaticAberration={60}
      distortion={0.3}
      distortionScale={80}
      temporalDistortion={0.5}
    />
  )
}
