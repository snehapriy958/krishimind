import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { G } from "../../styles/theme";

export default function MandiBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top:14, right:4, left:-14, bottom:0 }}
        barGap={3} barCategoryGap="26%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,107,53,0.06)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill:G.muted, fontSize:9 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill:G.muted, fontSize:8 }} axisLine={false} tickLine={false}
          tickFormatter={v => `₹${v}`} />
        <Tooltip
          formatter={(v, n) => [`₹${v}`, n === "today" ? "Today" : "Predicted"]}
          contentStyle={{ fontSize:11, borderRadius:8, border:`1px solid ${G.bdr}`,
            fontFamily:"'Mukta',sans-serif" }} />
        <Bar dataKey="today" fill={G.faint} radius={[4,4,0,0]} maxBarSize={26} />
        <Bar dataKey="predicted" radius={[4,4,0,0]} maxBarSize={26}>
          <LabelList dataKey="predicted" position="top"
            style={{ fill:G.green, fontSize:9, fontWeight:700 }}
            formatter={v => `₹${v}`} />
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? G.green : `rgba(27,107,53,${0.55 - i * 0.1})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}