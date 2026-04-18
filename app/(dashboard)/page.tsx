"use client";
import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import DailyScoreCard  from "@/components/DailyScoreCard";

const BREAKDOWN_AR = [
  { label:"\u0627\u0644\u062A\u0639\u0627\u0641\u064A",      icon:"\uD83D\uDD04", value:22.5, max:30, color:"#7C3AED" },
  { label:"\u0627\u0644\u0628\u0631\u0648\u062A\u064A\u0646", icon:"\uD83E\uDD69", value:18,   max:20, color:"#00A87A" },
  { label:"\u0627\u0644\u0645\u0627\u0621",                   icon:"\uD83D\uDCA7", value:12,   max:20, color:"#F59E0B" },
  { label:"\u0627\u0644\u0635\u064A\u0627\u0645",             icon:"\uD83C\uDF19", value:20,   max:20, color:"#00A87A" },
  { label:"\u0627\u0644\u062A\u0645\u0631\u064A\u0646",       icon:"\uD83D\uDCAA", value:0,    max:10, color:"#EF4444" },
];
const BREAKDOWN_EN = [
  { label:"Recovery", icon:"\uD83D\uDD04", value:22.5, max:30, color:"#7C3AED" },
  { label:"Protein",  icon:"\uD83E\uDD69", value:18,   max:20, color:"#00A87A" },
  { label:"Water",    icon:"\uD83D\uDCA7", value:12,   max:20, color:"#F59E0B" },
  { label:"Fasting",  icon:"\uD83C\uDF19", value:20,   max:20, color:"#00A87A" },
  { label:"Training", icon:"\uD83D\uDCAA", value:0,    max:10, color:"#EF4444" },
];
const ACTION_AR = { label:"\u0633\u062C\u0651\u0644 \u062A\u0645\u0631\u064A\u0646\u0627\u064B", points:10, icon:"\uD83D\uDCAA" };
const ACTION_EN = { label:"Log a Workout", points:10, icon:"\uD83D\uDCAA" };

const WEEK_AR = ["\u0633","\u062D","\u062B","\u0623","\u062E","\u062C","\u0633\u0628"];
const WEEK_EN = ["S","M","T","W","T","F","S"];
const SCORES  = [85, 72, 90, 68, 95, 72, 0];
const TODAY   = new Date().getDay();

const QUICK_AR = [
  { icon:"\uD83D\uDCA7", label:"\u0645\u0627\u0621",    color:"#0EA5E9" },
  { icon:"\uD83E\uDD69", label:"\u0648\u062C\u0628\u0629", color:"#00A87A" },
  { icon:"\uD83D\uDCAA", label:"\u062A\u0645\u0631\u064A\u0646", color:"#7C3AED" },
  { icon:"\uD83D\uDCA4", label:"\u0646\u0648\u0645",    color:"#6366F1" },
  { icon:"\uD83D\uDC8A", label:"\u0645\u0643\u0645\u0644", color:"#F59E0B" },
];
const QUICK_EN = [
  { icon:"\uD83D\uDCA7", label:"Water",      color:"#0EA5E9" },
  { icon:"\uD83E\uDD69", label:"Meal",       color:"#00A87A" },
  { icon:"\uD83D\uDCAA", label:"Workout",    color:"#7C3AED" },
  { icon:"\uD83D\uDCA4", label:"Sleep",      color:"#6366F1" },
  { icon:"\uD83D\uDC8A", label:"Supplement", color:"#F59E0B" },
];

export default function DashboardPage() {
  const [lang, setLang] = useState<"ar"|"en">("ar");
  const dir   = lang === "ar" ? "rtl" : "ltr";
  const week  = lang === "ar" ? WEEK_AR : WEEK_EN;
  const quick = lang === "ar" ? QUICK_AR : QUICK_EN;

  return (
    <div style={{ minHeight:"100vh", background:"#EEF2F8", padding:"20px 32px", direction:dir, fontFamily:"system-ui, sans-serif", boxSizing:"border-box" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto", display:"flex", flexDirection:"column", gap:"14px" }}>

        {/* HEADER */}
        <DashboardHeader
          lang={lang}
          onToggleLang={() => setLang(l => l === "ar" ? "en" : "ar")}
          userName="Osama"
          streak={7}
        />

        {/* QUICK ACTIONS */}
        <div style={{ background:"#fff", borderRadius:"14px", padding:"14px 20px", display:"flex", flexDirection:"column", gap:"12px", boxSizing:"border-box" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <span style={{ fontSize:"16px" }}>{"\u26A1"}</span>
            <span style={{ fontSize:"14px", fontWeight:800, color:"#0D1B2A" }}>
              {lang === "ar" ? "\u0625\u0636\u0627\u0641\u0629 \u0633\u0631\u064A\u0639\u0629" : "Quick Log"}
            </span>
            <span style={{ fontSize:"11px", color:"#94A3B8", marginInlineStart:"4px" }}>
              {lang === "ar" ? "\u2014 \u0633\u062C\u0651\u0644 \u0628\u0636\u063A\u0637\u0629 \u0648\u0627\u062D\u062F\u0629" : "\u2014 one tap logging"}
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px" }}>
          {quick.map((q,i) => (
            <button key={i} style={{
              flex:"1 1 0", display:"flex", flexDirection:"column", alignItems:"center", gap:"6px",
              background:"none", border:`1.5px solid ${q.color}22`,
              borderRadius:"12px", padding:"12px 8px", cursor:"pointer",
              transition:"background 0.2s", fontFamily:"inherit",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = q.color+"15")}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ fontSize:"22px" }}>{q.icon}</span>
              <span style={{ fontSize:"11px", fontWeight:700, color:q.color }}>{q.label}</span>
            </button>
          ))}
          </div>
        </div>

        {/* WEEKLY STRIP */}
        <div style={{ background:"#fff", borderRadius:"14px", padding:"14px 20px", boxSizing:"border-box" }}>
          <div style={{ display:"flex", gap:"8px", justifyContent:"space-between" }}>
            {SCORES.map((s, i) => {
              const isToday = i === TODAY;
              const done    = s > 0;
              const color   = s >= 85 ? "#00A87A" : s >= 65 ? "#7C3AED" : s > 0 ? "#F59E0B" : "#E2E8F0";
              return (
                <div key={i} style={{ flex:"1 1 0", display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
                  <span style={{ fontSize:"10px", fontWeight:700, color: isToday ? "#7C3AED" : "#94A3B8" }}>{week[i]}</span>
                  <div style={{
                    width:"36px", height:"36px", borderRadius:"50%",
                    background: isToday ? "#7C3AED" : done ? color+"22" : "#F1F5F9",
                    border: isToday ? "2px solid #7C3AED" : `2px solid ${done ? color : "#E2E8F0"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"11px", fontWeight:800,
                    color: isToday ? "#fff" : done ? color : "#CBD5E1",
                  }}>
                    {done ? s : "-"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DAILY SCORE CARD */}
        <DailyScoreCard
          score={72}
          maxScore={100}
          streakTarget={1000}
          expectedScore={81}
          weekProgress={{ current:7, total:10 }}
          breakdown={lang === "ar" ? BREAKDOWN_AR : BREAKDOWN_EN}
          oneAction={lang === "ar" ? ACTION_AR : ACTION_EN}
          onActionLog={() => console.log("logged")}
          lang={lang}
        />

      </div>
    </div>
  );
}