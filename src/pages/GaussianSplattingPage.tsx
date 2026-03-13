import CodeSection from '../sections/CodeSection.tsx'
// import FragmentShader from '../shaders/fnr_award/fragment.glsl?raw'
// import VertexShader from '../shaders/fnr_award/vertex.glsl?raw'
import CanvasVizRaw from '../sections/canvas/GaussianSplatting.tsx?raw'
import { GaussianSplatting as CanvasViz } from '../sections/canvas/GaussianSplatting.tsx'

const GaussianSplattingPage = () => {
  return (
    <div className="experiment flex">
      <CodeSection
        // VertexShader={VertexShader}
        // FragmentShader={FragmentShader}
        CanvasVizRaw={CanvasVizRaw}
      />
      <div className="canvas">
        <span className="bg-text">Gaussian Splatting</span>
        <CanvasViz />
      </div>
    </div>
  )
}

export default GaussianSplattingPage
