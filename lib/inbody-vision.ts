export type InBodyResult = {
  weight?: number | null;
  bmi?: number | null;
  body_fat_percent?: number | null;
  muscle_mass?: number | null;
  visceral_fat?: number | null;
  bmr?: number | null;
  raw_text?: string;
  error?: string;
};

const INBODY_PROMPT = `أنت نظام استخراج بيانات طبية متخصص في تقارير InBody.
المطلوب: استخرج هذه القيم من التقرير — إذا لم تجد قيمة اكتب null:
- weight: الوزن بالكيلوغرام
- bmi: مؤشر كتلة الجسم
- body_fat_percent: نسبة الدهون %
- muscle_mass: الكتلة العضلية بالكيلوغرام
- visceral_fat: دهون الأحشاء
- bmr: معدل الأيض الأساسي بالسعرات
قواعد: أرجع JSON فقط بدون شرح أو markdown. إذا الملف غير واضح: {"error":"NOT_INBODY"}. لا تخمّن.`;

async function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve({ data: result.split(",")[1], mediaType: file.type });
    };
    reader.onerror = () => reject(new Error("فشل قراءة الملف"));
    reader.readAsDataURL(file);
  });
}

export async function analyzeInBodyReport(file: File): Promise<InBodyResult> {
  try {
    const { data: base64, mediaType } = await fileToBase64(file);
    const isPDF = mediaType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = mediaType.startsWith("image/");
    if (!isPDF && !isImage) return { error: "نوع الملف غير مدعوم. استخدم صورة أو PDF." };

    const contentBlock = isPDF
      ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
      : { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } };

    const res = await fetch("/api/claude-vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: contentBlock, prompt: INBODY_PROMPT }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    if (result.error === "NOT_INBODY")
      return { error: "الملف لا يبدو تقرير InBody — تأكد من رفع التقرير الصحيح" };
    return result as InBodyResult;
  } catch (err) {
    console.error("[InBody Vision Error]", err);
    return { error: "حدث خطأ أثناء تحليل التقرير. حاول مرة أخرى." };
  }
}
