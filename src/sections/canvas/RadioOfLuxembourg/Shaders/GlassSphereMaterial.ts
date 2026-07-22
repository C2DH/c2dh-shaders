import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

import vertexShader from './vertexShader.glsl?raw'
import fragmentShader from './fragmentShader.glsl?raw'

export const GlassSphereMaterial = shaderMaterial(
  {
    envMap: null,
    useEnvMap: true,

    fresnelPower: 1.2,
    rimWidth: 0.8,

    reflectionFresnelPower: 5.0,
    reflectionStrength: 0.7,

    opacity: 1.0,

    rimColor: new THREE.Color(1, 1, 1),
  },

  vertexShader,
  fragmentShader,
)

extend({
  GlassSphereMaterial,
})
