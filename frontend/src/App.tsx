import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Graph from "./pages/graph";
import Chat from "./pages/chat";

interface ApiResponse {
  message: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.json())
      .then((data: ApiResponse) => setData(data))
      .catch((err) => console.error("Erreur API :", err));
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Bien-être & Santé 🌿</h1>
          <nav className="nav-bar">
            <Link to="/">Accueil</Link>
            <Link to="/graph">Graph</Link>
            <Link to="/chat">Chat</Link>
          </nav>
        </header>

        <main className="App-main">
          <Routes>
            <Route
              path="/"
              element={
                <div className="home-content">
                  <h2>Bienvenue sur votre espace Bien-être</h2>
                  <p>
                    Suivez votre fatigue, votre nutrition et discutez avec notre assistant santé pour
                    améliorer votre quotidien.
                  </p>
                  <p>{data ? data.message : "Connexion au serveur en cours..."}</p>
                </div>
              }
            />
            <Route path="/graph" element={<Graph />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
