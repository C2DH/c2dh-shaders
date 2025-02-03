import { jsx as _jsx } from "react/jsx-runtime";
import "./Button.css";
/**
 * AccessibleButton - A customizable and accessible button component
 * @param {AccessibleButtonProps} props - The props for the button
 * @returns {JSX.Element} A fully accessible button
 */
const Button = ({ type = "button", ariaLabel, disabled = false, className = "", onClick, children, ...rest }) => {
    return (_jsx("button", { type: type, "aria-label": ariaLabel || undefined, disabled: disabled, className: `accessible-button ${className}`, onClick: onClick, ...rest, children: children }));
};
export default Button;
