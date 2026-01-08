import React, { useEffect, useState } from "react";
import "./css/chat.css";

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

// URL du backend Flask qui joue le proxy avec LM Studio
const BACKEND_URL = "http://127.0.0.1:5000";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

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
    setUserId(loadUserId());
  }, []);

  // Chargement de l'historique des messages au montage
  useEffect(() => {
    const fetchMessages = async () => {
      const uid = loadUserId();
      setUserId(uid);
      if (!uid) return;
      try {
        const response = await fetch(`${BACKEND_URL}/messages?user_id=${uid}`);
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.statusText}`);
        }
        const data: Message[] = await response.json();
        const loadedMessages = data.map(({ role, content, created_at }) => ({
          role,
          content,
          created_at,
        }));
        setMessages(loadedMessages);
        
        // Si c'est la première conversation (pas de messages), envoyer automatiquement "Bonjour"
        // pour déclencher la récupération des données et la réponse de confirmation de l'IA
        if (loadedMessages.length === 0) {
          setIsLoading(true);
          try {
            const initResponse = await fetch(`${BACKEND_URL}/api/chat`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "mistralai/ministral-3-3b",
                user_id: uid,
                messages: [{
                  role: "user",
                  content: "Bonjour"
                }],
              }),
            });
            
            if (initResponse.ok) {
              const initData = await initResponse.json();
              const reply = initData.choices?.[0]?.message?.content ?? 
                           initData.output_text ?? 
                           "";
              
              if (reply) {
                const cleanedReply = sanitizeAssistantReply(reply);
                
                // Sauvegarder le message utilisateur "Bonjour"
                const userMessage: Message = { role: "user", content: "Bonjour" };
                await fetch(`${BACKEND_URL}/messages`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    role: "user",
                    content: "Bonjour",
                    user_id: uid,
                  }),
                });
                
                // Sauvegarder la réponse de l'IA
                const assistantMessage: Message = {
                  role: "assistant",
                  content: cleanedReply,
                };
                await fetch(`${BACKEND_URL}/messages`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    role: "assistant",
                    content: cleanedReply,
                    user_id: uid,
                  }),
                });
                
                // Récupérer tous les messages (y compris le message système)
                const updatedResponse = await fetch(`${BACKEND_URL}/messages?user_id=${uid}`);
                if (updatedResponse.ok) {
                  const updatedData: Message[] = await updatedResponse.json();
                  const updatedMessages = updatedData.map(({ role, content, created_at }) => ({
                    role,
                    content,
                    created_at,
                  }));
                  setMessages(updatedMessages);
                }
              }
            }
          } catch (error) {
            console.error("Erreur lors de l'initialisation:", error);
          } finally {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Impossible de charger l'historique :", error);
      }
    };

    fetchMessages();
  }, []);

  // Persistance d'un message côté backend
  const persistMessage = async (message: Message) => {
    try {
      if (!userId) return;
      await fetch(`${BACKEND_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: message.role,
          content: message.content,
          user_id: userId,
        }),
      });
    } catch (error) {
      console.error("Impossible d'enregistrer le message :", error);
    }
  };

  const sanitizeAssistantReply = (text: string) => {
    let cleaned = text;

    // Nettoyage Markdown de base
    cleaned = cleaned.replace(/`{3}[\s\S]*?`{3}/g, " "); // blocs code
    cleaned = cleaned.replace(/`([^`]+)`/g, "$1"); // inline code
    cleaned = cleaned.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1"); // italique/gras
    cleaned = cleaned.replace(/^#{1,6}\s*/gm, ""); // titres

    // Supprimer lignes de tableaux Markdown
    cleaned = cleaned.replace(/^\s*\|.*\|\s*$/gm, "");

    // Séparateurs type "---" ou " -- "
    cleaned = cleaned.replace(/--+/g, "\n\n");

    // Listes -> puces lisibles
    cleaned = cleaned.replace(/^\s*[-*•]\s+/gm, "• ");

    // Normaliser les sauts de ligne et aérer
    cleaned = cleaned.replace(/\r\n/g, "\n");
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
    cleaned = cleaned.replace(/[ \t]+\n/g, "\n"); // trim fin de ligne

    // Si le texte est une longue ligne sans retours, on insère des sauts aux séparateurs.
    // Sections numérotées / blocs importants
    cleaned = cleaned.replace(/(\d️⃣)/g, "\n\n$1");
    cleaned = cleaned.replace(/(✅|🚨|📌|💡)/g, "\n\n$1");
    cleaned = cleaned.replace(/(\.)(\s+)([A-ZÉÈÎÏÔÛÂÀ])/g, "$1\n$3"); // phrase suivante en majuscule
    cleaned = cleaned.replace(/(:)(\s+)/g, "$1\n"); // après deux-points

    return cleaned.trim();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!userId) {
      alert("Veuillez vous connecter avant d'utiliser le chat.");
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    await persistMessage(userMessage);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/ministral-3-3b",
          user_id: userId,
          messages: nextMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      const data = await response.json();
      const reply =
        data.choices?.[0]?.message?.content ??
        data.output_text ??
        "(pas de réponse)";
      const cleanedReply = sanitizeAssistantReply(reply);

      const assistantMessage: Message = {
        role: "assistant",
        content: cleanedReply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      persistMessage(assistantMessage).catch((error) =>
        console.error("Impossible d'enregistrer la réponse :", error)
      );
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erreur de connexion à LM Studio." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    const paragraphs = content.split(/\n{2,}/);
    return paragraphs.map((para, idx) => {
      const lines = para.split("\n");
      return (
        <p key={idx}>
          {lines.map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  return (
    <div className="chat-container">
      <h1>Chat Santé 💬</h1>
      <div className="chat-box">
        {messages
          .filter((msg) => msg.role !== "system") // Ne pas afficher les messages système
          .map((msg, index) => (
            <div key={index} className="chat-message">
              <strong>{msg.role === "user" ? "Vous" : "Assistant"}:</strong>
              {renderMessageContent(msg.content)}
            </div>
          ))}
        {isLoading && <div className="chat-message">Assistant: ...</div>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question santé..."
        />
        <button onClick={handleSend} disabled={isLoading}>
          {isLoading ? "Envoi..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
};

export default Chat;
