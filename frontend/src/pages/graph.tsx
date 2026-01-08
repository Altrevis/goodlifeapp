import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import "./css/graph.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ComparisonData {
  user: number;
  average: number;
  difference: number;
  difference_percentage: number;
}

interface TrendData {
  date: string;
  weight?: number;
  heart_rate?: number;
  sleep_hours?: number;
  calories_burned?: number;
  steps?: number;
}

const Graph: React.FC = () => {
  const [comparison, setComparison] = useState<Record<string, ComparisonData> | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('weight');

  const getUserId = (): number | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        return userData.id || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const userId = getUserId();

  useEffect(() => {
    if (userId) {
      fetchComparisonData();
      fetchTrendsData();
    } else {
      setError('Utilisateur non connecté');
      setLoading(false);
    }
  }, [userId]);

  const fetchComparisonData = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:5000/profile/${userId}/history?limit=30`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      
      const data = await response.json();
      
      // Calculer les moyennes à partir de l'historique
      if (data.length > 0) {
        const avgData = {
          weight: data.reduce((sum: number, d: TrendData) => sum + (d.weight || 0), 0) / data.length,
          heart_rate: data.reduce((sum: number, d: TrendData) => sum + (d.heart_rate || 0), 0) / data.length,
          sleep_hours: data.reduce((sum: number, d: TrendData) => sum + (d.sleep_hours || 0), 0) / data.length,
          calories_burned: data.reduce((sum: number, d: TrendData) => sum + (d.calories_burned || 0), 0) / data.length,
          steps: data.reduce((sum: number, d: TrendData) => sum + (d.steps || 0), 0) / data.length,
        };

        const latest = data[0];
        const comparisonData: Record<string, ComparisonData> = {};

        Object.keys(avgData).forEach(key => {
          const userValue = latest[key as keyof TrendData] as number || 0;
          const avgValue = avgData[key as keyof typeof avgData];
          const diff = userValue - avgValue;
          comparisonData[key] = {
            user: userValue,
            average: avgValue,
            difference: diff,
            difference_percentage: avgValue ? (diff / avgValue) * 100 : 0
          };
        });

        setComparison(comparisonData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const fetchTrendsData = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:5000/profile/${userId}/history?limit=30`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des tendances');
      
      const data = await response.json();
      setTrends(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoading(false);
    }
  };

  const getComparisonChartData = () => {
    if (!comparison) return null;

    const labels = Object.keys(comparison).map(key => {
      const labels: Record<string, string> = {
        'weight': 'Poids (kg)',
        'height': 'Taille (cm)',
        'heart_rate': 'Rythme cardiaque',
        'sleep_hours': 'Sommeil (h)',
        'calories_burned': 'Calories',
        'steps': 'Pas'
      };
      return labels[key] || key;
    });

    const userData = Object.values(comparison).map(item => item.user);
    const avgData = Object.values(comparison).map(item => item.average);

    return {
      labels,
      datasets: [
        {
          label: 'Vos données',
          data: userData,
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
        },
        {
          label: 'Votre moyenne',
          data: avgData,
          backgroundColor: 'rgba(118, 75, 162, 0.8)',
          borderColor: 'rgba(118, 75, 162, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  const getTrendsChartData = () => {
    if (!trends || trends.length === 0) return null;

    const labels = trends.map(item => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const metricLabels: Record<string, string> = {
      'weight': 'Poids (kg)',
      'heart_rate': 'Rythme cardiaque (bpm)',
      'sleep_hours': 'Sommeil (heures)',
      'calories_burned': 'Calories brûlées',
      'steps': 'Nombre de pas'
    };

    const data = trends.map(item => {
      const value = item[selectedMetric as keyof TrendData];
      return typeof value === 'number' ? value : null;
    });

    return {
      labels,
      datasets: [
        {
          label: metricLabels[selectedMetric] || selectedMetric,
          data,
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  if (loading) {
    return <div className="graph-container loading">Chargement des données...</div>;
  }

  if (error) {
    return <div className="graph-container error">{error}</div>;
  }

  if (!userId) {
    return <div className="graph-container error">Veuillez vous connecter</div>;
  }

  const comparisonData = getComparisonChartData();
  const trendsData = getTrendsChartData();

  return (
    <div className="graph-container">
      <h1>📊 Mes Statistiques & Comparaisons</h1>

      <div className="stats-grid">
        {comparison && Object.entries(comparison).map(([key, data]) => {
          const isPositive = data.difference_percentage > 0;
          const metricNames: Record<string, string> = {
            'weight': 'Poids',
            'height': 'Taille',
            'heart_rate': 'Rythme cardiaque',
            'sleep_hours': 'Sommeil',
            'calories_burned': 'Calories',
            'steps': 'Pas'
          };

          return (
            <div key={key} className="stat-card">
              <h3>{metricNames[key] || key}</h3>
              <div className="stat-values">
                <div className="user-value">
                  <span className="label">Vous</span>
                  <span className="value">{data.user?.toFixed(1) || '-'}</span>
                </div>
                <div className="avg-value">
                  <span className="label">Moyenne</span>
                  <span className="value">{data.average?.toFixed(1) || '-'}</span>
                </div>
              </div>
              <div className={`difference ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(data.difference_percentage).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>

      <div className="chart-section">
        <h2>Comparaison avec les moyennes</h2>
        {comparisonData && (
          <div className="chart-wrapper">
            <Bar data={comparisonData} options={chartOptions} />
          </div>
        )}
      </div>

      <div className="chart-section">
        <div className="section-header">
          <h2>Évolution sur 30 jours</h2>
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="metric-selector"
          >
            <option value="weight">Poids</option>
            <option value="heart_rate">Rythme cardiaque</option>
            <option value="sleep_hours">Sommeil</option>
            <option value="calories_burned">Calories brûlées</option>
            <option value="steps">Pas</option>
          </select>
        </div>
        {trendsData && (
          <div className="chart-wrapper">
            <Line data={trendsData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Graph;
