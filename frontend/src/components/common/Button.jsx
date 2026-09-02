import { G } from "../../styles/theme";
const V = {
  primary:{ background:`linear-gradient(135deg,${G.deep},${G.green})`, color:"#fff", border:"none", boxShadow:"0 4px 18px rgba(27,107,53,0.28)" },
  ghost:  { background:"#F1F8F1", color:G.text, border:`1px solid ${G.bdr}`, boxShadow:"none" },
  active: { background:`linear-gradient(135deg,${G.deep},${G.green})`, color:"#fff", border:"none", boxShadow:"0 3px 10px rgba(27,107,53,0.24)" },
  danger: { background:`linear-gradient(135deg,#700,#C0392B)`, color:"#fff", border:"none", boxShadow:"0 4px 18px rgba(192,57,43,0.26)" },
};
export default function Button({ children, variant="primary", onClick, disabled=false, style={}, fullWidth=false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...(V[variant]||V.primary), borderRadius:12, padding:"12px 20px", fontSize:14,
      fontWeight:700, fontFamily:"'Mukta',sans-serif", cursor:disabled?"not-allowed":"pointer",
      opacity:disabled?0.6:1, transition:"all 0.22s", width:fullWidth?"100%":"auto",
      display:"flex", alignItems:"center", justifyContent:"center", gap:8, ...style,
    }}>{children}</button>
  );
}
