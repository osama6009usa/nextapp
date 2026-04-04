"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase Client ────────────────────────────────────────────────────────
// Mirrors lib/supabase.ts — import from there in production
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Types ──────────────────────────────────────────────────────────────────
interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
}

interface Profile {
  user_id: string;
  water_goal_ml: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────
const QUICK_AMOUNTS = [250, 500, 750] as const;
const DEFAULT_GOAL = 3000;

// ─── Sub-components ─────────────────────────────────────────────────────────

function SkeletonRect({ w = "100%", h = 16, radius = 8 }: { w?: string | number; h?: number; radius?: number }) {
  return (
    <div
      className="biosov-shimmer"
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        flexShrink: 0,
      }}
    />
  );
}

interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error";
}

function Toast({ messages }: { messages: ToastMessage[] }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        insetInlineEnd: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        pointerEvents: "none",
      }}
    >
      {messages.map((m) => (
        <div
          key={m.id}
          style={{
            background: m.type === "success" ? "var(--color-success)" : "var(--color-danger)",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: "var(--radius-badge)",
            fontSize: "14px",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "biosov-toast-in 300ms ease forwards",
            fontFamily: "var(--font-family)",
            direction: "rtl",
          }}
        >
          <span>{m.type === "success" ? "✅" : "❌"}</span>
          {m.text}
        </div>
      ))}
    </div>
  );
}

interface WaterProgressBarProps {
  current: number;
  goal: number;
}

