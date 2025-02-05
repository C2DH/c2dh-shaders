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
      <ul>
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
      </ul>
    </nav>
  );
};

export default Navigation;
