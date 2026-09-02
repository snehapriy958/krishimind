import { G, cardStyle } from "../../styles/theme";
import Gauge from "../charts/Gauge";

export default function PriceSummary({ cdata, days }) {

  // --------------------------------------------------
  // ADVISORY NORMALIZATION
  // Backend currently returns WAIT / SELL / HOLD
  // --------------------------------------------------

  const advisory = String(cdata.adv || "WAIT").toUpperCase();

  const isWait =
    advisory === "WAIT" ||
    advisory === "HOLD";

  const isSell = advisory === "SELL";


  // --------------------------------------------------
  // PRICE VALUES
  // --------------------------------------------------

  const basePrice = Number(cdata.base || 0).toFixed(2);

  const predPrice = Number(cdata.pred || 0).toFixed(2);

  const pctValue = Number(cdata.pct || 0);

  const pctChange = Math.abs(pctValue).toFixed(2);


  // --------------------------------------------------
  // CONFIDENCE / MAPE
  // --------------------------------------------------

  const confidence = Number(cdata.conf || 0);

  const realMape = cdata.mape;

  const mapeDisplay =
    realMape !== null &&
    realMape !== undefined
      ? Number(realMape).toFixed(1)
      : Math.round(
          ((100 - confidence) / 10) * 2.5
        );


  // --------------------------------------------------
  // ADVISORY TEXT
  // --------------------------------------------------

  const advisorAction =
    isSell
      ? "↓ SELL"
      : isWait
      ? "↔ WAIT"
      : "↑ HOLD";


  const advisorDescription =
    isSell
      ? "Price drop expected · Consider selling soon"
      : pctValue > 0
      ? `+${pctChange}% expected over ${days} days`
      : "Prices relatively stable · Monitor market";


  // --------------------------------------------------
  // ADVISORY CARD COLORS
  // --------------------------------------------------

  const advisorBackground =
    isSell
      ? `linear-gradient(135deg,#700,${G.red})`
      : `linear-gradient(135deg,${G.deep},${G.green})`;


  const advisorShadow =
    isSell
      ? "0 6px 22px rgba(192,57,43,0.26)"
      : "0 6px 22px rgba(27,107,53,0.26)";


  return (

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1.1fr",
        gap: 11
      }}
    >


      {/* ==================================================
          CURRENT PRICE
      ================================================== */}

      <div
        style={{
          ...cardStyle({
            padding: "16px 18px",
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
              fontSize: 14,
              color: G.muted,
              fontFamily: "'Mukta',sans-serif",
              fontWeight: 600
            }}
          >
            /Q
          </span>

        </div>


        <div
          style={{
            fontSize: 12,
            color: G.muted,
            marginTop: 7,
            fontWeight: 600
          }}
        >
          Agmarknet mandi price
        </div>

      </div>



      {/* ==================================================
          PREDICTED PRICE
      ================================================== */}

      <div
        style={{
          ...cardStyle({
            padding: "16px 18px",
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
            background:
              `linear-gradient(90deg,${G.green},#2D9E58)`
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
              fontSize: 14,
              color: G.muted,
              fontFamily: "'Mukta',sans-serif",
              fontWeight: 600
            }}
          >
            /Q
          </span>

        </div>


        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color:
              pctValue > 0
                ? G.green
                : pctValue < 0
                ? G.red
                : G.muted,
            marginTop: 7
          }}
        >
          {pctValue > 0
            ? "▲"
            : pctValue < 0
            ? "▼"
            : "●"}

          {pctChange}% · LSTM
        </div>

      </div>



      {/* ==================================================
          CONFIDENCE
      ================================================== */}

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
            background:
              `linear-gradient(
                90deg,
                ${confidence >= 75 ? G.green : G.amber},
                #2D9E58
              )`
          }}
        />


        <Gauge
          value={confidence}
          size={76}
        />


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
              color:
                confidence >= 75
                  ? G.green
                  : G.amber
            }}
          >
            {confidence >= 75
              ? "High"
              : "Moderate"}
          </div>


          <div
            style={{
              fontSize: 13,
              color: G.muted,
              marginTop: 1,
              fontWeight: 600
            }}
          >
            MAPE {mapeDisplay}%
          </div>

        </div>

      </div>



      {/* ==================================================
          AI ADVISOR
      ================================================== */}

      <div
        style={{
          background: advisorBackground,
          borderRadius: 16,
          padding: "16px 18px",
          position: "relative",
          overflow: "hidden",
          boxShadow: advisorShadow
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
            marginBottom: 7
          }}
        >
          {advisorAction}
        </div>


        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.5
          }}
        >
          {advisorDescription}
        </div>

      </div>

    </div>
  );
}