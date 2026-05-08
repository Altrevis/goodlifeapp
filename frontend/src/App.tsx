import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { Sparkles, LogOut, User, Apple, Moon, MessageSquare, Home as HomeIcon } from 'lucide-react';
import "./pages/css/App.css";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Nutrition from "./pages/nutrition";
import Chat from "./pages/chat";
import Sleep from "./pages/sleep";
import ProfilePage from "./pages/profile";
import MentionsLegales from "./pages/MentionsLegales";

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [navPhoto, setNavPhoto] = useState<string | null>(null);
  const location = useLocation();
  const isDarkPage = location.pathname === "/legal";

  const checkAuth = () => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData && userData.first_name) {
          setIsLoggedIn(true);
          setUserName(userData.first_name);
          setNavPhoto(localStorage.getItem('profile_photo'));
          return;
        }
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setIsLoggedIn(false);
    setUserName("");
    setNavPhoto(null);
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authChange', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    checkAuth();
    window.dispatchEvent(new Event('authChange'));
  };

  return (
    <>
      <nav className={`navbar${isDarkPage ? " navbar-dark" : ""}`}>
        <Link to="/" className="nav-logo">
          <Sparkles size={24} color="#10b981" style={{ marginRight: '8px' }} />
          GoodLife
        </Link>
        <ul className="nav-menu">
          {isLoggedIn ? (
            <>
              <li><Link to="/"><HomeIcon size={18} /> Accueil</Link></li>
              <li><Link to="/nutrition"><Apple size={18} /> Nutrition</Link></li>
              <li><Link to="/sleep"><Moon size={18} /> Sommeil</Link></li>
              <li><Link to="/chat"><MessageSquare size={18} /> Chat IA</Link></li>
              <li className="nav-profile-wrapper">
                <Link to="/profile" className="nav-link">
                  <div className="nav-avatar-placeholder">
                    {navPhoto
                      ? <img src={navPhoto} alt="profil" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                      : <User size={18} color="#10b981" />
                    }
                  </div>
                  <span style={{ marginLeft: '8px' }}>{userName}</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn-icon" title="Déconnexion">
                  <LogOut size={18} />
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Connexion</Link></li>
              <li><Link to="/register" className="explorer-btn" style={{ marginTop: 0 }}>S'ouvrir un compte</Link></li>
            </>
          )}
        </ul>
      </nav>

      <div className={`App${isDarkPage ? " App-dark" : ""}`}>
        <Routes>
          <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
          <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isLoggedIn ? <Register /> : <Navigate to="/" />} />
          <Route path="/nutrition" element={isLoggedIn ? <Nutrition /> : <Navigate to="/login" />} />
          <Route path="/chat" element={isLoggedIn ? <Chat /> : <Navigate to="/login" />} />
          <Route path="/sleep" element={isLoggedIn ? <Sleep /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />} />
          {/* Route publique — pas besoin d'être connecté */}
          <Route path="/legal" element={<MentionsLegales />} />
        </Routes>
      </div>
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;