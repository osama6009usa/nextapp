"use client";

import { useState, useRef } from "react";
import { useWaterLog } from "@/hooks/useWaterLog";

function formatTotal(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(1)} L`;
  return `${ml.toLocaleString("en-US")} ml`;
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("ar-SA", {
    timeZone: "Asia/Riyadh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

function formatAmount(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(ml % 1000 === 0 ? 0 : 1)} L`;
  return `${ml} ml`;
}

const QUICK_ADD = [
  { label: "250 ml", value: 250 },
  { label: "500 ml", value: 500 },
  { label: "750 ml", value: 750 },
  { label: "1 L",    value: 1000 },
] as const;

export default function WaterPage() {
  const {
    logs, totalMl, waterGoal, loading, adding, deletingId,
    addWater, deleteLog, error,
  } = useWaterLog();

  const [customVal, setCustomVal] = useState<string>("");
  const [customErr, setCustomErr] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const progressPct = Math.min((totalMl / waterGoal) * 100, 100);
  const goalReached = totalMl >= waterGoal;
  const remaining   = Math.max(waterGoal - totalMl, 0);

  const handleCustomAdd = async () => {
    const parsed = parseInt(customVal, 10);
    if (!customVal || isNaN(parsed) || parsed <= 0) {
      setCustomErr("أدخل كمية صحيحة أكبر من صفر");
      inputRef.current?.focus();
      return;
    }
    if (parsed > 5000) {
      setCustomErr("الحد الأقصى 5000 ml للإدخال الواحد");
      return;
    }
    setCustomErr("");
    await addWater(parsed);
    setCustomVal("");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#EEF2F8", padding: "24px 16px", direction: "rtl" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {[80, 120, 200].map((h, i) => (
            <div key={i} style={{
              height: h, borderRadius: 14, marginBottom: 16,
              background: "linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)",
              backgroundSize: "200% 100%",
            }} />
          ))}
        </div>
      </div>
    );
  }

  const barColor = goalReached
    ? "var(--color-success, #22C55E)"
    : "linear-gradient(90deg,#4F46E5,#818CF8)";

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-main, #EEF2F8)",
      padding: "24px 16px 48px",
      direction: "rtl",
      fontFamily: "system-ui,-apple-system,sans-serif",
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F1629", margin: 0 }}>💧 تسجيل الماء</h1>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
              {new Intl.DateTimeFormat("ar-SA", {
                timeZone: "Asia/Riyadh",
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              }).format(new Date())}
            </p>
          </div>
          <div style={{
            borderRadius: 12, padding: "10px 16px",
            background: goalReached ? "var(--color-success,#22C55E)" : "var(--color-primary,#4F46E5)",
            display: "flex", flexDirection: "column", alignItems: "center", minWidth: 90,
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{formatTotal(totalMl)}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>من {formatTotal(waterGoal)}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#EF4444",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Progress card */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>التقدم نحو الهدف</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: goalReached ? "#22C55E" : "#4F46E5" }}>
              {Math.round(progressPct)}%
            </span>
          </div>
          <div style={{ height: 12, borderRadius: 9999, background: "#E2E8F0", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 9999,
              width: `${progressPct}%`,
              background: barColor,
              transition: "width 500ms ease",
              minWidth: progressPct > 0 ? 4 : 0,
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 16 }}>
            {[
              { label: "مُسجَّل",  val: formatTotal(totalMl) },
              { label: "متبقي",   val: remaining === 0 ? "✅ اكتمل" : formatTotal(remaining) },
              { label: "الهدف",   val: formatTotal(waterGoal) },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>{s.val}</span>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{s.label}</span>
              </div>
            ))}
          </div>
          {goalReached && (
            <div style={{
              marginTop: 14, textAlign: "center", fontSize: 14, fontWeight: 600,
              color: "#22C55E", background: "rgba(34,197,94,0.1)", borderRadius: 8, padding: "8px 12px",
            }}>
              🎉 أحسنت! لقد بلغت هدفك اليومي
            </div>
          )}
        </div>

        {/* Quick add card */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1E293B", margin: "0 0 16px" }}>إضافة سريعة</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {QUICK_ADD.map(({ label, value }) => (
              <button
                key={value}
                disabled={adding}
                onClick={() => addWater(value)}
                style={{
                  padding: "14px 8px", borderRadius: 10,
                  border: "2px solid #E2E8F0", background: "#F8FAFC",
                  fontSize: 15, fontWeight: 600, color: "#1E293B",
                  cursor: adding ? "not-allowed" : "pointer",
                  opacity: adding ? 0.6 : 1,
                  fontFamily: "inherit",
                  transition: "all 180ms ease",
                }}
              >
                💧 {label}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                min={1} max={5000} step={1}
                placeholder="كمية مخصصة (ml)"
                value={customVal}
                onChange={(e) => {
                  setCustomVal(e.target.value.replace(/[^0-9]/g, ""));
                  setCustomErr("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCustomAdd();
                  if ([".", ",", "-", "e", "E"].includes(e.key)) e.preventDefault();
                }}
                disabled={adding}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  border: `1.5px solid ${customErr ? "#EF4444" : "#CBD5E1"}`,
                  fontSize: 15, fontFamily: "inherit", direction: "rtl",
                  outline: "none", boxSizing: "border-box", background: "#fff", color: "#1E293B",
                }}
              />
              {customErr && <span style={{ display: "block", fontSize: 12, color: "#EF4444", marginTop: 4 }}>{customErr}</span>}
            </div>
            <button
              onClick={handleCustomAdd}
              disabled={adding}
              style={{
                padding: "12px 18px", borderRadius: 10,
                background: "var(--color-primary,#4F46E5)", color: "#fff",
                fontSize: 14, fontWeight: 600, border: "none",
                cursor: adding ? "not-allowed" : "pointer",
                opacity: adding ? 0.6 : 1,
                whiteSpace: "nowrap", fontFamily: "inherit", flexShrink: 0,
              }}
            >
              {adding ? "⏳" : "إضافة"}
            </button>
          </div>
        </div>

        {/* Log card */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1E293B", margin: "0 0 16px" }}>سجل اليوم</h2>

          {logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>💧</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#475569", margin: "0 0 6px" }}>لم تُسجَّل أي كمية بعد</p>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>استخدم الأزرار أعلاه لتسجيل أول كوب ماء</p>
            </div>
          ) : (
            <div>
              {logs.map((log) => (
                <div key={log.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0", borderBottom: "1px solid #F1F5F9",
                }}>
                  <span style={{ fontSize: 13, color: "#64748B", minWidth: 80 }}>{formatTime(log.logged_at)}</span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#1E293B" }}>{formatAmount(log.amount_ml)}</span>
                  <button
                    onClick={() => deleteLog(log.id)}
                    disabled={deletingId === log.id}
                    aria-label={`حذف ${formatAmount(log.amount_ml)}`}
                    style={{
                      background: "none", border: "none",
                      cursor: deletingId === log.id ? "not-allowed" : "pointer",
                      opacity: deletingId === log.id ? 0.4 : 1,
                      padding: "4px 6px", borderRadius: 6, fontSize: 16, lineHeight: 1,
                    }}
                  >
                    {deletingId === log.id ? "⏳" : "🗑️"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}