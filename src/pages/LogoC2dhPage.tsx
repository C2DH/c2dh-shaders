import CodeSection from "../sections/CodeSection.tsx";
import FragmentShader from "../shaders/logo_c2dh/fragment.glsl?raw";
import VertexShader from "../shaders/logo_c2dh/vertex.glsl?raw";
import CanvasVizRaw from "../sections/canvas/LogoC2dhCanvas.tsx?raw";
import CanvasViz from "../sections/canvas/LogoC2dhCanvas.tsx";

const LogoC2dh = () => {
  return (
    <div className="experiment flex">
      <h1 className="absolte mt-24">Experiment 1</h1>
      <CodeSection
        VertexShader={VertexShader}
        FragmentShader={FragmentShader}
        CanvasVizRaw={CanvasVizRaw}
      />
      <div className="canvas">
        <span className="bg-text">COMING SOON</span>
        <CanvasViz />
      </div>
    </div>
  );
};

export default LogoC2dh;
