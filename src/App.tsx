import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PageV1 from "./components/v1/PageV1";
import PageV2 from "./components/v2/PageV2";
import PageV3 from "./components/v3/PageV3";

function App() {
  return (
    <Router>
      <nav style={{ marginBottom: 20 }}>
        <Link to="/" style={{ marginRight: 10 }}>
       v1-draft-js
        </Link>
        <Link to="/v2" style={{ marginRight: 10 }}>
        v2-react-draft-wysiwyg
        </Link>
        <Link to="/v3" style={{ marginRight: 10 }}>
        lexical
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<PageV1 />} />
        <Route path="/v2" element={<PageV2 />} />
        <Route path="/v3" element={<PageV3/>} />
      </Routes>
    </Router>
  );
}

export default App;
