import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import "./Navigation.css";
const Navigation = ({ showDocumentation, setShowDocumentation, }) => {
    return (_jsx("nav", { className: "flex flex-col menu_panel", children: _jsxs("ul", { children: [_jsx("li", { children: _jsx("button", { onClick: () => setShowDocumentation(!showDocumentation), children: "Documentation" }) }), _jsx("li", { children: _jsx(Link, { to: "/", children: "Introduction" }) }), _jsx("li", { children: _jsx(Link, { to: "/logoc2dh", children: "Logo C2DH" }) })] }) }));
};
export default Navigation;
