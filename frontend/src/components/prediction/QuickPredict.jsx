import { useState, useEffect } from "react";
import { G, cardStyle } from "../../styles/theme";

export default function QuickPredict({ myMandis, cdata, cropEmoji, cropLabel, onPredict }) {
  const [mandi, setMandi] = useState(0);
  const [days, setDays] = useState(21);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Reset when crop changes
  // removed useEffect to persist state across crop switches

  const handlePredict = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setOpen(false);
      onPredict({ mandi: myMandis[mandi], mandiIdx: mandi, days });
    }, 1600);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Header bar */}
      <div
        onClick={() => setOpen(p => !p)}
        onMouseEnter={() => done && setOpen(true)}
        onMouseLeave={() => done && setOpen(false)}
        style={{
          ...cardStyle({
            padding: "13px 20px", cursor: "pointer",
            borderRadius: open ? "16px 16px 0 0" : 16,
            borderBottom: open ? `1px solid ${G.faint}` : `1px solid ${G.bdr}`,
            transition: "border-radius 0.3s"
          }),
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 3, height: 18, borderRadius: 2, background: G.green }} />
          <span style={{
            fontSize: 14, fontWeight: 700, letterSpacing: "0.15em",
            textTransform: "uppercase", color: G.green
          }}>Quick Predict</span>
          {done && !open && (
            <span style={{
              background: G.dim, border: `1px solid ${G.bdr}`, borderRadius: 20,
              padding: "2px 11px", fontSize: 13, color: G.green, fontWeight: 600
            }}>
              ✅ {cropEmoji} {cropLabel} · {myMandis[mandi]?.split(" ")[0]} · {days}d — hover to edit
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!done && <span style={{ fontSize: 13, fontWeight: 600, color: G.muted }}>{myMandis.length} mandis</span>}
          <div style={{
            width: 22, height: 22, borderRadius: "50%", background: G.light,
            border: `1px solid ${G.bdr}`, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: G.green, fontWeight: 700,
            transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s"
          }}>▾</div>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div
          onMouseEnter={() => done && setOpen(true)}
          onMouseLeave={() => done && setOpen(false)}
          style={{
            background: G.card, border: `1px solid ${G.bdr}`, borderTop: "none",
            borderRadius: "0 0 16px 16px", padding: "20px 22px",
            boxShadow: "0 8px 24px rgba(27,107,53,0.08)", animation: "fadeUp 0.22s ease both"
          }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Mandi list */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{
                  fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: G.muted, fontWeight: 700
                }}>Select Mandi</div>
                <div style={{
                  fontSize: 13, color: G.green, fontWeight: 700, background: G.light,
                  border: `1px solid ${G.bdr}`, borderRadius: 20, padding: "2px 9px"
                }}>{myMandis.length} markets</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {myMandis.slice(0, 5).map((m, i) => (
                  <button key={m} onClick={() => setMandi(i)} style={{
                    background: mandi === i ? `linear-gradient(135deg,${G.deep},${G.green})` : "#F1F8F1",
                    border: mandi === i ? "none" : `1px solid ${G.bdr}`, borderRadius: 10,
                    padding: "10px 15px", cursor: "pointer",
                    color: mandi === i ? "#fff" : G.text, fontFamily: "'Mukta',sans-serif",
                    fontSize: 15, fontWeight: mandi === i ? 700 : 600, textAlign: "left",
                    transition: "all 0.18s", boxShadow: mandi === i ? "0 3px 10px rgba(27,107,53,0.24)" : "none",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    {mandi === i && <span>★</span>}
                    <span style={{ flex: 1 }}>{m}</span>
                    {i === 0 && (
                      <span style={{
                        fontSize: 12,
                        background: mandi === 0 ? "rgba(255,255,255,0.2)" : "rgba(27,107,53,0.09)",
                        border: mandi === 0 ? "none" : `1px solid ${G.bdr}`, borderRadius: 20,
                        padding: "1px 7px", color: mandi === 0 ? "rgba(255,255,255,0.85)" : G.green,
                        fontWeight: 600
                      }}>My Mandi</span>
                    )}
                  </button>
                ))}
              </div>
              <div style={{
                marginTop: 9, padding: "8px 12px", background: G.dim,
                border: `1px solid ${G.bdr}`, borderRadius: 8, fontSize: 14, color: G.green,
                fontWeight: 700, display: "flex", gap: 12, flexWrap: "wrap"
              }}>
                <span>📍 {myMandis[mandi]}</span>
                <span>₹{cdata.base * 100}/Q</span>
                <span>FAQ Grade</span>
              </div>
            </div>

            {/* Days + Predict btn */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: G.muted, fontWeight: 700, marginBottom: 12
                }}>Forecast Period</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                  {[7, 14, 21, 30].map(d => (
                    <button key={d} onClick={() => setDays(d)} style={{
                      background: days === d ? `linear-gradient(135deg,${G.deep},${G.green})` : "#E8F4E8",
                      border: days === d ? "none" : `1px solid ${G.bdr}`, borderRadius: 12, padding: "13px 0",
                      cursor: "pointer", color: days === d ? "#fff" : G.text,
                      fontFamily: "'Mukta',sans-serif", textAlign: "center", transition: "all 0.18s",
                      boxShadow: days === d ? "0 3px 10px rgba(27,107,53,0.24)" : "none",
                    }}>
                      <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{d}</div>
                      <div style={{
                        fontSize: 13, marginTop: 3, fontWeight: 600,
                        color: days === d ? "rgba(255,255,255,0.7)" : G.muted
                      }}>days</div>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handlePredict} disabled={loading} style={{
                marginTop: 20,
                background: loading
                  ? "linear-gradient(270deg,#0F4422,#1B6B35,#2D9E58,#1B6B35,#0F4422)"
                  : `linear-gradient(135deg,${G.deep},${G.green},#2D9E58)`,
                backgroundSize: loading ? "400% auto" : "auto",
                animation: loading ? "shimmer 1.8s linear infinite" : "none",
                border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 16,
                fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Mukta',sans-serif",
                boxShadow: loading ? "none" : "0 4px 18px rgba(27,107,53,0.28)",
                transition: "all 0.25s", width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
              }}>
                {loading
                  ? <><span style={{ display: "inline-block", animation: "spin 0.9s linear infinite", fontSize: 16 }}>◌</span>Predicting…</>
                  : <><span style={{ fontSize: 16 }}>🔮</span>Predict Price for {days} Days</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}