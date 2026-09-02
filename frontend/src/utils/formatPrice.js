export const fmtKg  = (val) => `₹${Number(val).toFixed(1)}/kg`;
export const fmtQ   = (val) => `₹${Math.round(val * 100)}/Q`;
export const fmtPct = (pct) => `${pct >= 0 ? "▲" : "▼"}${Math.abs(pct).toFixed(1)}%`;
export const pctColor = (pct, G) => (pct >= 0 ? G.green : G.red);
