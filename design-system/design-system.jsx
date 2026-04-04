"use client";

import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

/* ============================================================
   CSS VARIABLES + GLOBAL STYLES
   Inject once at app root via <DesignSystemProvider />
   ============================================================ */
/*
 * ─── Cairo Font ──────────────────────────────────────────────────────────────
 * @import مُزال من هنا عمداً. أضفه يدوياً في app/layout.tsx:
 *
 *   import type { Metadata } from "next";
 *   import "./globals.css"; // أو مباشرةً في <head>:
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html lang="ar" dir="rtl">
 *         <head>
 *           <link rel="preconnect" href="https://fonts.googleapis.com" />
 *           <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
 *           <link
 *             href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap"
 *             rel="stylesheet"
 *           />
 *         </head>
 *         <body>{children}</body>
 *       </html>
 *     );
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CSS_VARS = `
  :root {
    /* ── Backgrounds ── */
    --bg-main: #F0F4FA;
    --bg-card: #FFFFFF;
    --bg-card-dark: #1A2744;
    --bg-sidebar: #0F1629;
    --bg-header: #FFFFFF;
    --bg-elevated: #F8FAFC;

    /* ── Brand Colors (FINAL) ── */
    --color-primary: #1A73E8;
    --color-primary-light: #E8F0FE;
    --color-success: #00A87A;
    --color-success-light: #E6F7F2;
    --color-warning: #F59E0B;
    --color-warning-light: #FFFBEB;
    --color-danger: #EF4444;
    --color-danger-light: #FEF2F2;
    --color-proactive: #7C3AED;

    /* ── Typography ── */
    --color-text-primary: #0D1B2A;
    --color-text-secondary: #64748B;
    --color-text-on-dark: #F1F5F9;
    --font-family: 'Cairo', sans-serif;

    /* ── Borders & Shadows ── */
    --color-border: #E2E8F0;
    --shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
    --shadow-card-hover: 0 4px 12px rgba(0,0,0,0.10);

    /* ── Radii ── */
    --radius-card: 14px;
    --radius-badge: 8px;

    /* ── Specialist Backgrounds ── */
    --specialist-bg-1: #FFF1F0;
    --specialist-bg-2: #F0FDF4;
    --specialist-bg-3: #EFF6FF;
    --specialist-bg-4: #FAF5FF;
    --specialist-bg-5: #FFFBEB;
    --specialist-bg-6: #F0FAFA;
    --specialist-bg-7: #FDF4FF;
  }

  * { font-family: var(--font-family); }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  @keyframes biosov-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.4); }
  }

  @keyframes biosov-bounce-dot {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-6px); }
  }

  @keyframes biosov-spin {
    to { transform: rotate(360deg); }
  }

  @keyframes biosov-slide-down {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes biosov-slide-up {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-20px); }
  }

  @keyframes biosov-fade-in-up {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes biosov-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }

  @keyframes biosov-scale-bounce {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.4); }
    100% { transform: scale(1); }
  }

  @keyframes biosov-badge-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes biosov-check-in {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1); }
  }

  /* ── Shimmer for Skeleton Loading ── */
  @keyframes biosov-shimmer {
    0%   { background-position: -468px 0; }
    100% { background-position: 468px 0; }
  }

  /* ── Toast slide-in from right ── */
  @keyframes biosov-toast-in {
    from { opacity: 0; transform: translateX(100%); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes biosov-toast-out {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(100%); }
  }

  /* ── Sidebar item highlight ── */
  @keyframes biosov-sidebar-in {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .biosov-card-hover {
    transition: transform 200ms ease, box-shadow 200ms ease;
  }
  .biosov-card-hover:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card-hover);
  }
  .biosov-card-hover:active {
    transform: translateY(0);
    transition: transform 100ms ease;
  }

  .biosov-alert-enter {
    animation: biosov-slide-down 300ms ease forwards;
  }
  .biosov-alert-exit {
    animation: biosov-slide-up 250ms ease forwards;
  }

  .biosov-msg-enter {
    animation: biosov-fade-in-up 250ms ease forwards;
  }

  .biosov-drag-over {
    border-color: var(--color-primary) !important;
    background: var(--color-primary-light) !important;
  }

  /* Typing dots */
  .biosov-dot-1 { animation: biosov-bounce-dot 1s ease-in-out infinite; animation-delay: 0ms; }
  .biosov-dot-2 { animation: biosov-bounce-dot 1s ease-in-out infinite; animation-delay: 150ms; }
  .biosov-dot-3 { animation: biosov-bounce-dot 1s ease-in-out infinite; animation-delay: 300ms; }

  /* Shimmer base */
  .biosov-shimmer {
    background: linear-gradient(
      90deg,
      #eef2f7 25%,
      #dce4ef 50%,
      #eef2f7 75%
    );
    background-size: 468px 100%;
    animation: biosov-shimmer 1.4s ease-in-out infinite;
  }
