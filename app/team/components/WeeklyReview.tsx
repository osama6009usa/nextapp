'use client'
import { useState } from 'react'

interface Props { lang: 'ar' | 'en'; userId: string }

const WEEK_SCORES = [62, 74, 58, 81, 76, 70, 78]
const DAYS_AR = ['\u0623\u062D\u062F', '\u0627\u062B\u0646', '\u062B\u0644\u0627\u062B', '\u0623\u0631\u0628', '\u062E\u0645\u0633', '\u062C\u0645\u0639', '\u0627\u0644\u064A\u0648\u0645']
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today']

const REPLIES_AR = [
  '\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0633\u0628\u0648\u0639: \u0627\u0644\u062A\u0631\u0643\u064A\u0632 \u0627\u0644\u0623\u0633\u0627\u0633\u064A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0639\u0644\u0649 \u0631\u0641\u0639 \u0645\u0639\u062F\u0644 \u0627\u0644\u0646\u0648\u0645 \u0623\u0648\u0644\u0627\u064B.',
  '\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 91% \u0628\u0627\u0644\u0645\u0643\u0645\u0644\u0627\u062A \u0645\u0645\u062A\u0627\u0632 \u2014 \u0647\u0630\u0627 \u0633\u064A\u0638\u0647\u0631 \u0641\u064A \u0641\u062D\u0635 \u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u0642\u0627\u062F\u0645. \u0627\u0633\u062A\u0645\u0631.',
  '\u0639\u062C\u0632 \u0627\u0644\u0628\u0631\u0648\u062A\u064A\u0646 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A 238g \u0633\u064A\u0624\u062B\u0631 \u0639\u0644\u0649 \u062A\u0639\u0627\u0641\u064A \u0627\u0644\u0639\u0636\u0644\u0627\u062A \u062A\u0631\u0627\u0643\u0645\u064A\u0627\u064B.',
]
const REPLIES_EN = [
  "Based on last week's data: the primary focus must be raising sleep duration first.",
  '91% supplement adherence is excellent \u2014 this will show in next month\'s tests.',
  'Weekly protein deficit of 238g will cumulatively affect muscle recovery.',
]

