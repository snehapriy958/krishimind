import { useState } from "react";
import { G } from "../styles/theme";

export default function LoginPage({ onSendOtp }) {
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (phone.replace(/\D/g, "").length !== 10) {
      setErr("Please enter a valid 10-digit number");
      return;
    }
    setErr("");
    onSendOtp(phone);
  };

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: G.bg, fontFamily: "'Mukta',sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>

      {/* Card */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24
      }}>
        <div className="fu" style={{
          background: G.card, border: `1px solid ${G.bdr}`,
          borderRadius: 24, padding: "40px 44px", width: "100%", maxWidth: 420,
          boxShadow: "0 8px 48px rgba(27,107,53,0.11)", textAlign: "center"
        }}>

          <div style={{ fontSize: 30, marginBottom: 10 }}>🌿</div>
          <div style={{
            fontFamily: "'Playfair Display',serif", fontSize: 26,
            fontWeight: 700, color: G.green, marginBottom: 6
          }}>KrishiMind</div>
          <div style={{
            fontFamily: "'Playfair Display',serif", fontSize: 20,
            fontWeight: 700, color: G.text, marginBottom: 6
          }}>Welcome Back</div>
          <div style={{ fontSize: 13, color: G.muted, marginBottom: 32 }}>
            AI Price Intelligence for Farmers
          </div>

          <div style={{ textAlign: "left", marginBottom: 20 }}>
            <label style={{
              fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
              color: G.muted, fontWeight: 700, display: "block", marginBottom: 8
            }}>
              Mobile Number
            </label>
            <div style={{
              display: "flex", border: `1px solid ${G.bdr}`, borderRadius: 12,
              overflow: "hidden", background: "#FAFFFE"
            }}>
              <div style={{
                padding: "12px 16px", background: G.light,
                borderRight: `1px solid ${G.bdr}`, fontSize: 15, fontWeight: 600,
                color: G.text, flexShrink: 0
              }}>+91</div>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="Enter 10 digit number"
                style={{
                  flex: 1, border: "none", padding: "12px 16px", fontSize: 14,
                  fontFamily: "'Mukta',sans-serif", color: G.text,
                  background: "transparent", outline: "none"
                }} />
            </div>
            {err && <div style={{ fontSize: 11, color: G.red, marginTop: 6 }}>⚠ {err}</div>}
          </div>

          <button onClick={submit} style={{
            width: "100%", background: `linear-gradient(135deg,${G.deep},${G.green})`,
            border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontSize: 15,
            fontWeight: 700, cursor: "pointer", fontFamily: "'Mukta',sans-serif",
            letterSpacing: "0.04em", boxShadow: "0 4px 18px rgba(27,107,53,0.28)",
            transition: "all 0.22s", marginBottom: 24,
          }}>Send OTP</button>

          <div style={{ height: 1, background: G.faint, marginBottom: 20 }} />
          <button onClick={() => onSendOtp(phone, "register")} style={{
            background: "none", border: "none", cursor: "pointer", fontSize: 13,
            color: G.green, fontFamily: "'Mukta',sans-serif", fontWeight: 700,
          }}>New farmer? Register Here</button>
        </div>
      </div>
    </div>
  );
}