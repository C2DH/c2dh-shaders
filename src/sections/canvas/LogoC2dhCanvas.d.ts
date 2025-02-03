import * as THREE from "three";
import { ReactThreeFiber } from "@react-three/fiber";
import { FC } from "react";
declare module "three" {
    interface ShaderMaterial {
        uTime: number;
        uColor: THREE.Color;
    }
}
declare module "@react-three/fiber" {
    interface ThreeElements {
        logoMaterial: ReactThreeFiber.Object3DNode<THREE.ShaderMaterial, typeof THREE.ShaderMaterial>;
    }
}
declare const CanvasViz: FC;
export default CanvasViz;
