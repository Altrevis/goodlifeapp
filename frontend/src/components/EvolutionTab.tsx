import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { 
  TrendingUp, 
  Dumbbell, 
  Utensils, 
  Moon, 
  Target, 
  Activity 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './css/evolution.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = 'http://127.0.0.1:5000/api/tasks';

interface DailyProgress {
  date: string;
  sport_tasks_completed: number;
  sport_total_duration: number;
  nutrition_tasks_completed: number;
  sleep_tasks_completed: number;
  sleep_duration_hours: number;
}

interface Summary {
  total_completions: number;
  total_duration?: number;
  avg_rating: number;
  avg_sleep_hours?: number;
}

interface EvolutionTabProps {
  userId: number | null;
}

const EvolutionTab: React.FC<EvolutionTabProps> = ({ userId }) => {
  const [progressData, setProgressData] = useState<DailyProgress[]>([]);
  const [sportSummary, setSportSummary] = useState<Summary | null>(null);
  const [nutritionSummary, setNutritionSummary] = useState<Summary | null>(null);
  const [sleepSummary, setSleepSummary] = useState<Summary | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Charger le progrès quotidien
      const progressResponse = await axios.get(`${API_URL}/progress/daily?days=${days}&user_id=${userId}`, {
        withCredentials: true
      });
      if (progressResponse.data.success) {
        setProgressData(progressResponse.data.progress);
      }

      // Charger le résumé
      const summaryResponse = await axios.get(`${API_URL}/progress/summary?days=${days}&user_id=${userId}`, {
        withCredentials: true
      });
      if (summaryResponse.data.success) {
        setSportSummary(summaryResponse.data.sport);
        setNutritionSummary(summaryResponse.data.nutrition);
        setSleepSummary(summaryResponse.data.sleep);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  }, [days, userId]);

  useEffect(() => {
    loadData();
  }, [days, loadData]);

  // Préparer les données pour le graphique avec les couleurs harmonisées
  const chartData = {
    labels: progressData.map(p => new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
    datasets: [
      {
        label: "Sport (min)",
        data: progressData.map(p => p.sport_total_duration),
        borderColor: "#10b981", // Vert GoodLife
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        yAxisID: 'y',
        tension: 0.3
      },
      {
        label: "Nutrition (tâches)",
        data: progressData.map(p => p.nutrition_tasks_completed),
        borderColor: "#3b82f6", // Bleu
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        yAxisID: 'y',
        tension: 0.3
      },
      {
        label: "Sommeil (h)",
        data: progressData.map(p => p.sleep_duration_hours),
        borderColor: "#8b5cf6", // Violet
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        yAxisID: 'y1',
        tension: 0.3
      }
    ]
  };

  if (loading) {
    return <div className="loading">Analyse de vos progrès en cours...</div>;
  }

  return (
    <div className="evolution-container">
      <div className="evolution-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TrendingUp size={28} color="#10b981" />
          <h2>Évolution de vos progrès</h2>
        </div>
        <div className="period-selector">
          <button className={days === 7 ? 'active' : ''} onClick={() => setDays(7)}>7 jours</button>
          <button className={days === 30 ? 'active' : ''} onClick={() => setDays(30)}>30 jours</button>
          <button className={days === 90 ? 'active' : ''} onClick={() => setDays(90)}>90 jours</button>
        </div>
      </div>

     <div className="stats-grid">
  {/* Carte Sport - Vert */}
  <div className="stat-card sport">
    <div className="stat-icon">
      <Dumbbell size={24} color="#10b981" />
    </div>
    <div className="stat-content">
      <h3 style={{ color: "#10b981" }}>Sport</h3>
      <div className="stat-value">{sportSummary?.total_completions || 0}</div>
      {/* ... reste du contenu ... */}
    </div>
  </div>

  {/* Carte Alimentation - Bleu */}
  <div className="stat-card nutrition">
    <div className="stat-icon">
      <Utensils size={24} color="#4A90E2" /> {/* Couleur accordée à ta bordure bleue */}
    </div>
    <div className="stat-content">
      <h3 style={{ color: "#4A90E2" }}>Alimentation</h3>
      <div className="stat-value">{nutritionSummary?.total_completions || 0}</div>
      {/* ... reste du contenu ... */}
    </div>
  </div>

  {/* Carte Sommeil - Violet */}
  <div className="stat-card sleep">
    <div className="stat-icon">
      <Moon size={24} color="#9b59b6" /> {/* Couleur accordée à ta bordure violette */}
    </div>
    <div className="stat-content">
      <h3 style={{ color: "#9b59b6" }}>Sommeil</h3>
      <div className="stat-value">{sleepSummary?.avg_sleep_hours ? Number(sleepSummary.avg_sleep_hours).toFixed(1) : 0}h</div>
      {/* ... reste du contenu ... */}
    </div>
  </div>
</div>
      <div className="chart-container" style={{ height: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
           <Activity size={20} color="#64748b" />
           <h3>Progression sur {days} jours</h3>
        </div>
        {chartData.labels.length > 0 ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: { display: true, text: 'Minutes / Tâches', font: { weight: 'bold' } }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  grid: { drawOnChartArea: false },
                  title: { display: true, text: 'Heures de sommeil', font: { weight: 'bold' } }
                }
              }
            }}
          />
        ) : (
          <div className="no-data">
            <Target size={40} color="#cbd5e1" />
            <p>Aucune donnée d'évolution pour cette période.</p>
            <p>Complétez des tâches pour voir votre progression !</p>
          </div>
        )}
      </div>

      {progressData.length > 0 && (
        <div className="progress-table">
          <h3>Détail quotidien</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sport</th>
                <th>Nutrition</th>
                <th>Sommeil</th>
              </tr>
            </thead>
            <tbody>
              {progressData.slice().reverse().map((p, index) => (
                <tr key={index}>
                  <td>{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                  <td>
                    {p.sport_tasks_completed} tâches
                    <br />
                    <small>{p.sport_total_duration} min</small>
                  </td>
                  <td>{p.nutrition_tasks_completed} recettes</td>
                  <td>{p.sleep_duration_hours.toFixed(1)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EvolutionTab;