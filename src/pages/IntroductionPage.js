import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CodeSection from "../sections/CodeSection.tsx";
import FragmentShader from "../shaders/introduction/fragment.glsl?raw";
import VertexShader from "../shaders/introduction/vertex.glsl?raw";
import CanvasVizRaw from "../sections/canvas/IntroductionCanvas.tsx?raw";
import CanvasViz from "../sections/canvas/IntroductionCanvas.tsx";
const Introduction = () => {
    return (_jsxs("div", { className: "experiment flex", children: [_jsx("h1", { className: "absolte mt-24", children: "Experiment 1" }), _jsx(CodeSection, { VertexShader: VertexShader, FragmentShader: FragmentShader, CanvasVizRaw: CanvasVizRaw }), _jsx("div", { className: "canvas", children: _jsx(CanvasViz, {}) })] }));
};
export default Introduction;
