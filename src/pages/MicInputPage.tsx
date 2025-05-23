import CodeSection from "../sections/CodeSection.tsx";
import FragmentShader from "../shaders/mic_Input/fragment.glsl?raw";
import VertexShader from "../shaders/mic_Input/vertex.glsl?raw";
import CanvasVizRaw from "../sections/canvas/MicSoundCapture.tsx?raw";
import CanvasViz from "../sections/canvas/MicSoundCapture.tsx";

const MicInputPage = () => {
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

export default MicInputPage;
