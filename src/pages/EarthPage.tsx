import CodeSection from "../sections/CodeSection.tsx";
import FragmentShader from "../shaders/earth/fragment.glsl?raw";
import VertexShader from "../shaders/earth/vertex.glsl?raw";
import CanvasVizRaw from "../sections/canvas/EarthCanvas.tsx?raw";
import CanvasViz from "../sections/canvas/EarthCanvas.tsx";

const EarthCanvasPage = () => {
  return (
    <div className="experiment flex">
      <CodeSection
        VertexShader={VertexShader}
        FragmentShader={FragmentShader}
        CanvasVizRaw={CanvasVizRaw}
      />
      <div className="canvas">
        <span className="bg-text">Earth</span>
        <CanvasViz />
      </div>
    </div>
  );
};

export default EarthCanvasPage;
