import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Nutrition from "./pages/nutrition";
import Chat from "./pages/chat";
import Sleep from "./pages/sleep";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData && userData.first_name) {
            setIsLoggedIn(true);
            setUserName(userData.first_name);
            return;
          }
        } catch (e) {
          // Si le JSON est invalide (ex: "undefined"), on nettoie
          localStorage.removeItem("user");
        }
      }
      setIsLoggedIn(false);
      setUserName("");
    };

    checkAuth();

    // Listen for storage changes (in case of logout from another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    // Listen for custom auth event
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    // Dispatch custom event to update any listeners
    window.dispatchEvent(new Event('authChange'));
  };

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="nav-logo">
          🌟 GoodLife
        </Link>
        <ul className="nav-menu">
          {isLoggedIn ? (
            <>
              <li>
                <Link to="/">Accueil</Link>
              </li>
              <li>
                <Link to="/nutrition">Nutrition</Link>
              </li>
              <li>
                <Link to="/sleep">Sommeil</Link>
              </li>
              <li>
                <Link to="/chat">Chat IA</Link>
              </li>
              <li className="user-info">
                👤 {userName}
                <button onClick={handleLogout} className="logout-btn">
                  Déconnexion
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Connexion</Link>
              </li>
              <li>
                <Link to="/register">Inscription</Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/nutrition" element={isLoggedIn ? <Nutrition /> : <Navigate to="/login" />} />
        <Route path="/chat" element={isLoggedIn ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/sleep" element={isLoggedIn ? <Sleep /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
