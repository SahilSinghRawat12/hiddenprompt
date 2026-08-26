import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import { GamePage } from "./pages/GamePage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    
        <Routes>

          {/* Public Route */}
           <Route path="/" element={<Home />}/>

           {/* Protected Routes */}
           <Route element={<ProtectedRoute />} >
              <Route path="/lobby/:roomCode" element={<Lobby />}/>
              <Route path="/game/:roomCode" element={<GamePage />}/>
           </Route>

           {/* Catch-all fallback */}
          <Route path="*" element={<Home />} />

        </Routes>
    
  );
}

export default App