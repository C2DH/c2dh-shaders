import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import fragmentShader from "../../shaders/introduction/fragment.glsl?raw";
import vertexShader from "../../shaders/introduction/vertex.glsl?raw";
import CustomShaderMaterial from "three-custom-shader-material";
import { useControls } from "leva";

function CanvasViz() {
  const OceanPillar = (props) => {
    const { nodes, materials } = useGLTF("./ocean_pillar.glb");
    console.log("Gltf", nodes);

    // Stripes control
    const stripesControl = useControls("uStripes", {
      uStripes: {
        min: 0.6,
        max: 2.0,
        value: 1,
      },
    });

    console.log(nodes);
    materials.ocean.roughness = 0.1;
    materials.ocean.metalness = 0.9;

    const baseMaterialCustom = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x000000),
      // map: originalMaterial ? originalMaterial.map : null,
      roughness: 0.2,
      metalness: 0.49,
      // normalMap: originalMaterial ? originalMaterial.normalMap : null,
      normalScale: new THREE.Vector2(0.9, -0.5),
      ior: 1.2,
      thickness: 0.9,
      transmission: 1,
      // iridescence: iridescence ? iridescence : null,
      side: THREE.DoubleSide,
    });

    const uniforms = {
      uTime: new THREE.Uniform(1.75),
      uStripes: new THREE.Uniform(stripesControl.uStripes),
    };

    useFrame((state, dt) => {
      uniforms.uTime.value += dt;
    });

    const CustomMaterial = () => {
      return (
        <CustomShaderMaterial
          baseMaterial={baseMaterialCustom}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          silent
          transperant
        />
      );
    };

    return (
      <group {...props} dispose={null}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.ocean.geometry}
          scale={3}
          position={[0, 0, 0]}
        >
          <CustomMaterial />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.pillar.geometry}
          material={materials.pillar}
        />
      </group>
    );
  };

  useGLTF.preload("./ocean_pillar.glb");

  return (
    <Canvas shadows camera={{ position: [15, 0, 15], fov: 25 }}>
      <directionalLight
        shadow-mapSize={1024}
        // shadow-bias={-0.006}
        shadow-normalBias={0.03}
        castShadow
        position={[-5, 1, 5]}
        intensity={6}
      />
      {/* <spotLight></spotLight> */}
      <OceanPillar position={[0, 0, 0]} />

      <OrbitControls
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.05}
        makeDefault
      />
      <Environment
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr"
        background
        // backgroundBlurriness={1}
      />
    </Canvas>
  );
}

export default CanvasViz;
