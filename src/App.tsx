import { Routes, Route } from "react-router-dom";
import Page from "./pages/Page";
import { useEffect, useState } from "react";
import Button from "./components/Button";
import { Menu, CodeBrackets, Xmark } from "iconoir-react";
import Navigation from "./components/Navigation";
import Documentation from "./components/Documentation";
import useGlobalState from "./components/store";

interface GlobalState {
  showGLSL: boolean;
  setShowGLSL: (showGLSL: boolean) => void;
  showTS: boolean;
  setShowTS: (showTS: boolean) => void;
}

function App() {
  const [showCoodeMenu, setShowCodeMenu] = useState(true);
  const [showMenu, setMenu] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(true);
  const { showGLSL, setShowGLSL, showTS, setShowTS } =
    useGlobalState() as GlobalState;

  // Update showGLSL based on showMenu
  useEffect(() => {
    if (!showCoodeMenu) {
      setShowGLSL(true);
    }
  }, [showCoodeMenu]);

  useEffect(() => {
    if (!showTS && !showGLSL) {
      console.log("Closing Code Menu");
      setShowCodeMenu(!showCoodeMenu);
    }
  }, [showTS, showGLSL]); // Correct dependencies

  return (
    <div
      className={`${showCoodeMenu ? "coodeMenuIsActive" : ""} ${
        showMenu ? "menuIsActive" : ""
      } ${showDocumentation ? "documentationIsActive" : ""}  App`}
    >
      <Documentation />
      <Navigation
        showDocumentation={showDocumentation}
        setShowDocumentation={setShowDocumentation}
      />
      {!showDocumentation ? (
        <Button
          className="circle absolute mt-5 ml-6 z-8"
          onClick={() => setShowDocumentation(!showDocumentation)}
        >
          <Xmark />
        </Button>
      ) : null}

      {!showCoodeMenu ? (
        <>
          <Button
            className={`circle show-code mt-5 ml-20 absolute z-8 ${
              showGLSL ? "" : "inactive"
            }`}
            onClick={() => setShowGLSL(!showGLSL)}
          >
            GLSL
          </Button>
          <Button
            className={`circle show-code mt-5 ml-34 absolute z-8 ${
              showTS ? "" : "inactive"
            }`}
            onClick={() => setShowTS(!showTS)}
          >
            TS
          </Button>
        </>
      ) : null}
      <Button
        ariaLabel="Show Code"
        className="code_panel_btn circle absolute mt-5 ml-6 z-4"
        onClick={() => {
          setShowCodeMenu(!showCoodeMenu);
        }}
      >
        <CodeBrackets />
      </Button>
      <Button
        ariaLabel="Show Menu"
        className="menu_panel_btn circle absolute mt-5 z-3 right-6"
        onClick={() => setMenu(!showMenu)}
      >
        <Menu />
      </Button>

      <Routes>
        {/* <Route path="/" element={<Page.Introduction />} /> */}
        <Route path="/" element={<Page.LogoC2dh />} />
        <Route path="/particals" element={<Page.Particals />} />
        <Route path="/mic-input" element={<Page.MicInput />} />
        <Route path="/morphing" element={<Page.Morphing />} />
        <Route path="/earth" element={<Page.Earth />} />      
         <Route path="/soundwave" element={<Page.Soundwave />} />
      </Routes>
    </div>
  );
}

export default App;
