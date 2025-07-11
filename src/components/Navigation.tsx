import { Link } from "react-router-dom";
import "./Navigation.css";

interface NavigationProps {
  showDocumentation: boolean;
  setShowDocumentation: (value: boolean) => void;
}

const Navigation = ({
  showDocumentation,
  setShowDocumentation,
}: NavigationProps) => {
  return (
    <nav className="flex flex-col menu_panel">
      <ul className="mt-6">
        <li>
          <button onClick={() => setShowDocumentation(!showDocumentation)}>
            Documentation
          </button>
        </li>
        {/* <li>
          <Link to="/">Introduction</Link>
        </li> */}
        <li>
          <Link to="/">Logo C2DH</Link>
        </li>
        <li>
          <Link to="/particals">Particals</Link>
        </li>
        <li>
          <Link to="/mic-input">Microphone Input</Link>
        </li>
        <li>
          <Link to="/morphing">Morphing</Link>
        </li>
        <li>
          <Link to="/earth">Earth</Link>
        </li>
                <li>
          <Link to="/soundwave">Soundwave</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
