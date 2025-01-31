import GLSLCodeBlock from "../components/GLSLCodeBlock.tsx";

interface CodeSectionProps {
  VertexShader: string;
  FragmentShader: string;
  CanvasVizRaw: string;
}

const CodeSection: React.FC<CodeSectionProps> = ({
  VertexShader,
  FragmentShader,
  CanvasVizRaw,
}) => {
  return (
    <pre className="code">
      <GLSLCodeBlock
        className="mt-15"
        glslTitle="Vertex Shader"
        glslCode={VertexShader}
      />
      <GLSLCodeBlock
        className="mt-5"
        glslTitle="Fragment Shader"
        glslCode={FragmentShader}
      />
      <GLSLCodeBlock
        className="mt-5"
        tsTitle="Typescript"
        typeScriptCode={CanvasVizRaw}
      />
    </pre>
  );
};

export default CodeSection;
