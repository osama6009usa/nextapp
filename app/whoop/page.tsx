"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// ─── Types ──────────────────────────────────────────────────────────────────
interface WhoopData {
  recovery_percent: number | null;
  hrv_ms: number | null;
  sleep_hours: number | null;
  sleep_performance: number | null;
  strain: number | null;
  resting_hr: number | null;
  deep_sleep_hours: number | null;
  rem_sleep_hours: number | null;
  sleep_consistency_percent: number | null;
  sleep_efficiency_percent: number | null;
}

type Stage = "upload" | "processing" | "review" | "saving" | "done" | "error";

const FIELD_META: Record<
  keyof WhoopData,
  { labelAr: string; labelEn: string; unit: string; icon: string; min: number; max: number }
> = {
  recovery_percent:        { labelAr: "الاستشفاء",         labelEn: "Recovery",          unit: "%",  icon: "💚", min: 0, max: 100 },
  hrv_ms:                  { labelAr: "تقلب معدل القلب",    labelEn: "HRV",               unit: "ms", icon: "❤️", min: 0, max: 200 },
  sleep_hours:             { labelAr: "ساعات النوم",        labelEn: "Sleep Hours",        unit: "h",  icon: "🌙", min: 0, max: 24  },
  sleep_performance:       { labelAr: "أداء النوم",         labelEn: "Sleep Performance",  unit: "%",  icon: "⭐", min: 0, max: 100 },
  strain:                  { labelAr: "الإجهاد",            labelEn: "Strain",             unit: "",   icon: "🔥", min: 0, max: 21  },
  resting_hr:              { labelAr: "معدل القلب أثناء الراحة", labelEn: "Resting HR",    unit: "bpm",icon: "💓", min: 30, max: 120 },
  deep_sleep_hours:        { labelAr: "النوم العميق",       labelEn: "Deep Sleep",         unit: "h",  icon: "🔵", min: 0, max: 10  },
  rem_sleep_hours:         { labelAr: "نوم REM",            labelEn: "REM Sleep",          unit: "h",  icon: "🟣", min: 0, max: 10  },
  sleep_consistency_percent:{ labelAr: "انتظام النوم",      labelEn: "Sleep Consistency",  unit: "%",  icon: "📅", min: 0, max: 100 },
  sleep_efficiency_percent: { labelAr: "كفاءة النوم",       labelEn: "Sleep Efficiency",   unit: "%",  icon: "⚡", min: 0, max: 100 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getRecoveryColor = (val: number | null) => {
  if (val === null) return "#F59E0B";
  if (val >= 67) return "#22C55E";
  if (val >= 34) return "#F59E0B";
  return "#EF4444";
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function WhoopLogPage() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [stage, setStage] = useState<Stage>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [data, setData] = useState<WhoopData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const t = (ar: string, en: string) => lang === "ar" ? ar : en;
  const isRTL = lang === "ar";

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFiles = useCallback((incoming: File[]) => {
    const imgs = incoming.filter(f => f.type.startsWith("image/")).slice(0, 7);
    setFiles(imgs);
    const urls = imgs.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, [handleFiles]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
  };

  // ── Claude Vision extraction ───────────────────────────────────────────────
  const extractData = async () => {
    if (files.length === 0) return;
    setStage("processing");
    setErrorMsg("");

    try {
      const formData = new FormData();
      files.forEach(f => formData.append("images", f));

      const res = await fetch("/api/whoop/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
      setStage("review");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStage("error");
    }
  };

  // ── Save to Supabase ───────────────────────────────────────────────────────
  const saveLog = async () => {
    if (!data) return;
    setStage("saving");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("daily_logs").insert({
        user_id: user.id,
        date,
        ...data,
      });

      if (error) throw error;
      setStage("done");
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
      setStage("error");
    }
  };

  const updateField = (key: keyof WhoopData, val: string) => {
    setData(prev => prev ? { ...prev, [key]: val === "" ? null : parseFloat(val) } : prev);
  };

  const nullCount = data ? Object.values(data).filter(v => v === null).length : 0;

  // ═══════════════════════════════ RENDER ═══════════════════════════════════
  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{
      minHeight: "100vh",
      background: "#EEF2F8",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "0",
    }}>

      {/* ── Header ── */}
      <header style={{
        background: "#0F1629",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              width: 36,
              height: 36,
              cursor: "pointer",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isRTL ? "→" : "←"}
          </button>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>
              {t("سجل WHOOP اليومي", "WHOOP Daily Log")}
            </div>
            <div style={{ color: "#94A3B8", fontSize: 12 }}>
              {t("استخراج تلقائي بالذكاء الاصطناعي", "AI-powered auto extraction")}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Date picker */}
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              color: "#fff",
              padding: "6px 10px",
              fontSize: 13,
              cursor: "pointer",
            }}
          />
          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === "ar" ? "en" : "ar")}
            style={{
              background: "rgba(79,70,229,0.3)",
              border: "1px solid rgba(79,70,229,0.5)",
              borderRadius: 8,
              color: "#A5B4FC",
              padding: "6px 14px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {lang === "ar" ? "EN" : "AR"}
          </button>
        </div>
      </header>

      {/* ── Progress steps ── */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #E2E8F0",
        padding: "12px 24px",
      }}>
        <StepIndicator stage={stage} lang={lang} />
      </div>

      {/* ── Content ── */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>

        {/* STAGE: upload */}
        {stage === "upload" && (
          <UploadZone
            lang={lang}
            files={files}
            previews={previews}
            dragOver={dragOver}
            fileInputRef={fileInputRef}
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onFileChange={onFileChange}
            onExtract={extractData}
          />
        )}

        {/* STAGE: processing */}
        {stage === "processing" && (
          <ProcessingState lang={lang} imageCount={files.length} />
        )}

        {/* STAGE: review (S-05b) */}
        {stage === "review" && data && (
          <ReviewStage
            lang={lang}
            data={data}
            date={date}
            nullCount={nullCount}
            previews={previews}
            onUpdate={updateField}
            onSave={saveLog}
            onRetry={() => { setData(null); setStage("upload"); }}
          />
        )}

        {/* STAGE: saving */}
        {stage === "saving" && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💾</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0F1629" }}>
              {t("جارٍ الحفظ...", "Saving...")}
            </div>
          </div>
        )}

        {/* STAGE: done */}
        {stage === "done" && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#22C55E" }}>
              {t("تم الحفظ بنجاح!", "Saved successfully!")}
            </div>
            <div style={{ color: "#64748B", marginTop: 8 }}>
              {t("سيتم تحويلك للداشبورد...", "Redirecting to dashboard...")}
            </div>
          </div>
        )}

        {/* STAGE: error */}
        {stage === "error" && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#EF4444", marginBottom: 8 }}>
              {t("حدث خطأ", "Something went wrong")}
            </div>
            <div style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 10,
              padding: "12px 20px",
              color: "#EF4444",
              fontSize: 13,
              maxWidth: 500,
              margin: "0 auto 24px",
              textAlign: "start",
              direction: "ltr",
            }}>
              {errorMsg}
            </div>
            <button
              onClick={() => { setErrorMsg(""); setStage("upload"); }}
              style={{
                background: "#4F46E5",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "12px 32px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t("🔄 إعادة المحاولة", "🔄 Try Again")}
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

// ─── StepIndicator ─────────────────────────────────────────────────────────
function StepIndicator({ stage, lang }: { stage: Stage; lang: "ar" | "en" }) {
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;
  const steps = [
    { key: "upload",     ar: "رفع الصور",   en: "Upload" },
    { key: "processing", ar: "معالجة AI",   en: "AI Processing" },
    { key: "review",     ar: "مراجعة",       en: "Review" },
    { key: "saving",     ar: "حفظ",          en: "Save" },
  ];

  const order = ["upload", "processing", "review", "saving", "done"];
  const currentIdx = order.indexOf(stage === "error" ? "upload" : stage);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {steps.map((s, i) => {
        const stepIdx = order.indexOf(s.key);
        const active = stepIdx === currentIdx;
        const done = stepIdx < currentIdx;
        return (
          <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: done ? "#22C55E" : active ? "#4F46E5" : "#E2E8F0",
                color: done || active ? "#fff" : "#94A3B8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, flexShrink: 0,
                transition: "all 300ms",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: 13, fontWeight: active ? 700 : 400,
                color: active ? "#0F1629" : done ? "#22C55E" : "#94A3B8",
              }}>
                {t(s.ar, s.en)}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: done ? "#22C55E" : "#E2E8F0",
                margin: "0 12px",
                transition: "background 300ms",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── UploadZone ────────────────────────────────────────────────────────────
function UploadZone({ lang, files, previews, dragOver, fileInputRef, onDrop, onDragOver, onDragLeave, onFileChange, onExtract }: {
  lang: "ar" | "en";
  files: File[];
  previews: string[];
  dragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExtract: () => void;
}) {
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  return (
    <div>
      {/* Upload zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "#4F46E5" : files.length > 0 ? "#22C55E" : "#CBD5E1"}`,
          borderRadius: 16,
          background: dragOver ? "rgba(79,70,229,0.04)" : "#fff",
          padding: "48px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 250ms",
          marginBottom: 24,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={onFileChange}
        />
        <div style={{ fontSize: 48, marginBottom: 12 }}>
          {files.length > 0 ? "🖼️" : "📤"}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#0F1629", marginBottom: 8 }}>
          {files.length > 0
            ? t(`تم اختيار ${files.length} صورة`, `${files.length} images selected`)
            : t("اسحب صور WHOOP هنا", "Drag WHOOP screenshots here")}
        </div>
        <div style={{ color: "#94A3B8", fontSize: 14, marginBottom: 4 }}>
          {t("أو انقر للاختيار من المعرض", "or click to pick from gallery")}
        </div>
        <div style={{
          display: "inline-block",
          background: "#F1F5F9",
          borderRadius: 8,
          padding: "4px 12px",
          fontSize: 12,
          color: "#64748B",
          marginTop: 8,
        }}>
          {t("الحد الأقصى: 7 صور", "Max: 7 images")}
        </div>
      </div>

      {/* Preview thumbnails */}
      {previews.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
          gap: 12,
          marginBottom: 28,
        }}>
          {previews.map((url, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img
                src={url}
                alt={`WHOOP ${i + 1}`}
                style={{
                  width: "100%",
                  aspectRatio: "9/16",
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "2px solid #E2E8F0",
                }}
              />
              <div style={{
                position: "absolute",
                top: 6,
                insetInlineStart: 6,
                background: "rgba(0,0,0,0.6)",
                borderRadius: 6,
                padding: "2px 6px",
                fontSize: 11,
                color: "#fff",
                fontWeight: 700,
              }}>
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* What Claude will extract */}
      <div style={{
        background: "rgba(79,70,229,0.05)",
        border: "1px solid rgba(79,70,229,0.15)",
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 28,
      }}>
        <div style={{ fontWeight: 700, color: "#4F46E5", marginBottom: 10, fontSize: 14 }}>
          {t("ما سيستخرجه الذكاء الاصطناعي تلقائياً:", "What AI will extract automatically:")}
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 8,
        }}>
          {Object.entries(FIELD_META).map(([key, meta]) => (
            <div key={key} style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#475569",
            }}>
              <span>{meta.icon}</span>
              <span>{lang === "ar" ? meta.labelAr : meta.labelEn}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Extract button */}
      <button
        onClick={onExtract}
        disabled={files.length === 0}
        style={{
          width: "100%",
          background: files.length > 0
            ? "linear-gradient(135deg, #4F46E5, #7C3AED)"
            : "#E2E8F0",
          color: files.length > 0 ? "#fff" : "#94A3B8",
          border: "none",
          borderRadius: 12,
          padding: "16px",
          fontSize: 16,
          fontWeight: 700,
          cursor: files.length > 0 ? "pointer" : "not-allowed",
          transition: "all 200ms",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <span>✨</span>
        {t("استخراج البيانات بالذكاء الاصطناعي", "Extract Data with AI")}
      </button>
    </div>
  );
}

// ─── ProcessingState ────────────────────────────────────────────────────────
function ProcessingState({ lang, imageCount }: { lang: "ar" | "en"; imageCount: number }) {
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      {/* Animated logo */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
        margin: "0 auto 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 36,
        animation: "pulse 1.5s infinite",
        boxShadow: "0 0 0 0 rgba(79,70,229,0.4)",
      }}>
        🤖
      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(79,70,229,0.4); }
          70% { box-shadow: 0 0 0 20px rgba(79,70,229,0); }
          100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ fontSize: 22, fontWeight: 700, color: "#0F1629", marginBottom: 8 }}>
        {t("جارٍ تحليل الصور...", "Analyzing images...")}
      </div>
      <div style={{ color: "#64748B", fontSize: 15, marginBottom: 32 }}>
        {t(
          `Claude يقرأ ${imageCount} صور من WHOOP ويستخرج بياناتك`,
          `Claude is reading ${imageCount} WHOOP screenshots`
        )}
      </div>

      {/* Steps */}
      {[
        t("تحميل الصور وتحضيرها", "Loading & preparing images"),
        t("إرسال إلى Claude Vision", "Sending to Claude Vision"),
        t("استخراج القيم الصحية", "Extracting health metrics"),
        t("التحقق من البيانات", "Validating data"),
      ].map((step, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            maxWidth: 380,
            margin: "0 auto 12px",
            textAlign: "start",
            direction: lang === "ar" ? "rtl" : "ltr",
          }}
        >
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#4F46E5",
            animation: `pulse ${1 + i * 0.3}s infinite ${i * 0.2}s`,
            flexShrink: 0,
          }} />
          <span style={{ color: "#475569", fontSize: 14 }}>{step}</span>
        </div>
      ))}
    </div>
  );
}

