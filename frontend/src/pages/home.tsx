import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Apple, Moon, BotMessageSquare, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="welcome-title">
        Bienvenue sur GoodLife <Sparkles size={32} color="#10b981" />
      </h1>
      <p className="home-subtitle">Votre plateforme de suivi santé et bien-être personnalisée.</p>

      <div className="dashboard-cards">

        {/* SECTION NUTRITION */}
        <div className="card">
          <div className="card-icon-wrapper nutrition">
            <Apple size={42} color="#10b981" />
          </div>
          <h2>Nutrition</h2>
          <p>Suivez vos repas et découvrez des informations nutritionnelles.</p>
          <button className="card-link" onClick={() => navigate('/nutrition')}>Explorer</button>
        </div>

        {/* SECTION SOMMEIL */}
        <div className="card">
          <div className="card-icon-wrapper sleep">
            <Moon size={42} color="#8b5cf6" />
          </div>
          <h2>Sommeil</h2>
          <p>Analysez votre qualité de sommeil et vos cycles de repos.</p>
          <button className="card-link" onClick={() => navigate('/sleep')}>Voir les données</button>
        </div>

        {/* SECTION CHAT IA */}
        <div className="card">
          <div className="card-icon-wrapper chat">
            <BotMessageSquare size={42} color="#0891b2" />
          </div>
          <h2>Chat IA</h2>
          <p>Discutez avec notre assistant IA pour des conseils personnalisés.</p>
          <button className="card-link" onClick={() => navigate('/chat')}>Commencer</button>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "28px 24px",
        textAlign: "center",
        marginTop: "60px"
      }}>
        <p style={{
          fontSize: "12px",
          color: "#475569",
          margin: "0 0 10px",
          lineHeight: 1.6
        }}>
          GoodLife n'est pas un dispositif médical. Les informations fournies ne remplacent pas l'avis d'un professionnel de santé.
        </p>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap" as const
        }}>
          <Link to="/legal" style={{
            fontSize: "12px",
            color: "#10b981",
            textDecoration: "none",
            fontWeight: 500
          }}>
            Mentions légales & Politique de confidentialité
          </Link>
          <span style={{ color: "#1e293b" }}>·</span>
          <span style={{ fontSize: "12px", color: "#334155" }}>© 2026 GoodLife — YNOV Campus</span>
        </div>
      </footer>

    </div>
  );
};

export default Home;