import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import GLSLCodeBlock from "../components/GLSLCodeBlock.tsx";
const CodeSection = ({ VertexShader, FragmentShader, CanvasVizRaw, }) => {
    return (_jsxs("pre", { className: "code", children: [_jsx(GLSLCodeBlock, { className: "mt-15", glslTitle: "Vertex Shader", glslCode: VertexShader }), _jsx(GLSLCodeBlock, { className: "mt-5", glslTitle: "Fragment Shader", glslCode: FragmentShader }), _jsx(GLSLCodeBlock, { className: "mt-5", tsTitle: "Typescript", typeScriptCode: CanvasVizRaw })] }));
};
export default CodeSection;
