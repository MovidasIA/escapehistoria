import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import HomePage from "./pages/HomePage";
import ClassA from "./pages/ClassA";
import ClassB from "./pages/ClassB";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/5a" element={<ClassA />} />
        <Route path="/5b" element={<ClassB />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
