import { G } from "../../styles/theme";

export default function Gauge({ value, size = 88 }) {
  const r = 30, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const col = value >= 75 ? G.green : value >= 50 ? G.amber : G.red;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={G.faint} strokeWidth={6} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - value / 100)}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 1.2s ease" }} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fill={col} fontSize={17} fontWeight={700} fontFamily="'Mukta',sans-serif">{value}</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill={col} fontSize={8}
        fontFamily="'Mukta',sans-serif" opacity={0.6}>/100</text>
    </svg>
  );
}