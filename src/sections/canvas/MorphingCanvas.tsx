import * as THREE from "three";
import { useState, useEffect, FC, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useControls, button } from "leva";
import gsap from "gsap";

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

  const [particlesData, setParticles] = useState<ParticlesData | null>(null);
  const [index, setIndex] = useState(0); // State for the current index
  const [animationActive, setAnimationActive] = useState(false); // State for the animation
  const { scene } = useThree();
  const gltf = useGLTF("./glb/logos.glb");

  // Use Leva to create buttons
  useControls({
    "Set Index to 0": button(() => setIndex(0)),
    "Set Index to 1": button(() => setIndex(1)),
    "Auto Morph": {
      value: animationActive,
      onChange: setAnimationActive, // Update state when checkbox is toggled
    },
  });

  // Morph function to animate particles
  const morph = (targetIndex: number) => {
    if (!particlesData) return;

    // Update attributes
    particlesData.geometry.setAttribute(
      "position",
      particlesData.positions[particlesData.index]
    );
    particlesData.geometry.setAttribute(
      "aPositionTarget",
      particlesData.positions[targetIndex]
    );

    // Animate uProgress using GSAP
    gsap.fromTo(
      particlesData.material.uniforms.uProgress,
      { value: 0 }, // Start value
      {
        value: 1, // End value
        duration: 3, // Animation duration (3 seconds)
        ease: "linear", // Easing function
        onComplete: () => {
          // Save the new index after animation completes
          particlesData.index = targetIndex;
        },
      }
    );
  };

  // Trigger morph animation when index changes
  useEffect(() => {
    if (particlesData) {
      morph(index);
    }
  }, [index, particlesData]);

  // Auto-morphing logic
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (animationActive) {
      intervalRef.current = setInterval(() => {
        setIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
      }, 5000); // 5 seconds interval
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [animationActive]);

  useEffect(() => {
    if (gltf) {
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
        particlesData.positions[index]
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

      particlesData.points.scale.set(3, 3, 3);

      setParticles(particlesData);
    }
  }, [gltf]);

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
