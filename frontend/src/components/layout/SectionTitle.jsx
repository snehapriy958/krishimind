import { G } from "../../styles/theme";
export default function SectionTitle({ children, right }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
        <div style={{ width:3, height:14, borderRadius:2, background:G.green }} />
        <span style={{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase",
          color:G.green, fontWeight:700 }}>{children}</span>
      </div>
      {right && (
        <div style={{ fontSize:10, color:G.green, fontWeight:600, background:G.light,
          border:`1px solid ${G.bdr}`, borderRadius:20, padding:"3px 11px" }}>{right}</div>
      )}
    </div>
  );
}