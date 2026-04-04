# YourHealth Platform — PROJECT BRAIN v1.0
> انسخ هذا الملف كاملاً في بداية كل محادثة جديدة

---

## [IDENTITY]
- المنصة: Your Health (BioSovereignty) — تطبيق صحي شخصي
- المالك: د. أسامة بن محمود (المستخدم الوحيد)
- المرحلة: تصميم → بناء MVP
- السوق: السعودية أولاً، ثم توسع بعد 3 أشهر تجريبية مع 10 أشخاص

---

## [STACK]
```
Frontend : Next.js 14 (App Router) + PWA
Backend  : Supabase Self-Hosted (PostgreSQL + Auth + Storage + RLS)
AI       : Claude API — Sonnet لكل شيء
Automation: n8n Self-Hosted
Hosting  : Hetzner VPS — IP: 178.104.115.233
           Ubuntu 24.04 + Docker 29.3.1 + Docker Compose v5.1.1
Ports    : Supabase → :8000 | n8n → (self-hosted)
Paths    : /opt/biosovereignty/supabase/docker
```

---

## [DATABASE — 17 جدول]
profiles, daily_logs, meals, workouts, supplements, water_logs,
inbody_reports, lab_results, conversations, meeting_rooms, alerts,
supplement_changes, memory_snapshots, behavioral_scores, pr_records
+ RLS مفعّل ✅

---

## [DESIGN SYSTEM — معتمد]
```css
--bg-main: #EEF2F8 | --bg-card: #FFFFFF | --bg-sidebar: #0F1629
--color-primary: #4F46E5 | --color-success: #22C55E
--color-warning: #F59E0B | --color-danger: #EF4444
--radius-card: 14px | Font: system-ui Arabic-first
```
Components: DesignSystemProvider, biosov-card-hover, biosov-pulse

---

## [WHOOP INTEGRATION]
- طريقة الإدخال: صورة screenshot من تطبيق WHOOP + Claude Vision لاستخراج البيانات
- البيانات المستخرجة: Recovery Score، HRV، RHR، Sleep Performance، Strain
- لا يوجد OAuth token — الاستخراج يعتمد كلياً على تحليل الصورة

---

## [MEMORY]
- كل متخصص يحتفظ بسياق مستقل من conversations table
- يُجلب آخر 5 محادثات per specialist من conversations table عند بدء كل جلسة
- يُخزَّن الملخص في memory_snapshots بعد كل محادثة

---

## [COMPLETED ✅]
- VPS + Docker + Supabase Self-Hosted يعمل
- 17 جدول + RLS
- n8n Self-Hosted
- Next.js 14 skeleton
- lib/supabase.ts + lib/claude.ts
- واجهة Dashboard (معتمدة)
- واجهة Team/Specialists (معتمدة)
- Design System JSX (بحاجة مراجعة)
- شاشة S-05 WHOOP Daily Log + S-05b مراجعة (مكتملة)
- تحديث Brain.md: AI Model + WHOOP + Memory

---

## [STATUS — يُحدَّث بعد كل جلسة]
```
آخر تحديث : 2026-04-04
آخر إنجاز  : S-04 — Dashboard وظيفي (Recovery + HRV + Fasting Timer + Protein + Water + Daily/BioSov Score + Skeleton Loading + Supabase real data)
الخطوة القادمة: S-06 — شاشة تسجيل الوجبات (Meal Logger مع حساب السعرات والبروتين تلقائياً)

```

---

## [ROADMAP — 4 أسابيع]
- W1: Design System + Auth + Dashboard حي + WHOOP ربط ← نحن هنا
- W2: الفريق وظيفي + ذاكرة حقيقية + غرفة الاجتماع
- W3: التمارين + الوجبات + المكملات (كامل)
- W4: التقارير + n8n + ضبط + PWA + إطلاق
- Launch: اختبار مع 10 أشخاص × 3 أشهر
---

## [CORE MODULES — ملخص]
| Module | الوصف |
|--------|--------|
| Dashboard | Recovery+HRV, Fasting Timer, Protein/Water bars, Daily Score, BioSov Score/1000 |
| Team | 14 متخصص، Specialist Memory، Smart Context، Second Opinion، Meeting Room |
| Workouts | Smart weight suggestion (WHOOP+Archive+Coach)، Fatigue Map، Knee tracker |
| Meals | Photo analysis (Claude Vision)، Fasting window، Barcode scan، Inflammatory Score |
| Supplements | Dynamic time windows، Smart Interaction Alerts، Blood correlation |
| Analytics | Daily Score/100، BioSov Score/1000، Trigger Mapping، Mood tracker |
| Archive | Time Machine، Doctor PDF export، Quarterly report، Smart search |

---

## [ROLES — كيف تستدعيها]
```
🔧 CTO   → "بصفتك CTO للمنصة، راجع STATUS أعلاه وأخبرني بـ [السؤال]"
📈 BD    → "بصفتك BD، حلّل [القرار] من زاوية المنتج والمستخدم"
⚡ DEV   → "اكتب كود [المهمة] بـ Next.js 14 / Supabase / TypeScript"
🎨 UI    → "صمم واجهة [الصفحة] متوافقة مع Design System أعلاه"
```

---

## [TOKEN RULES — قواعد التوكن]
1. محادثة = مهمة واحدة فقط
2. ابدأ دائماً بـ "OUTPUT:" للحصول على كود مباشر بدون شرح
3. ارفق Brain.md فقط + الملف المرتبط بالمهمة
4. بعد كل جلسة: حدّث STATUS بـ 3 أسطر
5. لا تطلب تصميم + كود في نفس الشات

---

## [CONNECTIONS]
- GitHub:  https://github.com/osama6009usa/yourhealth
- Supabase Dashboard: http://178.104.115.233:8000
- SSH: root@178.104.115.233
- n8n: [أضف البورت]
- Roadmap: /docs/BioSovereignty_Final_v3.md (معتمد: 2026-04-04)
