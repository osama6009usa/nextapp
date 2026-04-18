"use client";
import { useState } from "react";

interface AxisBreakdown {
  label: string;
  icon: string;
  value: number;
  max: number;
  color: string;
}
interface OneAction {
  label: string;
  points: number;
  icon: string;
}
interface DailyScoreCardProps {
  score?: number;
  maxScore?: number;
  streakTarget?: number;
  expectedScore?: number;
  weekProgress?: { current: number; total: number };
  breakdown?: AxisBreakdown[];
  oneAction?: OneAction;
  onActionLog?: () => void;
  lang?: "ar" | "en";
}

function gaugeColor(score: number, max: number) {
  const p = score / max;
  if (p >= 0.85) return "#00A87A";
  if (p >= 0.65) return "#7C3AED";
  if (p >= 0.45) return "#F59E0B";
  return "#EF4444";
}

const LABELS = {
  ar: { excellent:"\u0645\u0645\u062A\u0627\u0632", vgood:"\u062C\u064A\u062F \u062C\u062F\u0627\u064B", good:"\u062C\u064A\u062F", improve:"\u064A\u062D\u062A\u0627\u062C \u062A\u062D\u0633\u064A\u0646", axes:"\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u062D\u0627\u0648\u0631", details:"\u062A\u0641\u0627\u0635\u064A\u0644", expected:"\u0645\u062A\u0648\u0642\u0639", days:"\u0623\u064A\u0627\u0645", bestAction:"\u0623\u0641\u0636\u0644 \u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0622\u0646", points:"\u0646\u0642\u0637\u0629" },
  en: { excellent:"Excellent", vgood:"Very Good", good:"Good", improve:"Needs Work", axes:"Axis Breakdown", details:"Details", expected:"Expected", days:"days", bestAction:"Best Action Now", points:"pts" },
};

