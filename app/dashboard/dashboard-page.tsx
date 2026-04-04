"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  recovery_score: number | null;
  hrv: number | null;
  rhr: number | null;
  sleep_performance: number | null;
  protein_g: number | null;
  water_ml: number | null;
  daily_score: number | null;
  biosov_score: number | null;
}

interface Meal {
  id: string;
  user_id: string;
  eaten_at: string;
}

interface DashboardData {
  log: DailyLog | null;
  lastMealAt: string | null;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatFastingTime(ms: number) {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function fastingPct(ms: number, targetHours = 16) {
  return Math.min(100, (ms / (targetHours * 3600 * 1000)) * 100);
}

function fastingLabel(hours: number) {
  if (hours < 12) return { text: "حرق سكر", color: "#D97706", bg: "rgba(217,119,6,0.1)" };
  if (hours < 16) return { text: "كيتوز خفيف", color: "#1A73E8", bg: "rgba(26,115,232,0.1)" };
  return { text: "حرق دهون 🔥", color: "#00A87A", bg: "rgba(0,168,122,0.1)" };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "مساء الخير 🌙";
  if (h < 12) return "صباح الخير ☀️";
  if (h < 17) return "مساء النور 🌤";
  if (h < 21) return "مساء الخير 🌅";
  return "ليلة طيبة 🌙";
}

function scoreColor(val: number, max: number) {
  const pct = val / max;
  if (pct >= 0.75) return "#00A87A";
  if (pct >= 0.50) return "#F59E0B";
  return "#EF4444";
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

/* Shimmer skeleton block */
const Shimmer = ({ w = "100%", h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: r,
      background: "linear-gradient(90deg,#eef2f7 25%,#dce4ef 50%,#eef2f7 75%)",
      backgroundSize: "468px 100%",
      animation: "biosov-shimmer 1.4s ease-in-out infinite",
      flexShrink: 0,
    }}
  />
);

/* Card shell */
const Card = ({
  children,
  style = {},
  accent,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
}) => (
  <div
    className="biosov-card-hover"
    style={{
      background: "var(--bg-card)",
      borderRadius: "var(--radius-card)",
      boxShadow: "var(--shadow-card)",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      borderTop: accent ? `3px solid ${accent}` : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

/* Label above a metric */
const MetaLabel = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      fontSize: "11px",
      fontWeight: 700,
      color: "var(--color-text-secondary)",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </span>
);

/* Animated arc ring */
const ArcRing = ({
  value,
  max,
  size = 80,
  stroke = 7,
  color,
  label,
  sub,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color: string;
  label: string;
  sub?: string;
}) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setTimeout(() => setOffset(circ * (1 - pct)), 80);
    });
    return () => cancelAnimationFrame(raf);
  }, [pct, circ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <span
            style={{
              fontSize: size > 70 ? "18px" : "14px",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              lineHeight: 1,
            }}
          >
            {value}
          </span>
          {sub && (
            <span style={{ fontSize: "9px", color: "var(--color-text-secondary)", fontWeight: 600 }}>
              {sub}
            </span>
          )}
        </div>
      </div>
      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
        {label}
      </span>
    </div>
  );
};

/* Animated progress bar */
const BarTrack = ({
  current,
  target,
  color,
  label,
  unit,
  icon,
}: {
  current: number;
  target: number;
  color: string;
  label: string;
  unit: string;
  icon: string;
}) => {
  const pct = Math.min(100, Math.round((current / target) * 100));
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: 5 }}>
          {icon} {label}
        </span>
        <span style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontFamily: "monospace" }}>
          {current.toLocaleString("ar-SA")}{" "}
          <span style={{ color: "#94A3B8" }}>/ {target.toLocaleString("ar-SA")} {unit}</span>
        </span>
      </div>
      <div style={{ background: "#E2E8F0", borderRadius: 9999, height: 8, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: color,
            borderRadius: 9999,
            transition: "width 700ms cubic-bezier(.4,0,.2,1)",
            boxShadow: pct >= 100 ? `0 0 8px ${color}` : undefined,
          }}
        />
      </div>
      <span style={{ fontSize: "11px", color: pct >= 100 ? "#00A87A" : "var(--color-text-secondary)", fontWeight: pct >= 100 ? 700 : 400 }}>
        {pct >= 100 ? "✅ هدف محقق!" : `${pct}% من الهدف`}
      </span>
    </div>
  );
};

