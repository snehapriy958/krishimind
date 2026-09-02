import { G, cardStyle } from "../../styles/theme";
import Gauge from "../charts/Gauge";

export default function PriceSummary({ cdata, days }) {

  const isHold = cdata.adv === "HOLD";

  const basePrice = Number(cdata.base).toFixed(2);
  const predPrice = Number(cdata.pred).toFixed(2);
  const pctChange = Number(Math.abs(cdata.pct)).toFixed(2);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.1fr", gap: 11 }}>

      {/* Current Price */}
      <div style={{ ...cardStyle({ padding: "16px 18px", position: "relative", overflow: "hidden" }) }}>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: G.faint
          }}
        />

        <div
          style={{
            fontSize: 12,
            color: G.muted,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 6
          }}
        >
          💰 Current Price
        </div>

        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 34,
            fontWeight: 700,
            color: G.text,
            lineHeight: 1
          }}
        >
          ₹{basePrice}
          <span
            style={{
              fontSize: 15,
              color: G.muted,
              fontFamily: "'Mukta',sans-serif",
              fontWeight: 600
            }}
          >
            /kg
          </span>
        </div>

        <div
          style={{
            fontSize: 13,
            color: G.muted,
            marginTop: 5,
            fontWeight: 600
          }}
        >
          ₹{Math.round(cdata.base * 100)}/Q · Agmarknet
        </div>

      </div>

      {/* Predicted Price */}
      <div style={{ ...cardStyle({ padding: "16px 18px", position: "relative", overflow: "hidden" }) }}>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg,${G.green},#2D9E58)`
          }}
        />

        <div
          style={{
            fontSize: 12,
            color: G.muted,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 6
          }}
        >
          🔮 Predicted D{days}
        </div>

        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 34,
            fontWeight: 700,
            color: G.green,
            lineHeight: 1
          }}
        >
          ₹{predPrice}
          <span
            style={{
              fontSize: 15,
              color: G.muted,
              fontFamily: "'Mukta',sans-serif",
              fontWeight: 600
            }}
          >
            /kg
          </span>
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: cdata.pct > 0 ? G.green : G.red,
            marginTop: 5
          }}
        >
          {cdata.pct > 0 ? "▲" : "▼"}{pctChange}% · LSTM
        </div>

      </div>

      {/* Confidence Gauge */}
      <div
        style={{
          ...cardStyle({
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "relative",
            overflow: "hidden"
          })
        }}
      >

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg,${
              cdata.conf >= 75 ? G.green : G.amber
            },#2D9E58)`
          }}
        />

        <Gauge value={cdata.conf} size={76} />

        <div>
          <div
            style={{
              fontSize: 12,
              color: G.muted,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 3
            }}
          >
            🎯 Confidence
          </div>

          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: cdata.conf >= 75 ? G.green : G.amber
            }}
          >
            {cdata.conf >= 75 ? "High" : "Moderate"}
          </div>

          <div
            style={{
              fontSize: 13,
              color: G.muted,
              marginTop: 1,
              fontWeight: 600
            }}
          >
            MAPE ~{Math.round((100 - cdata.conf) / 10 * 2.5)}%
          </div>
        </div>

      </div>

      {/* AI Advisor */}
      <div
        style={{
          background: isHold
            ? `linear-gradient(135deg,${G.deep},${G.green})`
            : `linear-gradient(135deg,#700,${G.red})`,
          borderRadius: 16,
          padding: "16px 18px",
          position: "relative",
          overflow: "hidden",
          boxShadow: isHold
            ? "0 6px 22px rgba(27,107,53,0.26)"
            : "0 6px 22px rgba(192,57,43,0.26)"
        }}
      >

        <div
          style={{
            position: "absolute",
            top: -14,
            right: -14,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)"
          }}
        />

        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 4
          }}
        >
          🤖 AI Advisor
        </div>

        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1,
            marginBottom: 4
          }}
        >
          {isHold ? "↑ HOLD" : "↓ SELL"}
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.5
          }}
        >
          {isHold
            ? `+${pctChange}% over ${days}d · Wait D${Math.round(days * 0.75)}`
            : "Drop likely · Sell in 5 days"}
        </div>

      </div>
    </div>
  );
}