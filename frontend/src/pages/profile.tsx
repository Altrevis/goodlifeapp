import React, { useState, useEffect } from 'react';
import './css/profile.css';

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  age: number | null;
  gender: string | null;
}

interface HealthData {
  date?: string;
  weight?: number | null;
  height?: number | null;
  heart_rate?: number | null;
  sleep_hours?: number | null;
  calories_burned?: number | null;
  steps?: number | null;
}

interface CaloriesResult {
  name: string;
  calories_per_hour: number;
  duration_minutes: number;
  total_calories: number;
}

interface Activity {
  label: string;  // Nom en français
  value: string;  // Nom en anglais pour l'API
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [healthData, setHealthData] = useState<HealthData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Calculateur de calories
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [caloriesResult, setCaloriesResult] = useState<CaloriesResult | null>(null);
  const [calculatingCalories, setCalculatingCalories] = useState(false);
  
  // Données du formulaire
  const [formData, setFormData] = useState<HealthData>({
    weight: undefined,
    height: undefined,
    heart_rate: undefined,
    sleep_hours: undefined,
    calories_burned: undefined,
    steps: undefined,
  });

  // Récupérer l'ID de l'utilisateur connecté depuis localStorage
  const getUserId = (): number | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        return userData.id || null;
      } catch (e) {
        console.error('Erreur lors de la lecture du user depuis localStorage:', e);
        return null;
      }
    }
    return null;
  };

  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    
    if (id) {
      fetchProfile(id);
      fetchActivities(id);
    } else {
      setError('Utilisateur non connecté');
      setLoading(false);
    }
  }, []);

  const fetchActivities = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/profile/activities`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.activities) {
          setActivities(data.activities);
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des activités:', err);
    }
  };

  const fetchProfile = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/profile/${id}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du profil');
      }

      const data = await response.json();
      setUser(data.user);
      setHealthData(data.health_data || {});
      
      // Pré-remplir le formulaire avec les données existantes
      if (data.health_data) {
        setFormData({
          weight: data.health_data.weight !== null ? data.health_data.weight : null,
          height: data.health_data.height !== null ? data.health_data.height : null,
          heart_rate: data.health_data.heart_rate !== null ? data.health_data.heart_rate : null,
          sleep_hours: data.health_data.sleep_hours !== null ? data.health_data.sleep_hours : null,
          calories_burned: data.health_data.calories_burned !== null ? data.health_data.calories_burned : null,
          steps: data.health_data.steps !== null ? data.health_data.steps : null,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : Number(value)
    }));
  };

  const handleCalculateCalories = async () => {
    if (!userId || !selectedActivity) {
      setError('Veuillez sélectionner une activité');
      return;
    }

    setCalculatingCalories(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/profile/calculate-calories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          activity: selectedActivity,
          duration: duration,
          use_profile_weight: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du calcul');
      }

      const data = await response.json();
      
      if (data.success && data.results && data.results.length > 0) {
        setCaloriesResult(data.results[0]);
        setSuccess(`Calories calculées : ${data.results[0].total_calories} kcal`);
        
        // Mettre à jour le champ calories dans le formulaire
        setFormData(prev => ({
          ...prev,
          calories_burned: data.results[0].total_calories
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du calcul des calories');
    } finally {
      setCalculatingCalories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!userId) {
      setError('Utilisateur non connecté');
      return;
    }

    // Ne garder que les valeurs qui ont changé et qui ne sont pas vides/null
    const dataToSend: any = {};
    
    if (formData.weight !== null && formData.weight !== undefined && formData.weight !== healthData.weight) {
      dataToSend.weight = formData.weight;
    }
    if (formData.height !== null && formData.height !== undefined && formData.height !== healthData.height) {
      dataToSend.height = formData.height;
    }
    if (formData.heart_rate !== null && formData.heart_rate !== undefined && formData.heart_rate !== healthData.heart_rate) {
      dataToSend.heart_rate = formData.heart_rate;
    }
    if (formData.sleep_hours !== null && formData.sleep_hours !== undefined && formData.sleep_hours !== healthData.sleep_hours) {
      dataToSend.sleep_hours = formData.sleep_hours;
    }
    if (formData.calories_burned !== null && formData.calories_burned !== undefined && formData.calories_burned !== healthData.calories_burned) {
      dataToSend.calories_burned = formData.calories_burned;
    }
    if (formData.steps !== null && formData.steps !== undefined && formData.steps !== healthData.steps) {
      dataToSend.steps = formData.steps;
    }

    // Si aucune donnée n'a changé, ne pas faire de requête
    if (Object.keys(dataToSend).length === 0) {
      setSuccess('Aucune modification détectée');
      setTimeout(() => setSuccess(null), 2000);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/profile/health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...dataToSend, user_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des données');
      }

      await response.json();
      setSuccess('Données enregistrées avec succès !');
      
      // Recharger les données
      if (userId) {
        setTimeout(() => {
          fetchProfile(userId);
          setSuccess(null);
        }, 2000);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  if (loading) {
    return <div className="profile-container loading">Chargement...</div>;
  }

  if (!user) {
    return <div className="profile-container error">Utilisateur non trouvé</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Mon Profil</h1>
        <div className="user-info">
          <h2>{user.first_name} {user.last_name}</h2>
          <p className="email">{user.email}</p>
          {user.age && <p>Âge: {user.age} ans</p>}
          {user.gender && <p>Sexe: {user.gender === 'male' ? 'Homme' : 'Femme'}</p>}
        </div>
      </div>

      <div className="profile-content">
        <div className="current-data-section">
          <h3>Mes dernières données</h3>
          <div className="health-data-grid">
            <div className="data-card">
              <span className="data-label">Poids</span>
              <span className="data-value">{healthData.weight ? `${healthData.weight} kg` : '-'}</span>
            </div>
            <div className="data-card">
              <span className="data-label">Taille</span>
              <span className="data-value">{healthData.height ? `${healthData.height} cm` : '-'}</span>
            </div>
            <div className="data-card">
              <span className="data-label">Fréquence cardiaque</span>
              <span className="data-value">{healthData.heart_rate ? `${healthData.heart_rate} bpm` : '-'}</span>
            </div>
            <div className="data-card">
              <span className="data-label">Heures de sommeil</span>
              <span className="data-value">{healthData.sleep_hours ? `${healthData.sleep_hours} h` : '-'}</span>
            </div>
            <div className="data-card">
              <span className="data-label">Calories brûlées</span>
              <span className="data-value">{healthData.calories_burned ? `${healthData.calories_burned} kcal` : '-'}</span>
            </div>
            <div className="data-card">
              <span className="data-label">Pas</span>
              <span className="data-value">{healthData.steps ? healthData.steps.toLocaleString() : '-'}</span>
            </div>
          </div>
          {healthData.date && (
            <p className="last-update">Dernière mise à jour : {new Date(healthData.date).toLocaleDateString('fr-FR')}</p>
          )}
        </div>

        <div className="calories-calculator-section">
          <h3>🔥 Calculateur de calories brûlées</h3>
          <p className="calculator-description">
            Sélectionnez une activité sportive et sa durée pour calculer automatiquement les calories brûlées en fonction de votre poids.
          </p>
          
          <div className="calculator-form">
            <div className="form-group">
              <label htmlFor="activity">Activité sportive</label>
              <select
                id="activity"
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="activity-select"
              >
                <option value="">-- Sélectionner une activité --</option>
                {activities.map((activity) => (
                  <option key={activity.value} value={activity.value}>
                    {activity.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Durée (minutes)</label>
              <input
                type="number"
                id="duration"
                min="1"
                max="600"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                placeholder="Ex: 30"
              />
            </div>

            <button 
              onClick={handleCalculateCalories}
              disabled={!selectedActivity || calculatingCalories}
              className="btn-calculate"
            >
              {calculatingCalories ? 'Calcul en cours...' : 'Calculer les calories'}
            </button>

            {caloriesResult && (
              <div className="calories-result">
                <h4>Résultat :</h4>
                <p><strong>{caloriesResult.name}</strong></p>
                <p>Durée : {caloriesResult.duration_minutes} minutes</p>
                <p>Calories/heure : {caloriesResult.calories_per_hour} kcal</p>
                <p className="total-calories">Total : <strong>{caloriesResult.total_calories} kcal</strong></p>
                <p className="info-text">💡 Cette valeur a été ajoutée au champ "Calories brûlées" ci-dessous</p>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3>Mettre à jour mes données</h3>
          
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="weight">Poids (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  step="0.1"
                  min="0"
                  max="500"
                  value={formData.weight !== null ? formData.weight : ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 70.5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="height">Taille (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  step="0.1"
                  min="0"
                  max="300"
                  value={formData.height !== null ? formData.height : ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 175"
                />
              </div>

              <div className="form-group">
                <label htmlFor="heart_rate">Fréquence cardiaque (bpm)</label>
                <input
                  type="number"
                  id="heart_rate"
                  name="heart_rate"
                  min="0"
                  max="300"
                  value={formData.heart_rate !== null ? formData.heart_rate : ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 72"
                />
              </div>

              <div className="form-group">
                <label htmlFor="sleep_hours">Heures de sommeil</label>
                <input
                  type="number"
                  id="sleep_hours"
                  name="sleep_hours"
                  step="0.1"
                  min="0"
                  max="24"
                  value={formData.sleep_hours !== null ? formData.sleep_hours : ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 8"
                />
              </div>

              <div className="form-group">
                <label htmlFor="calories_burned">Calories brûlées (kcal)</label>
                <input
                  type="number"
                  id="calories_burned"
                  name="calories_burned"
                  step="1"
                  min="0"
                  max="10000"
                  value={formData.calories_burned !== null ? formData.calories_burned : ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 2000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="steps">Nombre de pas</label>
                <input
                  type="number"
                  id="steps"
                  name="steps"
                  min="0"
                  max="100000"
                  value={formData.steps !== null ? formData.steps : ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 10000"
                />
              </div>
            </div>

            <button type="submit" className="btn-submit">
              Enregistrer mes données
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
