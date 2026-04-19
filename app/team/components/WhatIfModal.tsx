'use client'
import { useState } from 'react'
import { WHATIF } from '@/lib/team-context'

interface Props {
  lang: 'ar' | 'en'
  onClose: () => void
}

export default function WhatIfModal({ lang, onClose }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const tv = (obj: { ar: string; en: string } | string) =>
    typeof obj === 'string' ? obj : obj[lang]

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(13,27,42,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--surf)', borderRadius: 18, padding: 24, width: 500, maxWidth: '92vw', maxHeight: '85vh', overflowY: 'auto', animation: 'fadeUp .3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
          <div style={{ fontSize: 26 }}>\uD83D\uDD2E</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>
              {lang === 'ar' ? '\u0645\u062D\u0627\u0643\u064A \u201C\u0645\u0627\u0630\u0627 \u0644\u0648\u061F\u201D \u2014 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0628\u064A\u0627\u0646\u0627\u062A \u0623\u0645\u0633' : '"What-If?" Simulator \u2014 based on yesterday\'s data'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 3 }}>
              {lang === 'ar' ? '\u063A\u064A\u0651\u0631 \u0645\u062A\u063A\u064A\u0651\u0631\u0627\u064B \u0648\u0627\u062D\u062F\u0627\u064B \u2014 \u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u062D\u0633\u0628 \u0643\u064A\u0641 \u0633\u064A\u0643\u0648\u0646 \u0627\u0644\u064A\u0648\u0645 \u0645\u062E\u062A\u0644\u0641\u0627\u064B' : 'Change one variable \u2014 see how today would differ'}
            </div>
          </div>
          <button style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surf2)', border: 'none', cursor: 'pointer', fontSize: 13 }} onClick={onClose}>\u2715</button>
        </div>

        {/* YESTERDAY DATA */}
        <div style={{ background: 'var(--surf2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 9 }}>
            {lang === 'ar' ? '\u0628\u064A\u0627\u0646\u0627\u062A \u0623\u0645\u0633 \u0627\u0644\u0641\u0639\u0644\u064A\u0629' : 'YESTERDAY\'S ACTUAL DATA'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { em: '\uD83D\uDE34', val: '6.5h', k: lang === 'ar' ? '\u0646\u0648\u0645' : 'Sleep' },
              { em: '\uD83E\uDEAC', val: '52ms', k: 'HRV' },
              { em: '\u26A1', val: '74%', k: 'Recovery' },
              { em: '\uD83E\uDD69', val: '96g', k: lang === 'ar' ? '\u0628\u0631\u0648\u062A\u064A\u0646' : 'Protein' },
              { em: '\uD83D\uDCA7', val: '2L', k: lang === 'ar' ? '\u0645\u0627\u0621' : 'Water' },
              { em: '\uD83D\uDCC8', val: '18.2', k: lang === 'ar' ? '\u0643\u0648\u0631\u062A\u064A\u0632\u0648\u0644' : 'Cortisol' },
            ].map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surf)', border: '1px solid var(--brd)', borderRadius: 6, padding: '4px 10px' }}>
                <span style={{ fontSize: 12 }}>{d.em}</span>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700, color: 'var(--t1)', lineHeight: 1 }}>{d.val}</div>
                  <div style={{ fontSize: 9, color: 'var(--t3)' }}>{d.k}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SCENARIOS */}
        {WHATIF.map((sc, i) => (
          <div
            key={i}
            className="wi-sc"
            style={{ background: activeIdx === i ? 'var(--bbg)' : 'var(--surf2)', border: `2px solid ${activeIdx === i ? 'var(--acc)' : 'transparent'}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8, cursor: 'pointer', transition: 'all .18s' }}
            onClick={() => setActiveIdx(activeIdx === i ? null : i)}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 3 }}>{sc.title[lang]}</div>
            <div style={{ fontSize: 10, color: 'var(--t2)' }}>{sc.sub[lang]}</div>
          </div>
        ))}

        {/* RESULTS */}
        {activeIdx !== null && (
          <div style={{ background: 'var(--t1)', borderRadius: 12, padding: '14px 16px', marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>
              {lang === 'ar' ? '\u0644\u0648 \u0643\u0627\u0646 \u0630\u0644\u0643 \u062D\u062F\u062B \u0623\u0645\u0633 \u2014 \u0627\u0644\u064A\u0648\u0645 \u0633\u064A\u0643\u0648\u0646' : 'If that happened yesterday \u2014 today would be'}
            </div>
            {WHATIF[activeIdx].results.map((r, i) => {
              const delta = typeof r.delta === 'string' ? r.delta : r.delta[lang]
              const val = typeof r.v === 'string' ? r.v : r.v[lang]
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < WHATIF[activeIdx].results.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>{typeof r.k === 'string' ? r.k : r.k[lang]}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{val}</span>
                    <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: r.good ? 'rgba(0,168,122,.3)' : 'rgba(217,119,6,.25)', color: r.good ? '#3effc5' : '#fde68a' }}>{delta}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}