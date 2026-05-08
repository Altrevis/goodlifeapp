import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';
import './css/login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('authChange'));
        navigate('/');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Identifiants incorrects');
      }
    } catch (err) {
      setError('Impossible de contacter le serveur. Vérifiez que Python tourne.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <Sparkles size={28} color="#10b981" />
          <span>GoodLife</span>
        </div>

        <h2 className="login-title">Connexion</h2>
        <p className="login-subtitle">Bon retour parmi nous</p>

        <form onSubmit={handleSubmit} className="login-form">

          <div className="login-field">
            <label htmlFor="email">Email</label>
            <div className="login-input-wrapper">
              <Mail size={16} color="#94a3b8" />
              <input
                type="email"
                id="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Mot de passe</label>
            <div className="login-input-wrapper">
              <Lock size={16} color="#94a3b8" />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="login-footer">
          Pas de compte ? <Link to="/register">S'inscrire</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
