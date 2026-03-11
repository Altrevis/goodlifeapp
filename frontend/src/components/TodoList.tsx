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
import './css/todolist.css';

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

interface Task {
  id: number;
  task_type: string;
  title: string;
  description: string;
  activity_type?: string;
  target_duration_minutes?: number;
  recipe_name?: string;
  target_calories?: number;
  target_duration_hours?: number;
  target_bedtime?: string;
  target_waketime?: string;
  weekly_quota: number;
  weekly_completions: number;
  is_active: number;
}

interface Completion {
  id: number;
  task_title: string;
  completion_date: string;
  duration_minutes?: number;
  quality_rating: number;
  actual_value?: number;
  task_id: number;
}

interface TodoListProps {
  taskType: 'sport' | 'nutrition' | 'sleep';
  userId: number | null;
}

const TodoList: React.FC<TodoListProps> = ({ taskType, userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    activity_type: '',
    target_duration_minutes: 30,
    recipe_name: '',
    target_calories: 0,
    target_duration_hours: 8,
    weekly_quota: 7
  });

  const [completeModalTask, setCompleteModalTask] = useState<number | null>(null);
  const [completeDuration, setCompleteDuration] = useState("");
  const [completeValue, setCompleteValue] = useState("");
  const [completeDate, setCompleteDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [deleteModalTask, setDeleteModalTask] = useState<number | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/${taskType}/tasks?user_id=${userId}`, {
        withCredentials: true
      });
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
    }
  }, [taskType, userId]);

  const loadCompletions = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/completions/${taskType}?user_id=${userId}&days=7`, {
        withCredentials: true
      });
      if (response.data.success) {
        setCompletions(response.data.completions);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  }, [taskType, userId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadTasks(), loadCompletions()]);
    setLoading(false);
  }, [loadTasks, loadCompletions]);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, loadData]);


  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      const response = await axios.post(`${API_URL}/${taskType}/tasks`, { ...newTask, user_id: userId, weekly_quota: newTask.weekly_quota }, {
        withCredentials: true
      });
      if (response.data.success) {
        loadTasks();
        setShowAddForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erreur ajout tâche:', error);
    }
  };

  const handleCompleteClick = async (taskId: number) => {
    setCompleteModalTask(taskId);
    setCompleteDuration("");
    setCompleteValue("");
    setCompleteDate(new Date().toISOString().split('T')[0]);

    if (taskType === 'sleep' && userId) {
      try {
        const profileRes = await axios.get(`http://localhost:5000/api/profile?user_id=${userId}`, {
          withCredentials: true
        });
        const sleepHours = profileRes.data?.health_data?.sleep_hours;
        if (sleepHours) {
          setCompleteValue(String(sleepHours));
        }
      } catch (error) {
        console.error('Erreur chargement profil pour sommeil:', error);
      }
    }
  };

  const submitCompleteTask = async () => {
    if (completeModalTask !== null && userId) {
      try {
        await axios.post(`${API_URL}/completions`, {
          user_id: userId,
          task_type: taskType,
          task_id: completeModalTask,
          duration_minutes: taskType === 'sport' ? parseInt(completeDuration) : null,
          actual_value: taskType === 'sleep' || taskType === 'nutrition' ? parseFloat(completeValue) : null,
          quality_rating: 5, // Default rating as quality logic was removed
          notes: '',
          completion_date: completeDate
        }, {
          withCredentials: true
        });
        setCompleteModalTask(null);
        loadData();
      } catch (error) {
        console.error('Erreur complétion:', error);
      }
    }
  };

  const handleDeleteClick = (taskId: number) => {
    setDeleteModalTask(taskId);
  };

  const submitDeleteTask = async () => {
    if (deleteModalTask !== null && userId) {
      try {
        await axios.delete(`${API_URL}/${taskType}/tasks/${deleteModalTask}?user_id=${userId}`, {
          withCredentials: true
        });
        setDeleteModalTask(null);
        loadTasks();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      activity_type: '',
      target_duration_minutes: 30,
      recipe_name: '',
      target_calories: 0,
      target_duration_hours: 8,
      weekly_quota: 7
    });
  };

  const getTaskIcon = () => {
    switch (taskType) {
      case 'sport': return '🏃';
      case 'nutrition': return '🥗';
      case 'sleep': return '😴';
    }
  };

  const getTaskLabel = () => {
    switch (taskType) {
      case 'sport': return 'Sport';
      case 'nutrition': return 'Alimentation';
      case 'sleep': return 'Sommeil';
    }
  };

  // Prepare data for the chart
  const reversedCompletions = [...completions].reverse();
  const chartData = {
    labels: reversedCompletions.map(c => new Date(c.completion_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
    datasets: [
      {
        label: "Qualité /10",
        data: reversedCompletions.map(c => c.quality_rating),
        borderColor: "#ff7300",
        backgroundColor: "rgba(255, 115, 0, 0.2)",
        yAxisID: 'y',
        tension: 0.3
      },
      {
        label: taskType === 'sport' ? 'Min' : (taskType === 'sleep' ? 'Heures' : 'Kcal'),
        data: reversedCompletions.map(c => taskType === 'sport' ? c.duration_minutes : (taskType === 'sleep' ? c.actual_value : c.actual_value)),
        borderColor: "#8884d8",
        backgroundColor: "rgba(136, 132, 216, 0.2)",
        yAxisID: 'y1',
        tension: 0.3
      }
    ]
  };

  const isTaskCompletedToday = (taskId: number) => {
    const today = new Date().toDateString();
    return completions.some(c => c.task_id === taskId && new Date(c.completion_date).toDateString() === today);
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="todolist-container">
      <div className="todolist-layout">
        <div className="todolist-main">
          <div className="todolist-header">
            <h2>{getTaskIcon()} {getTaskLabel()} - Todolist</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-add"
            >
              {showAddForm ? '✕ Annuler' : '+ Nouvelle tâche'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddTask} className="add-form">
              <input
                type="text"
                placeholder="Titre"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />

              {taskType === 'sport' && (
                <>
                  <input
                    type="text"
                    placeholder="Type d'activité (ex: course, yoga)"
                    value={newTask.activity_type}
                    onChange={(e) => setNewTask({ ...newTask, activity_type: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Durée cible (minutes)"
                    value={newTask.target_duration_minutes}
                    onChange={(e) => setNewTask({ ...newTask, target_duration_minutes: parseInt(e.target.value) })}
                  />
                </>
              )}

              {taskType === 'nutrition' && (
                <>
                  <input
                    type="text"
                    placeholder="Nom de la recette"
                    value={newTask.recipe_name}
                    onChange={(e) => setNewTask({ ...newTask, recipe_name: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Calories cibles"
                    value={newTask.target_calories}
                    onChange={(e) => setNewTask({ ...newTask, target_calories: parseInt(e.target.value) })}
                  />
                </>
              )}

              {taskType === 'sleep' && (
                <input
                  type="number"
                  step="0.5"
                  placeholder="Heures de sommeil cibles"
                  value={newTask.target_duration_hours}
                  onChange={(e) => setNewTask({ ...newTask, target_duration_hours: parseFloat(e.target.value) })}
                />
              )}

              <input
                type="number"
                min="1"
                max="7"
                placeholder="Quota hebdomadaire (1-7)"
                value={newTask.weekly_quota}
                onChange={(e) => setNewTask({ ...newTask, weekly_quota: parseInt(e.target.value) })}
                required
              />

              <button type="submit" className="btn-submit">Ajouter</button>
            </form>
          )}

          <div className="tasks-list">
            {tasks.length === 0 ? (
              <p className="no-tasks">Aucune tâche. Utilisez "✨ Programme Recommandé" pour en générer ! 🎯</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <div className="task-meta">
                      {taskType === 'sport' && task.activity_type && (
                        <span className="badge">{task.activity_type}</span>
                      )}
                      {taskType === 'sport' && task.target_duration_minutes && (
                        <span className="duration">{task.target_duration_minutes} min</span>
                      )}
                      {taskType === 'nutrition' && task.recipe_name && (
                        <span className="badge">{task.recipe_name}</span>
                      )}
                      {taskType === 'nutrition' && task.target_calories && (
                        <span className="calories">{task.target_calories} kcal</span>
                      )}
                      {taskType === 'sleep' && task.target_bedtime && task.target_waketime && (
                        <span className="badge">
                          {task.target_bedtime.slice(0, 5)} - {task.target_waketime.slice(0, 5)}
                        </span>
                      )}
                      {taskType === 'sleep' && task.target_duration_hours && (
                        <span className="duration">Objectif: {task.target_duration_hours}h de sommeil</span>
                      )}
                      
                      <div className="weekly-progress">
                        <div className="progress-container">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${Math.min(100, (task.weekly_completions / task.weekly_quota) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          Quota {task.weekly_completions} / {task.weekly_quota} {task.weekly_quota === 7 ? 'jours (Quotidien)' : 'fois / semaine'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button
                      onClick={() => task.weekly_completions < task.weekly_quota && !isTaskCompletedToday(task.id) && handleCompleteClick(task.id)}
                      className={`btn-complete ${task.weekly_completions >= task.weekly_quota ? 'completed-reached' : (isTaskCompletedToday(task.id) ? 'completed-today' : '')}`}
                      title={task.weekly_completions >= task.weekly_quota ? "Quota hebdomadaire atteint !" : (isTaskCompletedToday(task.id) ? "Déjà fait aujourd'hui" : "Marquer comme fait")}
                      disabled={task.weekly_completions >= task.weekly_quota || isTaskCompletedToday(task.id)}
                    >
                      {task.weekly_completions >= task.weekly_quota ? '★' : '✓'}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(task.id)}
                      className="btn-delete"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {completeModalTask !== null && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{taskType === 'sport' ? 'Durée (minutes)' : (taskType === 'sleep' ? 'Heures de sommeil' : 'Calories (kcal)')}</h3>
              <input 
                type="number" 
                value={taskType === 'sport' ? completeDuration : completeValue}
                onChange={(e) => taskType === 'sport' ? setCompleteDuration(e.target.value) : setCompleteValue(e.target.value)}
                placeholder="Entrez la valeur"
                autoFocus
              />
              
              <div className="date-selection">
                <label>Date de l'action :</label>
                <input 
                  type="date" 
                  value={completeDate}
                  onChange={(e) => setCompleteDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="modal-actions">
                <button onClick={() => setCompleteModalTask(null)} className="btn-cancel">Annuler</button>
                <button onClick={() => submitCompleteTask()} className="btn-confirm">Valider</button>
              </div>
            </div>
          </div>
        )}

        {deleteModalTask !== null && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirmer la suppression</h3>
              <p>Voulez-vous vraiment supprimer cette tâche ?</p>
              <div className="modal-actions">
                <button onClick={() => setDeleteModalTask(null)} className="btn-cancel">Annuler</button>
                <button onClick={() => submitDeleteTask()} className="btn-danger">Supprimer</button>
              </div>
            </div>
          </div>
        )}

        <div className="todolist-sidebar">
          <h3>📈 Progrès (7 derniers jours)</h3>
          <div className="task-chart-container">
            {chartData.labels.length > 0 ? (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      labels: { boxWidth: 10, font: { size: 10 } }
                    },
                    tooltip: { mode: 'index', intersect: false }
                  },
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      min: 0,
                      max: 10,
                      ticks: { font: { size: 10 } },
                      title: { display: true, text: 'Qualité', font: { size: 10 } }
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      grid: { drawOnChartArea: false },
                      ticks: { font: { size: 10 } },
                      title: {
                        display: true,
                        text: taskType === 'sport' ? 'Min' : (taskType === 'sleep' ? 'H' : 'Kcal'),
                        font: { size: 10 }
                      }
                    },
                    x: { ticks: { font: { size: 10 } } }
                  }
                }}
                height={250}
              />
            ) : (
              <div className="no-history">
                <p>Complétez des tâches pour voir votre graphique ! 🚀</p>
              </div>
            )}
          </div>

          <div className="history-list">
            <h4>Dernières complétions</h4>
            {completions.slice(0, 5).map(c => (
              <div key={c.id} className="history-item">
                <span className="history-date">{new Date(c.completion_date).toLocaleDateString('fr-FR')}</span>
                <span className="history-title">{c.task_title}</span>
                <span className="history-rating">{c.quality_rating}/10</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
