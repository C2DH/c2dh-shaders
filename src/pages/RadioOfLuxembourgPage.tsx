import CodeSection from '../sections/CodeSection.tsx'
import CanvasVizRaw from '../sections/canvas/RadioOfLuxembourg.tsx?raw'
import { RadioOfLuxembourg as CanvasViz } from '../sections/canvas/RadioOfLuxembourg.tsx'

const RadioOfLuxembourgPage = () => {
  return (
    <div className="experiment flex">
      <CodeSection CanvasVizRaw={CanvasVizRaw} />
      <div className="canvas">
        <span className="bg-text">Radio Of Luxembourg</span>
        <CanvasViz />
      </div>
    </div>
  )
}

export default RadioOfLuxembourgPage
