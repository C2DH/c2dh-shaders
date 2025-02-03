import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
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
            return (_jsx(CustomShaderMaterial, { baseMaterial: baseMaterialCustom, vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, silent: true, transperant: true }));
        };
        return (_jsxs("group", { ...props, dispose: null, children: [_jsx("mesh", { castShadow: true, receiveShadow: true, geometry: nodes.ocean.geometry, scale: 3, position: [0, 0, 0], children: _jsx(CustomMaterial, {}) }), _jsx("mesh", { castShadow: true, receiveShadow: true, geometry: nodes.pillar.geometry, material: materials.pillar })] }));
    };
    useGLTF.preload("./ocean_pillar.glb");
    return (_jsxs(Canvas, { shadows: true, camera: { position: [15, 0, 15], fov: 25 }, children: [_jsx("directionalLight", { "shadow-mapSize": 1024, "shadow-normalBias": 0.03, castShadow: true, position: [-5, 1, 5], intensity: 6 }), _jsx(OceanPillar, { position: [0, 0, 0] }), _jsx(OrbitControls, { minPolarAngle: 0, maxPolarAngle: Math.PI / 2, autoRotate: true, autoRotateSpeed: 0.05, makeDefault: true }), _jsx(Environment, { files: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr", background: true })] }));
}
export default CanvasViz;
