import React from "react";
import "./css/graph.css";

const Graph: React.FC = () => {
  return (
    <div className="graph-container">
      <h1>Vos Graphiques 📊</h1>
      <p>Suivi de la fatigue, nutrition et autres indicateurs santé.</p>
      <div className="graph-placeholder">
        {/* Ici tu pourras intégrer tes vrais graphiques */}
        <p>Graphiques à venir...</p>
      </div>
    </div>
  );
};

export default Graph;
