import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import HomePage from "./pages/HomePage";
import ClassA from "./pages/ClassA";
import ClassB from "./pages/ClassB";
import EscapeRoomHome from "./pages/EscapeRoomHome";
import MasterPanel from "./pages/MasterPanel";
import StudentTablet from "./pages/StudentTablet";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/5a" element={<ClassA />} />
        <Route path="/5b" element={<ClassB />} />
        <Route path="/escape-room" element={<EscapeRoomHome />} />
        <Route path="/escape-room/master" element={<MasterPanel />} />
        <Route path="/escape-room/tablet" element={<StudentTablet />} />
        <Route path="/escape-room/tablet/:groupId" element={<StudentTablet />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
