import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import VertexShader from "./shaders/vertex.glsl?raw";
import FragmentShader from "./shaders/fragment.glsl?raw";
const Code = () => {
    return (_jsx("div", { children: _jsx("pre", { children: _jsxs("code", { children: [_jsx(FragmentShader, {}), _jsx(VertexShader, {})] }) }) }));
};
export default Code;