`;

export const DesignSystemProvider = ({ children }) => {
  useEffect(() => {
    if (typeof document !== "undefined") {
      const existing = document.getElementById("biosov-design-vars");
      if (!existing) {
        const style = document.createElement("style");
        style.id = "biosov-design-vars";
        style.textContent = CSS_VARS;
        document.head.appendChild(style);
      }
    }
  }, []);
  return <>{children}</>;
};

/* ============================================================
   PAGE LAYOUT — إلزامي لكل الصفحات
   ============================================================ */
export const PageLayout = ({ children, dir = "rtl" }) => (
  <div
    dir={dir}
    style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      background: "var(--bg-main)",
      fontFamily: "var(--font-family)",
    }}
  >
    <div
      style={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
    <div
      style={{
        background: "#F8FAFC",
        borderTop: "1px solid var(--color-border)",
        padding: "6px 16px",
        textAlign: "center",
        flexShrink: 0,
      }}
    >
      <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", margin: 0 }}>
        {dir === "rtl"
          ? "المعلومات مُولَّدة بالذكاء الاصطناعي لأغراض توعوية فقط — لا تُغني عن استشارة طبيب مختص. المنصة غير مسؤولة عن أي قرارات صحية مبنية عليها."
          : "AI-generated information for awareness purposes only — not a substitute for professional medical advice. The platform is not responsible for any health decisions based on it."}
      </p>
    </div>
  </div>
);

/* ============================================================
   1. MetricCard
   ============================================================ */
export const MetricCard = ({
  title,
  value,
  unit,
  trend,
  trendValue,
}) => {
  const trendColor =
    trend === "up"
      ? "var(--color-success)"
      : trend === "down"
      ? "var(--color-danger)"
      : "var(--color-text-secondary)";

  const trendArrow =
    trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: "12px",
          color: "var(--color-text-secondary)",
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        {title}
      </span>

      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
        <span
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
            {unit}
          </span>
        )}
      </div>

      {trend && trendValue && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "13px", color: trendColor, fontWeight: 600 }}>
            {trendArrow} {trendValue}
          </span>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   2. ProgressBar
   ============================================================ */
export const ProgressBar = ({ label, current, target, unit }) => {
  const pct = Math.min(100, Math.round((current / target) * 100));
  const barColor =
    pct >= 80
      ? "var(--color-success)"
      : pct >= 50
      ? "var(--color-warning)"
      : "var(--color-danger)";

  const [width, setWidth] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setTimeout(() => setWidth(pct), 50);
    });
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  const [flashed, setFlashed] = useState(false);
  useEffect(() => {
    if (pct >= 100) {
      setFlashed(true);
      const t = setTimeout(() => setFlashed(false), 600);
      return () => clearTimeout(t);
    }
  }, [pct]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "13px", color: "var(--color-text-primary)", fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
          {current}
          {unit ? ` ${unit}` : ""} / {target}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>

      <div
        style={{
          background: "#E2E8F0",
          borderRadius: "9999px",
          height: "8px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: flashed ? "var(--color-success)" : barColor,
            borderRadius: "9999px",
            transition: "width 600ms ease-out, background 300ms ease",
            boxShadow: flashed ? "0 0 8px var(--color-success)" : "none",
          }}
        />
      </div>
    </div>
  );
};

/* ============================================================
   3. StatusBadge
   ============================================================ */
export const StatusBadge = ({ label, status, size = "md" }) => {
  const map = {
    green: {
      dot: "var(--color-success)",
      bg: "var(--color-success-light)",
      pulse: true,
    },
    yellow: {
      dot: "var(--color-warning)",
      bg: "var(--color-warning-light)",
      pulse: false,
    },
    red: {
      dot: "var(--color-danger)",
      bg: "var(--color-danger-light)",
      pulse: false,
    },
  };

  const cfg = map[status] || map.green;
  const fontSize = size === "sm" ? "11px" : "13px";
  const dotSize = size === "sm" ? "6px" : "8px";
  const px = size === "sm" ? "8px" : "10px";
  const py = size === "sm" ? "3px" : "5px";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: cfg.bg,
        borderRadius: "var(--radius-badge)",
        padding: `${py} ${px}`,
        fontSize,
        fontWeight: 500,
        color: "var(--color-text-primary)",
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
          animation: cfg.pulse
            ? "biosov-pulse 2s ease-in-out infinite"
            : "none",
        }}
      />
      {label}
    </span>
  );
};

/* ============================================================
   4. SectionHeader
   ============================================================ */
export const SectionHeader = ({ title, icon, subtitle, action }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "8px",
      padding: "4px 0",
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {icon && (
          <span style={{ fontSize: "18px", lineHeight: 1 }}>{icon}</span>
        )}
        <span
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          {title}
        </span>
      </div>
      {subtitle && (
        <span
          style={{
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            marginInlineStart: icon ? "26px" : "0",
          }}
        >
          {subtitle}
        </span>
      )}
    </div>

    {action && (
      <button
        onClick={action.onClick}
        style={{
          background: "none",
          border: "none",
          color: "var(--color-primary)",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          padding: "4px 0",
          flexShrink: 0,
        }}
      >
        {action.label}
      </button>
    )}
  </div>
);

/* ============================================================
   5. ActionButton
   ============================================================ */
export const ActionButton = ({
  label,
  variant = "primary",
  size = "md",
  icon,
  disabled = false,
  loading = false,
  onClick,
}) => {
  const variantStyles = {
    primary: {
      background: "var(--color-primary)",
      color: "#ffffff",
      border: "none",
    },
    secondary: {
      background: "var(--bg-elevated)",
      color: "var(--color-text-primary)",
      border: "1px solid var(--color-border)",
    },
    danger: {
      background: "var(--color-danger)",
      color: "#ffffff",
      border: "none",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-primary)",
      border: "none",
    },
  };

  const sizeStyles = {
    sm: { fontSize: "12px", padding: "6px 12px", height: "32px" },
    md: { fontSize: "14px", padding: "9px 18px", height: "40px" },
    lg: { fontSize: "15px", padding: "12px 24px", height: "48px" },
  };

  const vs = variantStyles[variant] || variantStyles.primary;
  const ss = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      style={{
        ...vs,
        ...ss,
        borderRadius: "var(--radius-badge)",
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        transition: "opacity 200ms, transform 150ms, box-shadow 150ms",
        position: "relative",
        outline: "none",
        lineHeight: 1,
        fontFamily: "var(--font-family)",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading)
          e.currentTarget.style.opacity = "0.9";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = disabled ? "0.5" : "1";
      }}
    >
      {loading ? (
        <span
          style={{
            width: "16px",
            height: "16px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderTop: "2px solid #ffffff",
            borderRadius: "50%",
            animation: "biosov-spin 600ms linear infinite",
            display: "inline-block",
          }}
        />
      ) : (
        <>
          {icon && <span style={{ fontSize: "15px" }}>{icon}</span>}
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

/* ============================================================
   6. TimerDisplay
   ============================================================ */
export const TimerDisplay = ({
  hours: initH = 0,
  minutes: initM = 0,
  seconds: initS = 0,
  label,
  variant = "elapsed",
  status,
}) => {
  const totalSecondsInit = initH * 3600 + initM * 60 + initS;
  const [elapsed, setElapsed] = useState(0);
  const [blinking, setBlinking] = useState(false);
  // ✅ FIX: intervalRef يحل مشكلة clearInterval داخل setElapsed closure
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (variant === "countdown") {
          const next = prev + 1;
          if (next >= totalSecondsInit) {
            setBlinking(true);
            setTimeout(() => setBlinking(false), 3000);
            // intervalRef.current متاح هنا لأنه ref وليس متغير closure
            clearInterval(intervalRef.current);
            return totalSecondsInit;
          }
          return next;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [variant, totalSecondsInit]);

  const displaySeconds =
    variant === "countdown"
      ? Math.max(0, totalSecondsInit - elapsed)
      : elapsed;

  const h = Math.floor(displaySeconds / 3600);
  const m = Math.floor((displaySeconds % 3600) / 60);
  const s = displaySeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");

  const color = status
    ? status === "green"
      ? "var(--color-success)"
      : status === "yellow"
      ? "var(--color-warning)"
      : "var(--color-danger)"
    : "var(--color-primary)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {label && (
        <span
          style={{
            fontSize: "12px",
            color: "var(--color-text-secondary)",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontSize: "clamp(24px, 5vw, 36px)",
          fontWeight: 700,
          color,
          letterSpacing: "0.05em",
          animation:
            blinking ? "biosov-blink 500ms ease-in-out 6" : "none",
          transition: "color 300ms",
        }}
      >
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </div>
  );
};

/* ============================================================
   7. PhotoUpload
   ============================================================ */
export const PhotoUpload = ({
  label,
  accept = "image/*,.pdf",
  maxSizeMB = 20,
  onUpload,
  preview,
  loading = false,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState(preview || null);
  const [showCheck, setShowCheck] = useState(false);
  const inputRef = useRef(null);
  // ✅ FIX: تتبع blob URLs لتحريرها من الذاكرة عند unmount أو التغيير
  const blobUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      // تحرير الـ blob URL عند unmount لمنع memory leak
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      if (file.size > maxSizeMB * 1024 * 1024) return;
      // تحرير الـ URL القديم قبل إنشاء واحد جديد
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      blobUrlRef.current = url;
      setLocalPreview(url);
      setShowCheck(true);
      setTimeout(() => setShowCheck(false), 1000);
      onUpload?.(file);
    },
    [maxSizeMB, onUpload]
  );

  return (
    <div
      onClick={() => !localPreview && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
      }}
      style={{
        border: `2px dashed ${dragOver ? "var(--color-primary)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-card)",
        background: dragOver
          ? "var(--color-primary-light)"
          : localPreview
          ? "#000"
          : "var(--bg-elevated)",
        minHeight: "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: localPreview ? "default" : "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 200ms ease, background 200ms ease",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {localPreview ? (
        <>
          <img
            src={localPreview}
            alt="preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              maxHeight: "200px",
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
              }
              setLocalPreview(null);
            }}
            style={{
              position: "absolute",
              top: "8px",
              insetInlineEnd: "8px",
              background: "rgba(0,0,0,0.6)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
          {showCheck && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,168,122,0.3)",
                animation: "biosov-check-in 300ms ease",
              }}
            >
              <span style={{ fontSize: "48px" }}>✅</span>
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            padding: "24px",
          }}
        >
          <span style={{ fontSize: "32px" }}>📸</span>
          <span
            style={{
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              textAlign: "center",
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "var(--color-text-secondary)",
              opacity: 0.7,
            }}
          >
            حتى {maxSizeMB}MB
          </span>
        </div>
      )}

      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid var(--color-border)",
              borderTop: "3px solid var(--color-primary)",
              borderRadius: "50%",
              animation: "biosov-spin 600ms linear infinite",
              display: "inline-block",
            }}
          />
        </div>
      )}
    </div>
  );
};

