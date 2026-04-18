# BioSovereignty Platform — PROJECT BRAIN v1.1
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

## [POWERSHELL RULES — مهم جداً]
- دائماً اكتب الملفات عبر: [System.IO.File]::WriteAllText(path, content, [System.Text.UTF8Encoding]::new($false))
- لا تستخدم Set-Content أبداً (يكسر encoding العربي)
- لا تستخدم pwsh (غير مثبت) — استخدم: powershell -ExecutionPolicy Bypass -File script.ps1
- لتشغيل سكريبت: انسخ والصق مباشرة في PowerShell
- Emoji تُكتب دائماً كـ unicode escape: \uD83D\uDCAA وليس مباشرة

---

## [DATABASE — 17 جدول]
profiles, daily_logs, meals, workouts, supplements, water_logs,
inbody_reports, lab_results, conversations, meeting_rooms, alerts,
supplement_changes, memory_snapshots, behavioral_scores, pr_records
+ RLS مفعّل

---

## [DESIGN SYSTEM — معتمد]
--bg-main: #EEF2F8 | --bg-card: #FFFFFF | --bg-card-dark: #1A2744
--bg-sidebar: #0F1629 | --bg-breakdown: #1E2D3D
--color-primary: #7C3AED | --color-success: #00A87A
--color-warning: #F59E0B | --color-danger: #EF4444
--radius-card: 14px | Font: system-ui Arabic-first
- الصفحات تستخدم: maxWidth 900px، padding 20px 32px، gap 14px
- البطاقات تستخدم: width 100%، boxSizing border-box، لا 100vw أبداً
- الـ container الرئيسي: max-w-2xl mx-auto px-4 (Tailwind) أو maxWidth 900px (inline)

---

## [I18N — ثنائي اللغة]
- زر تبديل EN / عر في كل صفحة
- العربية: dir="rtl" | الإنجليزية: dir="ltr"
- النصوص العربية تُكتب كـ unicode escape في PowerShell
- مثال: "\u0645\u0631\u062D\u0628\u0627" = مرحبا

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
  * CircularGauge (half-circle SVG) + BioSov dark card
  * Axis Breakdown (collapsible) + OneAction banner
  * DashboardHeader: تاريخ + وقت حي + streak + زر EN/عر
  * Quick Actions row: ماء / وجبة / تمرين / نوم / مكمل
  * Weekly strip: 7 أيام مع score ملون
  * i18n كامل: RTL عربي / LTR إنجليزي
  * suppressHydrationWarning على الساعة
  * maxWidth 900px desktop-first

---

## [STATUS]
آخر تحديث  : 2026-04-19
آخر إنجاز  : S-07 Daily Score — Layout fix + DashboardHeader + i18n + Quick Actions + Weekly Strip
الخطوة القادمة: S-08 صفحة الفريق

---

## [ROADMAP — 4 أسابيع]
- W1: Design System + Auth + Dashboard حي + WHOOP ربط
- W2: الفريق وظيفي + ذاكرة حقيقية + غرفة الاجتماع
- W3: التمارين + الوجبات + المكملات
- W4: التقارير + n8n + ضبط + PWA + إطلاق

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
4. اكتب الملفات دائماً عبر PowerShell script