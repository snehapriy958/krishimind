import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

import { G } from "../../styles/theme";


/**
 * Converts only valid numeric values.
 *
 * Important:
 * null, undefined and empty strings must NOT
 * become zero.
 */
const toFiniteNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};


/**
 * Tooltip
 */
function PriceTip({
  active,
  payload,
  label,
}) {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  const predicted =
    payload.find(
      (item) =>
        item.dataKey === "price"
    );

  const upper =
    payload.find(
      (item) =>
        item.dataKey === "upper"
    );

  const lower =
    payload.find(
      (item) =>
        item.dataKey === "lower"
    );

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${G.bdr}`,
        borderRadius: 10,
        padding: "10px 12px",
        fontSize: 11,
        fontFamily:
          "'Mukta', sans-serif",
        boxShadow:
          "0 6px 18px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          color: G.muted,
          fontSize: 10,
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      {predicted &&
        toFiniteNumber(
          predicted.value
        ) !== null && (
          <div
            style={{
              fontWeight: 700,
              color: G.green,
              fontSize: 14,
            }}
          >
            Predicted: ₹
            {Number(
              predicted.value
            ).toFixed(2)}
            /Q
          </div>
        )}

      {upper &&
        toFiniteNumber(
          upper.value
        ) !== null && (
          <div
            style={{
              color: G.amber,
              marginTop: 3,
            }}
          >
            Upper: ₹
            {Number(
              upper.value
            ).toFixed(2)}
            /Q
          </div>
        )}

      {lower &&
        toFiniteNumber(
          lower.value
        ) !== null && (
          <div
            style={{
              color: G.muted,
              marginTop: 3,
            }}
          >
            Lower: ₹
            {Number(
              lower.value
            ).toFixed(2)}
            /Q
          </div>
        )}
    </div>
  );
}


/**
 * PriceTrendChart
 */
export default function PriceTrendChart({
  data = [],
  base,
  pred,
  days,
  cropName,
  mandiName,
}) {
  /*
   * Safe current and final prediction.
   */
  const safeBase =
    toFiniteNumber(base) ?? 0;

  const safePred =
    toFiniteNumber(pred) ??
    safeBase;


  /*
   * Clean chart data.
   *
   * This is critical.
   *
   * Invalid null values are removed instead of
   * becoming zero and destroying the Y-axis range.
   */
  const cleanData =
    Array.isArray(data)
      ? data
          .map((item) => {
            if (!item) {
              return null;
            }

            const price =
              toFiniteNumber(
                item.price
              );

            if (price === null) {
              return null;
            }

            const upper =
              toFiniteNumber(
                item.upper
              );

            const lower =
              toFiniteNumber(
                item.lower
              );

            return {
              ...item,

              price,

              upper:
                upper !== null
                  ? upper
                  : price * 1.02,

              lower:
                lower !== null
                  ? lower
                  : price * 0.98,
            };
          })
          .filter(Boolean)
      : [];


  /*
   * Trend direction.
   */
  const rising =
    safePred >= safeBase;

  const lineCol =
    rising
      ? G.green
      : G.red;


  /*
   * Get ONLY valid numeric chart values.
   *
   * Never use Number(null), because:
   *
   * Number(null) === 0
   *
   * That was causing the chart to scale from
   * ₹0 to ₹2200.
   */
  const allValues =
    cleanData
      .flatMap(
        (item) => [
          toFiniteNumber(
            item.price
          ),

          toFiniteNumber(
            item.upper
          ),

          toFiniteNumber(
            item.lower
          ),
        ]
      )
      .filter(
        (value) =>
          value !== null
      );


  /*
   * Include current price and final prediction
   * in the Y-axis calculation.
   */
  const chartValues = [
    ...allValues,
    safeBase,
    safePred,
  ].filter(
    (value) =>
      Number.isFinite(value)
  );


  const rawMin =
    chartValues.length > 0
      ? Math.min(
          ...chartValues
        )
      : 0;


  const rawMax =
    chartValues.length > 0
      ? Math.max(
          ...chartValues
        )
      : 1;


  /*
   * Calculate visible range.
   */
  const valueRange =
    Math.max(
      rawMax - rawMin,
      1
    );


  /*
   * Add enough padding so the line is visible.
   */
  const padding =
    Math.max(
      valueRange * 0.2,
      5
    );


  const yMin =
    Math.floor(
      rawMin - padding
    );


  const yMax =
    Math.ceil(
      rawMax + padding
    );


  /*
   * X-axis tick interval.
   */
  const tickInterval =
    Math.max(
      Math.floor(
        Math.max(
          cleanData.length - 1,
          1
        ) / 5
      ),
      0
    );


  return (
    <div>

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
          marginBottom: 12,
          gap: 12,
        }}
      >
        <div>

          <div
            style={{
              fontFamily:
                "'Playfair Display', serif",

              fontSize: 15,

              fontWeight: 700,

              color: G.text,
            }}
          >
            {cropName} · {days}-Day Forecast ·{" "}
            {mandiName}
          </div>


          <div
            style={{
              fontSize: 11,
              color: G.muted,
              marginTop: 2,
            }}
          >
            LSTM prediction with confidence band
          </div>

        </div>


        {/* LEGEND */}

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              color: lineCol,
              label: "Predicted",
            },

            {
              color: G.amber,
              label: "Upper",
            },

            {
              color:
                "rgba(27,107,53,0.30)",

              label: "Lower",
            },
          ].map(
            (item) => (
              <div
                key={item.label}

                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: 4,
                  fontSize: 9,
                  color: G.muted,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 2,
                    background:
                      item.color,
                    borderRadius: 2,
                  }}
                />

                {item.label}
              </div>
            )
          )}
        </div>

      </div>


      {/* CHART */}

      <ResponsiveContainer
        width="100%"
        height={220}
      >
        <ComposedChart
          data={cleanData}

          margin={{
            top: 10,
            right: 18,
            left: 2,
            bottom: 0,
          }}
        >

          <defs>

            <linearGradient
              id="priceFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={lineCol}
                stopOpacity={0.18}
              />

              <stop
                offset="95%"
                stopColor={lineCol}
                stopOpacity={0.01}
              />

            </linearGradient>

          </defs>


          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(27,107,53,0.06)"
            vertical={false}
          />


          {/* X AXIS */}

          <XAxis
            dataKey="day"

            tick={{
              fill: G.muted,
              fontSize: 9,
            }}

            axisLine={false}

            tickLine={false}

            interval={
              tickInterval
            }
          />


          {/* Y AXIS */}

          <YAxis
            tick={{
              fill: G.muted,
              fontSize: 9,
            }}

            axisLine={false}

            tickLine={false}

            domain={[
              yMin,
              yMax,
            ]}

            tickCount={5}

            allowDataOverflow

            tickFormatter={
              (value) =>
                `₹${Math.round(
                  value
                )}`
            }
          />


          {/* TOOLTIP */}

          <Tooltip
            content={
              <PriceTip />
            }
          />


          {/* UPPER BOUND */}

          <Area
            type="monotone"

            dataKey="upper"

            stroke={G.amber}

            strokeWidth={1.5}

            strokeDasharray="5 3"

            fill="rgba(184,120,10,0.04)"

            dot={false}

            isAnimationActive={false}
          />


          {/* LOWER BOUND */}

          <Area
            type="monotone"

            dataKey="lower"

            stroke="rgba(27,107,53,0.30)"

            strokeWidth={1.2}

            strokeDasharray="3 3"

            fill="transparent"

            dot={false}

            isAnimationActive={false}
          />


          {/* MAIN PREDICTION */}

          <Area
            type="monotone"

            dataKey="price"

            stroke={lineCol}

            strokeWidth={3}

            fill="url(#priceFill)"

            dot={false}

            activeDot={{
              r: 5,
              fill: lineCol,
              stroke: "#fff",
              strokeWidth: 2,
            }}

            isAnimationActive={false}
          />


          {/* CURRENT PRICE */}

          <ReferenceLine
            y={safeBase}

            stroke={G.amber}

            strokeDasharray="4 3"

            ifOverflow="hidden"

            label={{
              value: "Today",
              position: "right",
              fill: G.amber,
              fontSize: 8,
            }}
          />

        </ComposedChart>

      </ResponsiveContainer>


      {/* SUMMARY */}

      <div
        style={{
          display: "flex",
          gap: 7,
          marginTop: 8,
          flexWrap: "wrap",
        }}
      >
        {[
          {
            label: "Today",

            value:
              `₹${safeBase.toFixed(
                2
              )}/Q`,

            color:
              G.muted,
          },

          {
            label: `D${days}`,

            value:
              `₹${safePred.toFixed(
                2
              )}/Q`,

            color:
              lineCol,
          },

          {
            label: "Source",

            value:
              "LSTM + Agmarknet",

            color:
              G.muted,
          },
        ].map(
          (item) => (
            <div
              key={item.label}

              style={{
                background:
                  G.light,

                borderRadius: 7,

                padding:
                  "4px 10px",

                fontSize: 10,
              }}
            >
              <span
                style={{
                  color:
                    G.muted,
                }}
              >
                {item.label}:{" "}
              </span>


              <span
                style={{
                  fontWeight: 700,
                  color:
                    item.color,
                }}
              >
                {item.value}
              </span>

            </div>
          )
        )}
      </div>

    </div>
  );
}