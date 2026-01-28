import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/todolist.css';

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
  is_active: number;
}

interface TodoListProps {
  taskType: 'sport' | 'nutrition' | 'sleep';
}

const TodoList: React.FC<TodoListProps> = ({ taskType }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    activity_type: '',
    target_duration_minutes: 30,
    recipe_name: '',
    target_calories: 0,
    target_duration_hours: 8
  });

  useEffect(() => {
    loadTasks();
  }, [taskType]);

  const loadTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/${taskType}/tasks`, {
        withCredentials: true
      });
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/${taskType}/tasks`, newTask, {
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

  const handleCompleteTask = async (taskId: number) => {
    const duration = prompt('Durée en minutes (pour sport) :');
    const rating = prompt('Note de 1 à 10 :');
    
    if (rating) {
      try {
        await axios.post(`${API_URL}/completions`, {
          task_type: taskType,
          task_id: taskId,
          duration_minutes: duration ? parseInt(duration) : null,
          quality_rating: parseInt(rating),
          notes: '',
          completion_date: new Date().toISOString().split('T')[0]
        }, {
          withCredentials: true
        });
        alert('Tâche complétée ! ✓');
        loadTasks();
      } catch (error) {
        console.error('Erreur complétion:', error);
      }
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Supprimer cette tâche ?')) {
      try {
        await axios.delete(`${API_URL}/${taskType}/tasks/${taskId}`, {
          withCredentials: true
        });
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
      target_duration_hours: 8
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

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="todolist-container">
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

          <button type="submit" className="btn-submit">Ajouter</button>
        </form>
      )}

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <p className="no-tasks">Aucune tâche. Ajoutez-en une pour commencer ! 🎯</p>
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
                  {taskType === 'sleep' && task.target_duration_hours && (
                    <span className="duration">{task.target_duration_hours}h</span>
                  )}
                </div>
              </div>
              <div className="task-actions">
                <button 
                  onClick={() => handleCompleteTask(task.id)} 
                  className="btn-complete"
                  title="Marquer comme terminé"
                >
                  ✓
                </button>
                <button 
                  onClick={() => handleDeleteTask(task.id)} 
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
  );
};

export default TodoList;
