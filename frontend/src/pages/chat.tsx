import React, { useState } from "react";
import "./css/chat.css";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() !== "") {
      setMessages([...messages, `Vous: ${input}`]);
      setMessages((prev) => [...prev, `Assistant: Réponse simulée pour "${input}"`]);
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <h1>Chat Santé 💬</h1>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">{msg}</div>
        ))}
      </div>
      <div className="chat-input">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Posez votre question santé..."
        />
        <button onClick={handleSend}>Envoyer</button>
      </div>
    </div>
  );
};

export default Chat;