export default function DailyScoreCard({
  score = 0, maxScore = 100, streakTarget = 1000,
  expectedScore = 0, weekProgress = { current: 0, total: 7 },
  breakdown = [], oneAction, onActionLog, lang = "ar",
}: DailyScoreCardProps) {
  const [open, setOpen] = useState(true);
  const gc  = gaugeColor(score, maxScore);
  const t   = LABELS[lang];
  const p   = score / maxScore;
  const lbl = p >= 0.85 ? t.excellent : p >= 0.65 ? t.vgood : p >= 0.45 ? t.good : t.improve;
  const R = 48; const cx = 60; const cy = 60;
  const circ = Math.PI * R;
  const off  = circ * (1 - Math.min(1, score / maxScore));
  const dir  = lang === "ar" ? "rtl" : "ltr";

  return (
    <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:"10px", boxSizing:"border-box", direction: dir }}>

      <div style={{ height:"4px", borderRadius:"9999px", background:`linear-gradient(${lang==="ar"?"to left":"to right"}, ${gc}, #7C3AED)`, width:"100%" }} />

      <div style={{ display:"flex", gap:"10px", width:"100%", boxSizing:"border-box" }}>

        <div style={{ flex:"1 1 0", minWidth:0, background:"#1A2744", borderRadius:"14px", padding:"16px", display:"flex", flexDirection:"column", gap:"6px", boxSizing:"border-box" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:"13px", fontWeight:700, color:"#F1F5F9", letterSpacing:"0.5px" }}>BIOSOV</span>
            <span style={{ fontSize:"16px" }}>{"\uD83E\uDDEC"}</span>
          </div>
          <div style={{ display:"flex", alignItems:"baseline", gap:"4px", marginTop:"2px", flexDirection: lang==="ar" ? "row-reverse" : "row", justifyContent:"flex-end" }}>
            <span style={{ color:"#F59E0B", fontSize:"13px", fontWeight:700 }}>{"\u2191"}</span>
            <span style={{ fontSize:"38px", fontWeight:800, color:"#fff", lineHeight:1 }}>{score}</span>
            <span style={{ fontSize:"13px", color:"rgba(241,245,249,0.45)" }}>/{streakTarget}</span>
          </div>
          <div style={{ fontSize:"11px", color:"rgba(241,245,249,0.45)", textAlign: lang==="ar" ? "right" : "left" }}>
            ({weekProgress.current}/{weekProgress.total} {t.days})
          </div>
          <div style={{ height:"1px", background:"rgba(255,255,255,0.08)", margin:"2px 0" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent: lang==="ar" ? "flex-start" : "flex-end", gap:"5px", fontSize:"12px", fontWeight:600, color:"rgba(241,245,249,0.65)" }}>
            <span>{"\uD83D\uDCCB"}</span>
            <span>{t.expected}: {expectedScore}/{maxScore}</span>
          </div>
        </div>

        <div style={{ flex:"1 1 0", minWidth:0, background:"#fff", borderRadius:"14px", padding:"16px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"6px", boxSizing:"border-box" }}>
          <svg width="120" height="70" viewBox="0 0 120 70" style={{ overflow:"visible" }}>
            <path d={`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${cx+R} ${cy}`} fill="none" stroke="#E2E8F0" strokeWidth="9" strokeLinecap="round" />
            <path d={`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${cx+R} ${cy}`} fill="none" stroke={gc} strokeWidth="9" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} style={{ transition:"stroke-dashoffset 0.8s ease-out" }} />
            <text x={cx} y={cy-6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#0D1B2A">{score}</text>
            <text x={cx} y={cy+12} textAnchor="middle" fontSize="10" fill="#64748B">/{maxScore}</text>
          </svg>
          <div style={{ background:gc+"22", color:gc, fontSize:"11px", fontWeight:700, padding:"3px 12px", borderRadius:"9999px" }}>{lbl}</div>
          <button onClick={() => setOpen(v => !v)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"10px", color:"#64748B", display:"flex", alignItems:"center", gap:"3px", fontFamily:"inherit", padding:0 }}>
            {open ? "\u25B2" : "\u25BC"} {t.details}
          </button>
        </div>

      </div>

      {open && breakdown.length > 0 && (
        <div style={{ background:"#1E2D3D", borderRadius:"14px", padding:"14px 16px", display:"flex", flexDirection:"column", gap:"10px", width:"100%", boxSizing:"border-box" }}>
          <span style={{ fontSize:"11px", fontWeight:700, color:"rgba(241,245,249,0.45)", textAlign: lang==="ar" ? "right" : "left" }}>
            {t.axes}
          </span>
          {breakdown.map((ax, i) => {
            const pct = Math.min(100, Math.round((ax.value / ax.max) * 100));
            const vc  = pct >= 100 ? "#00A87A" : pct >= 60 ? "#F59E0B" : "#EF4444";
            return (
              <div key={i} style={{ display:"flex", flexDirection:"column", gap:"3px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"12px", fontWeight:700, color:vc }}>{ax.value}/{ax.max}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:"5px", flexDirection: lang==="ar" ? "row" : "row-reverse" }}>
                    <span style={{ fontSize:"12px", color:"#F1F5F9", fontWeight:600 }}>{ax.label}</span>
                    <span style={{ fontSize:"15px" }}>{ax.icon}</span>
                  </div>
                </div>
                <div style={{ height:"7px", background:"rgba(255,255,255,0.08)", borderRadius:"9999px", overflow:"hidden", direction: lang==="ar" ? "rtl" : "ltr" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:ax.color, borderRadius:"9999px", transition:"width 0.6s ease-out" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {oneAction && (
        <div style={{ background:"linear-gradient(135deg,#7C3AED,#5B21B6)", borderRadius:"14px", padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", width:"100%", boxSizing:"border-box" }}>
          <button onClick={onActionLog} style={{ background:"rgba(255,255,255,0.18)", border:"none", borderRadius:"10px", padding:"7px 14px", color:"#fff", fontSize:"11px", fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
            {oneAction.points}+ {t.points}
          </button>
          <div style={{ flex:1, textAlign: lang==="ar" ? "right" : "left" }}>
            <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.65)", marginBottom:"2px" }}>{t.bestAction}</div>
            <div style={{ fontSize:"13px", fontWeight:700, color:"#fff" }}>{oneAction.label}</div>
          </div>
          <div style={{ width:"40px", height:"40px", background:"rgba(255,255,255,0.13)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", flexShrink:0 }}>
            {oneAction.icon}
          </div>
        </div>
      )}
    </div>
  );
}