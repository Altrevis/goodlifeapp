import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './css/evolution.css';

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

const EvolutionTab: React.FC = () => {
  const [progressData, setProgressData] = useState<DailyProgress[]>([]);
  const [sportSummary, setSportSummary] = useState<Summary | null>(null);
  const [nutritionSummary, setNutritionSummary] = useState<Summary | null>(null);
  const [sleepSummary, setSleepSummary] = useState<Summary | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger le progrès quotidien
      const progressResponse = await axios.get(`${API_URL}/progress/daily?days=${days}`, {
        withCredentials: true
      });
      if (progressResponse.data.success) {
        setProgressData(progressResponse.data.progress);
      }

      // Charger le résumé
      const summaryResponse = await axios.get(`${API_URL}/progress/summary?days=${days}`, {
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
  };

  // Préparer les données pour le graphique
  const chartData = progressData.map(p => ({
    date: new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    Sport: p.sport_total_duration,
    Nutrition: p.nutrition_tasks_completed,
    Sommeil: p.sleep_duration_hours
  }));

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
              {sportSummary?.total_duration || 0} min · Note moyenne: {sportSummary?.avg_rating?.toFixed(1) || '-'}/10
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
              Note moyenne: {nutritionSummary?.avg_rating?.toFixed(1) || '-'}/10
            </div>
          </div>
        </div>

        <div className="stat-card sleep">
          <div className="stat-icon">😴</div>
          <div className="stat-content">
            <h3>Sommeil</h3>
            <div className="stat-value">{sleepSummary?.avg_sleep_hours?.toFixed(1) || 0}h</div>
            <div className="stat-label">moyenne par nuit</div>
            <div className="stat-detail">
              {sleepSummary?.total_completions || 0} nuits · Note: {sleepSummary?.avg_rating?.toFixed(1) || '-'}/10
            </div>
          </div>
        </div>
      </div>

      {/* Graphique d'évolution */}
      <div className="chart-container">
        <h3>Évolution sur {days} jours</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" label={{ value: 'Minutes / Tâches', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Heures', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="Sport" 
                stroke="#4A90E2" 
                strokeWidth={2}
                name="Sport (min)" 
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="Nutrition" 
                stroke="#28a745" 
                strokeWidth={2}
                name="Nutrition (recettes)" 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="Sommeil" 
                stroke="#9b59b6" 
                strokeWidth={2}
                name="Sommeil (h)" 
              />
            </LineChart>
          </ResponsiveContainer>
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