export default function WeeklyReview({ lang }: Props) {
  const [msgs, setMsgs] = useState<{ role: 'user'|'ai'; text: string }[]>([])
  const [input, setInput] = useState('')
  const maxScore = Math.max(...WEEK_SCORES)

  const send = () => {
    if (!input.trim()) return
    const replies = lang === 'ar' ? REPLIES_AR : REPLIES_EN
    const reply = replies[Math.floor(Math.random() * replies.length)]
    setMsgs(prev => [...prev, { role: 'user', text: input }, { role: 'ai', text: reply }])
    setInput('')
  }

  return (
    <div className="review-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 12, flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, overflow: 'hidden', minHeight: 0 }}>
        <div className="week-header">
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 2 }}>
              {lang === 'ar' ? '\u0623\u0633\u0628\u0648\u0639 26 \u0645\u0627\u0631\u0633 \u2014 1 \u0623\u0628\u0631\u064A\u0644' : 'Week Mar 26 \u2014 Apr 1'}
            </div>
            <div className="wh-score">74</div>
            <div className="wh-score-lbl">{lang === 'ar' ? '\u0645\u062A\u0648\u0633\u0637 Daily Score' : 'Avg Daily Score'}</div>
          </div>
          <div className="wh-divider" />
          <div className="wh-stats">
            {[
              { v: '5', l: lang === 'ar' ? '\u062A\u0645\u0627\u0631\u064A\u0646' : 'workouts' },
              { v: '148g', l: lang === 'ar' ? '\u0628\u0631\u0648\u062A\u064A\u0646' : 'protein avg' },
              { v: '3', l: lang === 'ar' ? '\u0635\u064A\u0627\u0645' : 'fasting days' },
              { v: '94.1', l: 'kg avg' },
            ].map((stat, i) => (
              <div key={i} className="wh-stat">
                <div className="wh-sv">{stat.v}</div>
                <div className="wh-sl">{stat.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="week-bars">
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 6 }}>
            Daily Scores \u2014 {lang === 'ar' ? '\u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u0645\u0627\u0636\u064A' : 'Last Week'}
          </div>
          <div id="weekBars" className="wb-days">
            {WEEK_SCORES.map((s, i) => {
              const isToday = i === 6
              const clr = s >= 75 ? 'var(--grn)' : s >= 60 ? 'var(--amb)' : 'var(--red)'
              const pct = Math.round((s / maxScore) * 100)
              return (
                <div key={i} className={`wb-day${isToday ? ' today' : ''}`}>
                  <div className="wb-bar-wrap">
                    <div className="wb-bar" style={{ height: `${pct}%`, background: isToday ? 'var(--acc)' : clr, minHeight: 4 }} />
                  </div>
                  <div className="wb-day-lbl">{(lang === 'ar' ? DAYS_AR : DAYS_EN)[i]}</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 8, fontWeight: 700, color: isToday ? 'var(--acc)' : 'var(--t3)' }}>{s}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="metrics-grid" style={{ display: 'grid', gap: 5, flex: 1, overflow: 'auto' }}>
          {[
            { lbl: lang === 'ar' ? '\u0645\u062A\u0648\u0633\u0637 HRV' : 'Avg HRV', val: '54ms', sub: lang === 'ar' ? '\u0627\u0644\u0647\u062F\u0641: 65ms' : 'Target: 65ms', trend: '\u2193 \u0645\u0646 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u0645\u0627\u0636\u064A', tclr: 'var(--rtx)', tbg: 'var(--rbg)' },
            { lbl: lang === 'ar' ? '\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0646\u0648\u0645' : 'Avg Sleep', val: '6.8h', sub: lang === 'ar' ? '\u0627\u0644\u0647\u062F\u0641: 8h' : 'Target: 8h', trend: lang === 'ar' ? '\u062A\u062D\u062A \u0627\u0644\u0647\u062F\u0641' : 'Below target', tclr: 'var(--atx)', tbg: 'var(--abg)' },
            { lbl: lang === 'ar' ? '\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0627\u0644\u0645\u0643\u0645\u0644\u0627\u062A' : 'Supplement Adherence', val: '91%', sub: lang === 'ar' ? '11 \u064A\u0648\u0645 \u0628\u0644\u0627 \u0627\u0646\u0642\u0637\u0627\u0639' : '11 days uninterrupted', trend: lang === 'ar' ? '\u0645\u0645\u062A\u0627\u0632' : 'Excellent', tclr: 'var(--gtx)', tbg: 'var(--gbg)' },
          ].map((m, i) => (
            <div key={i} className="metric-card">
              <div className="mc-lbl">{m.lbl}</div>
              <div className="mc-val">{m.val}</div>
              <div className="mc-sub">{m.sub}</div>
              <div className="mc-trend" style={{ color: m.tclr, background: m.tbg }}>{m.trend}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="review-chat" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="rc-header">
          <div className="rc-title">{lang === 'ar' ? '\uD83D\uDDE3\uFE0F \u0646\u0642\u0627\u0634 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0645\u0639 \u0627\u0644\u0641\u0631\u064A\u0642' : '\uD83D\uDDE3\uFE0F Weekly Discussion with Team'}</div>
          <div className="rc-sub">{lang === 'ar' ? '\u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u0631\u0649 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u0645\u0627\u0636\u064A \u0641\u0642\u0637' : 'Team sees last week\'s data only'}</div>
        </div>
        <div className="rc-body" style={{ flex: 1, overflowY: 'auto' }}>
          {msgs.map((m, i) => (
            <div key={i} className={`msg${m.role === 'user' ? ' user' : ' spec'} anim`}>
              {m.role === 'ai' && <div className="msg-av">\uD83E\uDEAC</div>}
              <div><div className="msg-bubble">{m.text}</div></div>
              {m.role === 'user' && <div className="msg-av uav">{lang === 'ar' ? '\u0623\u0633' : 'U'}</div>}
            </div>
          ))}
        </div>
        <div className="rc-input-row">
          <textarea
            id="wkInput"
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={lang === 'ar' ? '\u0627\u0633\u0623\u0644 \u0627\u0644\u0641\u0631\u064A\u0642 \u0639\u0646 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0633\u0628\u0648\u0639...' : 'Ask the team about this week\'s data...'}
            rows={1}
          />
          <button className="send-btn" onClick={send}>
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: '#fff', strokeWidth: 2, fill: 'none' }}>
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}