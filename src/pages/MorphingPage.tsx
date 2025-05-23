import CodeSection from "../sections/CodeSection.tsx";
import FragmentShader from "../shaders/morphing/fragment.glsl?raw";
import VertexShader from "../shaders/morphing/vertex.glsl?raw";
import CanvasVizRaw from "../sections/canvas/MorphingCanvas.tsx?raw";
import CanvasViz from "../sections/canvas/MorphingCanvas.tsx";

const Morphing = () => {
  return (
    <div className="experiment flex">
      <CodeSection
        VertexShader={VertexShader}
        FragmentShader={FragmentShader}
        CanvasVizRaw={CanvasVizRaw}
      />
      <div className="canvas">
        <span className="bg-text">MORPHING</span>
        <CanvasViz />
      </div>
    </div>
  );
};

export default Morphing;
