import { G, cardStyle } from "../styles/theme";
import { HISTORY_ITEMS } from "../data/historyData";
import SectionTitle from "../components/layout/SectionTitle";

export default function HistoryTab({ profile }) {
  const avg = Math.round(HISTORY_ITEMS.reduce((s,h) => s + h.accuracy, 0) / HISTORY_ITEMS.length);

  const STATS = [
    { icon:"🔮", label:"Predictions Made", val:HISTORY_ITEMS.length, unit:"total"         },
    { icon:"🎯", label:"Avg Accuracy",      val:`${avg}%`,             unit:"MAPE based"   },
    { icon:"💰", label:"Best Prediction",   val:"99%",                 unit:"Wheat · Feb 1"},
    { icon:"🌾", label:"Crops Tracked",     val:profile.crops.length,  unit:"active crops" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:11 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ ...cardStyle({ padding:"14px 16px",
            position:"relative", overflow:"hidden" }) }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
              background:`linear-gradient(90deg,${G.green},#2D9E58)` }} />
            <div style={{ fontSize:18, marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26,
              fontWeight:700, color:G.green, lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:10, color:G.muted, marginTop:4 }}>{s.label}</div>
            <div style={{ fontSize:9, color:G.green, marginTop:2, fontWeight:600 }}>{s.unit}</div>
          </div>
        ))}
      </div>

      {/* History table */}
      <div>
        <SectionTitle>Prediction History</SectionTitle>
        <div style={{ ...cardStyle({ padding:0, overflow:"hidden" }) }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:G.light }}>
                {["Date","Crop","Mandi","Days","Predicted","Actual","Accuracy","Advice","Status"].map(h => (
                  <th key={h} style={{ fontSize:9, color:G.muted, padding:"10px 12px",
                    textAlign:"left", fontWeight:700, textTransform:"uppercase",
                    letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HISTORY_ITEMS.map((h, i) => (
                <tr key={h.id} style={{ borderBottom:`1px solid ${G.faint}`,
                  background: i % 2 === 0 ? "#fff" : "rgba(232,245,236,0.3)" }}>
                  <td style={{ padding:"10px 12px", fontSize:11, color:G.muted,
                    whiteSpace:"nowrap" }}>{h.date}</td>
                  <td style={{ padding:"10px 12px", fontSize:12, fontWeight:600 }}>{h.crop}</td>
                  <td style={{ padding:"10px 12px", fontSize:11, color:G.muted }}>
                    {h.mandi.split(" ")[0]}
                  </td>
                  <td style={{ padding:"10px 12px", fontSize:11 }}>{h.days}d</td>
                  <td style={{ padding:"10px 12px", fontSize:12, fontWeight:700,
                    color:G.green }}>{h.predicted}</td>
                  <td style={{ padding:"10px 12px", fontSize:12, fontWeight:600 }}>{h.actual}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ flex:1, height:4, background:G.faint,
                        borderRadius:4, minWidth:50 }}>
                        <div style={{ height:"100%", width:`${h.accuracy}%`,
                          background: h.accuracy >= 95 ? G.green : G.amber,
                          borderRadius:4 }} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:700,
                        color: h.accuracy >= 95 ? G.green : G.amber }}>{h.accuracy}%</span>
                    </div>
                  </td>
                  <td style={{ padding:"10px 12px" }}>
                    <span style={{ fontSize:10, fontWeight:700,
                      background: h.adv === "HOLD" ? "rgba(27,107,53,0.1)" : "rgba(192,57,43,0.1)",
                      color: h.adv === "HOLD" ? G.green : G.red,
                      borderRadius:20, padding:"2px 9px" }}>{h.adv}</span>
                  </td>
                  <td style={{ padding:"10px 12px" }}>
                    <span style={{ fontSize:10, fontWeight:600,
                      color: h.status === "active" ? G.green : G.muted }}>
                      {h.status === "active" ? "🟢 Active" : "✅ Done"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}