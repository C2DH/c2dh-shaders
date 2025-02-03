import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import useGlobalState from "./store";
import "./GLSLCodeBlock.css";

interface GlobalState {
  showGLSL: boolean;
  showTS: boolean;
}

interface GLSLCodeBlockProps {
  glslCode?: string;
  typeScriptCode?: string;
  className?: string;
  glslTitle?: string;
  tsTitle?: string;
  showTitile?: boolean;
}

const GLSLCodeBlock = ({
  glslCode,
  typeScriptCode,
  className,
  showTitile,
  glslTitle,
  tsTitle,
}: GLSLCodeBlockProps) => {
  const { showGLSL, showTS } = useGlobalState() as GlobalState;
  return (
    <section className={`GLSLCodeBlock ${className}`}>
      {showGLSL && (
        <>
          {glslCode ? (
            <div className="mt-5">
              {showTitile ? null : (
                <h3 className="mb-2">{glslTitle ? glslTitle : null}</h3>
              )}

              <SyntaxHighlighter language="glsl" style={dracula}>
                {glslCode}
              </SyntaxHighlighter>
            </div>
          ) : null}
        </>
      )}

      {showTS && (
        <>
          {typeScriptCode ? (
            <div className="mt-5">
              {showTitile ? null : (
                <h3 className="mb-2">{tsTitle ? tsTitle : null}</h3>
              )}
              <SyntaxHighlighter language="typescript" style={dracula}>
                {typeScriptCode}
              </SyntaxHighlighter>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
};

export default GLSLCodeBlock;
