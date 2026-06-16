import CodeSection from '../sections/CodeSection.tsx'
import FragmentShader from '../shaders/fnr_award/fragment.glsl?raw'
import VertexShader from '../shaders/fnr_award/vertex.glsl?raw'
import CanvasVizRaw from '../sections/canvas/FnrAward.tsx?raw'
import CanvasViz from '../sections/canvas/Refraction/Canvas.tsx'

const RefractionCanvasPage = () => {
  return (
    <div className="experiment flex">
      <CodeSection
        VertexShader={VertexShader}
        FragmentShader={FragmentShader}
        CanvasVizRaw={CanvasVizRaw}
      />
      <div className="canvas">
        <span className="bg-text">Refraction</span>
        <CanvasViz />
      </div>
    </div>
  )
}

export default RefractionCanvasPage
