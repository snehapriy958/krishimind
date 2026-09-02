import { G } from "../../styles/theme";

export default function ChatMessage({ msg, initials }) {
  const isBot = msg.from === "bot";
  return (
    <div className="chat-bubble"
      style={{ display:"flex", justifyContent: isBot ? "flex-start" : "flex-end", gap:7 }}>
      {isBot && (
        <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, marginTop:2,
          background:`linear-gradient(135deg,${G.deep},${G.green})`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🤖</div>
      )}
      <div style={{
        maxWidth:"78%",
        background: isBot ? G.light : `linear-gradient(135deg,${G.deep},${G.green})`,
        color: isBot ? G.text : "#fff",
        border: isBot ? `1px solid ${G.bdr}` : "none",
        borderRadius: isBot ? "14px 14px 14px 3px" : "14px 14px 3px 14px",
        padding:"9px 13px", fontSize:12, lineHeight:1.55,
      }}>
        {msg.text.split("**").map((part, j) =>
          j % 2 === 1
            ? <strong key={j} style={{ color: isBot ? G.green : "#fff" }}>{part}</strong>
            : <span key={j}>{part}</span>
        )}
      </div>
      {!isBot && (
        <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, marginTop:2,
          background:`linear-gradient(135deg,${G.deep},${G.green})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"#fff", fontSize:11, fontWeight:700 }}>{initials[0]}</div>
      )}
    </div>
  );
}