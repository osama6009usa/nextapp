"use client";

// ============================================================
// components/WaterWidget.tsx
// الجزء المستقل لعرض الماء في Dashboard
// يُستورد في app/(dashboard)/page.tsx ويحل محل الكود القديم
//
// الاستخدام في Dashboard:
//   import WaterWidget from "@/components/WaterWidget";
//   ...
//   <WaterWidget />
// ============================================================

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar, useToast } from "@/components/ui";
import { useWaterToday } from "@/hooks/useWaterToday";

const PRIMARY_AMOUNT = 250;

function formatMl(ml: number): string {
  return ml >= 1000 ? `${(ml / 1000).toFixed(1)} L` : `${ml} مل`;
}

export default function WaterWidget() {
  const router = useRouter();
  const { showToast } = useToast();

  const {
    totalMl,
    goalMl,
    percentFilled,
    remainingMl,
    isGoalReached,
    addWater,
    isInserting,
  } = useWaterToday();

  const handleQuickAdd = useCallback(async () => {
    if (isInserting) return;
    try {
      await addWater(PRIMARY_AMOUNT);
      showToast({
        type:    "success",
        message: `تم تسجيل ${PRIMARY_AMOUNT} مل ✓`,
      });
    } catch {
      showToast({ type: "error", message: "فشل الحفظ، حاول مجدداً" });
    }
  }, [addWater, isInserting, showToast]);

  const progressColor = isGoalReached
    ? "var(--color-success, #22C55E)"
    : "var(--color-primary, #4F46E5)";

  return (
    <div style={styles.widget}>

      {/* ── Header Row ── */}
      <div style={styles.headerRow}>
        <span style={styles.title}>💧 الماء</span>
        <div style={styles.headerActions}>
          {/* زر + المباشر */}
          <button
            style={{
              ...styles.quickAddBtn,
              opacity: isInserting ? 0.6 : 1,
            }}
            onClick={handleQuickAdd}
            disabled={isInserting}
            title="أضف 250 مل مباشرة"
          >
            {isInserting ? "..." : "+ 250ml"}
          </button>

          {/* رابط للصفحة الكاملة */}
          <button
            style={styles.detailBtn}
            onClick={() => router.push("/water")}
            title="فتح صفحة الماء"
          >
            ↗
          </button>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div style={{ margin: "10px 0 8px" }}>
        <ProgressBar
          value={percentFilled}
          max={100}
          color={progressColor}
          height={10}
          animated
        />
      </div>

      {/* ── Stats Row ── */}
      <div style={styles.statsRow}>
        <span style={{ ...styles.current, color: progressColor }}>
          {formatMl(totalMl)}
        </span>
        <span style={styles.separator}>من</span>
        <span style={styles.goal}>{formatMl(goalMl)}</span>
        <span style={styles.percent}>({percentFilled}%)</span>

        {isGoalReached ? (
          <span style={styles.reachedBadge}>✓ مكتمل</span>
        ) : (
          <span style={styles.remaining}>تبقى {formatMl(remainingMl)}</span>
        )}
      </div>

    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  widget: {
    background:    "var(--bg-card, #FFFFFF)",
    borderRadius:  "var(--radius-card, 14px)",
    padding:       "16px 18px",
    direction:     "rtl",
    fontFamily:    "system-ui, -apple-system, sans-serif",
  },
  headerRow: {
    display:       "flex",
    justifyContent:"space-between",
    alignItems:    "center",
  },
  title: {
    fontSize:      15,
    fontWeight:    600,
    color:         "var(--color-text-primary, #1E293B)",
  },
  headerActions: {
    display:       "flex",
    gap:           6,
    alignItems:    "center",
  },
  quickAddBtn: {
    padding:       "5px 12px",
    fontSize:      12,
    fontWeight:    700,
    color:         "#FFFFFF",
    background:    "var(--color-primary, #4F46E5)",
    border:        "none",
    borderRadius:  8,
    cursor:        "pointer",
    transition:    "opacity 0.15s",
  },
  detailBtn: {
    padding:       "5px 8px",
    fontSize:      13,
    color:         "var(--color-text-secondary, #64748B)",
    background:    "#F1F5F9",
    border:        "none",
    borderRadius:  8,
    cursor:        "pointer",
  },
  statsRow: {
    display:       "flex",
    alignItems:    "center",
    gap:           5,
    flexWrap:      "wrap",
  },
  current: {
    fontSize:      15,
    fontWeight:    700,
  },
  separator: {
    fontSize:      12,
    color:         "var(--color-text-secondary, #64748B)",
  },
  goal: {
    fontSize:      13,
    color:         "var(--color-text-secondary, #64748B)",
  },
  percent: {
    fontSize:      12,
    color:         "var(--color-text-secondary, #64748B)",
  },
  reachedBadge: {
    marginRight:   "auto",
    marginLeft:    4,
    fontSize:      11,
    fontWeight:    600,
    color:         "var(--color-success, #22C55E)",
    background:    "#F0FDF4",
    borderRadius:  20,
    padding:       "2px 10px",
  },
  remaining: {
    marginRight:   "auto",
    marginLeft:    4,
    fontSize:      11,
    color:         "var(--color-text-secondary, #64748B)",
  },
};