// ─── ReviewStage (S-05b) ────────────────────────────────────────────────────
function ReviewStage({ lang, data, date, nullCount, previews, onUpdate, onSave, onRetry }: {
  lang: "ar" | "en";
  data: WhoopData;
  date: string;
  nullCount: number;
  previews: string[];
  onUpdate: (key: keyof WhoopData, val: string) => void;
  onSave: () => void;
  onRetry: () => void;
}) {
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  const recoveryVal = data.recovery_percent;
  const recoveryColor = getRecoveryColor(recoveryVal);

  return (
    <div>
      {/* Summary hero card */}
      <div style={{
        background: `linear-gradient(135deg, ${recoveryColor}22, ${recoveryColor}11)`,
        border: `2px solid ${recoveryColor}44`,
        borderRadius: 16,
        padding: "24px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 4 }}>
            {t("نتائج الاستخراج — بتاريخ", "Extraction results — date")} {date}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0F1629" }}>
            {recoveryVal !== null
              ? t(`استشفاء ${recoveryVal}%`, `Recovery ${recoveryVal}%`)
              : t("الاستشفاء غير متوفر", "Recovery N/A")}
          </div>
          {nullCount > 0 && (
            <div style={{
              marginTop: 8,
              background: "#FEF9C3",
              border: "1px solid #FDE047",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 13,
              color: "#92400E",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}>
              ⚠️ {t(
                `${nullCount} قيم تحتاج إدخال يدوي`,
                `${nullCount} values need manual input`
              )}
            </div>
          )}
        </div>

        {/* Recovery gauge */}
        <div style={{ textAlign: "center" }}>
          <RecoveryGauge value={recoveryVal} color={recoveryColor} />
        </div>
      </div>

      {/* Metric cards grid */}
      <div style={{ marginBottom: 8, fontWeight: 700, color: "#0F1629", fontSize: 16 }}>
        {t("راجع وعدّل القيم المستخرجة:", "Review & edit extracted values:")}
      </div>
      <div style={{ color: "#64748B", fontSize: 13, marginBottom: 20 }}>
        {t("القيم المظللة بالأصفر تحتاج إدخال يدوي", "Yellow-highlighted values need manual input")}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 14,
        marginBottom: 28,
      }}>
        {(Object.keys(FIELD_META) as (keyof WhoopData)[]).map(key => {
          const meta = FIELD_META[key];
          const val = data[key];
          const isNull = val === null;

          return (
            <div
              key={key}
              style={{
                background: isNull ? "#FFFBEB" : "#fff",
                border: `2px solid ${isNull ? "#FDE047" : "#E2E8F0"}`,
                borderRadius: 14,
                padding: "16px",
                transition: "border-color 200ms",
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}>
                <div style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
                  <span style={{ marginInlineEnd: 6 }}>{meta.icon}</span>
                  {lang === "ar" ? meta.labelAr : meta.labelEn}
                </div>
                {isNull && (
                  <span style={{
                    background: "#FEF08A",
                    color: "#92400E",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 6,
                  }}>
                    {t("مطلوب", "Required")}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  value={val ?? ""}
                  min={meta.min}
                  max={meta.max}
                  step="0.01"
                  placeholder={isNull ? t("أدخل القيمة", "Enter value") : ""}
                  onChange={e => onUpdate(key, e.target.value)}
                  style={{
                    flex: 1,
                    border: `1.5px solid ${isNull ? "#FDE047" : "#E2E8F0"}`,
                    borderRadius: 8,
                    padding: "8px 10px",
                    fontSize: 20,
                    fontWeight: 700,
                    color: isNull ? "#92400E" : "#0F1629",
                    background: "transparent",
                    outline: "none",
                    width: "100%",
                  }}
                />
                <span style={{ color: "#94A3B8", fontSize: 12, flexShrink: 0 }}>
                  {meta.unit}
                </span>
              </div>

              {/* Mini progress bar for percentage fields */}
              {meta.unit === "%" && val !== null && (
                <div style={{
                  marginTop: 8,
                  height: 4,
                  background: "#E2E8F0",
                  borderRadius: 99,
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min(100, Math.max(0, val as number))}%`,
                    background: (val as number) >= 70 ? "#22C55E" : (val as number) >= 40 ? "#F59E0B" : "#EF4444",
                    borderRadius: 99,
                    transition: "width 400ms ease",
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Original images reference */}
      {previews.length > 0 && (
        <details style={{ marginBottom: 28 }}>
          <summary style={{
            cursor: "pointer",
            color: "#4F46E5",
            fontWeight: 600,
            fontSize: 14,
            marginBottom: 12,
            userSelect: "none",
          }}>
            {t(`📸 عرض الصور الأصلية (${previews.length})`, `📸 View original images (${previews.length})`)}
          </summary>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 10,
            marginTop: 12,
          }}>
            {previews.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`WHOOP ${i + 1}`}
                style={{
                  width: "100%",
                  aspectRatio: "9/16",
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "2px solid #E2E8F0",
                }}
              />
            ))}
          </div>
        </details>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onRetry}
          style={{
            flex: 1,
            background: "#F1F5F9",
            color: "#475569",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: "14px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t("🔄 إعادة المحاولة", "🔄 Retry")}
        </button>
        <button
          onClick={onSave}
          disabled={nullCount > 0}
          style={{
            flex: 2,
            background: nullCount > 0
              ? "#E2E8F0"
              : "linear-gradient(135deg, #22C55E, #16A34A)",
            color: nullCount > 0 ? "#94A3B8" : "#fff",
            border: "none",
            borderRadius: 12,
            padding: "14px",
            fontSize: 16,
            fontWeight: 700,
            cursor: nullCount > 0 ? "not-allowed" : "pointer",
            transition: "all 200ms",
          }}
        >
          {nullCount > 0
            ? t(`أكمل ${nullCount} قيم أولاً`, `Complete ${nullCount} values first`)
            : t("✅ تأكيد وحفظ", "✅ Confirm & Save")}
        </button>
      </div>
    </div>
  );
}

// ─── RecoveryGauge ──────────────────────────────────────────────────────────
function RecoveryGauge({ value, color }: { value: number | null; color: string }) {
  const pct = value !== null ? Math.min(100, Math.max(0, value)) : 0;
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ position: "relative", width: 100, height: 100 }}>
      <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 800ms ease" }}
        />
      </svg>
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>
          {value ?? "—"}
        </div>
        <div style={{ fontSize: 10, color: "#94A3B8" }}>%</div>
      </div>
    </div>
  );
}
