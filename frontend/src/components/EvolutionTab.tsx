import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
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

const API_URL = 'http://localhost:5000/api/tasks';

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

  // Préparer les données pour le graphique
  const chartData = {
    labels: progressData.map(p => new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
    datasets: [
      {
        label: "Sport (min)",
        data: progressData.map(p => p.sport_total_duration),
        borderColor: "#4A90E2",
        backgroundColor: "rgba(74, 144, 226, 0.2)",
        yAxisID: 'y',
        tension: 0.3
      },
      {
        label: "Nutrition (recettes)",
        data: progressData.map(p => p.nutrition_tasks_completed),
        borderColor: "#28a745",
        backgroundColor: "rgba(40, 167, 69, 0.2)",
        yAxisID: 'y',
        tension: 0.3
      },
      {
        label: "Sommeil (h)",
        data: progressData.map(p => p.sleep_duration_hours),
        borderColor: "#9b59b6",
        backgroundColor: "rgba(155, 89, 182, 0.2)",
        yAxisID: 'y1',
        tension: 0.3
      }
    ]
  };

  if (loading) {
    return <div className="loading">Chargement de l'évolution...</div>;
  }

  return (
    <div className="evolution-container">
      <div className="evolution-header">
        <h2>📊 Évolution de vos progrès</h2>
        <div className="period-selector">
          <button
            className={days === 7 ? 'active' : ''}
            onClick={() => setDays(7)}
          >
            7 jours
          </button>
          <button
            className={days === 30 ? 'active' : ''}
            onClick={() => setDays(30)}
          >
            30 jours
          </button>
          <button
            className={days === 90 ? 'active' : ''}
            onClick={() => setDays(90)}
          >
            90 jours
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-grid">
        <div className="stat-card sport">
          <div className="stat-icon">🏃</div>
          <div className="stat-content">
            <h3>Sport</h3>
            <div className="stat-value">{sportSummary?.total_completions || 0}</div>
            <div className="stat-label">tâches complétées</div>
            <div className="stat-detail">
              {sportSummary?.total_duration || 0} min · Note moyenne: {sportSummary?.avg_rating ? Number(sportSummary.avg_rating).toFixed(1) : '-'}/10
            </div>
          </div>
        </div>

        <div className="stat-card nutrition">
          <div className="stat-icon">🥗</div>
          <div className="stat-content">
            <h3>Alimentation</h3>
            <div className="stat-value">{nutritionSummary?.total_completions || 0}</div>
            <div className="stat-label">recettes réalisées</div>
            <div className="stat-detail">
              Note moyenne: {nutritionSummary?.avg_rating ? Number(nutritionSummary.avg_rating).toFixed(1) : '-'}/10
            </div>
          </div>
        </div>

        <div className="stat-card sleep">
          <div className="stat-icon">😴</div>
          <div className="stat-content">
            <h3>Sommeil</h3>
            <div className="stat-value">{sleepSummary?.avg_sleep_hours ? Number(sleepSummary.avg_sleep_hours).toFixed(1) : 0}h</div>
            <div className="stat-label">moyenne par nuit</div>
            <div className="stat-detail">
              {sleepSummary?.total_completions || 0} nuits · Note: {sleepSummary?.avg_rating ? Number(sleepSummary.avg_rating).toFixed(1) : '-'}/10
            </div>
          </div>
        </div>
      </div>

      {/* Graphique d'évolution */}
      <div className="chart-container" style={{ height: '400px' }}>
        <h3>Évolution sur {days} jours</h3>
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
                  title: { display: true, text: 'Minutes / Tâches' }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  grid: { drawOnChartArea: false },
                  title: { display: true, text: 'Heures' }
                }
              }
            }}
          />
        ) : (
          <div className="no-data">
            <p>Aucune donnée d'évolution pour cette période.</p>
            <p>Complétez des tâches pour voir votre progression ! 🎯</p>
          </div>
        )}
      </div>

      {/* Tableau récapitulatif */}
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
