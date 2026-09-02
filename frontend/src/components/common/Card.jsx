import { cardStyle } from "../../styles/theme";
export default function Card({ children, style = {}, className = "" }) {
  return <div className={className} style={{ ...cardStyle(), ...style }}>{children}</div>;
}