/* ============================================================
   8. NumberInput
   ============================================================ */
export const NumberInput = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}) => {
  const decrement = () => {
    const next = value - step;
    if (min !== undefined && next < min) return;
    onChange?.(next);
  };

  const increment = () => {
    const next = value + step;
    if (max !== undefined && next > max) return;
    onChange?.(next);
  };

  const btnStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "var(--bg-elevated)",
    border: "1px solid var(--color-border)",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: 300,
    color: "var(--color-text-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background 150ms",
    lineHeight: 1,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <span
        style={{
          fontSize: "13px",
          color: "var(--color-text-secondary)",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button style={btnStyle} onClick={decrement}>
          −
        </button>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              minWidth: "60px",
              textAlign: "center",
            }}
          >
            {value}
          </span>
          {unit && (
            <span
              style={{
                fontSize: "13px",
                color: "var(--color-text-secondary)",
              }}
            >
              {unit}
            </span>
          )}
        </div>
        <button style={btnStyle} onClick={increment}>
          +
        </button>
      </div>
    </div>
  );
};

/* ============================================================
   9. AlertBanner
   ============================================================ */
export const AlertBanner = ({
  message,
  type = "info",
  title,
  action,
  dismissible = false,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 250);
  };

  if (!visible) return null;

  const isProactive = type === "proactive";

  const styleMap = {
    info: {
      background: "var(--color-primary-light)",
      border: "1px solid var(--color-primary)",
      color: "var(--color-text-primary)",
    },
    success: {
      background: "var(--color-success-light)",
      border: "1px solid var(--color-success)",
      color: "var(--color-text-primary)",
    },
    warning: {
      background: "var(--color-warning-light)",
      border: "1px solid var(--color-warning)",
      color: "var(--color-text-primary)",
    },
    danger: {
      background: "var(--color-danger-light)",
      border: "1px solid var(--color-danger)",
      color: "var(--color-text-primary)",
    },
    proactive: {
      background: "linear-gradient(135deg, #7C3AED, #1A73E8)",
      border: "none",
      color: "#ffffff",
    },
  };

  const s = styleMap[type] || styleMap.info;

  return (
    <div
      style={{
        borderRadius: "var(--radius-card)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        position: "relative",
        animation: exiting
          ? "biosov-alert-exit 250ms ease forwards"
          : "biosov-slide-down 300ms ease forwards",
        ...s,
        background: s.background,
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        {title && (
          <span
            style={{
              fontWeight: 700,
              fontSize: "14px",
              color: isProactive ? "#ffffff" : "var(--color-text-primary)",
            }}
          >
            {title}
          </span>
        )}
        <span
          style={{
            fontSize: "13px",
            color: isProactive ? "rgba(255,255,255,0.9)" : "var(--color-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {message}
        </span>
        {action && (
          <button
            onClick={action.onClick}
            style={{
              marginTop: "6px",
              background: isProactive
                ? "rgba(255,255,255,0.2)"
                : "var(--color-primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "var(--radius-badge)",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            {action.label}
          </button>
        )}
      </div>

      {dismissible && (
        <button
          onClick={handleDismiss}
          style={{
            background: "none",
            border: "none",
            color: isProactive ? "rgba(255,255,255,0.7)" : "var(--color-text-secondary)",
            cursor: "pointer",
            fontSize: "18px",
            lineHeight: 1,
            padding: "0",
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

/* ============================================================
   10. ScoreDisplay
   ============================================================ */
export const ScoreDisplay = ({
  score,
  maxScore,
  label,
  trend,
  trendValue,
  dark = false,
  breakdown,
}) => {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    // ✅ FIX: تتبع raf ID لإلغائه عند unmount ومنع setState بعد تفكيك المكوّن
    let rafId;
    let start = 0;
    const duration = 1000;
    const step = (score / duration) * 16;
    const animate = () => {
      start += step;
      if (start >= score) {
        setDisplayed(score);
        return;
      }
      setDisplayed(Math.round(start));
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [score]);

  const trendColor =
    trend === "up"
      ? "var(--color-success)"
      : trend === "down"
      ? "var(--color-danger)"
      : "var(--color-text-secondary)";

  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  const textColor = dark ? "var(--color-text-on-dark)" : "var(--color-text-primary)";
  const subColor = dark ? "rgba(241,245,249,0.6)" : "var(--color-text-secondary)";

  return (
    <div
      style={{
        background: dark ? "var(--bg-card-dark)" : "var(--bg-card)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <span style={{ fontSize: "13px", color: subColor, fontWeight: 500 }}>
        {label}
      </span>

      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
        <span
          style={{
            fontSize: "clamp(36px, 8vw, 48px)",
            fontWeight: 700,
            color: textColor,
            lineHeight: 1,
          }}
        >
          {displayed}
        </span>
        <span style={{ fontSize: "18px", color: subColor }}>/ {maxScore}</span>
      </div>

      {trend && trendValue && (
        <span style={{ fontSize: "13px", color: trendColor, fontWeight: 600 }}>
          {trendArrow} {trendValue}
        </span>
      )}

      {breakdown && breakdown.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
          {breakdown.map((item, i) => {
            const pct = Math.min(100, Math.round((item.value / item.max) * 100));
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: subColor }}>{item.label}</span>
                  <span style={{ fontSize: "11px", color: subColor, fontWeight: 600 }}>
                    {item.value}/{item.max}
                  </span>
                </div>
                <div
                  style={{
                    height: "4px",
                    background: dark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                    borderRadius: "9999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "var(--color-primary)",
                      borderRadius: "9999px",
                      transition: "width 600ms ease-out",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   11. RatingSelector
   ============================================================ */
export const RatingSelector = ({
  label,
  value,
  min = 1,
  max = 5,
  mode = "number",
  onChange,
}) => {
  const emojis = ["😫", "😕", "😐", "🙂", "💪"];
  const trafficOptions = [
    { icon: "🔴", val: 1 },
    { icon: "🟡", val: 2 },
    { icon: "🟢", val: 3 },
  ];

  const renderOptions = () => {
    if (mode === "emoji") {
      return emojis.slice(0, max - min + 1).map((e, i) => {
        const v = i + min;
        const active = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange?.(v)}
            style={{
              background: active ? "var(--color-primary-light)" : "transparent",
              border: `2px solid ${active ? "var(--color-primary)" : "transparent"}`,
              borderRadius: "var(--radius-badge)",
              padding: "6px 10px",
              fontSize: "22px",
              cursor: "pointer",
              transition: "all 200ms",
            }}
          >
            {e}
          </button>
        );
      });
    }

    if (mode === "traffic") {
      return trafficOptions.map(({ icon, val }) => {
        const active = value === val;
        return (
          <button
            key={val}
            onClick={() => onChange?.(val)}
            style={{
              background: active ? "var(--color-primary-light)" : "transparent",
              border: `2px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
              borderRadius: "var(--radius-card)",
              padding: "10px 20px",
              fontSize: "28px",
              cursor: "pointer",
              transition: "all 200ms",
              flex: 1,
            }}
          >
            {icon}
          </button>
        );
      });
    }

    // number mode
    return Array.from({ length: max - min + 1 }, (_, i) => i + min).map((v) => {
      const active = value === v;
      return (
        <button
          key={v}
          onClick={() => onChange?.(v)}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: active ? "var(--color-primary)" : "var(--bg-elevated)",
            border: `2px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
            color: active ? "#ffffff" : "var(--color-text-primary)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 200ms",
            flexShrink: 0,
          }}
        >
          {v}
        </button>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 500 }}>
        {label}
      </span>
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: mode === "traffic" ? "nowrap" : "wrap",
          alignItems: "center",
        }}
      >
        {renderOptions()}
      </div>
    </div>
  );
};

/* ============================================================
   12. ToggleSwitch
   ============================================================ */
export const ToggleSwitch = ({
  label,
  checked,
  onChange,
  disabled = false,
  timestamp,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      opacity: disabled ? 0.4 : 1,
      cursor: disabled ? "not-allowed" : "default",
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <span style={{ fontSize: "14px", color: "var(--color-text-primary)", fontWeight: 500 }}>
        {label}
      </span>
      {timestamp && (
        <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
          {timestamp}
        </span>
      )}
    </div>

    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange?.(!checked)}
      style={{
        width: "48px",
        height: "26px",
        borderRadius: "9999px",
        background: checked ? "var(--color-success)" : "#CBD5E1",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative",
        transition: "background 250ms ease",
        flexShrink: 0,
        outline: "none",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          insetInlineStart: checked ? "calc(100% - 23px)" : "3px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "inset-inline-start 250ms ease",
        }}
      />
    </button>
  </div>
);

/* ============================================================
   13. StreakCounter
   ============================================================ */
export const StreakCounter = ({
  label,
  count,
  unit = "يوم",
  icon = "🔥",
  best,
}) => {
  const isRecord = best !== undefined && count >= best;
  const [iconBounced, setIconBounced] = useState(false);

  useEffect(() => {
    if (isRecord) {
      setIconBounced(true);
      const t = setTimeout(() => setIconBounced(false), 400);
      return () => clearTimeout(t);
    }
  }, [isRecord]);

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        position: "relative",
        minWidth: "100px",
      }}
    >
      <span
        style={{
          fontSize: "28px",
          animation: iconBounced
            ? "biosov-scale-bounce 400ms ease"
            : "none",
        }}
      >
        {icon}
      </span>

      <span
        style={{
          fontSize: "32px",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          lineHeight: 1,
        }}
      >
        {count}
      </span>

      <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
        {unit}
      </span>

      <span
        style={{
          fontSize: "12px",
          color: "var(--color-text-secondary)",
          fontWeight: 500,
        }}
      >
        {label}
      </span>

      {isRecord && (
        <span
          style={{
            position: "absolute",
            top: "-8px",
            insetInlineEnd: "-8px",
            background: "var(--color-warning)",
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: 700,
            padding: "3px 6px",
            borderRadius: "var(--radius-badge)",
            animation: "biosov-badge-in 300ms ease",
            whiteSpace: "nowrap",
          }}
        >
          🏆 رقم قياسي
        </span>
      )}
    </div>
  );
};

/* ============================================================
   14. BodyMap — Placeholder SVG
   ============================================================ */
export const BodyMap = ({ muscleStatus = {}, onMuscleClick }) => {
  const [tooltip, setTooltip] = useState(null);

  const colorMap = {
    green: "rgba(0,168,122,0.6)",
    yellow: "rgba(245,158,11,0.6)",
    red: "rgba(239,68,68,0.6)",
    neutral: "#E2E8F0",
  };

  const muscleNames = {
    chest: "الصدر",
    back: "الظهر",
    shoulders: "الكتفين",
    biceps: "الباي سبس",
    triceps: "التراي سبس",
    quads: "الكوادريسبس",
    hamstrings: "الهامسترينج",
    glutes: "الأرداف",
    calves: "السمانة",
    core: "الكور",
  };

  const frontMuscles = [
    { id: "chest", d: "M 30 40 Q 50 35 70 40 Q 70 55 50 58 Q 30 55 30 40 Z", label: "chest" },
    { id: "shoulders", d: "M 18 32 Q 28 28 30 40 Q 24 44 18 40 Z", label: "shoulders" },
    { id: "biceps", d: "M 10 48 Q 18 44 20 60 Q 14 64 10 60 Z", label: "biceps" },
    { id: "core", d: "M 36 58 Q 50 55 64 58 Q 64 80 50 83 Q 36 80 36 58 Z", label: "core" },
    { id: "quads", d: "M 36 90 Q 46 86 46 110 Q 38 114 34 110 Z", label: "quads" },
    { id: "calves", d: "M 36 118 Q 44 116 44 135 Q 38 137 34 135 Z", label: "calves" },
    { id: "triceps", d: "M 80 48 Q 88 44 90 60 Q 84 64 80 60 Z", label: "triceps" },
  ];

  const backMuscles = [
    { id: "back", d: "M 130 38 Q 150 33 170 38 Q 170 62 150 65 Q 130 62 130 38 Z", label: "back" },
    { id: "glutes", d: "M 134 82 Q 150 78 166 82 Q 168 100 150 103 Q 132 100 134 82 Z", label: "glutes" },
    { id: "hamstrings", d: "M 136 110 Q 148 106 148 128 Q 140 132 134 128 Z", label: "hamstrings" },
  ];

  const getColor = (muscle) =>
    colorMap[muscleStatus[muscle] || "neutral"] || colorMap.neutral;

  const handleClick = (muscle, e) => {
    const rect = e.currentTarget.closest("svg").getBoundingClientRect();
    setTooltip({
      muscle,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 30,
      status: muscleStatus[muscle] || "neutral",
      name: muscleNames[muscle] || muscle,
    });
    onMuscleClick?.(muscle);
    setTimeout(() => setTooltip(null), 2000);
  };

  return (
    <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
      <svg
        viewBox="0 0 200 160"
        style={{ width: "100%", maxWidth: "320px", display: "block", margin: "0 auto" }}
      >
        <ellipse cx="50" cy="22" rx="12" ry="14" fill="#E2E8F0" opacity="0.5" />
        <rect x="28" y="34" width="44" height="60" rx="8" fill="#E2E8F0" opacity="0.3" />
        <rect x="30" y="82" width="20" height="60" rx="6" fill="#E2E8F0" opacity="0.3" />
        <rect x="50" y="82" width="20" height="60" rx="6" fill="#E2E8F0" opacity="0.3" />
        <rect x="8" y="36" width="22" height="56" rx="6" fill="#E2E8F0" opacity="0.3" />
        <rect x="70" y="36" width="22" height="56" rx="6" fill="#E2E8F0" opacity="0.3" />

        {frontMuscles.map((m) => (
          <path
            key={m.id}
            d={m.d}
            fill={getColor(m.id)}
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: "pointer", transition: "fill 300ms" }}
            onClick={(e) => handleClick(m.id, e)}
          />
        ))}

        <line x1="100" y1="5" x2="100" y2="155" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4,4" />

        <ellipse cx="150" cy="22" rx="12" ry="14" fill="#E2E8F0" opacity="0.5" />
        <rect x="128" y="34" width="44" height="60" rx="8" fill="#E2E8F0" opacity="0.3" />
        <rect x="130" y="82" width="20" height="60" rx="6" fill="#E2E8F0" opacity="0.3" />
        <rect x="150" y="82" width="20" height="60" rx="6" fill="#E2E8F0" opacity="0.3" />
        <rect x="108" y="36" width="22" height="56" rx="6" fill="#E2E8F0" opacity="0.3" />
        <rect x="170" y="36" width="22" height="56" rx="6" fill="#E2E8F0" opacity="0.3" />

        {backMuscles.map((m) => (
          <path
            key={m.id}
            d={m.d}
            fill={getColor(m.id)}
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: "pointer", transition: "fill 300ms" }}
            onClick={(e) => handleClick(m.id, e)}
          />
        ))}

        <text x="50" y="155" textAnchor="middle" fontSize="8" fill="var(--color-text-secondary)">أمامي</text>
        <text x="150" y="155" textAnchor="middle" fontSize="8" fill="var(--color-text-secondary)">خلفي</text>
      </svg>

      {tooltip && (
        <div
          style={{
            position: "absolute",
            top: `${tooltip.y}px`,
            left: `${tooltip.x}px`,
            background: "var(--bg-card-dark)",
            color: "var(--color-text-on-dark)",
            fontSize: "11px",
            padding: "4px 8px",
            borderRadius: "var(--radius-badge)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            transform: "translateX(-50%)",
            boxShadow: "var(--shadow-card-hover)",
            zIndex: 10,
          }}
        >
          {tooltip.name} — {tooltip.status === "green" ? "جاهزة" : tooltip.status === "yellow" ? "مقبولة" : tooltip.status === "red" ? "راحة" : "محايد"}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   15. SpecialistCard
   ============================================================ */
export const SpecialistCard = ({
  name,
  specialty,
  avatar,
  status = "available",
  lastSession,
  lastInsight,
  bgIndex = 1,
  onClick,
}) => {
  const bgVar = `var(--specialist-bg-${((bgIndex - 1) % 7) + 1})`;

  return (
    <div
      onClick={onClick}
      className="biosov-card-hover"
      style={{
        background: bgVar,
        borderRadius: "var(--radius-card)",
        padding: "16px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        border: "1px solid var(--color-border)",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img
            src={avatar}
            alt={name}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "3px solid #ffffff",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div
            style={{
              display: "none",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "3px solid #ffffff",
              background: "var(--color-primary-light)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            🧑‍⚕️
          </div>
          <span
            style={{
              position: "absolute",
              bottom: "1px",
              insetInlineEnd: "1px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background:
                status === "active"
                  ? "var(--color-success)"
                  : "#94A3B8",
              border: "2px solid #ffffff",
              animation:
                status === "active"
                  ? "biosov-pulse 2s ease-in-out infinite"
                  : "none",
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary)" }}>
            {name}
          </div>
          <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
            {specialty}
          </div>
          {lastSession && (
            <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
              آخر جلسة: {lastSession}
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0 }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: status === "active" ? "var(--color-success)" : "var(--color-text-secondary)",
            }}
          >
            {status === "active" ? "نشط" : "متاح"}
          </span>
        </div>
      </div>

      {lastInsight && (
        <p
          style={{
            fontSize: "12px",
            color: "var(--color-text-secondary)",
            margin: 0,
            lineHeight: 1.5,
            paddingTop: "8px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          💡 {lastInsight}
        </p>
      )}
    </div>
  );
};

/* ============================================================
   16. CircularGauge
   ============================================================ */
export const CircularGauge = ({ value, label, sublabel, size = "md" }) => {
  const sizeMap = { sm: 72, md: 96, lg: 120 };
  const dim = sizeMap[size] || 96;
  const strokeWidth = size === "sm" ? 7 : 9;
  const r = (dim - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;

  const [animatedVal, setAnimatedVal] = useState(0);

  useEffect(() => {
    // ✅ FIX: تتبع raf ID لمنع setState بعد unmount
    let rafId;
    const duration = 800;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedVal(Math.round(value * eased));
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  const offset = circ - (animatedVal / 100) * circ;

  const color =
    value >= 70
      ? "var(--color-success)"
      : value >= 40
      ? "var(--color-warning)"
      : "var(--color-danger)";

  const cx = dim / 2;
  const cy = dim / 2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <svg width={dim} height={dim} style={{ display: "block" }}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 800ms ease-out, stroke 300ms" }}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: size === "sm" ? "16px" : "20px",
            fontWeight: 700,
            fill: "var(--color-text-primary)",
          }}
        >
          {animatedVal}%
        </text>
      </svg>

      <span
        style={{
          fontSize: "12px",
          color: "var(--color-text-secondary)",
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        {label}
      </span>
      {sublabel && (
        <span
          style={{
            fontSize: "11px",
            color: "var(--color-text-secondary)",
            opacity: 0.7,
            textAlign: "center",
          }}
        >
          {sublabel}
        </span>
      )}
    </div>
  );
};

/* ============================================================
   17. SparkLine
   ============================================================ */
export const SparkLine = ({
  data = [],
  width = 120,
  height = 40,
  trend = "neutral",
  trendLabel,
}) => {
  const pathRef = useRef(null);
  const [pathLen, setPathLen] = useState(0);
  const [drawn, setDrawn] = useState(false);

  const trendColor =
    trend === "up"
      ? "var(--color-success)"
      : trend === "down"
      ? "var(--color-danger)"
      : "var(--color-primary)";

  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  const pad = 4;
  const pts = data.length;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const toX = (i) => pad + (i / (pts - 1)) * (width - pad * 2);
  const toY = (v) => height - pad - ((v - min) / range) * (height - pad * 2);

  const pathD =
    pts < 2
      ? ""
      : data
          .map((v, i) =>
            i === 0
              ? `M ${toX(i)} ${toY(v)}`
              : `L ${toX(i)} ${toY(v)}`
          )
          .join(" ");

  const lastX = pts > 0 ? toX(pts - 1) : 0;
  const lastY = pts > 0 ? toY(data[pts - 1]) : 0;

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathLen(len);
      setTimeout(() => setDrawn(true), 50);
    }
  }, [pathD]);

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <svg
        width={width}
        height={height}
        style={{ display: "block", overflow: "visible" }}
      >
        {pathD && (
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke={trendColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLen}
            strokeDashoffset={drawn ? 0 : pathLen}
            style={{ transition: "stroke-dashoffset 800ms ease-out" }}
          />
        )}
        {pts > 0 && (
          <circle
            cx={lastX}
            cy={lastY}
            r="3"
            fill={trendColor}
          />
        )}
      </svg>
      {trendLabel && (
        <span style={{ fontSize: "12px", color: trendColor, fontWeight: 600 }}>
          {trendArrow} {trendLabel}
        </span>
      )}
    </div>
  );
};

/* ============================================================
   18. TimelineBar
   ============================================================ */
export const TimelineBar = ({ blocks = [], startHour = 0, endHour = 24, currentHour }) => {
  const [tooltip, setTooltip] = useState(null);
  const total = endHour - startHour;
  const pct = (h) => ((h - startHour) / total) * 100;

  const typeColors = {
    sleep: "#6366F1",
    work: "#1A73E8",
    exercise: "#00A87A",
    meal: "#F59E0B",
    rest: "#94A3B8",
    other: "#CBD5E1",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div
        style={{
          position: "relative",
          height: "40px",
          background: "#E2E8F0",
          borderRadius: "9999px",
          overflow: "hidden",
        }}
      >
        {blocks.map((block, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${pct(block.start)}%`,
              width: `${pct(block.end) - pct(block.start)}%`,
              background: typeColors[block.type] || typeColors.other,
              display: "flex",
              alignItems: "flex-end",
              paddingBottom: "2px",
              paddingInline: "4px",
            }}
            onMouseEnter={() => setTooltip({ label: block.label, type: block.type, i })}
            onMouseLeave={() => setTooltip(null)}
            onClick={() => setTooltip(tooltip?.i === i ? null : { label: block.label, type: block.type, i })}
          >
            <span
              style={{
                fontSize: "10px",
                color: "#fff",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1,
              }}
            >
              {block.label}
            </span>
          </div>
        ))}

        {currentHour !== undefined && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${pct(currentHour)}%`,
              width: "2px",
              background: "var(--color-primary)",
              zIndex: 10,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-6px",
                left: "-5px",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "var(--color-primary)",
              }}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", paddingInline: "2px" }}>
        {[0, 6, 12, 18, 24].map((h) => (
          <span key={h} style={{ fontSize: "10px", color: "var(--color-text-secondary)" }}>
            {h === 24 ? "24" : `${h}:00`}
          </span>
        ))}
      </div>

      {tooltip && (
        <div
          style={{
            background: "var(--bg-card-dark)",
            color: "var(--color-text-on-dark)",
            fontSize: "12px",
            padding: "6px 10px",
            borderRadius: "var(--radius-badge)",
            alignSelf: "flex-start",
            boxShadow: "var(--shadow-card-hover)",
          }}
        >
          {tooltip.label} ({tooltip.type})
        </div>
      )}
    </div>
  );
};

/* ============================================================
   19. TabBar
   ============================================================ */
export const TabBar = ({ tabs = [], activeTab, onChange, variant = "top" }) => {
  if (variant === "bottom") {
    return (
      <div
        style={{
          display: "flex",
          background: "var(--bg-header)",
          borderTop: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange?.(tab.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                padding: "8px 4px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
                position: "relative",
                transition: "color 200ms",
              }}
            >
              {tab.icon && (
                <span style={{ fontSize: "20px", lineHeight: 1 }}>{tab.icon}</span>
              )}
              <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500 }}>
                {tab.label}
              </span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "6px",
                    insetInlineEnd: "calc(50% - 18px)",
                    background: "var(--color-danger)",
                    color: "#fff",
                    fontSize: "9px",
                    fontWeight: 700,
                    borderRadius: "9999px",
                    minWidth: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        padding: "4px",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange?.(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "9999px",
              background: active ? "var(--color-primary)" : "transparent",
              color: active ? "#ffffff" : "var(--color-text-secondary)",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              transition: "background 200ms, color 200ms",
              position: "relative",
            }}
          >
            {tab.icon && <span style={{ fontSize: "14px" }}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                style={{
                  background: active ? "rgba(255,255,255,0.3)" : "var(--color-danger)",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: 700,
                  borderRadius: "9999px",
                  minWidth: "18px",
                  height: "18px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

/* ============================================================
   20. StatsRow
   ============================================================ */
export const StatsRow = ({ stats = [] }) => (
  <div
    style={{
      background: "var(--bg-card)",
      borderRadius: "9999px",
      boxShadow: "var(--shadow-card)",
      padding: "10px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      flexWrap: "wrap",
      gap: "8px",
    }}
  >
    {stats.map((stat, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: "0" }}>
        {i > 0 && (
          <span
            style={{
              color: "var(--color-border)",
              fontSize: "18px",
              marginInlineEnd: "16px",
              userSelect: "none",
            }}
          >
            |
          </span>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
          }}
        >
          {stat.icon && (
            <span style={{ fontSize: "14px", lineHeight: 1 }}>{stat.icon}</span>
          )}
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              lineHeight: 1,
            }}
          >
            {stat.value}
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "var(--color-text-secondary)",
            }}
          >
            {stat.label}
          </span>
        </div>
      </div>
    ))}
  </div>
);

/* ============================================================
   21. ChatBubble
   ============================================================ */
export const ChatBubble = ({ messages = [], loading = false, onSend }) => {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = () => {
    const txt = input.trim();
    if (!txt) return;
    setInput("");
    onSend?.(txt);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-main)",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className="biosov-msg-enter"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
                gap: "4px",
              }}
            >
              {!isUser && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    paddingInlineStart: "4px",
                  }}
                >
                  {msg.specialistAvatar && (
                    <img
                      src={msg.specialistAvatar}
                      alt={msg.specialistName}
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  {msg.specialistName && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {msg.specialistName}
                    </span>
                  )}
                </div>
              )}

              <div
                style={{
                  maxWidth: "80%",
                  background: isUser
                    ? "var(--color-primary)"
                    : "var(--bg-elevated)",
                  color: isUser
                    ? "#ffffff"
                    : "var(--color-text-primary)",
                  borderRadius: isUser
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  padding: "10px 14px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  border: isUser ? "none" : "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-card)",
                  wordBreak: "break-word",
                }}
              >
                {msg.content}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  paddingInline: "4px",
                  flexDirection: isUser ? "row-reverse" : "row",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {msg.timestamp}
                </span>
                {!isUser && msg.confidence && (
                  <StatusBadge
                    label={
                      msg.confidence === "green"
                        ? "موثوق"
                        : msg.confidence === "yellow"
                        ? "محتمل"
                        : "غير مؤكد"
                    }
                    status={msg.confidence}
                    size="sm"
                  />
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "4px",
            }}
          >
            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "18px 18px 18px 4px",
                padding: "12px 16px",
                display: "flex",
                gap: "5px",
                alignItems: "center",
              }}
            >
              <span
                className="biosov-dot-1"
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--color-text-secondary)",
                  display: "inline-block",
                }}
              />
              <span
                className="biosov-dot-2"
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--color-text-secondary)",
                  display: "inline-block",
                }}
              />
              <span
                className="biosov-dot-3"
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--color-text-secondary)",
                  display: "inline-block",
                }}
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div
        style={{
          background: "var(--bg-card)",
          borderTop: "1px solid var(--color-border)",
          padding: "12px 16px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
          flexShrink: 0,
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autoResize(e);
          }}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالتك..."
          rows={1}
          style={{
            flex: 1,
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "14px",
            color: "var(--color-text-primary)",
            background: "var(--bg-elevated)",
            outline: "none",
            resize: "none",
            lineHeight: 1.5,
            fontFamily: "var(--font-family)",
            maxHeight: "120px",
            overflowY: "auto",
            transition: "border-color 200ms",
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = "var(--color-primary)")
          }
          onBlur={(e) =>
            (e.target.style.borderColor = "var(--color-border)")
          }
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: input.trim()
              ? "var(--color-primary)"
              : "var(--bg-elevated)",
            border: "1px solid var(--color-border)",
            color: input.trim() ? "#ffffff" : "var(--color-text-secondary)",
            cursor: input.trim() ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            flexShrink: 0,
            transition: "background 200ms, color 200ms",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

/* ============================================================
   22. Toast / Notification System
   Usage:
     const { addToast } = useToast();
     addToast({ type: "success", title: "تم الحفظ", message: "..." });

   ✅ مكان الوضع في app/layout.tsx (مرة واحدة فوق كل الـ routes):
   ─────────────────────────────────────────────────────────────
   import { DesignSystemProvider, ToastProvider } from "@/components/design-system";

   export default function RootLayout({ children }) {
     return (
       <html lang="ar" dir="rtl">
         <body>
           <DesignSystemProvider>
             <ToastProvider>
               {children}
             </ToastProvider>
           </DesignSystemProvider>
         </body>
       </html>
     );
   }
   ─────────────────────────────────────────────────────────────
   ⚠️  لا تضعه داخل page component — ستُفقَد الـ toasts عند navigation.
   ============================================================ */
const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // ✅ FIX: removeToast مُعرَّفة أولاً حتى يمكن إدراجها في deps لـ addToast
  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 320);
  }, []); // setToasts مستقرة — لا تحتاج إدراجها

  // ✅ FIX: removeToast مُدرجة في deps array بدلاً من [] الفارغة
  const addToast = useCallback(
    ({ type = "info", title, message, duration = 4000 }) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, type, title, message, exiting: false }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const iconMap = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  const colorMap = {
    success: { bar: "var(--color-success)", bg: "var(--color-success-light)" },
    error:   { bar: "var(--color-danger)",  bg: "var(--color-danger-light)"  },
    warning: { bar: "var(--color-warning)", bg: "var(--color-warning-light)" },
    info:    { bar: "var(--color-primary)", bg: "var(--color-primary-light)" },
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container — fixed top-left for RTL */}
      <div
        style={{
          position: "fixed",
          top: "16px",
          insetInlineStart: "16px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none",
          maxWidth: "340px",
          width: "calc(100vw - 32px)",
        }}
      >
        {toasts.map((toast) => {
          const cfg = colorMap[toast.type] || colorMap.info;
          return (
            <div
              key={toast.id}
              style={{
                background: "var(--bg-card)",
                borderRadius: "var(--radius-card)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                overflow: "hidden",
                animation: toast.exiting
                  ? "biosov-toast-out 300ms ease forwards"
                  : "biosov-toast-in 300ms ease forwards",
                pointerEvents: "all",
                borderInlineStart: `4px solid ${cfg.bar}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 14px",
                }}
              >
                <span style={{ fontSize: "18px", flexShrink: 0, lineHeight: 1.3 }}>
                  {iconMap[toast.type] || iconMap.info}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {toast.title && (
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        marginBottom: toast.message ? "2px" : 0,
                      }}
                    >
                      {toast.title}
                    </div>
                  )}
                  {toast.message && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {toast.message}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-text-secondary)",
                    cursor: "pointer",
                    fontSize: "16px",
                    lineHeight: 1,
                    padding: "0",
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};

/* ============================================================
   23. Skeleton / Shimmer Loading
   Variants:
     <SkeletonText lines={3} />
     <SkeletonCard />
     <SkeletonAvatar size={48} />
     <SkeletonRect width="100%" height={120} radius={14} />
   ============================================================ */
const shimmerStyle = {
  background: "linear-gradient(90deg, #eef2f7 25%, #dce4ef 50%, #eef2f7 75%)",
  backgroundSize: "468px 100%",
  animation: "biosov-shimmer 1.4s ease-in-out infinite",
  borderRadius: "6px",
};

export const SkeletonRect = ({
  width = "100%",
  height = 16,
  radius = 6,
  style: extraStyle = {},
}) => (
  <div
    style={{
      ...shimmerStyle,
      width,
      height,
      borderRadius: radius,
      flexShrink: 0,
      ...extraStyle,
    }}
  />
);

export const SkeletonText = ({ lines = 3, lastLineWidth = "60%" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonRect
        key={i}
        height={14}
        width={i === lines - 1 ? lastLineWidth : "100%"}
      />
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 48 }) => (
  <div
    style={{
      ...shimmerStyle,
      width: size,
      height: size,
      borderRadius: "50%",
      flexShrink: 0,
    }}
  />
);

export const SkeletonCard = ({ showAvatar = true, lines = 2 }) => (
  <div
    style={{
      background: "var(--bg-card)",
      borderRadius: "var(--radius-card)",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      boxShadow: "var(--shadow-card)",
    }}
  >
    {showAvatar && (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <SkeletonAvatar size={40} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <SkeletonRect height={14} width="50%" />
          <SkeletonRect height={12} width="35%" />
        </div>
      </div>
    )}
    <SkeletonText lines={lines} />
    <SkeletonRect height={8} radius={9999} />
  </div>
);

/* ============================================================
   24. Tabs Component (Panel-based)
   Usage:
     <Tabs
       tabs={[
         { id: "overview", label: "نظرة عامة", icon: "📊" },
         { id: "history",  label: "السجل",      icon: "📅" },
       ]}
       panels={{
         overview: <OverviewContent />,
         history: <HistoryContent />,
       }}
       defaultTab="overview"
       variant="underline"  // "underline" | "pill" | "card"
     />
   ============================================================ */
export const Tabs = ({
  tabs = [],
  panels = {},
  defaultTab,
  variant = "underline",
  onChange,
}) => {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  const handleChange = (id) => {
    setActive(id);
    onChange?.(id);
  };

  const tabHeaderStyles = {
    underline: {
      wrapper: {
        display: "flex",
        borderBottom: "2px solid var(--color-border)",
        gap: "0",
        overflowX: "auto",
        scrollbarWidth: "none",
      },
      btn: (isActive) => ({
        padding: "10px 18px",
        background: "none",
        border: "none",
        borderBottom: `2px solid ${isActive ? "var(--color-primary)" : "transparent"}`,
        marginBottom: "-2px",
        color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
        fontWeight: isActive ? 700 : 500,
        fontSize: "14px",
        cursor: "pointer",
        transition: "color 200ms, border-color 200ms",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: "var(--font-family)",
      }),
    },
    pill: {
      wrapper: {
        display: "flex",
        gap: "6px",
        background: "var(--bg-elevated)",
        borderRadius: "9999px",
        padding: "4px",
        flexWrap: "wrap",
      },
      btn: (isActive) => ({
        padding: "7px 16px",
        background: isActive ? "var(--color-primary)" : "transparent",
        border: "none",
        borderRadius: "9999px",
        color: isActive ? "#ffffff" : "var(--color-text-secondary)",
        fontWeight: 600,
        fontSize: "13px",
        cursor: "pointer",
        transition: "background 200ms, color 200ms",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: "var(--font-family)",
      }),
    },
    card: {
      wrapper: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
      },
      btn: (isActive) => ({
        padding: "10px 16px",
        background: isActive ? "var(--bg-card)" : "transparent",
        border: `1px solid ${isActive ? "var(--color-border)" : "transparent"}`,
        borderBottom: isActive ? "1px solid var(--bg-card)" : "1px solid var(--color-border)",
        borderRadius: "var(--radius-badge) var(--radius-badge) 0 0",
        color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
        fontWeight: isActive ? 700 : 500,
        fontSize: "13px",
        cursor: "pointer",
        transition: "all 200ms",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: "var(--font-family)",
      }),
    },
  };

  const styles = tabHeaderStyles[variant] || tabHeaderStyles.underline;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Tab headers */}
      <div style={styles.wrapper}>
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => handleChange(tab.id)}
              style={styles.btn(isActive)}
            >
              {tab.icon && <span style={{ fontSize: "15px" }}>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  style={{
                    background: isActive ? "rgba(255,255,255,0.3)" : "var(--color-danger)",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: 700,
                    borderRadius: "9999px",
                    minWidth: "16px",
                    height: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div
        key={active}
        style={{
          animation: "biosov-fade-in-up 220ms ease forwards",
          paddingTop: variant === "underline" ? "16px" : "12px",
        }}
      >
        {panels[active] ?? null}
      </div>
    </div>
  );
};

/* ============================================================
   25. CircularProgressRing (Standalone SVG Ring)
   Distinct from CircularGauge — supports custom colors,
   gradient fill, multi-ring mode, and label slots.
   Usage:
     <CircularProgressRing value={72} size={140} strokeWidth={12}
       color="#1A73E8" label="التقدم" sublabel="من 100" />
   ============================================================ */
export const CircularProgressRing = ({
  value = 0,         // 0–100
  size = 120,
  strokeWidth = 10,
  color,             // override automatic color
  label,
  sublabel,
  showValue = true,
  animationDuration = 900,
}) => {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  const [animVal, setAnimVal] = useState(0);

  useEffect(() => {
    let raf;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / animationDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimVal(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, animationDuration]);

  const resolvedColor = color
    ? color
    : value >= 70
    ? "var(--color-success)"
    : value >= 40
    ? "var(--color-warning)"
    : "var(--color-danger)";

  const offset = circ - (animVal / 100) * circ;

  const gradId = `ring-grad-${size}-${strokeWidth}`;

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block" }}
        aria-label={label ? `${label}: ${animVal}%` : `${animVal}%`}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={resolvedColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={resolvedColor} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{
            transition: `stroke-dashoffset ${animationDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
          }}
        />

        {/* Center value */}
        {showValue && (
          <>
            <text
              x={cx} y={cy - (sublabel ? 6 : 0)}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--color-text-primary)"
              style={{ fontSize: `${Math.round(size * 0.18)}px`, fontWeight: 700 }}
            >
              {animVal}%
            </text>
            {sublabel && (
              <text
                x={cx} y={cy + size * 0.14}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--color-text-secondary)"
                style={{ fontSize: `${Math.round(size * 0.1)}px` }}
              >
                {sublabel}
              </text>
            )}
          </>
        )}
      </svg>

      {label && (
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            textAlign: "center",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

/* ============================================================
   26. NavigationSidebar
   Usage:
     <NavigationSidebar
       items={[
         { id: "home",     icon: "🏠", label: "الرئيسية",    badge: 0 },
         { id: "health",   icon: "❤️", label: "صحتي",         badge: 2 },
         { id: "sessions", icon: "🧑‍⚕️", label: "الجلسات" },
         { id: "settings", icon: "⚙️",  label: "الإعدادات",   dividerBefore: true },
       ]}
       activeItem="health"
       onSelect={(id) => ...}
       logo={<span>BioS</span>}
       footer={<UserAvatar />}
       collapsed={false}
     />
   ============================================================ */
export const NavigationSidebar = ({
  items = [],
  activeItem,
  onSelect,
  logo,
  footer,
  collapsed = false,
}) => {
  const [hovered, setHovered] = useState(null);

  return (
    <nav
      style={{
        width: collapsed ? "64px" : "220px",
        minHeight: "100vh",
        background: "var(--bg-sidebar)",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        transition: "width 280ms cubic-bezier(0.4,0,0.2,1)",
        flexShrink: 0,
        overflowX: "hidden",
        position: "relative",
        zIndex: 100,
      }}
    >
      {/* Logo area */}
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          paddingInline: collapsed ? "0" : "20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {logo && (
          <div
            style={{
              color: "var(--color-text-on-dark)",
              fontWeight: 800,
              fontSize: "18px",
              whiteSpace: "nowrap",
              opacity: collapsed ? 0 : 1,
              transition: "opacity 200ms",
            }}
          >
            {logo}
          </div>
        )}
        {collapsed && (
          <span style={{ fontSize: "22px" }}>⚕️</span>
        )}
      </div>

      {/* Nav items */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          scrollbarWidth: "none",
        }}
      >
        {items.map((item, idx) => {
          const isActive = item.id === activeItem;
          const isHovered = hovered === item.id;

          return (
            <div key={item.id}>
              {item.dividerBefore && idx > 0 && (
                <div
                  style={{
                    height: "1px",
                    background: "rgba(255,255,255,0.08)",
                    margin: "8px 8px",
                  }}
                />
              )}
              <button
                onClick={() => onSelect?.(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                title={collapsed ? item.label : undefined}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: collapsed ? "10px" : "10px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: "10px",
                  background: isActive
                    ? "rgba(26,115,232,0.25)"
                    : isHovered
                    ? "rgba(255,255,255,0.06)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(26,115,232,0.4)"
                    : "1px solid transparent",
                  cursor: "pointer",
                  transition: "background 180ms, border 180ms",
                  animation: "biosov-sidebar-in 300ms ease forwards",
                  animationDelay: `${idx * 40}ms`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Active indicator line */}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      insetInlineStart: 0,
                      top: "20%",
                      bottom: "20%",
                      width: "3px",
                      background: "var(--color-primary)",
                      borderRadius: "0 3px 3px 0",
                    }}
                  />
                )}

                {/* Icon */}
                <span
                  style={{
                    fontSize: "18px",
                    lineHeight: 1,
                    flexShrink: 0,
                    transition: "transform 200ms",
                    transform: isHovered && !isActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {item.icon}
                </span>

                {/* Label — hidden when collapsed */}
                {!collapsed && (
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive
                        ? "#ffffff"
                        : "rgba(241,245,249,0.65)",
                      whiteSpace: "nowrap",
                      flex: 1,
                      textAlign: "start",
                      transition: "color 180ms",
                    }}
                  >
                    {item.label}
                  </span>
                )}

                {/* Badge */}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      background: "var(--color-danger)",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 700,
                      borderRadius: "9999px",
                      minWidth: "18px",
                      height: "18px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      flexShrink: 0,
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed badge dot */}
                {collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "6px",
                      insetInlineEnd: "6px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "var(--color-danger)",
                      border: "2px solid var(--bg-sidebar)",
                    }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer slot */}
      {footer && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "12px 8px",
            flexShrink: 0,
            display: "flex",
            justifyContent: collapsed ? "center" : "flex-start",
            alignItems: "center",
          }}
        >
          {footer}
        </div>
      )}
    </nav>
  );
};

