import { G } from "../../styles/theme";
const TABS = [
  { id:"predict", icon:"🔮", label:"Prediction" },
  { id:"news",    icon:"📰", label:"News"       },
  { id:"history", icon:"📜", label:"History"    },
];
export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:150,
      background:"rgba(255,255,255,0.97)", borderTop:`1px solid ${G.faint}`,
      backdropFilter:"blur(14px)", display:"flex", height:54 }}>
      {TABS.map(tab => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
          flex:1, border:"none", cursor:"pointer", background:"transparent",
          fontFamily:"'Mukta',sans-serif", display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:2,
          borderTop: activeTab === tab.id ? `2.5px solid ${G.green}` : "2.5px solid transparent",
          transition:"all 0.18s",
        }}>
          <span style={{ fontSize:17 }}>{tab.icon}</span>
          <span style={{ fontSize:9, color: activeTab === tab.id ? G.green : G.muted,
            fontWeight: activeTab === tab.id ? 700 : 400 }}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}