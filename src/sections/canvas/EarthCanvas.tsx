import { color, mix, PI, positionWorld, uniform, uv, vec3 } from "three/tsl";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  useTexture,
  textureLoader,
} from "@react-three/drei";
import {
  useFrame,
  CameraProps,
  Canvas,
  extend,
  type ThreeToJSXElements,
} from "@react-three/fiber";
import {
  type FC,
  type PropsWithChildren,
  useLayoutEffect,
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { useLoader } from "@react-three/fiber";
import { RGBELoader } from "three-stdlib";

import * as THREE from "three";

// Load your PNG texture
const maskTexture = (THREE.TextureLoader, "./world_map.png");
console.log(maskTexture);

const Earth = () => {
  return (
    <mesh>
      <icosahedronGeometry args={[1, 32]} />
      <meshPhysicalMaterial
        color="#70c1ff"
        roughness={0.5}
        metalness={0.5}
        transparent
        opacity={0.1}
      />
    </mesh>
  );
};

const EarthPoints = () => {
  const pointsNum = 10000;
  const pointsSize = 0.01;
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  // Generate positions
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < pointsNum; i++) {
      const prog = i / pointsNum;
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - 2 * prog);
      pos.push(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      );
    }
    return new Float32Array(pos);
  }, []);

  // Create transformation matrices for each instance
  const matrices = useMemo(() => {
    const matrix = new THREE.Matrix4();
    const matricesArray = new Float32Array(pointsNum * 16);

    for (let i = 0; i < pointsNum; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      // Position each dot
      matrix.makeTranslation(x, y, z);
      // Scale each dot (adjust size here)
      matrix.scale(new THREE.Vector3(0.05, 0.05, 0.05));
      matrix.lookAt(
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0)
      );

      // Copy matrix into array
      matrix.toArray(matricesArray, i * 16);
    }
    return matricesArray;
  }, [positions]);

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[null, null, pointsNum]}
      count={pointsNum}
    >
      <planeGeometry args={[pointsSize, pointsSize]} />
      <meshBasicMaterial color="#FF0000" />
      <instancedBufferAttribute
        attach="instanceMatrix"
        array={matrices}
        itemSize={16}
        count={pointsNum}
      />
    </instancedMesh>
  );
};

// Main Canvas Component
const EarthCanvas: FC = () => {
  const texture = useLoader(
    RGBELoader,
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr"
  );
  texture.mapping = THREE.EquirectangularReflectionMapping;

  return (
    <Canvas shadows gl={{ antialias: true }}>
      <ambientLight intensity={0.5} />
      <color attach="background" args={["black"]} />
      <Earth />
      <EarthPoints />
      <OrbitControls
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        makeDefault
        autoRotate
        autoRotateSpeed={0.5}
      />
      <Earth />
      <PerspectiveCamera makeDefault position={[0, 0, 3]} />
      <Environment map={texture} />
    </Canvas>
  );
};

export default EarthCanvas;
