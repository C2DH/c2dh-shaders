import "./GLSLCodeBlock.css";
interface GLSLCodeBlockProps {
    glslCode?: string;
    typeScriptCode?: string;
    className?: string;
    glslTitle?: string;
    tsTitle?: string;
    showTitile?: boolean;
}
declare const GLSLCodeBlock: ({ glslCode, typeScriptCode, className, showTitile, glslTitle, tsTitle, }: GLSLCodeBlockProps) => import("react/jsx-runtime").JSX.Element;
export default GLSLCodeBlock;
