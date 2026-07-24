import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";

const App = () => {
  return (
    <>
        <Routes>
           <Route path="/" element={<Home />}/>
           <Route path="/lobby/:roomCode" element={<Lobby />}/>
        </Routes>
    </>
  )
}

export default App