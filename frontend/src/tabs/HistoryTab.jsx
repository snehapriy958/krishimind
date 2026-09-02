import { useMemo } from "react";

import { G, cardStyle } from "../styles/theme";

import {
  getPredictionHistory,
} from "../utils/predictionHistory";

import SectionTitle from "../components/layout/SectionTitle";


const CROP_EMOJI = {
  onion: "🧅",
  potato: "🥔",
  tomato: "🍅",
  wheat: "🌾",
  rice: "🌾",
};


function getCropEmoji(crop = "") {
  return CROP_EMOJI[crop.toLowerCase()] || "🌱";
}


function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}/Q`;
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    );
  } catch {
    return value;
  }
}


export default function HistoryTab({ profile }) {

  // Read real prediction history directly from localStorage.
  // No useEffect or setState is needed.
  const historyItems = getPredictionHistory();


  const stats = useMemo(() => {
    const totalPredictions = historyItems.length;

    const completedItems = historyItems.filter(
      (item) =>
        Number.isFinite(Number(item.accuracy))
    );

    const averageAccuracy =
      completedItems.length > 0
        ? Math.round(
            completedItems.reduce(
              (sum, item) =>
                sum + Number(item.accuracy),
              0
            ) / completedItems.length
          )
        : null;

    const bestPrediction =
      completedItems.length > 0
        ? completedItems.reduce(
            (best, item) =>
              Number(item.accuracy) >
              Number(best.accuracy)
                ? item
                : best
          )
        : null;

    const trackedCrops =
      new Set(
        historyItems.map((item) =>
          String(item.crop || "").toLowerCase()
        )
      ).size;

    return {
      totalPredictions,
      averageAccuracy,
      bestPrediction,
      trackedCrops,
    };
  }, [historyItems]);


  const statItems = [
    {
      icon: "🔮",
      label: "Predictions Made",
      val: stats.totalPredictions,
      unit: "total",
    },

    {
      icon: "🎯",
      label: "Avg Accuracy",
      val:
        stats.averageAccuracy !== null
          ? `${stats.averageAccuracy}%`
          : "—",
      unit:
        stats.averageAccuracy !== null
          ? "completed predictions"
          : "awaiting actual prices",
    },

    {
      icon: "💰",
      label: "Best Prediction",
      val:
        stats.bestPrediction
          ? `${stats.bestPrediction.accuracy}%`
          : "—",
      unit:
        stats.bestPrediction
          ? `${stats.bestPrediction.crop} · ${formatDate(
              stats.bestPrediction.createdAt
            )}`
          : "awaiting actual prices",
    },

    {
      icon: "🌾",
      label: "Crops Tracked",
      val:
        stats.trackedCrops ||
        profile?.crops?.length ||
        0,
      unit: "active crops",
    },
  ];


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >

      {/* =========================
          STATS
      ========================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: 11,
        }}
      >
        {statItems.map((stat) => (
          <div
            key={stat.label}
            style={{
              ...cardStyle({
                padding: "14px 16px",
                position: "relative",
                overflow: "hidden",
              }),
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(
                  90deg,
                  ${G.green},
                  #2D9E58
                )`,
              }}
            />

            <div
              style={{
                fontSize: 18,
                marginBottom: 6,
              }}
            >
              {stat.icon}
            </div>

            <div
              style={{
                fontFamily:
                  "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 700,
                color: G.green,
                lineHeight: 1,
              }}
            >
              {stat.val}
            </div>

            <div
              style={{
                fontSize: 10,
                color: G.muted,
                marginTop: 4,
              }}
            >
              {stat.label}
            </div>

            <div
              style={{
                fontSize: 9,
                color: G.green,
                marginTop: 2,
                fontWeight: 600,
              }}
            >
              {stat.unit}
            </div>
          </div>
        ))}
      </div>


      {/* =========================
          HISTORY TABLE
      ========================= */}

      <div>
        <SectionTitle>
          Prediction History
        </SectionTitle>

        <div
          style={{
            ...cardStyle({
              padding: 0,
              overflow: "hidden",
            }),
          }}
        >

          {historyItems.length === 0 ? (

            <div
              style={{
                padding: "48px 20px",
                textAlign: "center",
                color: G.muted,
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  marginBottom: 10,
                }}
              >
                🔮
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: G.text,
                }}
              >
                No predictions yet
              </div>

              <div
                style={{
                  fontSize: 11,
                  marginTop: 6,
                }}
              >
                Run a prediction from Quick Predict
                to see it here.
              </div>
            </div>

          ) : (

            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 900,
                }}
              >

                <thead>
                  <tr
                    style={{
                      background: G.light,
                    }}
                  >
                    {[
                      "Date",
                      "Crop",
                      "Mandi",
                      "Days",
                      "Predicted",
                      "Current",
                      "Accuracy",
                      "Advice",
                      "Status",
                    ].map((header) => (
                      <th
                        key={header}
                        style={{
                          fontSize: 9,
                          color: G.muted,
                          padding:
                            "10px 12px",
                          textAlign: "left",
                          fontWeight: 700,
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.08em",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>


                <tbody>

                  {historyItems.map(
                    (item, index) => {

                      const accuracy =
                        Number.isFinite(
                          Number(item.accuracy)
                        )
                          ? Number(item.accuracy)
                          : null;


                      const isActive =
                        item.status === "active" ||
                        item.actual === null ||
                        item.actual === undefined;


                      const advice =
                        String(
                          item.adv ||
                          "WAIT"
                        ).toUpperCase();


                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom:
                              `1px solid ${G.faint}`,

                            background:
                              index % 2 === 0
                                ? "#fff"
                                : "rgba(232,245,236,0.3)",
                          }}
                        >

                          {/* DATE */}

                          <td
                            style={{
                              padding:
                                "10px 12px",
                              fontSize: 11,
                              color:
                                G.muted,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formatDate(
                              item.createdAt
                            )}
                          </td>


                          {/* CROP */}

                          <td
                            style={{
                              padding:
                                "10px 12px",
                              fontSize: 12,
                              fontWeight: 600,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {getCropEmoji(
                              item.crop
                            )}{" "}

                            {item.crop
                              ? item.crop.charAt(0)
                                  .toUpperCase() +
                                item.crop.slice(1)
                              : "Unknown"}
                          </td>


                          {/* MANDI */}

                          <td
                            style={{
                              padding:
                                "10px 12px",
                              fontSize: 11,
                              color:
                                G.muted,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {item.mandi || "—"}
                          </td>


                          {/* DAYS */}

                          <td
                            style={{
                              padding:
                                "10px 12px",
                              fontSize: 11,
                            }}
                          >
                            {item.days
                              ? `${item.days}d`
                              : "—"}
                          </td>


                          {/* PREDICTED */}

                          <td
                            style={{
                              padding:
                                "10px 12px",
                              fontSize: 12,
                              fontWeight: 700,
                              color:
                                G.green,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formatPrice(
                              item.predicted
                            )}
                          </td>


                          {/* CURRENT / ACTUAL */}

                          <td
                            style={{
                              padding:
                                "10px 12px",
                              fontSize: 12,
                              fontWeight: 600,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {isActive
                              ? "Pending"
                              : formatPrice(
                                  item.actual
                                )}
                          </td>


                          {/* ACCURACY */}

                          <td
                            style={{
                              padding:
                                "10px 12px",
                            }}
                          >

                            {accuracy === null ? (

                              <span
                                style={{
                                  fontSize: 10,
                                  color:
                                    G.muted,
                                }}
                              >
                                Pending
                              </span>

                            ) : (

                              <div
                                style={{
                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  gap: 6,
                                }}
                              >

                                <div
                                  style={{
                                    flex: 1,
                                    height: 4,
                                    background:
                                      G.faint,
                                    borderRadius: 4,
                                    minWidth: 50,
                                  }}
                                >
                                  <div
                                    style={{
                                      height:
                                        "100%",

                                      width:
                                        `${Math.min(
                                          100,
                                          Math.max(
                                            0,
                                            accuracy
                                          )
                                        )}%`,

                                      background:
                                        accuracy >= 95
                                          ? G.green
                                          : G.amber,

                                      borderRadius: 4,
                                    }}
                                  />
                                </div>


                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,

                                    color:
                                      accuracy >= 95
                                        ? G.green
                                        : G.amber,
                                  }}
                                >
                                  {accuracy}%
                                </span>

                              </div>
                            )}

                          </td>


                          {/* ADVICE */}

                          <td
                            style={{
                              padding:
                                "10px 12px",
                            }}
                          >

                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,

                                background:
                                  advice === "SELL"
                                    ? "rgba(192,57,43,0.1)"
                                    : advice === "BUY"
                                      ? "rgba(41,128,185,0.1)"
                                      : "rgba(27,107,53,0.1)",

                                color:
                                  advice === "SELL"
                                    ? G.red
                                    : advice === "BUY"
                                      ? "#2980b9"
                                      : G.green,

                                borderRadius: 20,

                                padding:
                                  "2px 9px",
                              }}
                            >
                              {advice}
                            </span>

                          </td>


                          {/* STATUS */}

                          <td
                            style={{
                              padding:
                                "10px 12px",
                              whiteSpace:
                                "nowrap",
                            }}
                          >

                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,

                                color:
                                  isActive
                                    ? G.green
                                    : G.muted,
                              }}
                            >
                              {isActive
                                ? "🟢 Active"
                                : "✅ Done"}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}