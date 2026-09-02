import { useState } from "react";
import { G } from "../styles/theme";
import { ALL_CROPS, STATES } from "../data/crops";
import { MANDIS_BY_STATE } from "../data/mandis";

export default function ProfilePage({ onComplete }) {
  const [name, setName] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [selCrops, setSelCrops] = useState(["onion", "potato"]);
  const [mandiOpen, setMandiOpen] = useState(false);
  const [selMandi, setSelMandi] = useState("Lasalgaon APMC");
  const [err, setErr] = useState("");

  const mandis = MANDIS_BY_STATE[state] || MANDIS_BY_STATE["Maharashtra"];

  const toggleCrop = id =>
    setSelCrops(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);

  const submit = () => {
    if (!name.trim()) { setErr("Please enter your name"); return; }
    if (selCrops.length === 0) { setErr("Select at least one crop"); return; }
    setErr("");
    onComplete({ name: name.trim(), state, crops: selCrops, mandi: selMandi });
  };

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: G.bg, fontFamily: "'Mukta',sans-serif",
      display: "flex", flexDirection: "column"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.95)", borderBottom: `1px solid ${G.faint}`,
        padding: "0 28px", height: 56, display: "flex", alignItems: "center", gap: 10,
        boxShadow: "0 1px 10px rgba(27,107,53,0.06)"
      }}>
        <span style={{
          fontFamily: "'Playfair Display',serif", fontSize: 20,
          fontWeight: 700, color: G.green
        }}>KrishiMind</span>
        <span style={{ fontSize: 12, color: G.muted }}>Complete Your Profile</span>
      </div>

      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24
      }}>
        <div className="fu" style={{
          background: G.card, border: `1px solid ${G.bdr}`,
          borderRadius: 24, width: "100%", maxWidth: 500,
          boxShadow: "0 8px 48px rgba(27,107,53,0.11)", overflow: "hidden"
        }}>

          {/* Gradient header */}
          <div style={{
            background: `linear-gradient(135deg,${G.deep},${G.green})`,
            padding: "26px 28px", position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: -24, right: -24, width: 100, height: 100,
              borderRadius: "50%", background: "rgba(255,255,255,0.07)"
            }} />
            <div style={{ fontSize: 26, marginBottom: 6 }}>🌿</div>
            <div style={{
              fontFamily: "'Playfair Display',serif", fontSize: 22,
              fontWeight: 700, color: "#fff", marginBottom: 4
            }}>Complete Your Profile</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
              We personalise prices &amp; mandis for you
            </div>
          </div>

          <div style={{ padding: "24px 28px" }}>

            {/* Full name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
                color: G.muted, fontWeight: 700, display: "block", marginBottom: 7
              }}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="E.g. Ramesh Kumar"
                style={{
                  width: "100%", border: `1px solid ${G.bdr}`, borderRadius: 10,
                  padding: "11px 14px", fontSize: 14, fontFamily: "'Mukta',sans-serif",
                  color: G.text, background: "#FAFFFE", outline: "none", transition: "all 0.2s"
                }} />
            </div>

            {/* State */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
                color: G.muted, fontWeight: 700, display: "block", marginBottom: 7
              }}>State</label>
              <div style={{ position: "relative" }}>
                <select value={state} onChange={e => {
                  setState(e.target.value);
                  setSelMandi(MANDIS_BY_STATE[e.target.value]?.[0]?.name || "");
                }} style={{
                  width: "100%", border: `1px solid ${G.bdr}`, borderRadius: 10,
                  padding: "11px 36px 11px 14px", fontSize: 14,
                  fontFamily: "'Mukta',sans-serif", color: G.text,
                  background: "#FAFFFE", appearance: "none", cursor: "pointer", outline: "none"
                }}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)", pointerEvents: "none", color: G.green
                }}>▾</span>
              </div>
            </div>

            {/* Crops */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
                color: G.muted, fontWeight: 700, display: "block", marginBottom: 7
              }}>
                My Crops{" "}
                <span style={{
                  fontSize: 9, color: G.green, textTransform: "none",
                  letterSpacing: 0, fontWeight: 400
                }}>(select all you grow)</span>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ALL_CROPS.map(c => {
                  const sel = selCrops.includes(c.id);
                  return (
                    <button key={c.id} onClick={() => toggleCrop(c.id)} style={{
                      background: sel ? `linear-gradient(135deg,${G.deep},${G.green})` : "#F1F8F1",
                      border: sel ? "none" : `1px solid ${G.bdr}`, borderRadius: 10,
                      padding: "8px 14px", cursor: "pointer", fontFamily: "'Mukta',sans-serif",
                      fontSize: 13, color: sel ? "#fff" : G.text, fontWeight: sel ? 700 : 400,
                      display: "flex", alignItems: "center", gap: 6, transition: "all 0.18s",
                      boxShadow: sel ? "0 3px 10px rgba(27,107,53,0.22)" : "none",
                    }}>
                      <span style={{ fontSize: 15 }}>{c.emoji}</span>{c.label}
                      {sel && <span style={{
                        background: "rgba(255,255,255,0.25)", borderRadius: "50%",
                        width: 15, height: 15, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 9
                      }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Mandi */}
            <div style={{ marginBottom: 22 }}>
              <label style={{
                fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
                color: G.muted, fontWeight: 700, display: "block", marginBottom: 7
              }}>Primary Mandi</label>
              <button onClick={() => setMandiOpen(p => !p)} style={{
                width: "100%", border: `1px solid ${mandiOpen ? G.green : G.bdr}`,
                borderRadius: mandiOpen ? "10px 10px 0 0" : 10, padding: "11px 14px",
                cursor: "pointer", background: mandiOpen ? G.light : "#FAFFFE",
                fontFamily: "'Mukta',sans-serif", fontSize: 14, color: G.text,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span>{selMandi || `Select mandi in ${state}...`}</span>
                <span style={{
                  color: G.green, transform: mandiOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s"
                }}>▾</span>
              </button>
              {mandiOpen && (
                <div style={{
                  border: `1px solid ${G.green}`, borderTop: "none",
                  borderRadius: "0 0 10px 10px", background: G.card,
                  maxHeight: 200, overflowY: "auto", boxShadow: "0 8px 20px rgba(27,107,53,0.10)"
                }}>
                  {mandis.map((m, i) => (
                    <button key={m.name} onClick={() => { setSelMandi(m.name); setMandiOpen(false); }}
                      style={{
                        width: "100%", padding: "10px 16px", border: "none",
                        borderBottom: i < mandis.length - 1 ? `1px solid ${G.faint}` : "none",
                        background: selMandi === m.name ? "rgba(27,107,53,0.05)" : "transparent",
                        cursor: "pointer", fontFamily: "'Mukta',sans-serif", fontSize: 13,
                        color: G.text, display: "flex", justifyContent: "space-between",
                        alignItems: "center", transition: "background 0.13s"
                      }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: G.green, width: 14, textAlign: "center" }}>
                          {selMandi === m.name ? "✓" : ""}
                        </span>
                        <span style={{ fontWeight: selMandi === m.name ? 700 : 400 }}>{m.name}</span>
                      </div>
                      <span style={{ fontSize: 11, color: G.muted }}>({m.district})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {err && (
              <div style={{
                background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.20)",
                borderRadius: 8, padding: "8px 12px", fontSize: 12, color: G.red, marginBottom: 14
              }}>
                ⚠ {err}
              </div>
            )}

            {/* Live preview */}
            {name && selCrops.length > 0 && (
              <div style={{
                background: G.light, border: `1px solid ${G.bdr}`, borderRadius: 10,
                padding: "10px 14px", marginBottom: 16, fontSize: 11, color: G.green, lineHeight: 1.8
              }}>
                <span style={{ fontWeight: 700 }}>📋 Your profile: </span>
                👤 {name} · 📍 {state} · 🌾 {selCrops.map(id =>
                  ALL_CROPS.find(c => c.id === id)?.label).join(", ")} · 🏪 {selMandi}
              </div>
            )}

            <button onClick={submit} style={{
              width: "100%", background: `linear-gradient(135deg,${G.deep},${G.green},#2D9E58)`,
              border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontSize: 15,
              fontWeight: 700, cursor: "pointer", fontFamily: "'Mukta',sans-serif",
              boxShadow: "0 4px 18px rgba(27,107,53,0.28)", transition: "all 0.22s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>Save &amp; Continue →</button>

            <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: G.muted }}>
              🔒 Your data stays on your device
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}