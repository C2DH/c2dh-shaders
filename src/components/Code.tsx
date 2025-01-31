import VertexShader from "./shaders/vertex.glsl?raw";
import FragmentShader from "./shaders/fragment.glsl?raw";

const Code = () => {
  return (
    <div>
      <pre>
        <code>
          <FragmentShader />
          <VertexShader />
        </code>
      </pre>
    </div>
  );
};

export default Code;
