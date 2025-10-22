import React, { useEffect, useState } from "react";

interface ApiResponse {
  message: string;
}

function App() {
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/") // ton backend Flask/FastAPI
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        console.log(data);
        setData(data);
      })
      .catch((err) => console.error("Erreur API :", err));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Frontend React (TypeScript) connecté à Python ⚙️</h1>
      <p>
        {data ? data.message : "En attente de la réponse du serveur..."}
      </p>
    </div>
  );
}

export default App;
