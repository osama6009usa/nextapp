# BioSovereignty Platform — PROJECT BRAIN v1.0
> انسخ هذا الملف كاملاً في بداية كل محادثة جديدة

---

## [IDENTITY]
- المنصة: Your Health (BioSovereignty) — تطبيق صحي شخصي
- المالك: د. أسامة بن محمود (المستخدم الوحيد)
- المرحلة: تصميم → بناء MVP
- السوق: السعودية أولاً، ثم توسع بعد 3 أشهر تجريبية مع 10 أشخاص

---

## [STACK]
Frontend : Next.js 14 (App Router) + PWA
Backend  : Supabase Self-Hosted (PostgreSQL + Auth + Storage + RLS)
AI       : Claude API — Sonnet لكل شيء
Automation: n8n Self-Hosted
Hosting  : Hetzner VPS — IP: 178.104.115.233
Ports    : Supabase → :8000
Paths    : /opt/biosovereignty/supabase/docker

---

## [DATABASE — 17 جدول]
profiles, daily_logs, meals, workouts, supplements, water_logs,
inbody_reports, lab_results, conversations, meeting_rooms, alerts,
supplement_changes, memory_snapshots, behavioral_scores, pr_records
+ RLS مفعّل

---

## [DESIGN SYSTEM — معتمد]
--bg-main: #EEF2F8 | --bg-card: #FFFFFF | --bg-sidebar: #0F1629
--color-primary: #4F46E5 | --color-success: #22C55E
--color-warning: #F59E0B | --color-danger: #EF4444
--radius-card: 14px | Font: system-ui Arabic-first
Components: DesignSystemProvider, biosov-card-hover, biosov-pulse

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
- S-05 WHOOP Daily Log + S-05b (مكتملة)
- S-01 Auth + middleware
- S-02 Profile setup
- S-03 Goals setup
- S-04 Dashboard 2-A — WhoopMetrics + ScoreCards + FastingTimer + ProgressBars + EmptyWhoop
- S-04 Dashboard 2-B — FastingTimerDetailed + useFastingTimer + Realtime

---

## [STATUS]
آخر تحديث : 2026-04-12
آخر إنجاز  : S-04 Dashboard 2-B — FastingTimerDetailed يعمل
الخطوة القادمة: S-04 Dashboard 2-C — Protein + Water bars

---

## [ROADMAP — 4 اسابيع]
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
CTO → "بصفتك CTO للمنصة، راجع STATUS اعلاه وأخبرني بـ [السؤال]"
BD  → "بصفتك BD، حلّل [القرار] من زاوية المنتج والمستخدم"
DEV → "اكتب كود [المهمة] بـ Next.js 14 / Supabase / TypeScript"
UI  → "صمم واجهة [الصفحة] متوافقة مع Design System اعلاه"

---

## [TOKEN RULES]
1. محادثة = مهمة واحدة فقط
2. ابدأ بـ OUTPUT: للحصول على كود مباشر
3. لا تكرر الكود الموجود — فقط الإضافات والتغييرات