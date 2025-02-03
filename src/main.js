import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Leva } from "leva";
import "./style.css";
createRoot(document.getElementById("root")).render(_jsx(StrictMode, { children: _jsxs(BrowserRouter, { children: [_jsx(App, {}), _jsx(Leva, {})] }) }));
