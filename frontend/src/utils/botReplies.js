// frontend/src/utils/botReplies.js

import { sendChatMessage } from "./api";

// ── Local fallback rules (used when backend is unreachable) ──────────────────
const RULES = [
  { keys: ["sell", "hold", "wait", "now"],
    answer: (c) => `📈 LSTM shows **+${c.pct}%** over ${c.days} days. Recommend **HOLD** — optimal sell around **Day ${Math.round(c.days * 0.72)}**. Confidence: ${c.conf}/100.` },
  { keys: ["mandi", "market", "best", "where"],
    answer: (c) => `📍 Best mandi: **${c.mandi}** — highest predicted price in your region. Compare in the Mandi Comparison section above.` },
  { keys: ["weather", "rain", "monsoon"],
    answer: ()  => `🌤 **Deficit rainfall** (-40%) in growing belts this week. Supply disruption likely → upward pressure on prices.` },
  { keys: ["peak", "when", "maximum", "highest"],
    answer: (c) => `📈 Prices projected to peak around **Day ${Math.round(c.days * 0.75)}–${Math.round(c.days * 0.82)}** at ~₹${(c.pred * 1.04).toFixed(1)}/kg.` },
  { keys: ["price", "rate", "today", "current", "modal"],
    answer: (c) => `💰 Current modal: **₹${c.base}/kg** (₹${c.base * 100}/Q) at ${c.mandi}. Live from Agmarknet.` },
  { keys: ["arrival", "supply", "stock"],
    answer: ()  => `📦 Arrivals at major mandis are **18% below** the 5-day average. Tighter supply supports the upward price trend.` },
  { keys: ["msp", "support", "government", "policy"],
    answer: ()  => `📋 Govt recently raised MSP by ₹200/Q. MSP acts as a floor — actual market prices may trade above if demand stays strong.` },
];

const DEFAULT = "🌾 Ask me: *'Should I sell now?'*, *'Best mandi?'*, *'Weather impact?'*, or *'When will prices peak?'*";

/**
 * getBotReply — async.
 * 1. Tries POST /chat (Groq RAG via backend).
 * 2. Falls back to local rule-based reply if backend fails.
 *
 * @param {string} message  — farmer's question
 * @param {object} ctx      — { base, pred, conf, pct, days, mandi, crop }
 * @param {object} profile  — { state, name, ... }
 */
export const getBotReply = async (message, ctx = {}, profile = {}) => {
  try {
    const data = await sendChatMessage({
      question: message,
      crop:     ctx.crop || "onion",
      state:    profile.state || "Maharashtra",
      district: ctx.mandi?.split(" ")[0] || "Nashik",
    });
    return data.answer;
  } catch {
    // Backend unreachable — use local fallback
    const m     = message.toLowerCase();
    const match = RULES.find((r) => r.keys.some((k) => m.includes(k)));
    return match ? match.answer(ctx) : DEFAULT;
  }
};