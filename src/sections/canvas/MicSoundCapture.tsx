import * as THREE from "three";
import { Canvas, extend, useFrame, ReactThreeFiber } from "@react-three/fiber";
import {
  OrbitControls,
  shaderMaterial,
  PerspectiveCamera,
} from "@react-three/drei";
import { useRef, FC, useState } from "react";
import { useGLTF } from "@react-three/drei";
// import { useControls } from "leva";
import fragmentShaderSound from "../../shaders/mic_Input/fragment.glsl?raw";
import vertexShaderSound from "../../shaders/mic_Input/vertex.glsl?raw";
import MicInput from "../../components/MicInput";
import useGlobalState from "../../components/store";

// Extend ShaderMaterial to include custom properties
declare module "three" {
  interface ShaderMaterial {
    uTime: number;
    uColor: THREE.Color;
  }
}

interface GlobalState {
  isListening: boolean;
}

// Extend JSX IntrinsicElements to include soundMaterial
declare module "@react-three/fiber" {
  interface ThreeElements {
    soundMaterial: ReactThreeFiber.Object3DNode<
      THREE.ShaderMaterial,
      typeof THREE.ShaderMaterial
    >;
  }
}

// Define the shader material
const SoundMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#70c1ff"),
    uAudioData: 0, // Default value
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  },
  vertexShaderSound,
  fragmentShaderSound
);

extend({ SoundMaterial });

// CubeAnnualReport Component
const CubeAnnualReport: FC<{
  audioValue: number;
}> = ({ audioValue, ...props }) => {
  const { nodes, materials } = useGLTF("/cubeAnnualReport.glb");
  const cubeMaterial = useRef<THREE.ShaderMaterial>(null);
  const { isListening } = useGlobalState() as GlobalState;

  (materials.White as THREE.MeshStandardMaterial).roughness = 1;
  materials.White.transparent = true;
  materials.White.opacity = 0.8;

  // const { uColor } = useControls({
  //   uColor: "#70c1ff", // Default color
  // });

  useFrame(() => {
    if (cubeMaterial.current) {
      cubeMaterial.current.uniforms.uAudioData.value = isListening
        ? audioValue
        : 0;
      // console.log("audioValue", cubeMaterial.current.uniforms.uAudioData.value);
    }
  });

  useFrame((_, delta) => {
    if (cubeMaterial.current) {
      cubeMaterial.current.uTime += delta;
      // cubeMaterial.current.uColor = new THREE.Color(uColor);
    }
  });

  return (
    <group scale={0.5} {...props} dispose={null}>
      <mesh castShadow geometry={(nodes.Cube as THREE.Mesh).geometry}>
        <soundMaterial ref={cubeMaterial} />
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
  const [audioValue, setAudioValue] = useState<number>(0); // Store a single number

  return (
    <>
      {/* <pre>Mic Level: {audioValue.toFixed(2)}</pre> */}
      <MicInput onAudioData={setAudioValue} />
      <Canvas
        shadows
        gl={{
          pixelRatio: Math.min(window.devicePixelRatio, 2),
          antialias: true,
        }}
      >
        <color attach="background" args={["black"]} />
        <directionalLight position={[-3, 0, 0]} intensity={9} />
        <directionalLight position={[3, 0, 0]} intensity={9} />
        <directionalLight position={[0, 0, -3]} intensity={9} />
        <directionalLight position={[0, 0, 3]} intensity={9} />

        <CubeAnnualReport audioValue={audioValue} />

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
    </>
  );
};

export default CanvasViz;
