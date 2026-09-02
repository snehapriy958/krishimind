import { G } from "../../styles/theme";

export default function ChatInput({ value, onChange, onSend }) {
  return (
    <div style={{ padding:"12px 16px", borderTop:`1px solid ${G.faint}`,
      display:"flex", gap:9, background:"rgba(255,255,255,0.95)" }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onSend()}
        placeholder="Ask about prices, mandis, weather…"
        style={{ flex:1, border:`1px solid ${G.bdr}`, borderRadius:24, padding:"9px 16px",
          fontSize:12, fontFamily:"'Mukta',sans-serif", color:G.text,
          background:"#FAFFFE", transition:"all 0.2s" }} />
      <button onClick={onSend} style={{
        background:`linear-gradient(135deg,${G.deep},${G.green})`,
        border:"none", borderRadius:24, padding:"9px 18px",
        color:"#fff", fontSize:12, fontWeight:700,
        fontFamily:"'Mukta',sans-serif", cursor:"pointer",
        boxShadow:"0 2px 10px rgba(27,107,53,0.26)",
        display:"flex", alignItems:"center", gap:5,
      }}>Send 🌾</button>
    </div>
  );
}