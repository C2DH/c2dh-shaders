import * as THREE from "three";
import { useState, useEffect, FC } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
// import { useSpring, animated } from "@react-spring/three";

// import { useControls } from "leva";

import simplexNoise3d from "../../shaders/morphing/includes/simplexNoise3d.glsl?raw";
import fragmentMorphing from "../../shaders/morphing/fragment.glsl?raw";
import vertexMorphing from "../../shaders/morphing/vertex.glsl?raw";

const Particles = () => {
  interface ParticlesData {
    index: number;
    maxCount: number;
    positions: THREE.Float32BufferAttribute[];
    geometry: THREE.BufferGeometry;
    material: THREE.ShaderMaterial;
    points: THREE.Points;
    colorA: string;
    colorB: string;
  }

  const setParticles = useState<ParticlesData | null>(null)[1];
  const { scene } = useThree();
  const gltf = useGLTF("./glb/logos.glb"); // Use useGLTF to load the model

  // const [{ uProgress }, set] = useSpring(() => ({
  //   uProgress: 0,
  //   config: { duration: 3000 },
  // }));

  console.log(gltf.scene.children);

  useEffect(() => {
    if (gltf) {
      interface ParticlesData {
        index: number;
        maxCount: number;
        positions: THREE.Float32BufferAttribute[];
        geometry: THREE.BufferGeometry;
        material: THREE.ShaderMaterial;
        points: THREE.Points;
        colorA: string;
        colorB: string;
      }

      const particlesData: ParticlesData = {
        index: 0,
        maxCount: 0,
        positions: [],
        geometry: new THREE.BufferGeometry(),
        material: new THREE.ShaderMaterial(),
        points: new THREE.Points(),
        colorA: "#ff7300",
        colorB: "#0091ff",
      };
      particlesData.index = 0;

      // Positions
      const positions = gltf.scene.children.map(
        (child: THREE.Object3D) =>
          (child as THREE.Mesh).geometry.attributes.position
      );

      particlesData.maxCount = 0;
      for (const position of positions) {
        if (position.count > particlesData.maxCount)
          particlesData.maxCount = position.count;
      }

      particlesData.positions = [];
      for (const position of positions) {
        const originalArray = position.array;
        const newArray = new Float32Array(particlesData.maxCount * 3);

        for (let i = 0; i < particlesData.maxCount; i++) {
          const i3 = i * 3;

          if (i3 < originalArray.length) {
            newArray[i3 + 0] = originalArray[i3 + 0];
            newArray[i3 + 1] = originalArray[i3 + 1];
            newArray[i3 + 2] = originalArray[i3 + 2];
          } else {
            const randomIndex = Math.floor(position.count * Math.random()) * 3;
            newArray[i3 + 0] = originalArray[randomIndex + 0];
            newArray[i3 + 1] = originalArray[randomIndex + 1];
            newArray[i3 + 2] = originalArray[randomIndex + 2];
          }
        }

        particlesData.positions.push(
          new THREE.Float32BufferAttribute(newArray, 3)
        );
      }

      // Geometry
      const sizesArray = new Float32Array(particlesData.maxCount);

      for (let i = 0; i < particlesData.maxCount; i++)
        sizesArray[i] = Math.random();

      particlesData.geometry = new THREE.BufferGeometry();
      particlesData.geometry.setAttribute(
        "position",
        particlesData.positions[particlesData.index]
      );
      particlesData.geometry.setAttribute(
        "aPositionTarget",
        particlesData.positions[1]
      );
      particlesData.geometry.setAttribute(
        "aSize",
        new THREE.BufferAttribute(sizesArray, 1)
      );

      // Material
      particlesData.colorA = "#ff7300";
      particlesData.colorB = "#0091ff";

      particlesData.material = new THREE.ShaderMaterial({
        uniforms: {
          uSize: new THREE.Uniform(0.04),
          uResolution: new THREE.Uniform(
            new THREE.Vector2(
              window.innerWidth * window.devicePixelRatio,
              window.innerHeight * window.devicePixelRatio
            )
          ),
          uProgress: new THREE.Uniform(0),
          uColorA: new THREE.Uniform(new THREE.Color(particlesData.colorA)),
          uColorB: new THREE.Uniform(new THREE.Color(particlesData.colorB)),
        },
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexShader: `
        ${simplexNoise3d}
        ${vertexMorphing}
        `,
        fragmentShader: fragmentMorphing,
      });

      // Points
      particlesData.points = new THREE.Points(
        particlesData.geometry,
        particlesData.material
      );
      particlesData.points.frustumCulled = false;
      scene.add(particlesData.points);

      particlesData.points.scale.set(2, 2, 2);

      setParticles(particlesData);
    }
  }, [gltf]);

  // const morph = (index: number) => {
  //   if (particles) {
  //     particles.geometry.attributes.position =
  //       particles.positions[particles.index];
  //     particles.geometry.attributes.aPositionTarget =
  //       particles.positions[index];

  //     set({ uProgress: 1 });

  //     particles.index = index;
  //   }
  // };

  return null;
};

// Main Canvas Component
const CanvasViz: FC = () => {
  return (
    <Canvas
      shadows
      gl={{ pixelRatio: Math.min(window.devicePixelRatio, 2), antialias: true }}
    >
      <color attach="background" args={["black"]} />
      <directionalLight position={[-3, 0, 0]} intensity={9} />
      <directionalLight position={[3, 0, 0]} intensity={9} />
      <directionalLight position={[0, 0, -3]} intensity={9} />
      <directionalLight position={[0, 0, 3]} intensity={9} />

      <Particles />

      <OrbitControls
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        makeDefault
        autoRotate
        autoRotateSpeed={0.5}
      />
      <PerspectiveCamera makeDefault position={[0, 0, 3]} />
    </Canvas>
  );
};

export default CanvasViz;
