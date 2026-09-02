import { useState } from "react";
import { G } from "../styles/theme";
import { ALL_CROPS } from "../data/crops";
import { getCropData } from "../data/cropData";
import { getOrderedMandis } from "../data/mandis";
import Navbar from "../components/layout/Navbar";
import BottomNav from "../components/layout/BottomNav";
import ChatSidebar from "../components/chatbot/ChatSidebar";
import PredictionTab from "../tabs/PredictionTab";
import NewsTab from "../tabs/NewsTab";
import HistoryTab from "../tabs/HistoryTab";

export default function DashboardPage({ profile }) {
  const initCrop = ALL_CROPS.find(c => c.id === profile.crops[0]) || ALL_CROPS[0];

  const [activeCrop, setActiveCrop] = useState(initCrop);
  const [activeTab, setActiveTab] = useState("predict");
  const [lang, setLang] = useState("en");
  const [chatOpen, setChatOpen] = useState(false);

  // Context passed to the chatbot for contextual replies
  const cdata = getCropData(activeCrop.id);
  const myMandis = getOrderedMandis(profile.mandi, profile.state);
  const cropCtx = {
    base: cdata.base,
    pred: cdata.pred,
    conf: cdata.conf,
    pct: cdata.pct,
    days: 21,
    mandi: myMandis[0],
  };

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: G.bg, fontFamily: "'Mukta',sans-serif",
      color: G.text, position: "relative"
    }}>

      <Navbar
        profile={profile}
        lang={lang} setLang={setLang}
        activeCrop={activeCrop} setActiveCrop={crop => { setActiveCrop(crop); setActiveTab("predict"); }}
        activeTab={activeTab} setActiveTab={setActiveTab}
      />

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 18px 90px" }}>
        {activeTab === "predict" && <PredictionTab profile={profile} activeCrop={activeCrop} />}
        {activeTab === "news" && <NewsTab activeCrop={activeCrop} />}
        {activeTab === "history" && <HistoryTab profile={profile} />}
      </div>

      {/* Floating AI chat button */}
      <button onClick={() => setChatOpen(true)} style={{
        position: "fixed", bottom: 80, right: 24,
        width: 56, height: 56, borderRadius: "50%",
        background: `linear-gradient(135deg,${G.deep},${G.green})`,
        border: "none", cursor: "pointer",
        boxShadow: "0 6px 24px rgba(27,107,53,0.36)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, zIndex: 200, transition: "all 0.22s",
      }} title="Ask KrishiMind AI">
        🤖
        <div style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          border: `2px solid ${G.green}`, opacity: 0.3, animation: "pulse 2s infinite"
        }} />
      </button>

      {/* RAG Chatbot sidebar */}
      <ChatSidebar
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        profile={profile}
        cropCtx={cropCtx}
      />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}