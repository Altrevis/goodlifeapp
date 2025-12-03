import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <h1>Bienvenue sur GoodLife 🌟</h1>
      <p>Votre plateforme de suivi santé et bien-être</p>

      <div className="dashboard-cards">
        <div className="card">
          <h3>Nutrition 🍎</h3>
          <p>Suivez vos repas et découvrez des informations nutritionnelles</p>
          <Link to="/nutrition" className="card-link">Explorer</Link>
        </div>

        <div className="card">
          <h3>Sommeil 🛌</h3>
          <p>Analysez votre qualité de sommeil</p>
          <Link to="/sleep" className="card-link">Voir les données</Link>
        </div>

        <div className="card">
          <h3>Chat IA 🤖</h3>
          <p>Discutez avec notre assistant IA pour des conseils personnalisés</p>
          <Link to="/chat" className="card-link">Commencer</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
