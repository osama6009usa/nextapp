'use client'
import { SPECIALISTS } from '@/lib/specialists'
import type { Specialist } from '@/lib/specialists'

interface Props {
  lang: 'ar' | 'en'
  onSpecialistClick: (s: Specialist) => void
  onOpenWI: () => void
  currentSpecialistId?: string
}

export default function SpecialistGrid({ lang, onSpecialistClick, onOpenWI, currentSpecialistId }: Props) {
  const tv = (obj: { ar: string; en: string }) => obj[lang]

  const confColor = (i: number, conf: number, color: string) =>
    i < conf ? color : 'var(--brd)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* META */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
        {[
          { v: '14', l: lang === 'ar' ? '\u0645\u062A\u062E\u0635\u0635\u0627\u064B' : 'specialists' },
          { v: 'Attia \u2022 2h', l: lang === 'ar' ? '\u0622\u062E\u0631 \u062C\u0644\u0633\u0629' : 'Last session' },
          { v: '7', l: lang === 'ar' ? '\u062C\u0644\u0633\u0627\u062A / \u0623\u0633\u0628\u0648\u0639' : 'sessions / week' },
        ].map((chip, i) => (
          <div key={i} className="meta-chip">
            <strong>{chip.v}</strong> {chip.l}
          </div>
        ))}
        <div className="meta-chip" style={{ color: 'var(--amb)', marginRight: lang === 'ar' ? 'auto' : 0, marginLeft: lang === 'en' ? 'auto' : 0 }}>
          <strong>3</strong> {lang === 'ar' ? '\u062A\u0648\u0635\u064A\u0627\u062A \u0645\u0639\u0644\u0651\u0642\u0629' : 'Pending Recommendations'}
        </div>
      </div>

      {/* BANNERS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flexShrink: 0 }}>
        <div className="banner-dark" onClick={onOpenWI}>
          <div className="bn-icon">\uD83D\uDD2E</div>
          <div>
            <div className="bn-title">{lang === 'ar' ? '\u0645\u062D\u0627\u0643\u064A \u201C\u0645\u0627\u0630\u0627 \u0644\u0648\u061F\u201D \u2014 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0623\u0645\u0633' : '"What-If?" Simulator \u2014 based on yesterday'}</div>
            <div className="bn-sub">{lang === 'ar' ? '\u063A\u064A\u0651\u0631 \u0645\u062A\u063A\u064A\u0651\u0631\u0627\u064B \u2014 \u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u062D\u0633\u0628' : 'Change one variable \u2014 team calculates'}</div>
          </div>
          <div className="bn-badge bn-badge-grn">{lang === 'ar' ? '\u062C\u062F\u064A\u062F' : 'NEW'}</div>
        </div>
        <div className="banner-purple">
          <div className="bn-icon">\u2694\uFE0F</div>
          <div>
            <div className="bn-title">{lang === 'ar' ? '\u0648\u0636\u0639 \u0627\u0644\u0645\u0646\u0627\u0638\u0631\u0629' : 'Debate Mode'}</div>
            <div className="bn-sub">{lang === 'ar' ? '\u062F\u0639 \u0645\u062A\u062E\u0635\u0635\u064A\u0646 \u064A\u062A\u062C\u0627\u062F\u0644\u0627\u0646 \u2014 \u0623\u0646\u062A \u0627\u0644\u062D\u064E\u0643\u064E\u0645' : 'Two specialists argue \u2014 you judge'}</div>
          </div>
          <div className="bn-badge bn-badge-wht">BETA</div>
        </div>
      </div>

      {/* GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, flex: 1, minHeight: 0, alignContent: 'start', overflowY: 'auto' }}>
        {SPECIALISTS.map(s => {
          const isActive = s.status === 'active'
          const isCurrent = s.id === currentSpecialistId
          return (
            <div
              key={s.id}
              className="spec-card"
              style={{ '--sp-clr': s.color } as React.CSSProperties}
              onClick={() => onSpecialistClick(s)}
            >
              {isCurrent && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: 12, border: `2px solid ${s.color}`, pointerEvents: 'none', zIndex: 1 }} />
              )}
              {/* AVATAR */}
              <div className="sc-avatar-wrap" style={{ background: `${s.color}14` }}>
                <div className="sc-photo-fallback" style={{ background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                  {s.em}
                </div>
                {isActive && <div className="sc-active-ring" />}
              </div>
              {/* BODY */}
              <div className="sc-body">
                <div className="sc-name">{lang === 'ar' ? `\u062F. ${s.nameAr}` : `Dr. ${s.name}`}</div>
                <div className="sc-role">{tv(s.role)}</div>
                <div className="sc-status">
                  <div className="sc-st-dot" style={{ background: isActive ? 'var(--grn)' : 'var(--t3)', animation: isActive ? 'pulse 2s infinite' : 'none' }} />
                  <span className="sc-st-lbl" style={{ color: isActive ? 'var(--grn)' : 'var(--t3)' }}>
                    {isActive ? (lang === 'ar' ? '\u0646\u0634\u0637' : 'Active') : (lang === 'ar' ? '\u0645\u062A\u0627\u062D' : 'Available')}
                  </span>
                </div>
              </div>
              <div className="sc-last-mini">
                <div className="sc-last-mini-txt">{tv(s.lastMsg)}</div>
                <div style={{ fontSize: 8, color: 'var(--t3)', marginTop: 2 }}>{tv(s.lastTime)}</div>
              </div>
              <div className="sc-conf">
                {[0,1,2,3].map(i => (
                  <div key={i} className="sc-conf-d" style={{ background: confColor(i, s.conf, s.color) }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}