function WaterProgressBar({ current, goal }: WaterProgressBarProps) {
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const [width, setWidth] = useState(0);
  const [flashed, setFlashed] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setTimeout(() => setWidth(pct), 50);
    });
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  useEffect(() => {
    if (pct >= 100) {
      setFlashed(true);
      const t = setTimeout(() => setFlashed(false), 600);
      return () => clearTimeout(t);
    }
  }, [pct]);

  const barColor =
    pct >= 80
      ? "var(--color-success)"
      : pct >= 50
      ? "var(--color-primary)"
      : "var(--color-warning)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>
          💧 الماء اليومي
        </span>
        <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
          {current.toLocaleString("ar-SA")} / {goal.toLocaleString("ar-SA")} مل
          <span
            style={{
              marginInlineStart: "8px",
              fontWeight: 700,
              color: barColor,
            }}
          >
            {pct}%
          </span>
        </span>
      </div>

      <div
        style={{
          background: "#E2E8F0",
          borderRadius: "9999px",
          height: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: flashed
              ? "var(--color-success)"
              : `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
            borderRadius: "9999px",
            transition: "width 600ms ease-out, background 300ms ease",
            boxShadow: flashed ? "0 0 10px var(--color-success)" : "none",
          }}
        />
      </div>

      {pct >= 100 && (
        <p
          style={{
            fontSize: "12px",
            color: "var(--color-success)",
            fontWeight: 600,
            margin: 0,
            textAlign: "center",
            animation: "biosov-fade-in-up 300ms ease forwards",
          }}
        >
          🎉 أحسنت! وصلت هدفك اليومي من الماء
        </p>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WaterLogger({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [goal, setGoal] = useState<number>(DEFAULT_GOAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [showCustom, setShowCustom] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastCounter = useRef(0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayLogs = logs.filter(
    (l) => new Date(l.logged_at) >= todayStart
  );

  const totalToday = todayLogs.reduce((sum, l) => sum + l.amount_ml, 0);

  // ─── Toast helper ────────────────────────────────────────────────────────
  const showToast = useCallback((text: string, type: ToastMessage["type"] = "success") => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  // ─── Fetch initial data ──────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, logsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("water_goal_ml")
          .eq("user_id", userId)
          .single(),
        supabase
          .from("water_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("logged_at", todayStart.toISOString())
          .order("logged_at", { ascending: false }),
      ]);

      if (profileRes.data?.water_goal_ml) {
        setGoal(profileRes.data.water_goal_ml);
      }
      if (logsRes.data) {
        setLogs(logsRes.data);
      }
    } catch {
      showToast("فشل تحميل البيانات", "error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Supabase Realtime ───────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`water_logs:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "water_logs",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newLog = payload.new as WaterLog;
          setLogs((prev) => {
            if (prev.some((l) => l.id === newLog.id)) return prev;
            return [newLog, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // ─── Log water ──────────────────────────────────────────────────────────
  const logWater = useCallback(
    async (amount: number) => {
      if (!amount || amount <= 0) return;
      setSaving(true);
      try {
        const { error } = await supabase.from("water_logs").insert({
          user_id: userId,
          amount_ml: amount,
          logged_at: new Date().toISOString(),
        });

        if (error) throw error;

        showToast(`✅ تم تسجيل ${amount} مل`);
        setCustomAmount("");
        setShowCustom(false);
      } catch {
        showToast("فشل حفظ السجل، حاول مجدداً", "error");
      } finally {
        setSaving(false);
      }
    },
    [userId, showToast]
  );

  // ─── Skeleton Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        dir="rtl"
        style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          fontFamily: "var(--font-family)",
        }}
      >
        <SkeletonRect h={20} w="40%" />
        <SkeletonRect h={10} />
        <div style={{ display: "flex", gap: "10px" }}>
          <SkeletonRect h={44} w="30%" radius={8} />
          <SkeletonRect h={44} w="30%" radius={8} />
          <SkeletonRect h={44} w="30%" radius={8} />
        </div>
        <SkeletonRect h={44} radius={8} />
        <SkeletonRect h={16} w="60%" />
        <SkeletonRect h={16} w="80%" />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <div
        dir="rtl"
        style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-card)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          fontFamily: "var(--font-family)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              💧 تسجيل الماء
            </h2>
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
              {new Date().toLocaleDateString("ar-SA", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--color-primary)",
              direction: "ltr",
            }}
          >
            {(totalToday / 1000).toFixed(1)}L
          </span>
        </div>

        {/* Progress Bar */}
        <WaterProgressBar current={totalToday} goal={goal} />

        {/* Quick Buttons */}
        <div>
          <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: "0 0 10px", fontWeight: 500 }}>
            إضافة سريعة
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                className="biosov-card-hover"
                disabled={saving}
                onClick={() => logWater(amount)}
                style={{
                  flex: 1,
                  minWidth: "72px",
                  padding: "10px 8px",
                  background: "var(--color-primary-light)",
                  border: "1.5px solid var(--color-primary)",
                  borderRadius: "10px",
                  color: "var(--color-primary)",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1,
                  fontFamily: "var(--font-family)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                <span>💧</span>
                <span>{amount}</span>
                <span style={{ fontSize: "10px", fontWeight: 500, opacity: 0.8 }}>مل</span>
              </button>
            ))}

            {/* Custom Button */}
            <button
              className="biosov-card-hover"
              onClick={() => setShowCustom((v) => !v)}
              style={{
                flex: 1,
                minWidth: "72px",
                padding: "10px 8px",
                background: showCustom ? "var(--bg-elevated)" : "var(--bg-elevated)",
                border: `1.5px solid ${showCustom ? "var(--color-primary)" : "var(--color-border)"}`,
                borderRadius: "10px",
                color: showCustom ? "var(--color-primary)" : "var(--color-text-secondary)",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "var(--font-family)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <span>✏️</span>
              <span>مخصص</span>
            </button>
          </div>
        </div>

        {/* Custom Amount Input */}
        {showCustom && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "stretch",
              animation: "biosov-fade-in-up 250ms ease forwards",
            }}
          >
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="number"
                min={1}
                max={2000}
                placeholder="أدخل الكمية بالمل..."
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = parseInt(customAmount, 10);
                    if (val > 0) logWater(val);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: "10px",
                  fontSize: "14px",
                  color: "var(--color-text-primary)",
                  background: "var(--bg-elevated)",
                  fontFamily: "var(--font-family)",
                  direction: "rtl",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                autoFocus
              />
              <span
                style={{
                  position: "absolute",
                  insetInlineStart: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "12px",
                  color: "var(--color-text-secondary)",
                  pointerEvents: "none",
                }}
              >
                مل
              </span>
            </div>
            <button
              disabled={!customAmount || parseInt(customAmount, 10) <= 0 || saving}
              onClick={() => {
                const val = parseInt(customAmount, 10);
                if (val > 0) logWater(val);
              }}
              style={{
                padding: "10px 18px",
                background:
                  !customAmount || parseInt(customAmount, 10) <= 0
                    ? "var(--color-border)"
                    : "var(--color-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "14px",
                cursor:
                  !customAmount || parseInt(customAmount, 10) <= 0 || saving
                    ? "not-allowed"
                    : "pointer",
                fontFamily: "var(--font-family)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "background 200ms",
                flexShrink: 0,
              }}
            >
              {saving ? (
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #fff",
                    borderRadius: "50%",
                    animation: "biosov-spin 600ms linear infinite",
                    display: "inline-block",
                  }}
                />
              ) : (
                "حفظ"
              )}
            </button>
          </div>
        )}

        {/* Log History */}
        <div>
          <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: "0 0 10px", fontWeight: 500 }}>
            سجل اليوم ({todayLogs.length} مدخلات)
          </p>

          {todayLogs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 16px",
                background: "var(--bg-elevated)",
                borderRadius: "10px",
                border: "1.5px dashed var(--color-border)",
              }}
            >
              <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>🥤</span>
              <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: 0, fontWeight: 500 }}>
                لم تشرب ماءً بعد اليوم
              </p>
              <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: "4px 0 0", opacity: 0.7 }}>
                ابدأ بكوب ماء الآن 💧
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {todayLogs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "var(--bg-elevated)",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                    animation: "biosov-fade-in-up 250ms ease forwards",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "18px" }}>💧</span>
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "var(--color-primary)",
                      }}
                    >
                      {log.amount_ml} مل
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                    {new Date(log.logged_at).toLocaleTimeString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}

              {todayLogs.length > 8 && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  + {todayLogs.length - 8} مدخلات أخرى
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <Toast messages={toasts} />
    </>
  );
}
