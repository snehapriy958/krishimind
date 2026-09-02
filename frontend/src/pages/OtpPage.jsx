import { useState, useEffect, useRef } from "react";
import { G } from "../styles/theme";

export default function OtpPage({ phone, onVerified }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState("");
  const [timer, setTimer] = useState(30);
  const ref0 = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5];

  useEffect(() => {
    const t = setInterval(() => setTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  const handleKey = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const n = [...otp]; n[i] = val.slice(-1); setOtp(n);
    if (val && i < 5) refs[i + 1].current?.focus();
  };
  const handleBackspace = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };
  const verify = () => {
    const code = otp.join("");
    if (code.length !== 6) { setErr("Enter all 6 digits"); return; }
    setErr(""); onVerified();
  };

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: G.bg, fontFamily: "'Mukta',sans-serif",
      display: "flex", flexDirection: "column"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.95)", borderBottom: `1px solid ${G.faint}`,
        padding: "0 28px", height: 56, display: "flex", alignItems: "center",
        boxShadow: "0 1px 10px rgba(27,107,53,0.06)"
      }}>
        <span style={{
          fontFamily: "'Playfair Display',serif", fontSize: 20,
          fontWeight: 700, color: G.green
        }}>KrishiMind</span>
      </div>

      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24
      }}>
        <div className="fu" style={{
          background: G.card, border: `1px solid ${G.bdr}`,
          borderRadius: 24, padding: "40px 44px", width: "100%", maxWidth: 420,
          boxShadow: "0 8px 48px rgba(27,107,53,0.11)", textAlign: "center"
        }}>

          <div style={{
            width: 52, height: 52, borderRadius: "50%", background: G.light,
            border: `2px solid ${G.bdr}`, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 24, margin: "0 auto 16px"
          }}>📱</div>

          <div style={{
            fontFamily: "'Playfair Display',serif", fontSize: 22,
            fontWeight: 700, color: G.text, marginBottom: 6
          }}>Verify OTP</div>
          <div style={{ fontSize: 13, color: G.muted, marginBottom: 8 }}>Sent to +91 {phone}</div>
          <div style={{
            fontSize: 11, color: G.green, fontWeight: 600, marginBottom: 28,
            background: G.light, borderRadius: 20, padding: "4px 14px", display: "inline-block"
          }}>
            Demo: type any 6 digits
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
            {otp.map((v, i) => (
              <input key={i} ref={refs[i]} value={v} maxLength={1}
                onChange={e => handleKey(i, e.target.value)}
                onKeyDown={e => handleBackspace(i, e)}
                style={{
                  width: 44, height: 52, border: `1.5px solid ${v ? G.green : G.bdr}`,
                  borderRadius: 10, textAlign: "center", fontSize: 22, fontWeight: 700,
                  color: G.green, background: "#FAFFFE", fontFamily: "'Mukta',sans-serif",
                  outline: "none", transition: "all 0.15s"
                }} />
            ))}
          </div>

          {err && <div style={{ fontSize: 11, color: G.red, marginBottom: 14 }}>⚠ {err}</div>}

          <button onClick={verify} style={{
            width: "100%", background: `linear-gradient(135deg,${G.deep},${G.green})`,
            border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontSize: 15,
            fontWeight: 700, cursor: "pointer", fontFamily: "'Mukta',sans-serif",
            boxShadow: "0 4px 18px rgba(27,107,53,0.28)", marginBottom: 18,
          }}>Verify &amp; Continue</button>

          <div style={{ fontSize: 12, color: G.muted }}>
            {timer > 0
              ? `Resend OTP in ${timer}s`
              : <button onClick={() => setTimer(30)} style={{
                background: "none", border: "none",
                cursor: "pointer", color: G.green, fontFamily: "'Mukta',sans-serif",
                fontSize: 12, fontWeight: 700
              }}>Resend OTP</button>}
          </div>
        </div>
      </div>
    </div>
  );
}