/* ============================================================
   DISPLAY NAMES — لتحسين قراءة React DevTools
   ============================================================ */
DesignSystemProvider.displayName  = "DesignSystemProvider";
PageLayout.displayName            = "PageLayout";
MetricCard.displayName            = "MetricCard";
ProgressBar.displayName           = "ProgressBar";
StatusBadge.displayName           = "StatusBadge";
SectionHeader.displayName         = "SectionHeader";
ActionButton.displayName          = "ActionButton";
TimerDisplay.displayName          = "TimerDisplay";
PhotoUpload.displayName           = "PhotoUpload";
NumberInput.displayName           = "NumberInput";
AlertBanner.displayName           = "AlertBanner";
ScoreDisplay.displayName          = "ScoreDisplay";
RatingSelector.displayName        = "RatingSelector";
ToggleSwitch.displayName          = "ToggleSwitch";
StreakCounter.displayName         = "StreakCounter";
BodyMap.displayName               = "BodyMap";
SpecialistCard.displayName        = "SpecialistCard";
CircularGauge.displayName         = "CircularGauge";
SparkLine.displayName             = "SparkLine";
TimelineBar.displayName           = "TimelineBar";
TabBar.displayName                = "TabBar";
StatsRow.displayName              = "StatsRow";
ChatBubble.displayName            = "ChatBubble";
ToastProvider.displayName         = "ToastProvider";
SkeletonRect.displayName          = "SkeletonRect";
SkeletonText.displayName          = "SkeletonText";
SkeletonAvatar.displayName        = "SkeletonAvatar";
SkeletonCard.displayName          = "SkeletonCard";
Tabs.displayName                  = "Tabs";
CircularProgressRing.displayName  = "CircularProgressRing";
NavigationSidebar.displayName     = "NavigationSidebar";
