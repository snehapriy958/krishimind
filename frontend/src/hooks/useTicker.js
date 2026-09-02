import { useState, useEffect } from "react";
import { TICKERS } from "../data/tickers";

export function useTicker(interval = 2800) {
  const [tickIdx, setTickIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTickIdx((p) => (p + 1) % TICKERS.length), interval);
    return () => clearInterval(t);
  }, [interval]);
  return { tick: TICKERS[tickIdx], tickIdx };
}
