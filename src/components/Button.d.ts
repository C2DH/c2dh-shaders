import "./Button.css";
import React, { ReactNode, ButtonHTMLAttributes } from "react";
interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Accessible label for screen readers (required for icon-only buttons) */
    ariaLabel?: string;
    /** Additional CSS classes for styling */
    className?: string;
    /** Button content (text, icon, etc.) */
    children: ReactNode;
}
/**
 * AccessibleButton - A customizable and accessible button component
 * @param {AccessibleButtonProps} props - The props for the button
 * @returns {JSX.Element} A fully accessible button
 */
declare const Button: React.FC<AccessibleButtonProps>;
export default Button;
