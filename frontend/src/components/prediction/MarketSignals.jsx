import SectionTitle from "../layout/SectionTitle";

export default function MarketSignals({ apiData }) {

  const weatherTitle =
    apiData?.weather_condition === "deficit"
      ? "Deficit Rain"
      : apiData?.weather_condition === "excess"
      ? "Heavy Rain"
      : "Normal Weather";

  const weatherDetail = apiData?.weather_impact || "Weather stable";

  const sentimentTitle =
    apiData?.sentiment_label === "bearish"
      ? "📉 Bearish"
      : apiData?.sentiment_label === "bullish"
      ? "😊 Bullish"
      : "⚖ Neutral";

  const sentimentScore = apiData?.sentiment_score ?? 0;

  const SIGNALS = [
    {
      icon: "🌤",
      label: "Weather",
      title: weatherTitle,
      detail: weatherDetail,
      stats: ["IMD Data"],
      rgb: "27,107,53",
    },
    {
      icon: "📦",
      label: "Arrivals",
      title: "Market Supply",
      detail: "Based on mandi arrivals",
      stats: ["Agmarknet"],
      rgb: "184,120,10",
    },
    {
      icon: "📰",
      label: "News Sentiment",
      title: sentimentTitle,
      detail: apiData?.sentiment_reason || "News impact on crop prices",
      stats: [`Score ${sentimentScore.toFixed(2)}`],
      rgb: sentimentScore < 0 ? "180,50,50" : "27,107,53",
    },
  ];

  return (
    <div>
      <SectionTitle>Market Signals</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 11 }}>
        {SIGNALS.map((s) => (
          <div
            key={s.label}
            style={{
              background: `rgba(${s.rgb},0.05)`,
              border: `1px solid rgba(${s.rgb},0.15)`,
              borderRadius: 14,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: `rgba(${s.rgb},0.65)`,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 5,
              }}
            >
              {s.icon} {s.label}
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: `rgb(${s.rgb})`,
                marginBottom: 4,
              }}
            >
              {s.title}
            </div>

            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#5C7A5C",
                marginBottom: 7,
                lineHeight: 1.4,
              }}
            >
              {s.detail}
            </div>

            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {s.stats.map((st) => (
                <div
                  key={st}
                  style={{
                    background: `rgba(${s.rgb},0.08)`,
                    borderRadius: 5,
                    padding: "2px 7px",
                    fontSize: 12,
                    color: `rgb(${s.rgb})`,
                    fontWeight: 700,
                  }}
                >
                  {st}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}