"use client";
import { useState, useEffect } from "react";

interface Props {
  lang: "ar" | "en";
  onToggleLang: () => void;
  userName?: string;
  streak?: number;
}

const T = {
  ar: {
    greeting: (n: string) => `\u0645\u0631\u062D\u0628\u0627\u060C ${n} \uD83D\uDC4B`,
    streak: "\u064A\u0648\u0645 \u062A\u062A\u0627\u0628\u0639",
    today: "\u0627\u0644\u064A\u0648\u0645",
    days: ["\u0627\u0644\u0623\u062D\u062F","\u0627\u0644\u0627\u062B\u0646\u064A\u0646","\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621","\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621","\u0627\u0644\u062E\u0645\u064A\u0633","\u0627\u0644\u062C\u0645\u0639\u0629","\u0627\u0644\u0633\u0628\u062A"],
    months: ["\u064A\u0646\u0627\u064A\u0631","\u0641\u0628\u0631\u0627\u064A\u0631","\u0645\u0627\u0631\u0633","\u0623\u0628\u0631\u064A\u0644","\u0645\u0627\u064A\u0648","\u064A\u0648\u0646\u064A\u0648","\u064A\u0648\u0644\u064A\u0648","\u0623\u063A\u0633\u0637\u0633","\u0633\u0628\u062A\u0645\u0628\u0631","\u0623\u0643\u062A\u0648\u0628\u0631","\u0646\u0648\u0641\u0645\u0628\u0631","\u062F\u064A\u0633\u0645\u0628\u0631"],
  },
  en: {
    greeting: (n: string) => `Welcome back, ${n} \uD83D\uDC4B`,
    streak: "day streak",
    today: "Today",
    days: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  },
};

export default function DashboardHeader({ lang, onToggleLang, userName = "Osama", streak = 7 }: Props) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const t = T[lang];
  const dayName   = t.days[now.getDay()];
  const monthName = t.months[now.getMonth()];
  const dateStr   = lang === "ar"
    ? `${dayName}\u060C ${now.getDate()} ${monthName} ${now.getFullYear()}`
    : `${dayName}, ${monthName} ${now.getDate()}, ${now.getFullYear()}`;

  const hh = String(now.getHours()).padStart(2,"0");
  const mm = String(now.getMinutes()).padStart(2,"0");
  const ss = String(now.getSeconds()).padStart(2,"0");
  const timeStr = mounted ? `${hh}:${mm}:${ss}` : "--:--:--";

  return (
    <div style={{
      background: "linear-gradient(135deg, #0F1629 0%, #1A2744 100%)",
      borderRadius: "16px",
      padding: "20px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      width: "100%",
      boxSizing: "border-box",
      direction: lang === "ar" ? "rtl" : "ltr",
    }}>
      <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
        <div style={{ fontSize:"22px", fontWeight:800, color:"#FFFFFF" }}>
          {t.greeting(userName)}
        </div>
        <div style={{ fontSize:"14px", color:"rgba(241,245,249,0.55)" }}>
          {dateStr}
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>

        <div style={{
          background:"rgba(255,255,255,0.06)", borderRadius:"12px",
          padding:"10px 18px", display:"flex", flexDirection:"column",
          alignItems:"center", gap:"2px",
        }}>
          <span suppressHydrationWarning style={{ fontSize:"24px", fontWeight:800, color:"#FFFFFF", fontVariantNumeric:"tabular-nums", letterSpacing:"1px" }}>
            {timeStr}
          </span>
          <span style={{ fontSize:"10px", color:"rgba(241,245,249,0.4)", letterSpacing:"0.5px" }}>
            {t.today}
          </span>
        </div>

        <div style={{
          background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)",
          borderRadius:"12px", padding:"10px 16px",
          display:"flex", alignItems:"center", gap:"8px",
        }}>
          <span style={{ fontSize:"20px" }}>{"\uD83D\uDD25"}</span>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
            <span style={{ fontSize:"22px", fontWeight:800, color:"#F59E0B", lineHeight:1 }}>{streak}</span>
            <span style={{ fontSize:"9px", color:"rgba(245,158,11,0.7)" }}>{t.streak}</span>
          </div>
        </div>

        <button onClick={onToggleLang} style={{
          background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.4)",
          borderRadius:"10px", padding:"10px 16px",
          color:"#A78BFA", fontSize:"14px", fontWeight:700,
          cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap",
        }}>
          {lang === "ar" ? "EN" : "\u0639\u0631"}
        </button>

      </div>
    </div>
  );
}