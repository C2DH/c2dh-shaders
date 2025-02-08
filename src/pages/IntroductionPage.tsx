import CodeSection from "../sections/CodeSection.tsx";
import FragmentShader from "../shaders/introduction/fragment.glsl?raw";
import VertexShader from "../shaders/introduction/vertex.glsl?raw";
import CanvasVizRaw from "../sections/canvas/IntroductionCanvas.tsx?raw";
import CanvasViz from "../sections/canvas/IntroductionCanvas.tsx";

const Introduction = () => {
  return (
    <div className="experiment flex">
      <CodeSection
        VertexShader={VertexShader}
        FragmentShader={FragmentShader}
        CanvasVizRaw={CanvasVizRaw}
      />
      <div className="canvas">
        <CanvasViz />
      </div>
    </div>
  );
};

export default Introduction;
