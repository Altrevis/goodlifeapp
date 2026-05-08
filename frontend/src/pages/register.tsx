import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, AlertCircle } from 'lucide-react';
import './css/register.css';

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          age: parseInt(age),
          gender
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('authChange'));
        navigate('/');
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        {/* Logo */}
        <div className="register-logo">
          <Sparkles size={28} color="#10b981" />
          <span>GoodLife</span>
        </div>

        <h2 className="register-title">Créer un compte</h2>
        <p className="register-subtitle">Rejoignez la communauté GoodLife</p>

        <form onSubmit={handleSubmit} className="register-form">

          {/* Prénom + Nom */}
          <div className="register-grid">
            <div className="register-field">
              <label>Prénom</label>
              <div className="register-input-wrapper">
                <User size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="register-field">
              <label>Nom</label>
              <div className="register-input-wrapper">
                <User size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="register-field">
            <label>Email</label>
            <div className="register-input-wrapper">
              <Mail size={15} color="#94a3b8" />
              <input
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="register-field">
            <label>Mot de passe</label>
            <div className="register-input-wrapper">
              <Lock size={15} color="#94a3b8" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Âge + Genre */}
          <div className="register-grid">
            <div className="register-field">
              <label>Âge</label>
              <div className="register-input-wrapper">
                <input
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="register-field">
              <label>Genre</label>
              <div className="register-input-wrapper">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="register-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <p className="register-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
