import pathlib

content = """# BioSovereignty Platform — PROJECT BRAIN v1.2
> انسخ هذا الملف كاملاً في بداية كل محادثة جديدة

---

## [IDENTITY]
- المنصة: Your Health (BioSovereignty) — تطبيق صحي شخصي
- المالك: د. أسامة بن محمود (المستخدم الوحيد)
- المرحلة: بناء MVP
- السوق: السعودية أولاً، ثم توسع بعد 3 أشهر تجريبية مع 10 أشخاص

---

## [STACK]
Frontend   : Next.js 14 (App Router) + PWA
Backend    : Supabase Self-Hosted (PostgreSQL + Auth + Storage + RLS)
AI         : Claude API — Sonnet لكل شيء
Automation : n8n Self-Hosted
Hosting    : Hetzner VPS — IP: 178.104.115.233
Ports      : Supabase -> :8000
Paths      : /opt/biosovereignty/supabase/docker

---

## [POWERSHELL + PYTHON RULES — مهم جداً]
- لكتابة ملفات TSX/عربي: استخدم Python دائماً (أموثوق من PowerShell)
- سكريبت Python: pathlib.Path(r"C:\\path").write_text(content, encoding="utf-8")
- PowerShell فقط لـ: تشغيل الأوامر (npx, npm, git)
- لا تستخدم Set-Content أبداً (يكسر encoding العربي)
- لا تستخدم pwsh (غير مثبت) — استخدم: powershell
- Emoji في PowerShell strings: unicode escape \\uD83D\\uDCAA
- Python مثبت: Python 3.14.3 في C:\\Python314\\

---

## [DATABASE — 17 جدول]
profiles, daily_logs, meals, workouts, supplements, water_logs,
inbody_reports, lab_results, conversations, meeting_rooms, alerts,
supplement_changes, memory_snapshots, behavioral_scores, pr_records
+ RLS مفعّل

workouts schema: id, user_id, date, exercise_name(text), sets(jsonb: [{weight,reps,rpe}]), hrv_at_time(int), recovery_score(int), knee_flagged(bool), ai_suggestion(text), notes(text)
pr_records schema: id, user_id, exercise_name, weight, reps, date

---

## [DESIGN SYSTEM — معتمد]
--bg-main: #EEF2F8 | --bg-card: #FFFFFF | --bg-card-dark: #1A2744
--bg-sidebar: #0F1629 | --bg-breakdown: #1E2D3D
--color-primary: #7C3AED | --color-success: #00A87A
--color-warning: #F59E0B | --color-danger: #EF4444
--radius-card: 14px | Font: Cairo (Arabic) / DM Sans (English)
- الصفحات تستخدم: maxWidth 900px، padding 20px 32px، gap 14px
- البطاقات تستخدم: width 100%، boxSizing border-box، لا 100vw أبداً
- الـ container الرئيسي: max-w-2xl mx-auto px-4 (Tailwind) أو maxWidth 900px (inline)

---

## [I18N — ثنائي اللغة]
- زر تبديل EN / عر في كل صفحة
- العربية: dir="rtl" | الإنجليزية: dir="ltr"
- النصوص العربية في Python تُكتب مباشرة (UTF-8)
- النصوص العربية في PowerShell strings تُكتب كـ unicode escape

---

## [WHOOP INTEGRATION]
- طريقة الإدخال: صورة screenshot من تطبيق WHOOP + Claude Vision
- البيانات: Recovery Score، HRV، RHR، Sleep Performance، Strain
- لا يوجد OAuth token — الاستخراج يعتمد على تحليل الصورة

---

## [MEMORY]
- كل متخصص يحتفظ بسياق مستقل من conversations table
- يُجلب آخر 5 محادثات per specialist عند بدء كل جلسة
- يُخزَّن الملخص في memory_snapshots بعد كل محادثة

---

## [COMPLETED]
- VPS + Docker + Supabase Self-Hosted يعمل
- 17 جدول + RLS
- n8n Self-Hosted
- Next.js 14 skeleton
- lib/supabase.ts + lib/claude.ts
- واجهة Dashboard + Team (معتمدة)
- Design System JSX
- S-01 Auth + middleware
- S-02 Profile setup
- S-03 Goals setup
- S-04 Dashboard 2-A — WhoopMetrics + ScoreCards + FastingTimer + ProgressBars + EmptyWhoop
- S-04 Dashboard 2-B — FastingTimerDetailed + useFastingTimer + Realtime
- S-04 Dashboard 2-C — NutritionSection + WaterQuickAdd + StreakCounter + Realtime
- S-05 WHOOP Daily Log + S-05b (مكتملة)
- S-06 تسجيل الماء — WaterPage + useWaterLog + Realtime
- S-07 Daily Score — DailyScoreCard + DashboardHeader + Weekly Strip + Quick Actions
- S-08b Debate Mode — Courtroom + Claude API + Archive + Quota 3/day
- S-09 صفحة الفريق — 14 متخصص + بطاقات + Empty State (static HTML معتمد)
- S-09c PhasePrep v5 — مكتملة ومعتمدة:
  * Hero داكن مضغوط مع orbs + grid pattern
  * Layout صفحة واحدة بدون scroll (height: 100vh)
  * Grid 2×N مرن — يتكيف مع عدد التمارين
  * البطاقة الأخيرة الفردية تمتد عمودين (gridColumn: span 2)
  * صور العضلات SVG مخصصة لكل عضلة (chest/back/biceps/triceps/shoulders/legs)
  * زر EN/عر في الـ Hero
  * Bottom Sheet إعدادات الراحة (60s/90s/120s/180s + مخصص)
  * Sticky button مع shine animation
  * i18n كامل RTL/LTR
  * encoding: Python write_text UTF-8 (لا PowerShell)
- S-09c PhaseActive v2 — Rest Timer مضاف:
  * RestTimer component: SVG countdown circle + أرقام تنازلية
  * يبدأ تلقائياً بعد إكمال كل set (ما عدا الأخيرة)
  * زر "تخطي الراحة"
  * navigator.vibrate عند انتهاء الوقت
  * يختفي تلقائياً عند انتهاء الـ countdown
  * restSecondsDefault prop من PhasePrep

---

## [STATUS]
آخر تحديث  : 2026-04-23
آخر إنجاز  : S-09c PhasePrep v5 + PhaseActive Rest Timer
الخطوة القادمة: S-09c PhaseActive — تحسينات (RPE visual selector + PR celebration)

---

## [ROADMAP — 4 أسابيع]
- W1: Design System + Auth + Dashboard حي + WHOOP ربط ✅
- W2: الفريق وظيفي + ذاكرة حقيقية + غرفة الاجتماع ✅
- W3: التمارين + الوجبات + المكملات (جاري)
- W4: التقارير + n8n + ضبط + PWA + إطلاق

---

## [WORKOUT MODULE — تفاصيل تقنية]
المسار: C:\\nextapp\\app\\workout\\
الملفات:
- page.tsx — Server Component، يجلب dailyContext من Supabase
- WorkoutClient.tsx — Client Component، state machine للـ phases
- exercises.ts — قائمة التمارين + DEFAULT_WEEKLY_PLAN + getTodayPlan()
- useWorkoutSession.ts — Hook للـ session state
- components/PhasePrep.tsx — شاشة التحضير (معتمدة v5)
- components/PhaseActive.tsx — شاشة التمرين الفعلي (Rest Timer مضاف)
- components/PhaseRest.tsx — شاشة الراحة بين التمارين
- components/PhaseWhoop.tsx — رفع صورة WHOOP
- components/PhaseSummary.tsx — ملخص الجلسة

DEFAULT_WEEKLY_PLAN:
- 0 (أحد): راحة
- 1 (اثنين): صدر + ثنائي
- 2 (ثلاثاء): ظهر + ثلاثي
- 3 (أربعاء): ظهر + ثلاثي (للاختبار — الأصل: راحة فعّالة)
- 4 (خميس): أرجل
- 5 (جمعة): كتف + عضلات صغيرة
- 6 (سبت): راحة

---

## [CORE MODULES]
Dashboard  : Recovery+HRV, Fasting Timer, Protein/Water bars, Daily Score, BioSov Score/1000
Team       : 14 متخصص، Specialist Memory، Smart Context، Meeting Room
Workouts   : Smart weight suggestion، Fatigue Map، Knee tracker
Meals      : Photo analysis (Claude Vision)، Fasting window، Barcode scan
Supplements: Dynamic time windows، Smart Interaction Alerts
Analytics  : Daily Score/100، BioSov Score/1000، Trigger Mapping
Archive    : Time Machine، Doctor PDF export، Quarterly report

---

## [ROLES]
CTO -> "بصفتك CTO للمنصة، راجع STATUS أعلاه وأخبرني بـ [السؤال]"
DEV -> "بصفتك DEV، اكتب كود [المهمة] بـ Next.js 14 / Supabase / TypeScript"
UI  -> "صمم واجهة [الصفحة] متوافقة مع Design System أعلاه"

---

## [TOKEN RULES]
1. محادثة = مهمة واحدة فقط
2. ابدأ بـ OUTPUT: للحصول على كود مباشر
3. لا تكرر الكود الموجود — فقط الإضافات والتغييرات
4. اكتب الملفات دائماً عبر Python script (لا PowerShell لملفات TSX)
"""

pathlib.Path(r"C:\\nextapp\\BRAIN.md").write_text(content, encoding="utf-8")
print("Done")