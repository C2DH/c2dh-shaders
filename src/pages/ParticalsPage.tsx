import CodeSection from "../sections/CodeSection.js";
import FragmentShader from "../shaders/particals/fragment.glsl?raw";
import VertexShader from "../shaders/particals/vertex.glsl?raw";
import CanvasVizRaw from "../sections/canvas/ParticalsCanvas.tsx?raw";
import CanvasViz from "../sections/canvas/ParticalsCanvas.js";

const ParticalsPage = () => {
  return (
    <div className="experiment flex">
      <CodeSection
        VertexShader={VertexShader}
        FragmentShader={FragmentShader}
        CanvasVizRaw={CanvasVizRaw}
      />
      <div className="canvas">
        <span className="bg-text">PARTICLES EXPERIMENT</span>
        <CanvasViz />
      </div>
    </div>
  );
};

export default ParticalsPage;
