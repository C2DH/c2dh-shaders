import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import useGlobalState from "./store";
import "./GLSLCodeBlock.css";
const GLSLCodeBlock = ({ glslCode, typeScriptCode, className, showTitile, glslTitle, tsTitle, }) => {
    const { showGLSL, showTS } = useGlobalState();
    return (_jsxs("section", { className: `GLSLCodeBlock ${className}`, children: [showGLSL && (_jsx(_Fragment, { children: glslCode ? (_jsxs("div", { className: "mt-5", children: [showTitile ? null : (_jsx("h3", { className: "mb-2", children: glslTitle ? glslTitle : null })), _jsx(SyntaxHighlighter, { language: "glsl", style: dracula, children: glslCode })] })) : null })), showTS && (_jsx(_Fragment, { children: typeScriptCode ? (_jsxs("div", { className: "mt-5", children: [showTitile ? null : (_jsx("h3", { className: "mb-2", children: tsTitle ? tsTitle : null })), _jsx(SyntaxHighlighter, { language: "typescript", style: dracula, children: typeScriptCode })] })) : null }))] }));
};
export default GLSLCodeBlock;
