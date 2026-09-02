import { useState } from "react";
import { G } from "../../styles/theme";
import { useChatScroll } from "../../hooks/useChatScroll";
import { getBotReply } from "../../utils/botReplies";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const QUICK_PROMPTS = [
  "Should I sell now?",
  "Best mandi?",
  "Weather impact?",
  "When prices peak?",
  "Price today?",
];

export default function ChatSidebar({ open, onClose, profile, cropCtx }) {
  const firstName = profile?.name?.split(" ")[0] || "Farmer";
  const initials = (profile?.name || "F").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const [messages, setMessages] = useState([
    { from: "bot", text: `🌾 Namaste ${firstName}! Ask me about prices, sell timing, best mandi, or weather impact.` },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatRef = useChatScroll([messages, typing]);

  const send = (text) => {
    const txt = (text || input).trim();
    if (!txt) return;
    setInput("");
    setMessages(m => [...m, { from: "user", text: txt }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { from: "bot", text: getBotReply(txt, cropCtx) }]);
    }, 1100);
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, zIndex: 290,
          background: "rgba(15,68,34,0.18)", backdropFilter: "blur(2px)"
        }} />
      )}

      {/* Sidebar panel */}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0, width: 380, zIndex: 300,
        background: G.card, borderLeft: `1px solid ${G.bdr}`,
        boxShadow: "-8px 0 40px rgba(27,107,53,0.14)",
        display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)"
      }}>

        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg,${G.deep},${G.green})`,
          padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
            }}>🤖</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>KrishiMind AI</div>
              <div style={{
                fontSize: 10, color: "rgba(255,255,255,0.7)",
                display: "flex", alignItems: "center", gap: 4
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: "50%", background: "#4ade80",
                  animation: "pulse 1.5s infinite"
                }} />
                RAG · Agmarknet + LSTM
              </div>
            </div>
          </div>
        </div>

        {/* Quick prompts */}
        <div style={{
          padding: "10px 16px", background: G.light, borderBottom: `1px solid ${G.bdr}`,
          display: "flex", gap: 6, flexWrap: "wrap"
        }}>
          {QUICK_PROMPTS.map(q => (
            <button key={q} onClick={() => send(q)} style={{
              background: G.card, border: `1px solid ${G.bdr}`, borderRadius: 20, padding: "4px 11px",
              fontSize: 11, color: G.green, fontFamily: "'Mukta',sans-serif", cursor: "pointer", fontWeight: 600,
            }}>{q}</button>
          ))}
        </div>

        {/* Messages */}
        <div ref={chatRef} style={{
          flex: 1, overflowY: "auto", padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 10
        }}>
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} initials={initials} />
          ))}
          {typing && (
            <div style={{ display: "flex", gap: 7 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: `linear-gradient(135deg,${G.deep},${G.green})`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13
              }}>🤖</div>
              <div style={{
                background: G.light, border: `1px solid ${G.bdr}`,
                borderRadius: "14px 14px 14px 3px", padding: "10px 14px",
                display: "flex", gap: 4, alignItems: "center"
              }}>
                {[0, 0.15, 0.3].map(d => (
                  <div key={d} style={{
                    width: 6, height: 6, borderRadius: "50%", background: G.green,
                    animation: `blink 1s ${d}s infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput value={input} onChange={setInput} onSend={() => send()} />

        {/* Footer */}
        <div style={{
          padding: "7px 16px", background: G.light, borderTop: `1px solid ${G.faint}`,
          fontSize: 9, color: G.muted, display: "flex", gap: 14, flexWrap: "wrap"
        }}>
          <span>📚 RAG: Agmarknet · IMD · GNews</span>
          <span>🧠 LSTM + DistilBERT</span>
          <span>🔒 Private</span>
        </div>
      </div>
    </>
  );
}