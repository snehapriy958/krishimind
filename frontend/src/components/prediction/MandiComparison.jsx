import { G, cardStyle } from "../../styles/theme";
import MandiBarChart from "../charts/MandiBarChart";
import SectionTitle from "../layout/SectionTitle";

export default function MandiComparison({ barData, bestMandi }) {
  return (
    <div>
      <SectionTitle right={`★ Best: ${bestMandi?.split(" ")[0]}`}>Mandi Comparison</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 11 }}>
        <div style={cardStyle()}>
          <div style={{ fontSize: 14, fontWeight: 700, color: G.text, marginBottom: 9 }}>
            Today vs Predicted (₹/Q)
          </div>
          <MandiBarChart data={barData} />
        </div>

        <div style={{ ...cardStyle({ padding: 0, overflow: "hidden" }) }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: G.light }}>
                {["Mandi", "Today", "Pred", "Δ"].map(h => (
                  <th key={h} style={{
                    fontSize: 11, color: G.muted, padding: "8px 10px",
                    textAlign: "left", fontWeight: 700, textTransform: "uppercase"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {barData.map((m, i) => (
                <tr key={m.name} style={{
                  borderBottom: `1px solid ${G.faint}`,
                  background: i === 0 ? "rgba(27,107,53,0.03)" : "#fff"
                }}>
                  <td style={{ padding: "8px 10px", fontSize: 15, fontWeight: i === 0 ? 700 : 700 }}>
                    {i === 0 && <span style={{ color: G.amber, marginRight: 3 }}>★</span>}{m.name}
                  </td>
                  <td style={{ padding: "8px 10px", fontSize: 14, fontWeight: 700, color: G.text }}>₹{m.today}</td>
                  <td style={{ padding: "8px 10px", fontSize: 15, fontWeight: 700, color: G.green }}>₹{m.predicted}</td>
                  <td style={{ padding: "8px 10px", fontSize: 14, fontWeight: 700, color: G.green }}>
                    ▲{Math.round((m.predicted - m.today) / m.today * 100)}%
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