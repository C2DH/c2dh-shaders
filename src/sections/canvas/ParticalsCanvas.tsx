import { Canvas, extend, ReactThreeFiber } from "@react-three/fiber";
import { OrbitControls, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import fragmentShaderParticals from "../../shaders/particals/fragment.glsl?raw";
import vertexShaderParticals from "../../shaders/particals/vertex.glsl?raw";

// Extend JSX IntrinsicElements to include logoMaterial
declare module "@react-three/fiber" {
  interface ThreeElements {
    ParticalsoMaterial: ReactThreeFiber.Object3DNode<
      THREE.ShaderMaterial,
      typeof THREE.ShaderMaterial
    >;
  }
}

// Loaders
const textureLoader = new THREE.TextureLoader();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

// Define the shader material
const ParticalsMaterial = shaderMaterial(
  {
    uResolution: new THREE.Vector2(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio
    ),
    uPointSize: 1.0,
    uPictureTexture: textureLoader.load("./img/particals/logo_c2dh.png"),
    // blending: THREE.AdditiveBlending,
  },
  vertexShaderParticals,
  fragmentShaderParticals
);

extend({ ParticalsMaterial });

const Particles = () => {
  const mesh = new THREE.PlaneGeometry(10, 10, 128, 128);
  const materialPoints = new ParticalsMaterial();

  const pointCloud = new THREE.Points(mesh, materialPoints);

  console.log("fragmentShaderParticals", pointCloud);
  return <primitive object={pointCloud} />;
};

const ParticlesCanvas = () => {
  return (
    <Canvas camera={{ position: [0, 0, 18], fov: 35 }}>
      <color attach="background" args={["black"]} />
      <Particles />
      <OrbitControls
        enableDamping
        minAzimuthAngle={0}
        maxAzimuthAngle={0}
        minPolarAngle={-Math.PI / 1.0}
        maxPolarAngle={Math.PI / 1.0}
      />
    </Canvas>
  );
};

export default ParticlesCanvas;
