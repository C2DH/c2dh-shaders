import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from "react-router-dom";
import Page from "./pages/Page";
import { useState } from "react";
import Button from "./components/Button";
import { Menu, CodeBrackets, Xmark } from "iconoir-react";
import Navigation from "./components/Navigation";
import Documentation from "./components/Documentation";
import useGlobalState from "./components/store";
function App() {
    const [showCoodeMenu, setShowCodeMenu] = useState(false);
    const [showMenu, setMenu] = useState(false);
    const [showDocumentation, setShowDocumentation] = useState(true);
    const { showGLSL, setShowGLSL, showTS, setShowTS } = useGlobalState();
    return (_jsxs("div", { className: `${showCoodeMenu ? "coodeMenuIsActive" : ""} ${showMenu ? "menuIsActive" : ""} ${showDocumentation ? "documentationIsActive" : ""}  App`, children: [_jsx(Documentation, {}), _jsx(Navigation, { showDocumentation: showDocumentation, setShowDocumentation: setShowDocumentation }), !showDocumentation ? (_jsx(Button, { className: "circle absolute mt-5 ml-6 z-8", onClick: () => setShowDocumentation(!showDocumentation), children: _jsx(Xmark, {}) })) : null, !showCoodeMenu ? (_jsxs(_Fragment, { children: [_jsx(Button, { className: `circle show-code mt-5 ml-20 absolute z-8 ${showGLSL ? "" : "inactive"}`, onClick: () => setShowGLSL(!showGLSL), children: "GLSL" }), _jsx(Button, { className: `circle show-code mt-5 ml-34 absolute z-8 ${showTS ? "" : "inactive"}`, onClick: () => setShowTS(!showTS), children: "TS" })] })) : null, _jsx(Button, { ariaLabel: "Show Code", className: "code_panel_btn circle absolute mt-5 ml-6 z-4", onClick: () => setShowCodeMenu(!showCoodeMenu), children: _jsx(CodeBrackets, {}) }), _jsx(Button, { ariaLabel: "Show Menu", className: "menu_panel_btn circle absolute mt-5 z-3 right-6", onClick: () => setMenu(!showMenu), children: _jsx(Menu, {}) }), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Page.Introduction, {}) }), _jsx(Route, { path: "/logoc2dh", element: _jsx(Page.LogoC2dh, {}) })] })] }));
}
export default App;
