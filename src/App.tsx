import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PageV1 from "./components/v1/PageV1";

function App() {
  return (
    <Router>
      <nav style={{ marginBottom: 20 }}>
        <Link to="/" style={{ marginRight: 10 }}>
          PageV1
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<PageV1 />} />
      </Routes>
    </Router>
  );
}

export default App;
