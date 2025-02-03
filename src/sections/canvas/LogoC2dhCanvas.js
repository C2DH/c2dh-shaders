import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as THREE from "three";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { OrbitControls, shaderMaterial, PerspectiveCamera, } from "@react-three/drei";
import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import fragmentShaderLogo from "../../shaders/logo_c2dh/fragment.glsl?raw";
import vertexShaderLogo from "../../shaders/logo_c2dh/vertex.glsl?raw";
import random2D from "../../shaders/logo_c2dh/includes/random2D.glsl?raw"; // Import random2D shader
// Define the shader material
const LogoMaterial = shaderMaterial({
    uTime: 0,
    uColor: new THREE.Color("#70c1ff"),
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
}, `
    ${random2D}
    ${vertexShaderLogo}
  `, fragmentShaderLogo);
extend({ LogoMaterial });
// LogoC2dh Component
const LogoC2dh = (props) => {
    const logoMaterial = useRef(null);
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
    return (_jsx("group", { scale: 2.5, ...props, dispose: null, children: _jsx("mesh", { castShadow: true, receiveShadow: true, geometry: nodes.logo.geometry, children: _jsx("logoMaterial", { ref: logoMaterial }) }) }));
};
useGLTF.preload("./c2dh_logo.glb");
// CubeAnnualReport Component
const CubeAnnualReport = (props) => {
    const { nodes, materials } = useGLTF("/cubeAnnualReport.glb");
    const textMaterial = useRef(null);
    const cubeMaterial = useRef(null);
    materials.White.roughness = 1;
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
    return (_jsxs("group", { scale: 0.5, ...props, dispose: null, children: [_jsx("mesh", { castShadow: true, geometry: nodes.Cube.geometry, children: _jsx("logoMaterial", { ref: cubeMaterial }) }), _jsx("mesh", { castShadow: true, geometry: nodes.text.geometry, children: _jsx("logoMaterial", { ref: textMaterial }) }), _jsx("mesh", { castShadow: true, receiveShadow: true, geometry: nodes.text.geometry, material: materials.White })] }));
};
useGLTF.preload("./cubeAnnualReport.glb");
// Main Canvas Component
const CanvasViz = () => {
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
    return (_jsxs(Canvas, { shadows: true, gl: { pixelRatio: Math.min(window.devicePixelRatio, 2), antialias: true }, children: [_jsx("color", { attach: "background", args: ["black"] }), _jsx("directionalLight", { position: [-3, 0, 0], intensity: 9 }), _jsx("directionalLight", { position: [3, 0, 0], intensity: 9 }), _jsx("directionalLight", { position: [0, 0, -3], intensity: 9 }), _jsx("directionalLight", { position: [0, 0, 3], intensity: 9 }), selectedObject === "LogoC2dh" && _jsx(LogoC2dh, { position: [0, 0, 0] }), selectedObject === "CubeAnnualReport" && (_jsx(CubeAnnualReport, { position: [0, 0, 0] })), _jsx(OrbitControls, { minPolarAngle: Math.PI / 2, maxPolarAngle: Math.PI / 2, makeDefault: true, autoRotate: true, autoRotateSpeed: 0.5 }), _jsx(PerspectiveCamera, { makeDefault: true, position: [0, 0, 3] })] }));
};
export default CanvasViz;
