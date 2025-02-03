import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import GLSLCodeBlock from "../components/GLSLCodeBlock";
import values from "../assets/variables.glsl?raw";
import Resources from "../assets/Resources";
import Functions from "../assets/Functions";
import TPosition from "../assets/tips/TPosition.tsx?raw";
import "./Documentation.css";
const Documentation = () => {
    return (_jsxs("div", { className: "Documentation relative", children: [_jsx("h1", { className: "mt-15", children: "Documentation" }), _jsxs("div", { className: "documentation-content", children: [_jsx("h2", { children: "Resources" }), _jsx(Resources, {}), _jsx("h2", { children: "Functions" }), _jsx("p", { children: "The most used functions" }), _jsx(Functions, {}), _jsx(GLSLCodeBlock, { glslCode: values, glslTitle: "Variables" }), _jsx("h2", { children: "Tips" }), _jsx(GLSLCodeBlock, { typeScriptCode: TPosition, tsTitle: "Position" })] })] }));
};
export default Documentation;
