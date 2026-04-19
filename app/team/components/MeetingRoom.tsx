'use client'
import { useState } from 'react'
import { SPECIALISTS } from '@/lib/specialists'
import { MEET_RESPONSES, VERDICT } from '@/lib/team-context'
import type { useMeetingRoom } from '../hooks/useMeetingRoom'

type MeetHook = ReturnType<typeof useMeetingRoom>

interface Props {
  lang: 'ar' | 'en'
  meeting: MeetHook
}

export default function MeetingRoom({ lang, meeting }: Props) {
  const [question, setQuestion] = useState('')
  const { selected, toggleSpecialist, status, responses, startSession, resetSession } = meeting
  const tv = (obj: { ar: string; en: string }) => obj[lang]

  const badgeStyle = {
    idle: { background: 'var(--bbg)', color: 'var(--btx)' },
    running: { background: 'var(--abg)', color: 'var(--atx)' },
    done: { background: 'var(--gbg)', color: 'var(--gtx)' },
  }[status]

  const badgeLabel = {
    idle: lang === 'ar' ? '\u062C\u0627\u0647\u0632\u0629' : 'Ready',
    running: lang === 'ar' ? '\u062C\u0627\u0631\u064D' : 'Running',
    done: lang === 'ar' ? '\u0645\u0643\u062A\u0645\u0644\u0629' : 'Complete',
  }[status]

  const activeResponses = Object.values(responses).filter(r => r.text)
  const allDone = Object.values(responses).length > 0 && Object.values(responses).every(r => r.done)

  return (
    <div className="room-layout" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 14, flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* LEFT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        <div className="room-config">
          <div className="rc-lbl">{lang === 'ar' ? '\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u064A\u0646' : 'SELECT SPECIALISTS'}</div>
          <div className="preset-row">
            {[
              { key: '1', label: lang === 'ar' ? '\u0641\u0631\u062F\u064A' : 'Solo', ids: ['AT'] },
              { key: '4', label: lang === 'ar' ? '2\u20135' : '2-5', ids: ['AT','PL','CE','IR'] },
              { key: 'all', label: lang === 'ar' ? '\u0627\u0644\u0643\u0644' : 'All', ids: SPECIALISTS.map(s => s.id) },
            ].map(p => (
              <div
                key={p.key}
                className={`preset${JSON.stringify(selected.sort()) === JSON.stringify(p.ids.sort()) ? ' on' : ''}`}
                onClick={() => {
                  p.ids.forEach(id => {
                    if (!selected.includes(id)) meeting.toggleSpecialist(id)
                  })
                  selected.filter(id => !p.ids.includes(id)).forEach(id => meeting.toggleSpecialist(id))
                }}
              >
                {p.label}
              </div>
            ))}
          </div>
          <div className="spec-sel-grid">
            {SPECIALISTS.map(s => (
              <div
                key={s.id}
                className={`spec-sel${selected.includes(s.id) ? ' on' : ''}`}
                style={{ '--sp-clr': s.color } as React.CSSProperties}
                onClick={() => toggleSpecialist(s.id)}
              >
                <span className="ss-em">{s.em}</span>
                <span className="ss-name">{lang === 'ar' ? s.nameAr.split(' ').pop() : s.name.split(' ').pop()}</span>
                <div className="ss-chk">
                  {selected.includes(s.id) && (
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--t2)', textAlign: 'center', marginTop: 4 }}>
            {selected.length} {lang === 'ar' ? '\u0645\u062D\u062F\u062F\u064A\u0646' : 'selected'}
          </div>
        </div>

        <div className="room-q" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="rc-lbl">{lang === 'ar' ? '\u0627\u0644\u0633\u0624\u0627\u0644' : 'QUESTION'}</div>
          <textarea
            className="rq-area"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder={lang === 'ar' ? '\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643 \u0644\u0644\u0641\u0631\u064A\u0642...' : 'Write your question for the team...'}
            style={{ flex: 1, minHeight: 80 }}
          />
          <div className="rq-foot">
            <button
              className="start-btn"
              onClick={() => startSession(question)}
              disabled={status === 'running' || !question.trim()}
            >
              {status === 'running' ? '\u23F3' : (lang === 'ar' ? '\u0627\u0628\u062F\u0623' : 'Start')}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, overflowY: 'auto' }}>
        <div className="room-header-bar">
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>
            {lang === 'ar' ? '\u062C\u0644\u0633\u0629 \u063A\u0631\u0641\u0629 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639' : 'Meeting Room Session'}
          </div>
          <div className="rh-badge" style={badgeStyle}>{badgeLabel}</div>
          <div className="sav-row">
            {selected.slice(0, 6).map(id => {
              const sp = SPECIALISTS.find(s => s.id === id)!
              return <div key={id} className="sav" style={{ background: `${sp.color}22` }}>{sp.em}</div>
            })}
          </div>
          <div style={{ fontSize: 11, color: 'var(--t2)' }}>
            {status === 'running' ? (lang === 'ar' ? '\u062C\u0627\u0631\u064D \u062C\u0645\u0639 \u0627\u0644\u0622\u0631\u0627\u0621...' : 'Collecting opinions...') : ''}
          </div>
        </div>

        {status === 'idle' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t2)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>\uD83C\uDFDB\uFE0F</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {lang === 'ar' ? '\u063A\u0631\u0641\u0629 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639 \u062C\u0627\u0647\u0632\u0629' : 'Meeting Room Ready'}
            </div>
            <div style={{ fontSize: 11, marginTop: 4 }}>
              {lang === 'ar' ? '\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u064A\u0646 \u0648\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643' : 'Select specialists and write your question'}
            </div>
          </div>
        )}

        {activeResponses.length > 0 && (
          <div className="responses-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.values(responses).filter(r => r.text || !r.done).map(r => {
              const sp = SPECIALISTS.find(s => s.id === r.specialistId)!
              const preset = MEET_RESPONSES[r.specialistId]
              return (
                <div key={r.specialistId} className="resp-card anim">
                  <div className="resp-head">
                    <div className="resp-av" style={{ background: `${sp.color}18` }}>{sp.em}</div>
                    <div>
                      <div className="resp-name">{lang === 'ar' ? `\u062F. ${sp.nameAr}` : `Dr. ${sp.name}`}</div>
                      <div className="resp-role">{lang === 'ar' ? sp.role.ar : sp.role.en}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 2, marginRight: lang === 'ar' ? 'auto' : 0, marginLeft: lang === 'en' ? 'auto' : 0 }}>
                      {[0,1,2,3].map(i => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i < (preset?.conf || 3) ? (preset?.cc || 'var(--grn)') : 'var(--brd)' }} />
                      ))}
                    </div>
                  </div>
                  <div className="resp-body">
                    {r.text || (
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[0,1,2].map(i => <div key={i} className="ld" style={{ animationDelay: `${i*0.15}s` }} />)}
                      </div>
                    )}
                  </div>
                  {preset && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
                      {(lang === 'ar' ? preset.tags.ar : preset.tags.en).map((tag, i) => (
                        <span key={i} className="resp-tag" style={{ background: `${sp.color}18`, color: sp.color }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {allDone && (
          <div className="verdict-card anim">
            <div className="vd-lbl">\u2696\uFE0F {lang === 'ar' ? '\u062A\u0639\u0627\u0631\u0636 \u062A\u0644\u0642\u0627\u0626\u064A' : 'Auto Conflict'}</div>
            <div className="conflict-box">
              <span style={{ fontSize: 12 }}>\u26A0\uFE0F</span>
              <span className="conflict-txt">{lang === 'ar' ? VERDICT.conflict.ar : VERDICT.conflict.en}</span>
            </div>
            <div className="vd-lbl">\uD83C\uDFDB\uFE0F {lang === 'ar' ? '\u0642\u0631\u0627\u0631 \u0627\u0644\u0641\u0631\u064A\u0642' : 'Team Decision'}</div>
            <div className="vd-head">
              <div className="vd-icon">\uD83C\uDFAF</div>
              <div className="vd-title">{lang === 'ar' ? VERDICT.title.ar : VERDICT.title.en}</div>
            </div>
            <div className="vd-txt">{lang === 'ar' ? VERDICT.text.ar : VERDICT.text.en}</div>
            <div className="vd-actions">
              <button className="va va-w">{lang === 'ar' ? '\u2705 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0642\u0631\u0627\u0631' : '\u2705 Apply Decision'}</button>
              <button className="va va-g">{lang === 'ar' ? '\uD83D\uDCBE \u0623\u0631\u0634\u0641\u0629' : '\uD83D\uDCBE Archive'}</button>
              <button className="va va-g" onClick={resetSession}>{lang === 'ar' ? '\uD83D\uDD01 \u062C\u0644\u0633\u0629 \u062C\u062F\u064A\u062F\u0629' : '\uD83D\uDD01 New Session'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}