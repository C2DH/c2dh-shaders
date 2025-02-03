import { jsx as _jsx } from "react/jsx-runtime";
import Introduction from "./IntroductionPage";
import "../../src/style.css";
import LogoC2dh from "./LogoC2dhPage";
const PageWrapper = ({ children }) => (_jsx("div", { className: "Page", children: children }));
const Page = {
    Introduction: () => (_jsx(PageWrapper, { children: _jsx(Introduction, {}) })),
    LogoC2dh: () => (_jsx(PageWrapper, { children: _jsx(LogoC2dh, {}) })),
};
export default Page;
