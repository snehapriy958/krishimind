import { G, cardStyle } from "../../styles/theme";
import MandiBarChart from "../charts/MandiBarChart";
import SectionTitle from "../layout/SectionTitle";

export default function MandiComparison({
  barData,
  bestMandi,
  selectedMandi,
}) {

  if (!barData || barData.length === 0) {
    return null;
  }

  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  const getChange = (today, predicted) => {
    if (!today) return 0;

    return ((predicted - today) / today) * 100;
  };

  return (
    <div>
      <SectionTitle
        right={`★ Selected: ${selectedMandi?.split(" ")[0] || bestMandi?.split(" ")[0]}`}
      >
        Mandi Comparison
      </SectionTitle>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 11,
        }}
      >

        {/* Chart */}

        <div style={cardStyle()}>

          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: G.text,
              marginBottom: 4,
            }}
          >
            Today vs Predicted (₹/Quintal)
          </div>

          <div
            style={{
              fontSize: 10,
              color: G.muted,
              marginBottom: 9,
            }}
          >
            Selected mandi uses live model output. Other mandi values are comparison estimates.
          </div>

          <MandiBarChart
            data={barData}
            selectedMandi={selectedMandi}
          />

        </div>


        {/* Table */}

        <div
          style={{
            ...cardStyle({
              padding: 0,
              overflow: "hidden",
            }),
          }}
        >

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >

            <thead>

              <tr
                style={{
                  background: G.light,
                }}
              >

                {["Mandi", "Today", "Pred", "Δ"].map((h) => (

                  <th
                    key={h}
                    style={{
                      fontSize: 10,
                      color: G.muted,
                      padding: "8px 10px",
                      textAlign: "left",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>

                ))}

              </tr>

            </thead>


            <tbody>

              {barData.map((m, i) => {

                const change = getChange(
                  m.today,
                  m.predicted
                );

                const selectedShortName =
                  selectedMandi
                    ?.split(" ")[0]
                    ?.toLowerCase();

                const mandiShortName =
                  m.name
                    ?.toLowerCase();

                const isSelected =
                  mandiShortName === selectedShortName;

                const isPositive =
                  change >= 0;

                return (

                  <tr
                    key={`${m.name}-${i}`}
                    style={{
                      borderBottom:
                        `1px solid ${G.faint}`,

                      background: isSelected
                        ? "rgba(27,107,53,0.06)"
                        : "#fff",
                    }}
                  >

                    {/* Mandi */}

                    <td
                      style={{
                        padding: "9px 10px",
                        fontSize: 12,
                        fontWeight:
                          isSelected
                            ? 700
                            : 600,
                        color: G.text,
                      }}
                    >

                      {isSelected && (
                        <span
                          style={{
                            color: G.amber,
                            marginRight: 4,
                          }}
                        >
                          ★
                        </span>
                      )}

                      {m.name}

                    </td>


                    {/* Today */}

                    <td
                      style={{
                        padding: "9px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: G.text,
                      }}
                    >
                      ₹{formatPrice(m.today)}
                    </td>


                    {/* Prediction */}

                    <td
                      style={{
                        padding: "9px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: G.green,
                      }}
                    >
                      ₹{formatPrice(m.predicted)}
                    </td>


                    {/* Change */}

                    <td
                      style={{
                        padding: "9px 10px",
                        fontSize: 12,
                        fontWeight: 700,

                        color: isPositive
                          ? G.green
                          : G.red,
                      }}
                    >

                      {isPositive ? "▲" : "▼"}

                      {Math.abs(change).toFixed(1)}%

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}