import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Moon, Calendar, Star, Activity, Plus } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import "./css/sleep.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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
      } catch (e) { return null; }
    }
    return null;
  };

  const userId = getUserId();

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
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (userId) fetchSleepData();
  }, [userId]);

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
    } catch (error) { setMessage("Erreur de connexion"); }
  };

  return (
    <div className="sleep-container">
      <h1 className="welcome-title">Sommeil <Moon size={36} color="#10b981" /></h1>
      <p className="home-subtitle">Optimisez votre récupération avec un suivi précis de vos nuits.</p>

      <div className="sleep-content-grid">
        <div className="card sleep-form-card">
          <div className="card-header">
            <Plus size={20} color="#10b981" />
            <h2>Ajouter une nuit</h2>
          </div>
          <form onSubmit={handleSubmit} className="premium-form">
            <div className="input-group">
              <label><Calendar size={16} /> Date</label>
              <input type="date" name="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div className="input-group">
              <label><Activity size={16} /> Durée (h)</label>
              <input type="number" name="duration" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} step="0.1" required />
            </div>
            <div className="input-group">
              <label><Star size={16} /> Qualité (1-10)</label>
              <input type="number" name="quality" value={formData.quality} onChange={(e) => setFormData({...formData, quality: e.target.value})} min="1" max="10" required />
            </div>
            <button type="submit" className="card-link full-width">Enregistrer la nuit</button>
          </form>
        </div>

        <div className="card sleep-history-card">
          <h2>Historique récent</h2>
          <div className="table-container">
            <table className="sleep-table">
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
                    <td className="bold">{data.duration}h</td>
                    <td><span className="badge-quality">{data.quality}/10</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="charts-section">
        {sleepData.length > 0 ? (
          <div className="charts-grid">
            <div className="card chart-card">
              <h3>Cycle de durée</h3>
              <Line 
                data={{
                  labels: sleepData.map(d => d.date),
                  datasets: [{
                    label: 'Heures',
                    data: sleepData.map(d => d.duration),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                  }]
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
            <div className="card chart-card">
              <h3>Score de Qualité</h3>
              <Line 
                data={{
                  labels: sleepData.map(d => d.date),
                  datasets: [{
                    label: 'Score',
                    data: sleepData.map(d => d.quality),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                  }]
                }}
                options={{ responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 10 } } }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Sleep;