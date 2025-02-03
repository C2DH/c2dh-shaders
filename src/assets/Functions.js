import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import functionsData from "./data/functions.json";
const Functions = () => {
    return (_jsxs(_Fragment, { children: [_jsx("ul", { className: "Functions flex flex-wrap", children: functionsData.functions.useful.map((func) => (_jsxs("li", { children: [_jsxs("a", { href: func.link, target: "_blank", children: [func.name, "()"] }), functionsData.functions.useful.indexOf(func) !==
                            functionsData.functions.useful.length - 1 && ","] }, func.name))) }), _jsx("p", { children: "The most popular Noises" }), _jsx("ul", { className: "Functions flex flex-wrap", children: functionsData.functions.noises.map((func) => (_jsxs("li", { children: [_jsxs("a", { href: func.link, target: "_blank", children: [func.name, "()"] }), functionsData.functions.noises.indexOf(func) !==
                            functionsData.functions.noises.length - 1 && ","] }, func.name))) })] }));
};
export default Functions;