/* Score gauge strip */
const ScoreStrip = ({
  value,
  max,
  label,
  icon,
  color,
}: {
  value: number;
  max: number;
  label: string;
  icon: string;
  color: string;
}) => {
  const pct = Math.min(100, (value / max) * 100);
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 200);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "14px 16px",
        background: "var(--bg-card)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        borderBottom: `3px solid ${color}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
            {icon} {label}
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color,
              fontFamily: "'JetBrains Mono','Courier New',monospace",
              lineHeight: 1,
            }}
          >
            {value.toLocaleString("ar-SA")}
          </div>
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            fontWeight: 600,
            paddingBottom: 4,
          }}
        >
          / {max.toLocaleString("ar-SA")}
        </div>
      </div>
      <div style={{ background: "#E2E8F0", borderRadius: 9999, height: 6, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${w}%`,
            background: color,
            borderRadius: 9999,
            transition: "width 900ms cubic-bezier(.4,0,.2,1)",
            boxShadow: `0 0 10px ${color}55`,
          }}
        />
      </div>
    </div>
  );
};

/* Fasting Timer Card */
const FastingCard = ({ lastMealAt }: { lastMealAt: string | null }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!lastMealAt) return;
    const tick = () => setElapsed(Date.now() - new Date(lastMealAt).getTime());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastMealAt]);

  if (!lastMealAt) {
    return (
      <Card accent="#64748B" style={{ alignItems: "center", justifyContent: "center", minHeight: 160 }}>
        <MetaLabel>⏱ صيام متقطع</MetaLabel>
        <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", textAlign: "center" }}>
          لم تُسجَّل وجبة اليوم
        </span>
      </Card>
    );
  }

  const hours = elapsed / 3600000;
  const pct = fastingPct(elapsed);
  const badge = fastingLabel(hours);
  const timeStr = formatFastingTime(elapsed);
  const [h, m, s] = timeStr.split(":");

  return (
    <Card accent="#1A73E8" style={{ alignItems: "center", gap: 12 }}>
      <MetaLabel>⏱ صيام متقطع</MetaLabel>

      <div
        style={{
          fontFamily: "'JetBrains Mono','Courier New',monospace",
          fontSize: "36px",
          fontWeight: 800,
          color: "var(--color-primary)",
          letterSpacing: "-1px",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <span>{h}</span>
        <span style={{ opacity: 0.4, animation: "biosov-blink 1s step-start infinite" }}>:</span>
        <span>{m}</span>
        <span style={{ opacity: 0.4, animation: "biosov-blink 1s step-start infinite" }}>:</span>
        <span style={{ fontSize: "28px" }}>{s}</span>
      </div>

      <div style={{ width: "100%", background: "#E2E8F0", borderRadius: 9999, height: 6, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--color-primary), var(--color-success))",
            borderRadius: 9999,
            transition: "width 1s linear",
          }}
        />
      </div>

      <span
        style={{
          padding: "4px 12px",
          borderRadius: 9999,
          fontSize: "12px",
          fontWeight: 700,
          color: badge.color,
          background: badge.bg,
        }}
      >
        {badge.text}
      </span>

      <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
        آخر وجبة: {new Date(lastMealAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
      </span>
    </Card>
  );
};

/* Skeleton layout for initial load */
const DashboardSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-card)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <Shimmer h={11} w="45%" />
          <Shimmer h={80} r={50} w={80} />
          <Shimmer h={12} w="60%" />
        </div>
      ))}
    </div>
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-card)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <Shimmer h={11} w="35%" />
      <Shimmer h={44} w="70%" />
      <Shimmer h={6} r={9999} />
      <Shimmer h={12} w="30%" />
    </div>
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-card)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "var(--shadow-card)",
      }}
    >
      {[0, 1].map((i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Shimmer h={12} w="50%" />
          <Shimmer h={8} r={9999} />
          <Shimmer h={11} w="25%" />
        </div>
      ))}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-card)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <Shimmer h={11} w="55%" />
          <Shimmer h={36} w="65%" />
          <Shimmer h={6} r={9999} />
        </div>
      ))}
    </div>
  </div>
);

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const supabase = createClient();
  const [data, setData] = useState<DashboardData>({ log: null, lastMealAt: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  /* Clock tick every minute */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  /* Fetch dashboard data */
  const fetchData = useCallback(async () => {
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error("غير مصادَق");

      const [logRes, mealRes] = await Promise.all([
        supabase
          .from("daily_logs")
          .select("*")
          .eq("user_id", user.id)
          .eq("log_date", todayISO())
          .maybeSingle(),
        supabase
          .from("meals")
          .select("id, user_id, eaten_at")
          .eq("user_id", user.id)
          .order("eaten_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (logRes.error) throw logRes.error;
      if (mealRes.error) throw mealRes.error;

      setData({
        log: logRes.data ?? null,
        lastMealAt: mealRes.data?.eaten_at ?? null,
      });
    } catch (e: any) {
      setError(e?.message ?? "خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { log, lastMealAt } = data;

  /* Derived values with safe fallbacks */
  const recovery  = log?.recovery_score  ?? 0;
  const hrv       = log?.hrv             ?? 0;
  const protein   = log?.protein_g       ?? 0;
  const water     = log?.water_ml        ?? 0;
  const daily     = log?.daily_score     ?? 0;
  const biosov    = log?.biosov_score    ?? 0;

  const recovColor = scoreColor(recovery, 100);
  const hrvColor   = hrv >= 60 ? "#00A87A" : hrv >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <>
      {/* Inject keyframes + font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

        :root {
          --bg-main:#F0F4FA;--bg-card:#FFFFFF;--bg-elevated:#F8FAFC;
          --color-primary:#1A73E8;--color-primary-light:#E8F0FE;
          --color-success:#00A87A;--color-success-light:#E6F7F2;
          --color-warning:#F59E0B;--color-danger:#EF4444;
          --color-text-primary:#0D1B2A;--color-text-secondary:#64748B;
          --color-border:#E2E8F0;
          --font-family:'Cairo',sans-serif;
          --radius-card:14px;--radius-badge:8px;
          --shadow-card:0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.06);
          --shadow-card-hover:0 4px 12px rgba(0,0,0,0.10);
          --bg-sidebar:#0F1629;
        }

        * { font-family: var(--font-family); box-sizing: border-box; }

        @keyframes biosov-shimmer {
          0%   { background-position: -468px 0; }
          100% { background-position:  468px 0; }
        }
        @keyframes biosov-blink {
          0%,100% { opacity:1; } 50% { opacity:0; }
        }
        @keyframes biosov-fade-in-up {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .biosov-card-hover {
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .biosov-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-card-hover);
        }

        .dash-section {
          animation: biosov-fade-in-up 400ms ease forwards;
        }

        .dash-section:nth-child(1) { animation-delay: 0ms; }
        .dash-section:nth-child(2) { animation-delay: 60ms; }
        .dash-section:nth-child(3) { animation-delay: 120ms; }
        .dash-section:nth-child(4) { animation-delay: 180ms; }
        .dash-section:nth-child(5) { animation-delay: 240ms; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 9999px; }
      `}</style>

      <div
        dir="rtl"
        style={{
          minHeight: "100vh",
          background: "var(--bg-main)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <div
          style={{
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--color-border)",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 50,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
              {getGreeting()}
            </h1>
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: 0, marginTop: 1 }}>
              {now.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={fetchData}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9999,
                background: "var(--color-primary-light)",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 200ms",
              }}
              title="تحديث"
            >
              🔄
            </button>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-badge)",
                padding: "6px 10px",
              }}
            >
              {now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 600,
            width: "100%",
            margin: "0 auto",
          }}
        >
          {/* Error */}
          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "var(--radius-card)",
                padding: "12px 16px",
                fontSize: "13px",
                color: "#991B1B",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              ⚠️ {error}
              <button
                onClick={() => { setError(null); setLoading(true); fetchData(); }}
                style={{ marginInlineStart: "auto", background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* ── Skeleton ── */}
          {loading && <DashboardSkeleton />}

          {/* ── Live Data ── */}
          {!loading && !error && (
            <>
              {/* Row 1: Recovery + HRV */}
              <div className="dash-section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Recovery Score */}
                <Card accent={recovColor} style={{ alignItems: "center", gap: 8 }}>
                  <MetaLabel>🫀 Recovery</MetaLabel>
                  {recovery > 0 ? (
                    <ArcRing
                      value={recovery}
                      max={100}
                      size={88}
                      stroke={8}
                      color={recovColor}
                      label="Recovery Score"
                      sub="/ 100"
                    />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 0" }}>
                      <span style={{ fontSize: "32px" }}>—</span>
                      <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>لم يُسجَّل بعد</span>
                    </div>
                  )}
                  {log?.sleep_performance != null && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--color-text-secondary)",
                        padding: "3px 8px",
                        background: "var(--bg-elevated)",
                        borderRadius: 9999,
                      }}
                    >
                      نوم {log.sleep_performance}%
                    </span>
                  )}
                </Card>

                {/* HRV */}
                <Card accent={hrvColor} style={{ alignItems: "center", gap: 8 }}>
                  <MetaLabel>💓 HRV</MetaLabel>
                  {hrv > 0 ? (
                    <ArcRing
                      value={hrv}
                      max={120}
                      size={88}
                      stroke={8}
                      color={hrvColor}
                      label="معدل HRV"
                      sub="ms"
                    />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 0" }}>
                      <span style={{ fontSize: "32px" }}>—</span>
                      <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>لم يُسجَّل بعد</span>
                    </div>
                  )}
                  {log?.rhr != null && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--color-text-secondary)",
                        padding: "3px 8px",
                        background: "var(--bg-elevated)",
                        borderRadius: 9999,
                      }}
                    >
                      RHR {log.rhr} نبضة
                    </span>
                  )}
                </Card>
              </div>

              {/* Row 2: Fasting Timer */}
              <div className="dash-section">
                <FastingCard lastMealAt={lastMealAt} />
              </div>

              {/* Row 3: Protein + Water bars */}
              <div className="dash-section">
                <Card style={{ gap: 16 }}>
                  <MetaLabel>📊 التتبع اليومي</MetaLabel>
                  <BarTrack
                    current={protein}
                    target={180}
                    color="#7C3AED"
                    label="بروتين"
                    unit="جم"
                    icon="🥩"
                  />
                  <div style={{ height: 1, background: "var(--color-border)" }} />
                  <BarTrack
                    current={water}
                    target={3000}
                    color="#1A73E8"
                    label="ماء"
                    unit="مل"
                    icon="💧"
                  />
                </Card>
              </div>

              {/* Row 4: Daily Score + BioSov Score */}
              <div className="dash-section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <ScoreStrip
                  value={daily}
                  max={100}
                  label="Daily Score"
                  icon="⚡"
                  color={scoreColor(daily, 100)}
                />
                <ScoreStrip
                  value={biosov}
                  max={1000}
                  label="BioSov Score"
                  icon="🧬"
                  color={scoreColor(biosov, 1000)}
                />
              </div>

              {/* Empty state when no log today */}
              {!log && (
                <div
                  className="dash-section"
                  style={{
                    textAlign: "center",
                    padding: "24px 16px",
                    background: "var(--bg-card)",
                    borderRadius: "var(--radius-card)",
                    boxShadow: "var(--shadow-card)",
                    color: "var(--color-text-secondary)",
                    fontSize: "14px",
                  }}
                >
                  <div style={{ fontSize: "36px", marginBottom: 8 }}>📋</div>
                  لا يوجد سجل يومي لليوم — أضف بيانات WHOOP لرؤية النتائج
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer disclaimer */}
        <div
          style={{
            background: "var(--bg-elevated)",
            borderTop: "1px solid var(--color-border)",
            padding: "6px 16px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "10px", color: "var(--color-text-secondary)", margin: 0 }}>
            المعلومات لأغراض توعوية فقط — لا تُغني عن استشارة طبيب مختص
          </p>
        </div>
      </div>
    </>
  );
}
