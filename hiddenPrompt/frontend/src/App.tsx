import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import { GamePage } from "./pages/GamePage";

const App = () => {
  return (
    <>
        <Routes>
           <Route path="/" element={<Home />}/>
           <Route path="/lobby/:roomCode" element={<Lobby />}/>
           <Route path="/game/:roomCode" element={<GamePage />}/>
        </Routes>
    </>
  )
}

export default App