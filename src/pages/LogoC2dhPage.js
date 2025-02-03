import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CodeSection from "../sections/CodeSection.tsx";
import FragmentShader from "../shaders/logo_c2dh/fragment.glsl?raw";
import VertexShader from "../shaders/logo_c2dh/vertex.glsl?raw";
import CanvasVizRaw from "../sections/canvas/LogoC2dhCanvas.tsx?raw";
import CanvasViz from "../sections/canvas/LogoC2dhCanvas.tsx";
const LogoC2dh = () => {
    return (_jsxs("div", { className: "experiment flex", children: [_jsx("h1", { className: "absolte mt-24", children: "Experiment 1" }), _jsx(CodeSection, { VertexShader: VertexShader, FragmentShader: FragmentShader, CanvasVizRaw: CanvasVizRaw }), _jsxs("div", { className: "canvas", children: [_jsx("span", { className: "bg-text", children: "COMMING SOON" }), _jsx(CanvasViz, {})] })] }));
};
export default LogoC2dh;
