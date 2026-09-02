import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { G } from "../../styles/theme";

function PriceTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:`1px solid ${G.bdr}`, borderRadius:10,
      padding:"8px 12px", fontSize:11, fontFamily:"'Mukta',sans-serif" }}>
      <div style={{ color:G.muted, fontSize:10, marginBottom:2 }}>{label}</div>
      <div style={{ fontWeight:700, color:G.green, fontSize:14 }}>
        ₹{payload[0]?.value}/kg
      </div>
    </div>
  );
}

export default function PriceTrendChart({ data, base, pred, days, cropName, mandiName }) {
  const rising = pred >= base;
  const lineCol = rising ? G.green : G.red;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:G.text }}>
            {cropName} · {days}-Day Forecast · {mandiName}
          </div>
          <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>LSTM prediction with confidence band</div>
        </div>
        <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>
          {[{c:G.green,l:"Predicted"},{c:G.amber,l:"Upper"},{c:"rgba(27,107,53,0.3)",l:"Lower"}].map(x => (
            <div key={x.l} style={{ display:"flex", alignItems:"center", gap:4, fontSize:9, color:G.muted }}>
              <div style={{ width:16, height:2.5, background:x.c, borderRadius:2 }}/>{x.l}
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top:4, right:8, left:-16, bottom:0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={lineCol} stopOpacity={0.15} />
              <stop offset="95%" stopColor={lineCol} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,107,53,0.06)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill:G.muted, fontSize:9 }} axisLine={false} tickLine={false}
            interval={Math.floor(days / 6)} />
          <YAxis tick={{ fill:G.muted, fontSize:9 }} axisLine={false} tickLine={false}
            tickFormatter={v => `₹${v}`} />
          <Tooltip content={<PriceTip />} />
          <Area type="monotone" dataKey="upper" stroke={G.amber} strokeWidth={1.5}
            strokeDasharray="5 3" fill="rgba(184,120,10,0.04)" dot={false} />
          <Area type="monotone" dataKey="price" stroke={lineCol} strokeWidth={3}
            fill="url(#priceFill)" dot={false}
            activeDot={{ r:5, fill:lineCol, stroke:"#fff", strokeWidth:2 }} />
          <Area type="monotone" dataKey="lower" stroke="rgba(27,107,53,0.25)" strokeWidth={1}
            strokeDasharray="2 3" fill="#fff" dot={false} />
          <ReferenceLine y={base} stroke={G.amber} strokeDasharray="4 3"
            label={{ value:"Today", position:"right", fill:G.amber, fontSize:8 }} />
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{ display:"flex", gap:7, marginTop:8, flexWrap:"wrap" }}>
        {[
          { l:"Today", v:`₹${base}/kg`,       c:G.muted  },
          { l:`D${days}`, v:`₹${pred}/kg`,    c:G.green  },
          { l:"Source", v:"LSTM + Agmarknet", c:G.muted  },
        ].map(s => (
          <div key={s.l} style={{ background:G.light, borderRadius:7, padding:"4px 10px", fontSize:10 }}>
            <span style={{ color:G.muted }}>{s.l}: </span>
            <span style={{ fontWeight:700, color:s.c }}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}