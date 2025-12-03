import React, { useEffect, useState } from "react";
import "./css/chat.css";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
};

// URL du backend Flask qui joue le proxy avec LM Studio
const BACKEND_URL = "http://127.0.0.1:5000";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Chargement de l'historique des messages au montage
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/messages`);
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.statusText}`);
        }
        const data: Message[] = await response.json();
        setMessages(
          data.map(({ role, content, created_at }) => ({
            role,
            content,
            created_at,
          }))
        );
      } catch (error) {
        console.error("Impossible de charger l'historique :", error);
      }
    };

    fetchMessages();
  }, []);

  // Persistance d'un message côté backend
  const persistMessage = async (message: Message) => {
    try {
      await fetch(`${BACKEND_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: message.role,
          content: message.content,
        }),
      });
    } catch (error) {
      console.error("Impossible d'enregistrer le message :", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

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

      const assistantMessage: Message = {
        role: "assistant",
        content: reply.trim(),
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

  return (
    <div className="chat-container">
      <h1>Chat Santé 💬</h1>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <strong>{msg.role === "user" ? "Vous" : "Assistant"}:</strong>{" "}
            {msg.content}
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
