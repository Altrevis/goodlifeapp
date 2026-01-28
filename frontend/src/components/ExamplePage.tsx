// Exemple d'utilisation des composants TodoList et EvolutionTab
// Ce fichier montre comment intégrer les composants dans votre application

import React, { useState } from 'react';
import TodoList from './TodoList';
import EvolutionTab from './EvolutionTab';
import './ExamplePage.css';

const ExamplePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sport' | 'nutrition' | 'sleep' | 'evolution'>('sport');

  return (
    <div className="example-page">
      {/* Navigation par onglets */}
      <div className="tabs-navigation">
        <button
          className={activeTab === 'sport' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('sport')}
        >
          🏃 Sport
        </button>
        <button
          className={activeTab === 'nutrition' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('nutrition')}
        >
          🥗 Alimentation
        </button>
        <button
          className={activeTab === 'sleep' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('sleep')}
        >
          😴 Sommeil
        </button>
        <button
          className={activeTab === 'evolution' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('evolution')}
        >
          📊 Évolution
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="tab-content">
        {activeTab === 'sport' && <TodoList taskType="sport" />}
        {activeTab === 'nutrition' && <TodoList taskType="nutrition" />}
        {activeTab === 'sleep' && <TodoList taskType="sleep" />}
        {activeTab === 'evolution' && <EvolutionTab />}
      </div>
    </div>
  );
};

export default ExamplePage;
