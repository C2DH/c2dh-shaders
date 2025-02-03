import * as THREE from "three";
import { Canvas, extend, useFrame, ReactThreeFiber } from "@react-three/fiber";
import {
  OrbitControls,
  shaderMaterial,
  PerspectiveCamera,
} from "@react-three/drei";
import { useRef, FC } from "react";

// Extend ShaderMaterial to include custom properties
declare module "three" {
  interface ShaderMaterial {
    uTime: number;
    uColor: THREE.Color;
  }
}
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import fragmentShaderLogo from "../../shaders/logo_c2dh/fragment.glsl?raw";
import vertexShaderLogo from "../../shaders/logo_c2dh/vertex.glsl?raw";
import random2D from "../../shaders/logo_c2dh/includes/random2D.glsl?raw"; // Import random2D shader

// Extend JSX IntrinsicElements to include logoMaterial
declare module "@react-three/fiber" {
  interface ThreeElements {
    logoMaterial: ReactThreeFiber.Object3DNode<
      THREE.ShaderMaterial,
      typeof THREE.ShaderMaterial
    >;
  }
}

// Define the shader material
const LogoMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#70c1ff"),
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  },
  `
    ${random2D}
    ${vertexShaderLogo}
  `,
  fragmentShaderLogo
);

extend({ LogoMaterial });

// LogoC2dh Component
const LogoC2dh: FC<{ position: [number, number, number] }> = (props) => {
  const logoMaterial = useRef<THREE.ShaderMaterial>(null);
  const { nodes } = useGLTF("./c2dh_logo.glb");

  const { uColor } = useControls({
    uColor: "#70c1ff", // Default color
  });

  useFrame((state, delta) => {
    if (logoMaterial.current) {
      logoMaterial.current.uTime += delta;
      logoMaterial.current.uColor = new THREE.Color(uColor);
    }
  });

  return (
    <group scale={2.5} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.logo as THREE.Mesh).geometry}
      >
        <logoMaterial ref={logoMaterial} />
      </mesh>
    </group>
  );
};

useGLTF.preload("./c2dh_logo.glb");

// CubeAnnualReport Component
const CubeAnnualReport: FC<{ position: [number, number, number] }> = (
  props
) => {
  const { nodes, materials } = useGLTF("/cubeAnnualReport.glb");
  const textMaterial = useRef<THREE.ShaderMaterial>(null);
  const cubeMaterial = useRef<THREE.ShaderMaterial>(null);

  (materials.White as THREE.MeshStandardMaterial).roughness = 1;
  materials.White.transparent = true;
  materials.White.opacity = 0.8;

  const { uColor } = useControls({
    uColor: "#70c1ff", // Default color
  });

  useFrame((state, delta) => {
    if (textMaterial.current) {
      textMaterial.current.uTime += delta;
      textMaterial.current.uColor = new THREE.Color(uColor);
    }
    if (cubeMaterial.current) {
      cubeMaterial.current.uTime += delta;
      cubeMaterial.current.uColor = new THREE.Color(uColor);
    }
  });

  return (
    <group scale={0.5} {...props} dispose={null}>
      <mesh castShadow geometry={(nodes.Cube as THREE.Mesh).geometry}>
        <logoMaterial ref={cubeMaterial} />
      </mesh>
      <mesh castShadow geometry={(nodes.text as THREE.Mesh).geometry}>
        <logoMaterial ref={textMaterial} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.text as THREE.Mesh).geometry}
        material={materials.White}
      />
    </group>
  );
};

useGLTF.preload("./cubeAnnualReport.glb");

// Main Canvas Component
const CanvasViz: FC = () => {
  // Use leva to create a dropdown for selecting the 3D object
  const { selectedObject } = useControls({
    selectedObject: {
      value: "LogoC2dh",
      options: ["LogoC2dh", "CubeAnnualReport"],
      label: "3D Object", // Label for the dropdown
    },
    uColor: {
      value: "#70c1ff", // Default color
      label: "Color",
    },
  });

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

      {selectedObject === "LogoC2dh" && <LogoC2dh position={[0, 0, 0]} />}
      {selectedObject === "CubeAnnualReport" && (
        <CubeAnnualReport position={[0, 0, 0]} />
      )}
      <OrbitControls
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        makeDefault
        autoRotate
        autoRotateSpeed={0.5}
      />
      <PerspectiveCamera makeDefault position={[0, 0, 3]} />
      {/* <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr" /> */}
    </Canvas>
  );
};

export default CanvasViz;
