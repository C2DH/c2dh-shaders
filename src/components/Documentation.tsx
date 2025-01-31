import GLSLCodeBlock from "../components/GLSLCodeBlock";
import values from "../assets/variables.glsl?raw";
import Resources from "../assets/Resources";
import Functions from "../assets/Functions";
import TPosition from "../assets/tips/TPosition.tsx?raw";
import "./Documentation.css";

const Documentation = () => {
  return (
    <div className="Documentation relative">
      <h1 className="mt-15">Documentation</h1>
      <div className="documentation-content">
        <h2>Resources</h2>
        <Resources />
        <h2>Functions</h2>
        <p>The most used functions</p>
        <Functions />
        <GLSLCodeBlock glslCode={values} glslTitle="Variables" />
        <h2>Tips</h2>
        <GLSLCodeBlock typeScriptCode={TPosition} tsTitle="Position" />
      </div>
    </div>
  );
};

export default Documentation;
