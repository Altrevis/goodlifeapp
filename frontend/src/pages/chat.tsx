import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/chat.css";
import UserInfo from "../components/UserInfo";
import TodoList from "../components/TodoList";
import EvolutionTab from "../components/EvolutionTab";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
};

type StoredUser = {
  id: number;
  email?: string;
  first_name?: string;
  last_name?: string;
};

// URL du backend Flask
const BACKEND_URL = "http://127.0.0.1:5000";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // New States for Dashboard
  const [userData, setUserData] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sport' | 'nutrition' | 'sleep' | 'evolution'>('sport');
  const [refreshKey, setRefreshKey] = useState(0); // To force reload of tabs

  const loadUserId = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed: StoredUser = JSON.parse(raw);
      return parsed?.id ?? null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const uid = loadUserId();
    setUserId(uid);
    if (uid) {
      fetchMessages(uid);
      fetchUserProfile(uid);
    }
  }, []);

  const fetchUserProfile = async (uid: number) => {
    try {
      // Endpoint from profile.py: /profile
      const response = await axios.get(`${BACKEND_URL}/profile?user_id=${uid}`);
      if (response.data) {
        setUserData(response.data.user);
        setHealthData(response.data.health_data);
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    }
  };

  const fetchMessages = async (uid: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/messages?user_id=${uid}`);
      if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
      const data: Message[] = await response.json();
      setMessages(data.map(({ role, content, created_at }) => ({ role, content, created_at })));
    } catch (error) {
      console.error("Impossible de charger l'historique :", error);
    }
  };

  const persistMessage = async (message: Message) => {
    if (!userId) return;
    try {
      await fetch(`${BACKEND_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: message.role, content: message.content, user_id: userId }),
      });
    } catch (error) {
      console.error("Impossible d'enregistrer le message :", error);
    }
  };

  const sanitizeAssistantReply = (text: string) => {
    // Simple basic cleaning
    return text.replace(/`{3}[\s\S]*?`{3}/g, " ").trim();
  };

  const handleSend = async () => {
    if (!input.trim() || !userId) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    await persistMessage(userMessage);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "mistralai/ministral-3-3b",
          user_id: userId,
          messages: [...messages, userMessage]
            .filter(m => !m.content.includes("❌") && !m.content.includes("Génération"))
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content ?? data.output_text ?? "(pas de réponse)";
      const cleanedReply = sanitizeAssistantReply(reply);

      const assistantMessage: Message = { role: "assistant", content: cleanedReply };
      setMessages(prev => [...prev, assistantMessage]);
      await persistMessage(assistantMessage);

      // If the reply implies data update (could be sophisticated), we could refresh tabs
      // For now, only the dedicated button does it reliably or if user asks "updates".
      // Let's stick to the button for explicit updates.

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion à LM Studio." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProgram = async () => {
    if (!userId) {
      alert("Veuillez vous connecter.");
      return;
    }

    setIsLoading(true);
    // Add a temporary system message to UI to show action
    setMessages(prev => [...prev, { role: "system", content: "Génération du programme en cours... Veuillez patienter." } as Message]);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/generate-program`, { user_id: userId });
      const data = response.data;

      if (data.success) {
        // Add success message from AI
        const aiMessage: Message = {
          role: "assistant",
          content: `✅ Programme mis à jour !\n\n${data.details || "Consultez les onglets ci-dessous pour voir votre nouveau programme."}`
        };
        setMessages(prev => [...prev.filter(m => m.content !== "Génération du programme en cours... Veuillez patienter."), aiMessage]);
        persistMessage(aiMessage);

        // Trigger tabs refresh
        setRefreshKey(prev => prev + 1);
      } else {
        throw new Error(data.error || "Erreur inconnue");
      }
    } catch (error) {
      console.error("Erreur génération programme:", error);
      setMessages(prev => [...prev.filter(m => m.content !== "Génération du programme en cours... Veuillez patienter."), { role: "assistant", content: "❌ Une erreur est survenue lors de la génération du programme." } as Message]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="main-page-container">
      {/* Top Section: Chat + User Info */}
      <div className="top-section">

        {/* Left Column: Chat */}
        <div className="chat-section">
          <div className="chat-header-row">
            <h1>Chat Santé 💬</h1>
          </div>

          <div className="chat-box">
            {messages.filter(msg => msg.role !== "system" || msg.content.includes("Génération")).map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <strong>{msg.role === "user" ? "Vous" : msg.role === "system" ? "Système" : "Coach IA"}:</strong>
                <div className="message-text">{renderMessageContent(msg.content)}</div>
              </div>
            ))}
            {isLoading && <div className="chat-message assistant"><em>L'IA réfléchit...</em></div>}
          </div>

          <div className="chat-controls">
            <button
              className="btn-program-recommend"
              onClick={handleGenerateProgram}
              disabled={isLoading}
              title="Générer un programme personnalisé basé sur vos données"
            >
              ✨ Programme Recommandé
            </button>
            <div className="chat-input-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez votre question santé..."
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading} className="btn-send">
                Envoyer
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: User Info */}
        <div className="user-info-section">
          <UserInfo user={userData} healthData={healthData} />
        </div>
      </div>

      {/* Bottom Section: Tabs */}
      <div className="bottom-section">
        <div className="tabs-navigation">
          <button className={`tab ${activeTab === 'sport' ? 'active' : ''}`} onClick={() => setActiveTab('sport')}>🏃 Sport</button>
          <button className={`tab ${activeTab === 'nutrition' ? 'active' : ''}`} onClick={() => setActiveTab('nutrition')}>🥗 Alimentation</button>
          <button className={`tab ${activeTab === 'sleep' ? 'active' : ''}`} onClick={() => setActiveTab('sleep')}>😴 Sommeil</button>
          <button className={`tab ${activeTab === 'evolution' ? 'active' : ''}`} onClick={() => setActiveTab('evolution')}>📊 Évolution</button>
        </div>

        <div className="tab-content-area">
          {activeTab === 'sport' && <TodoList key={`sport-${refreshKey}`} taskType="sport" userId={userId} />}
          {activeTab === 'nutrition' && <TodoList key={`nutrition-${refreshKey}`} taskType="nutrition" userId={userId} />}
          {activeTab === 'sleep' && <TodoList key={`sleep-${refreshKey}`} taskType="sleep" userId={userId} />}
          {activeTab === 'evolution' && <EvolutionTab key={`evolution-${refreshKey}`} userId={userId} />}
        </div>
      </div>
    </div>
  );
};

export default Chat;
