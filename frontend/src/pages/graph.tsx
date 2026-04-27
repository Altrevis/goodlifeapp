import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Moon, Calendar, Star, Info, Plus } from 'lucide-react';
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
import "./css/graph.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SleepData {
  date: string;
  duration: number;
  quality: number;
}

const Sleep: React.FC = () => {
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [formData, setFormData] = useState({ date: "", duration: "", quality: "" });
  const [message, setMessage] = useState("");

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
      fetchSleepData();
    }
  }, [userId]);

  const fetchSleepData = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/sleep?user_id=${userId}`);
      const data = await response.json();
      if (data.last_7_days) {
        setSleepData(data.last_7_days.map((item: any) => ({
          date: item.date,
          duration: item.duration,
          quality: item.quality
        })));
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/sleep?user_id=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          duration: parseFloat(formData.duration),
          quality: parseInt(formData.quality),
        }),
      });
      if (response.ok) {
        setFormData({ date: "", duration: "", quality: "" });
        fetchSleepData();
      }
    } catch (error) {
      setMessage("Erreur lors de l'ajout");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="graph-container">
      <h1 className="welcome-title">Sommeil <Moon size={36} color="#10b981" /></h1>
      <p className="home-subtitle">Suivez vos cycles de repos pour optimiser votre récupération.</p>

      <div className="sleep-main-grid">
        <div className="card sleep-form-card">
          <div className="card-header-minimal">
            <Plus size={20} color="#10b981" />
            <h2>Nouvelle entrée</h2>
          </div>
          <form onSubmit={handleSubmit} className="premium-form">
            <div className="form-group-minimal">
              <label><Calendar size={14} /> Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="form-group-minimal">
              <label><Info size={14} /> Durée (h)</label>
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} step="0.1" min="0" max="24" required />
            </div>
            <div className="form-group-minimal">
              <label><Star size={14} /> Qualité (1-10)</label>
              <input type="number" name="quality" value={formData.quality} onChange={handleChange} min="1" max="10" required />
            </div>
            <button type="submit" className="card-link full-width">Ajouter</button>
          </form>
        </div>

        <div className="card sleep-history-card">
          <h2>Historique récent</h2>
          <div className="sleep-table-wrapper">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Durée</th>
                  <th>Qualité</th>
                </tr>
              </thead>
              <tbody>
                {sleepData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.date}</td>
                    <td className="weight-bold">{data.duration}h</td>
                    <td><span className="quality-badge">{data.quality}/10</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="chart-section-premium">
        <h2 className="section-title">Analyse Graphique</h2>
        {sleepData.length > 0 ? (
          <div className="graphs-grid-premium">
            <div className="card chart-card">
              <h3>Heures de sommeil</h3>
              <Line
                data={{
                  labels: sleepData.map(d => d.date),
                  datasets: [{
                    label: "Heures",
                    data: sleepData.map(d => d.duration),
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    tension: 0.4,
                    fill: true,
                  }],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>

            <div className="card chart-card">
              <h3>Score de qualité</h3>
              <Line
                data={{
                  labels: sleepData.map(d => d.date),
                  datasets: [{
                    label: "Score",
                    data: sleepData.map(d => d.quality),
                    borderColor: "#8b5cf6",
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                    tension: 0.4,
                    fill: true,
                  }],
                }}
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: { y: { min: 0, max: 10 } }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="empty-state-chart">
            <p>Ajoutez des données pour générer vos graphiques personnalisés.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sleep;