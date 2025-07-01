import CodeSection from "../sections/CodeSection.tsx";
import FragmentShader from "../shaders/soundwave/fragment.glsl?raw";
import VertexShader from "../shaders/soundwave/vertex.glsl?raw";
import CanvasVizRaw from "../sections/canvas/SoundwaveCanvas.tsx?raw";
import CanvasViz from "../sections/canvas/SoundwaveCanvas.tsx";

const EarthCanvasPage = () => {
  return (
    <div className="experiment flex">
      <CodeSection
        VertexShader={VertexShader}
        FragmentShader={FragmentShader}
        CanvasVizRaw={CanvasVizRaw}
      />
      <div className="canvas">
        <span className="bg-text">Soundwave</span>
        <CanvasViz />
      </div>
    </div>
  );
};

export default EarthCanvasPage;
