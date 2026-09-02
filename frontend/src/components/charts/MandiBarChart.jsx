import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

import { G } from "../../styles/theme";


export default function MandiBarChart({
  data = [],
  selectedMandi,
}) {

  const selectedShortName =
    selectedMandi
      ?.split(" ")[0]
      ?.toLowerCase();


  return (

    <ResponsiveContainer
      width="100%"
      height={160}
    >

      <BarChart
        data={data}

        margin={{
          top: 14,
          right: 4,
          left: -14,
          bottom: 0,
        }}

        barGap={3}

        barCategoryGap="26%"
      >

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(27,107,53,0.06)"
          vertical={false}
        />


        <XAxis
          dataKey="name"

          tick={{
            fill: G.muted,
            fontSize: 9,
          }}

          axisLine={false}

          tickLine={false}
        />


        <YAxis
          tick={{
            fill: G.muted,
            fontSize: 8,
          }}

          axisLine={false}

          tickLine={false}

          tickFormatter={(value) =>
            `₹${Math.round(value)}`
          }
        />


        <Tooltip
          formatter={(value, name) => [

            `₹${Number(value).toLocaleString("en-IN")}`,

            name === "today"
              ? "Today"
              : "Predicted",

          ]}

          contentStyle={{
            fontSize: 11,
            borderRadius: 8,
            border: `1px solid ${G.bdr}`,
            fontFamily: "'Mukta',sans-serif",
          }}
        />


        {/* Today's price */}

        <Bar
          dataKey="today"

          fill={G.faint}

          radius={[4, 4, 0, 0]}

          maxBarSize={26}
        />


        {/* Predicted price */}

        <Bar
          dataKey="predicted"

          radius={[4, 4, 0, 0]}

          maxBarSize={26}
        >

          <LabelList
            dataKey="predicted"

            position="top"

            style={{
              fill: G.green,
              fontSize: 9,
              fontWeight: 700,
            }}

            formatter={(value) =>
              `₹${Math.round(value)}`
            }
          />


          {data.map((mandi, index) => {

            const mandiShortName =
              mandi.name
                ?.toLowerCase();


            const isSelected =
              mandi.fullName === selectedMandi ||
              mandiShortName === selectedShortName;


            return (

              <Cell
                key={`${mandi.name}-${index}`}

                fill={
                  isSelected
                    ? G.green
                    : `rgba(27,107,53,${
                        Math.max(
                          0.25,
                          0.55 - index * 0.08
                        )
                      })`
                }
              />

            );

          })}

        </Bar>

      </BarChart>

    </ResponsiveContainer>

  );

}