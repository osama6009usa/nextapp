'use client'
interface Props { lang: 'ar' | 'en'; userId: string }
export default function MonthlyReview({ lang }: Props) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 28 }}>\uD83D\uDCC5</div>
      <div style={{ fontWeight: 700 }}>{lang === 'ar' ? '\u0645\u0631\u0627\u062C\u0639\u0629 \u0634\u0647\u0631 \u0645\u0627\u0631\u0633 2026' : 'March 2026 Review'}</div>
      <div style={{ fontSize: 11 }}>{lang === 'ar' ? '\u0633\u064A\u062A\u0645 \u0628\u0646\u0627\u0624\u0647 \u0641\u064A \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629' : 'Coming in next sprint'}</div>
    </div>
  )
}