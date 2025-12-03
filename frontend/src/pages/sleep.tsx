import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SleepData {
  date: string;
  duration: number;
  quality: number;
}

const Sleep: React.FC = () => {
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [formData, setFormData] = useState({ date: "", duration: "", quality: "" });
  const [message, setMessage] = useState("");

  const userId = 1; // Assuming user ID 1 for now

  useEffect(() => {
    fetchSleepData();
  }, []);

  const fetchSleepData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sleep/${userId}`);
      const data = await response.json();
      if (data.last_7_days) {
        setSleepData(data.last_7_days.map((item: any) => ({
          date: item.date,
          duration: item.duration,
          quality: item.quality
        })));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données de sommeil:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/sleep/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formData.date,
          duration: parseFloat(formData.duration),
          quality: parseInt(formData.quality),
        }),
      });
      const result = await response.json();
      setMessage(result.message || result.error);
      if (response.ok) {
        setFormData({ date: "", duration: "", quality: "" });
        fetchSleepData(); // Refresh data
      }
    } catch (error) {
      setMessage("Erreur lors de l'ajout des données");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="graph-container">
      <h1>Suivi du Sommeil 🛌</h1>

      <div className="sleep-form">
        <h2>Ajouter des données de sommeil</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Durée (heures):</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="24"
              required
            />
          </div>
          <div className="form-group">
            <label>Qualité (1-10):</label>
            <input
              type="number"
              name="quality"
              value={formData.quality}
              onChange={handleChange}
              min="1"
              max="10"
              required
            />
          </div>
          <button type="submit">Ajouter</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>

      <div className="sleep-data">
        <h2>Données récentes</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Durée (h)</th>
              <th>Qualité</th>
            </tr>
          </thead>
          <tbody>
            {sleepData.map((data, index) => (
              <tr key={index}>
                <td>{data.date}</td>
                <td>{data.duration}</td>
                <td>{data.quality}/10</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sleep-graphs">
        <h2>Graphiques en temps réel</h2>
        {sleepData.length > 0 ? (
          <div className="graphs-grid">
            <div className="graph-item">
              <h3>Durée de sommeil (heures)</h3>
              <Line
                data={{
                  labels: sleepData.map(d => d.date),
                  datasets: [
                    {
                      label: "Durée (h)",
                      data: sleepData.map(d => d.duration),
                      borderColor: "rgba(75, 192, 192, 1)",
                      backgroundColor: "rgba(75, 192, 192, 0.2)",
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true },
                    title: { display: false, text: "" },
                  },
                }}
              />
            </div>

            <div className="graph-item">
              <h3>Qualité du sommeil</h3>
              <Line
                data={{
                  labels: sleepData.map(d => d.date),
                  datasets: [
                    {
                      label: "Qualité (1-10)",
                      data: sleepData.map(d => d.quality),
                      borderColor: "rgba(153, 102, 255, 1)",
                      backgroundColor: "rgba(153, 102, 255, 0.2)",
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true },
                    title: { display: false, text: "" },
                  },
                  scales: {
                    y: { min: 0, max: 10 },
                  },
                }}
              />
            </div>
          </div>
        ) : (
          <div className="graph-placeholder">
            <p>Aucune donnée pour le moment. Ajoutez vos premières valeurs de sommeil pour voir les graphiques en temps réel.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sleep;
