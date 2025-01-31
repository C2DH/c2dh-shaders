import CodeSection from "../sections/CodeSection.tsx";
import FragmentShader from "../shaders/introduction/fragment.glsl?raw";
import VertexShader from "../shaders/introduction/vertex.glsl?raw";
import CanvasVizRaw from "../sections/canvas/IntroductionCanvas.tsx?raw";
import CanvasViz from "../sections/canvas/IntroductionCanvas.tsx";

const Introduction = () => {
  return (
    <div className="experiment flex">
      <h1 className="absolte mt-24">Experiment 1</h1>
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
