"use client";
import { useState, useRef } from "react";
import { analyzeInBodyReport, type InBodyResult } from "@/lib/inbody-vision";

interface Step2Data {
  inbody_file?: File | null;
  inbody_result?: InBodyResult | null;
  inbody_error?: string;
  has_htma: boolean | null;
  htma_file?: File | null;
  has_whoop: boolean | null;
  whoop_placement?: "left_wrist" | "right_wrist" | "upper_arm" | "ankle" | null;
}

interface Step2Props {
  data: Step2Data;
  onChange: (updates: Partial<Step2Data>) => void;
}

const WHOOP_PLACEMENTS = [
  { value: "left_wrist",  label: "المعصم الأيسر", icon: "🤚" },
  { value: "right_wrist", label: "المعصم الأيمن", icon: "✋" },
  { value: "upper_arm",   label: "العضد",          icon: "💪" },
  { value: "ankle",       label: "الكاحل",          icon: "🦵" },
] as const;

function FileUploadZone({ accept, label, hint, file, onChange }: {
  accept: string; label: string; hint: string;
  file: File | null | undefined; onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div onClick={() => inputRef.current?.click()} style={{
      border: "2px dashed #4F46E5", borderRadius: 12, padding: "20px 16px",
      textAlign: "center", cursor: "pointer", background: file ? "#F0FDF4" : "#F8F9FF",
    }}>
      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      {file ? (
        <div>
          <div style={{ fontSize: 24 }}>✅</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{file.name}</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>{(file.size / 1024).toFixed(0)} KB</div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 28 }}>📎</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{label}</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>{hint}</div>
        </div>
      )}
    </div>
  );
}

function BoolButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, padding: "12px 16px", borderRadius: 10,
      border: `2px solid ${active ? "#4F46E5" : "#E5E7EB"}`,
      background: active ? "#EEF2FF" : "#FFFFFF",
      color: active ? "#4F46E5" : "#374151",
      fontWeight: active ? 700 : 400, fontSize: 14, cursor: "pointer",
    }}>{label}</button>
  );
}

export default function Step2InBodyDevice({ data, onChange }: Step2Props) {
  const [analyzing, setAnalyzing] = useState(false);

  async function handleInBodyFile(file: File | null) {
    onChange({ inbody_file: file, inbody_result: null, inbody_error: undefined });
    if (!file) return;
    setAnalyzing(true);
    try {
      const result = await analyzeInBodyReport(file);
      if (result.error) onChange({ inbody_error: result.error, inbody_result: null });
      else onChange({ inbody_result: result, inbody_error: undefined });
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: "0 4px" }}>

      {/* InBody */}
      <section>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4 }}>📊 تقرير InBody</h3>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>ارفع تقرير InBody الأخير — صورة أو PDF</p>
        <FileUploadZone accept="image/*,application/pdf,.pdf" label="ارفع صورة أو PDF"
          hint="JPEG, PNG, WEBP, PDF" file={data.inbody_file} onChange={handleInBodyFile} />
        {analyzing && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "#EFF6FF", fontSize: 13 }}>
            ⏳ جاري تحليل التقرير...
          </div>
        )}
        {data.inbody_error && !analyzing && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "#FFF7ED", fontSize: 13 }}>
            ⚠️ {data.inbody_error}
            <br /><small style={{ color: "#9CA3AF" }}>تأكد من وضوح الصورة — أو أدخل البيانات يدوياً</small>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              {(["weight","bmi","body_fat_percent","muscle_mass"] as const).map((key) => {
                const labels: Record<string, string> = { weight:"الوزن (كغ)", bmi:"مؤشر الكتلة", body_fat_percent:"الدهون %", muscle_mass:"العضلات (كغ)" };
                return (
                  <input key={key} type="number" placeholder={labels[key]}
                    style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 14 }}
                    value={(data.inbody_result as any)?.[key] ?? ""}
                    onChange={(e) => onChange({ inbody_result: { ...data.inbody_result, [key]: e.target.value ? parseFloat(e.target.value) : null } })} />
                );
              })}
            </div>
          </div>
        )}
        {data.inbody_result && !data.inbody_error && (
          <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: "#F0FDF4", fontSize: 13 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>✅ تم استخراج البيانات</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {([["weight","الوزن","كغ"],["bmi","مؤشر الكتلة",""],["body_fat_percent","الدهون","%"],["muscle_mass","العضلات","كغ"],["visceral_fat","دهون الأحشاء",""],["bmr","معدل الأيض","kcal"]] as const).map(([k,l,u]) =>
                (data.inbody_result as any)?.[k] != null ? (
                  <div key={k} style={{ padding: "8px 10px", background: "#fff", borderRadius: 8, border: "1px solid #E5E7EB" }}>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{l}</div>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{(data.inbody_result as any)[k]} <span style={{ fontSize: 11, color: "#6B7280" }}>{u}</span></div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </section>

      {/* HTMA */}
      <section>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4 }}>🧪 فحص HTMA</h3>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>تحليل المعادن والسمية عبر الشعر</p>
        <div style={{ display: "flex", gap: 10 }}>
          <BoolButton active={data.has_htma === true} onClick={() => onChange({ has_htma: true })} label="نعم، لديّ فحص" />
          <BoolButton active={data.has_htma === false} onClick={() => onChange({ has_htma: false, htma_file: null })} label="لا" />
        </div>
        {data.has_htma === true && (
          <div style={{ marginTop: 12 }}>
            <FileUploadZone accept="image/*,application/pdf,.pdf" label="ارفع نتيجة HTMA"
              hint="صورة أو PDF للتقرير" file={data.htma_file} onChange={(f) => onChange({ htma_file: f })} />
          </div>
        )}
      </section>

      {/* WHOOP */}
      <section>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 12 }}>⌚ WHOOP</h3>
        <div style={{ display: "flex", gap: 10 }}>
          <BoolButton active={data.has_whoop === true} onClick={() => onChange({ has_whoop: true })} label="نعم، لديّ WHOOP" />
          <BoolButton active={data.has_whoop === false} onClick={() => onChange({ has_whoop: false, whoop_placement: null })} label="لا يوجد" />
        </div>
        {data.has_whoop === true && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#374151" }}>أين تضع WHOOP دائماً؟</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {WHOOP_PLACEMENTS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => onChange({ whoop_placement: opt.value })} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "14px 8px", borderRadius: 12, cursor: "pointer",
                  border: `2px solid ${data.whoop_placement === opt.value ? "#4F46E5" : "#E5E7EB"}`,
                  background: data.whoop_placement === opt.value ? "#EEF2FF" : "#FFFFFF",
                }}>
                  <span style={{ fontSize: 22, marginBottom: 4 }}>{opt.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
