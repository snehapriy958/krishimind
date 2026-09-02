import { G } from "../../styles/theme";
import { useTicker } from "../../hooks/useTicker";
import { ALL_CROPS, cropName } from "../../data/crops";

const TABS = [
  { id: "predict", icon: "🔮", label: "Prediction" },
  { id: "news", icon: "📰", label: "News" },
  { id: "history", icon: "📜", label: "History" },
];

export default function Navbar({ profile, lang, setLang, activeCrop, setActiveCrop, activeTab, setActiveTab }) {
  const { tick, tickIdx } = useTicker();
  const initials = (profile.name || "F").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(255,255,255,0.97)", borderBottom: `1px solid ${G.faint}`,
      backdropFilter: "blur(14px)", boxShadow: "0 1px 14px rgba(27,107,53,0.07)"
    }}>

      {/* Row 1 */}
      <div style={{
        height: 54, padding: "0 22px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 22 }}>🌿</span>
          <div>
            <div style={{
              fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700,
              color: G.green, lineHeight: 1.1
            }}>KrishiMind</div>
            <div style={{ fontSize: 13, color: G.muted }}>📍 {profile.state}</div>
          </div>
        </div>

        {/* Live Ticker */}
        <div key={tickIdx} className="tick-in"
          style={{
            display: "flex", alignItems: "center", gap: 8, background: G.light,
            border: `1px solid ${G.bdr}`, borderRadius: 24, padding: "6px 18px", minWidth: 260
          }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%", background: G.green,
            animation: "pulse 1.6s infinite", flexShrink: 0
          }} />
          <span style={{ fontSize: 17, fontWeight: 700 }}>{tick.l.split("·")[0].trim()}</span>
          <span style={{ fontSize: 14, color: G.muted, fontWeight: 600 }}>{tick.l.split("·")[1]?.trim()}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: G.green }}>{tick.v}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: tick.up ? G.green : G.red }}>{tick.c}</span>
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", gap: 7, alignItems: "center", flexShrink: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, background: G.light,
            border: `1px solid ${G.bdr}`, borderRadius: 24, padding: "4px 12px 4px 4px"
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: `linear-gradient(135deg,${G.deep},${G.green})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14, fontWeight: 700
            }}>{initials}</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: G.text }}>{profile.name.split(" ")[0]}</span>
          </div>
          {["en", "hi", "kn"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              background: lang === l ? G.dim : "transparent",
              border: `1px solid ${lang === l ? "rgba(27,107,53,0.32)" : G.bdr}`,
              borderRadius: 20, padding: "4px 11px", cursor: "pointer", fontSize: 16,
              color: lang === l ? G.green : G.muted, fontWeight: lang === l ? 700 : 400,
              fontFamily: "'Mukta',sans-serif", transition: "all 0.15s",
            }}>{l === "en" ? "EN" : l === "hi" ? "हि" : "ಕ"}</button>
          ))}
        </div>
      </div>

      {/* Row 2 — Crop sub-bar */}
      <div style={{
        padding: "7px 22px", background: "rgba(248,253,248,0.96)",
        borderTop: `1px solid ${G.faint}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap"
      }}>
        <span style={{
          fontSize: 12, color: G.muted, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.13em", flexShrink: 0
        }}>
          {lang === "hi" ? "मेरी फसलें" : lang === "kn" ? "ನನ್ನ ಬೆಳೆ" : "My Crops"}
        </span>
        {profile.crops.map(id => {
          const c = ALL_CROPS.find(x => x.id === id);
          if (!c) return null;
          const active = activeCrop.id === c.id;
          return (
            <button key={c.id} onClick={() => setActiveCrop(c)} style={{
              background: active ? `linear-gradient(135deg,${G.deep},${G.green})` : "#F1F8F1",
              border: active ? "none" : `1px solid ${G.bdr}`, borderRadius: 10, padding: "5px 14px",
              cursor: "pointer", color: active ? "#fff" : G.text, fontFamily: "'Mukta',sans-serif",
              fontSize: 16, fontWeight: active ? 700 : 500, display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.18s", boxShadow: active ? "0 3px 10px rgba(27,107,53,0.26)" : "none",
            }}>
              <span style={{ fontSize: 19 }}>{c.emoji}</span>
              <span>{cropName(c, lang)}</span>
              {active && <span style={{
                background: "rgba(255,255,255,0.25)", borderRadius: "50%",
                width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11
              }}>✓</span>}
            </button>
          );
        })}
        <div style={{ marginLeft: "auto" }}>
          <span style={{
            fontSize: 13, background: G.light, border: `1px solid ${G.bdr}`,
            borderRadius: 20, padding: "2px 10px", color: G.green, fontWeight: 700
          }}>
            🏪 {profile.mandi.split(" ")[0]}
          </span>
        </div>
      </div>

    </div>
  );
}