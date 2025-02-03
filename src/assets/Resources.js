import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import resourcesData from "./data/resources.json";
const Resources = () => {
    return (_jsxs(_Fragment, { children: [_jsx("p", { children: "Websites" }), _jsx("ul", { className: "Functions flex flex-col flex-wrap", children: resourcesData.resources.websites.map((func) => (_jsxs("li", { children: [_jsx("a", { href: func.link, target: "_blank", children: func.name }), resourcesData.resources.websites.indexOf(func) !==
                            resourcesData.resources.websites.length - 1 && ","] }, func.name))) }), _jsx("p", { children: "GLSL Graphs" }), _jsx("ul", { className: "Functions flex flex-col flex-wrap", children: resourcesData.resources.graphs.map((func) => (_jsxs("li", { children: [_jsx("a", { href: func.link, target: "_blank", children: func.name }), resourcesData.resources.graphs.indexOf(func) !==
                            resourcesData.resources.graphs.length - 1 && ","] }, func.name))) }), _jsx("p", { children: "Noise Generators" }), _jsx("ul", { className: "Functions flex flex-col flex-wrap", children: resourcesData.resources.noises.map((func) => (_jsxs("li", { children: [_jsx("a", { href: func.link, target: "_blank", children: func.name }), resourcesData.resources.noises.indexOf(func) !==
                            resourcesData.resources.noises.length - 1 && ","] }, func.name))) })] }));
};
export default Resources;
