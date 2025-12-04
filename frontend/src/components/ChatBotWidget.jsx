import React, { useState, useEffect, useRef } from "react";
import { Icons } from "./Icons";
import { USE_MOCK_API, API_BASE_URL } from "../config";

export default function ChatbotWidget() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I'm your betting assistant. Ask me about upcoming matches, team stats, or value bets." },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isProcessing) return;

    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setIsProcessing(true);

    const thinkingId = Date.now();
    setMessages(prev => [...prev, { role: "bot", text: "Analyzing...", isThinking: true, id: thinkingId }]);

    try {
      let responseText = "";

      if (USE_MOCK_API) {
        await new Promise(r => setTimeout(r, 1200)); 
        if (text.toLowerCase().includes("team")) {
            responseText = "Based on our database, we have Team USA, Mexico, France, and Germany.";
        } else if (text.toLowerCase().includes("bet") || text.toLowerCase().includes("value")) {
            responseText = "Here are top value bets:\n* **England vs Italy**: Draw @ +350\n* **Brazil vs Spain**: Brazil -1 @ -120";
        } else {
            responseText = "I can help with match stats, team rosters, and value bets.";
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text })
        });

        if (!res.ok) throw new Error("Backend error");
        const data = await res.json();
        responseText = data.response;
      }

      setMessages(prev => prev.map(m => 
        m.id === thinkingId ? { role: "bot", text: responseText } : m
      ));

    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(m => 
        m.id === thinkingId ? { role: "bot", text: "Error connecting to server." } : m
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="chat-section">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Activity style={{ width: '20px', height: '20px', color: '#34d399' }} />
            <span style={{ fontWeight: 'bold' }}>AI Assistant</span>
        </div>
        <div className="mode-badge">
            {USE_MOCK_API ? "Demo Mode" : "Live"}
        </div>
      </div>

      <div ref={scrollRef} className="chat-body">
        {messages.map((m, i) => (
          <div key={i} className="chat-message-row" style={{ justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div className={m.role === "user" ? "msg-user" : "msg-bot"}>
              {m.isThinking ? <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Thinking...</span> : renderFormattedText(m.text)}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <div className="input-group">
          <input
            className="chat-input"
            placeholder="Ask about matches, odds, or teams..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            disabled={isProcessing}
          />
          <button 
            onClick={send}
            disabled={isProcessing}
            className="send-btn"
          >
            <Icons.Send style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>
    </section>
  );
}