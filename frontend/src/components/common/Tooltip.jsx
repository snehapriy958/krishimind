import { useState } from "react";
import { G } from "../../styles/theme";
export default function Tooltip({ children, text }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{position:"relative",display:"inline-flex"}}
      onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      {children}
      {show && (
        <div style={{position:"absolute",bottom:"110%",left:"50%",transform:"translateX(-50%)",
          background:G.deep,color:"#fff",padding:"5px 10px",borderRadius:7,
          fontSize:11,whiteSpace:"nowrap",boxShadow:"0 4px 12px rgba(0,0,0,0.18)",
          zIndex:999,pointerEvents:"none"}}>
          {text}
          <div style={{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",
            border:"5px solid transparent",borderTopColor:G.deep}}/>
        </div>
      )}
    </div>
  );
}
