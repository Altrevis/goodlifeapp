import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./css/chat.css";
import { 
  MessageCircle, 
  Sparkles, 
  Send, 
  Dumbbell, 
  Utensils, 
  Moon, 
  TrendingUp 
} from "lucide-react";
import UserInfo from "../components/UserInfo";
import TodoList from "../components/TodoList";
import EvolutionTab from "../components/EvolutionTab";

// --- Types & Config ---
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

const BACKEND_URL = "http://127.0.0.1:5000";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const [userData, setUserData] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sport' | 'nutrition' | 'sleep' | 'evolution'>('sport');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

  // --- API Calls ---
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

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion au serveur de chat." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProgram = async () => {
    if (!userId) return;
    setIsLoading(true);
    setMessages(prev => [...prev, { role: "system", content: "Génération du programme en cours..." } as Message]);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/generate-program`, { user_id: userId });
      const data = response.data;

      if (data.success) {
        const aiMessage: Message = {
          role: "assistant",
          content: `Programme mis à jour ! Consultez les onglets ci-dessous pour voir vos nouveaux objectifs.`
        };
        setMessages(prev => [...prev.filter(m => !m.content.includes("Génération")), aiMessage]);
        persistMessage(aiMessage);
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error("Erreur génération programme:", error);
      setMessages(prev => [...prev.filter(m => !m.content.includes("Génération")), { role: "assistant", content: "Une erreur est survenue lors de la mise à jour." } as Message]);
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
    <div className="chat-page-main">
      <div className="top-layout">
        
        {/* BLOC GAUCHE : CHAT */}
        <div className="chat-card-main">
          <div className="chat-header-minimal">
            <div className="title-with-icon">
              <MessageCircle size={24} color="#10b981" />
              <h1>Chat IA</h1>
            </div>
          </div>

          <div className="chat-display-area" ref={chatBoxRef}>
            {messages.filter(msg => msg.role !== "system" || msg.content.includes("Génération")).map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <strong>{msg.role === "user" ? "Vous" : "Coach IA"}:</strong>
                <div className="message-text">{renderMessageContent(msg.content)}</div>
              </div>
            ))}
            {isLoading && <div className="chat-message assistant"><em>Le coach prépare une réponse...</em></div>}
          </div>

          <div className="chat-input-section">
            <button className="btn-magic-program" onClick={handleGenerateProgram} disabled={isLoading}>
              <Sparkles size={16} /> Programme Recommandé
            </button>
            <div className="input-wrapper-premium">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez votre question santé..."
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading} className="send-btn-modern">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* BLOC DROITE : PROFIL */}
        <div className="profile-sidebar-card">
          <UserInfo user={userData} healthData={healthData} />
        </div>
      </div>

      {/* SECTION BASSE : ONGLETS */}
      <div className="dashboard-bottom-card">
        <div className="dashboard-tabs">
          <button className={`tab-btn ${activeTab === 'sport' ? 'active' : ''}`} onClick={() => setActiveTab('sport')}>
            <Dumbbell size={18} /> Sport
          </button>
          <button className={`tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`} onClick={() => setActiveTab('nutrition')}>
            <Utensils size={18} /> Alimentation
          </button>
          <button className={`tab-btn ${activeTab === 'sleep' ? 'active' : ''}`} onClick={() => setActiveTab('sleep')}>
            <Moon size={18} /> Sommeil
          </button>
          <button className={`tab-btn ${activeTab === 'evolution' ? 'active' : ''}`} onClick={() => setActiveTab('evolution')}>
            <TrendingUp size={18} /> Évolution
          </button>
        </div>

        <div className="tab-render-area">
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