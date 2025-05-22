import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  shaderMaterial,
} from "@react-three/drei";
import { Canvas, extend, ReactThreeFiber } from "@react-three/fiber";
import { type FC, useState, useMemo, useRef, useEffect } from "react";
import fragmentEarthPoint from "../../shaders/earth/fragment.glsl?raw";
import vertexEarthPoint from "../../shaders/earth/vertex.glsl?raw";
import { useLoader } from "@react-three/fiber";
import { RGBELoader } from "three-stdlib";

import * as THREE from "three";

// Extend JSX IntrinsicElements to include earthPointMaterial
declare module "@react-three/fiber" {
  interface ThreeElements {
    earthPointMaterial: ReactThreeFiber.Object3DNode<
      THREE.ShaderMaterial,
      typeof THREE.ShaderMaterial
    >;
  }
}

const uColor = "#2fe7ff"; // Default color

const GoldenRatio = (1 + Math.sqrt(5)) / 2;

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

const EarthPoints = ({
  size = 1024,
  pointsNum = 50000,
  pointsSize = 0.01,
}: {
  size?: number;
  pointsNum?: number;
  pointsSize?: number;
}) => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const [pixels, setPixels] = useState<number[][]>([]);
  const earthPointMaterial = useRef<THREE.ShaderMaterial>(null);
  const tempGeometry = new THREE.PlaneGeometry(pointsSize, pointsSize);
  const tempMaterial = new THREE.MeshBasicMaterial();

  // Load the world map and process pixel data
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    // Create canvas but don't add to body - we just need it for processing
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get canvas context");
      return;
    }

    // Load the image
    const loader = new THREE.TextureLoader();
    loader.load("/img/world_map.png", (texture) => {
      const image = texture.image;
      console.log("[EarthCanvas] Image loaded:", image);

      // Initialize pixels array with zeros
      const _pixels = Array.from(Array(size), () => new Array(size).fill(0));

      // Draw image to canvas and process pixel data
      ctx.drawImage(image, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);

      for (let i = 0; i < imageData.data.length; i += 4) {
        const x = (i / 4) % size;
        const y = Math.floor(i / 4 / size);
        _pixels[x][y] = imageData.data[i] > 20 ? 1 : 0;
      }

      setPixels(_pixels);
    });

    return () => {
      // No need to remove from body since we never added it
    };
  }, [size]);

  // Generate positions for points based on Fibonacci distribution
  const positions = useMemo((): Float32Array => {
    if (!pixels.length) return new Float32Array();

    const pos: number[] = [];

    for (let i = 0; i < pointsNum; i++) {
      const prog: number = i / pointsNum;
      const theta: number = (2 * Math.PI * i) / GoldenRatio;
      const phi: number = Math.acos(1 - 2 * prog);

      const x: number = Math.sin(phi) * Math.cos(theta);
      const y: number = Math.sin(phi) * Math.sin(theta);
      const z: number = Math.cos(phi);

      // Calculate UV coordinates for texture lookup
      const u: number = 1 - (Math.asin(y) / Math.PI + 0.5);
      const v: number = 1 - (Math.atan2(z, x) + Math.PI) / (2 * Math.PI);

      const pixelX: number = Math.floor(v * size);
      const pixelY: number = Math.floor(u * size);

      // Check bounds before accessing pixel data
      if (pixelX >= 0 && pixelX < size && pixelY >= 0 && pixelY < size) {
        const isBlack: number = pixels[pixelX][pixelY];
        // Only add points for ocean (black areas)
        if (isBlack === 0) {
          pos.push(x, y, z);
        }
      }
    }

    console.log("[EarthCanvas] Ocean points:", pos.length / 3);
    return new Float32Array(pos);
  }, [pixels, pointsNum, size]);

  // Define the shader material
  const EarthPointMaterial = shaderMaterial(
    {
      uColor: new THREE.Color(uColor),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    },
    vertexEarthPoint,
    fragmentEarthPoint
  );

  extend({ EarthPointMaterial });

  // Update instancedMesh when positions change
  useEffect(() => {
    if (!instancedMeshRef.current || positions.length === 0) return;

    const count = positions.length / 3;
    const mesh = instancedMeshRef.current;

    // Update count to match actual number of points
    mesh.count = count;

    // Removed unused variable 'matrix'
    const dummy = new THREE.Object3D();

    // Set matrices for each point
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      dummy.position.set(x, y, z);
      dummy.lookAt(new THREE.Vector3(x * 2, y * 2, z * 2)); // Make points face center
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);
    }

    // Important! This tells Three.js the matrices have been updated
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions, pointsSize, uColor]);

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[tempGeometry, tempMaterial, positions.length / 3 || 1]}
    >
      <planeGeometry args={[pointsSize, pointsSize]} />
      <earthPointMaterial ref={earthPointMaterial} />
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
      <PerspectiveCamera makeDefault position={[0, 0, 3]} />
      <Environment map={texture} />
    </Canvas>
  );
};

export default EarthCanvas;
