$utf8 = [System.Text.UTF8Encoding]::new($false)

# ============================================================
# FILE 9: app/team/components/SpecialistGrid.tsx
# ============================================================
$specGrid = @'
'use client'
import Image from 'next/image'
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
                <div className="sc-photo-fallback" style={{ background: s.color }}>
                  <Image
                    src={s.photo}
                    alt={s.name}
                    width={80}
                    height={80}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
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
'@

[System.IO.File]::WriteAllText("$PWD\app\team\components\SpecialistGrid.tsx", $specGrid, $utf8)
Write-Host "SpecialistGrid.tsx written"

# ============================================================
# FILE 10: app/team/components/IndividualChat.tsx
# ============================================================
$indChat = @'
'use client'
import { useState, useRef, useEffect } from 'react'
import { SPECIALISTS } from '@/lib/specialists'
import { CTX_DATA } from '@/lib/team-context'
import type { useSpecialistChat } from '../hooks/useSpecialistChat'

type ChatHook = ReturnType<typeof useSpecialistChat>

interface Props {
  lang: 'ar' | 'en'
  userId: string
  chat: ChatHook
}

export default function IndividualChat({ lang, userId, chat }: Props) {
  const [input, setInput] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const { messages, streaming, currentSpecialist, sendMessage } = chat
  const tv = (obj: { ar: string; en: string } | string) =>
    typeof obj === 'string' ? obj : obj[lang]

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  if (!currentSpecialist) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--t2)' }}>
        <div style={{ fontSize: 32 }}>\uD83D\uDC65</div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>
          {lang === 'ar' ? '\u0627\u062E\u062A\u0631 \u0645\u062A\u062E\u0635\u0635\u0627\u064B \u0645\u0646 \u0627\u0644\u0641\u0631\u064A\u0642 \u0644\u0644\u0628\u062F\u0621' : 'Select a specialist from the team to begin'}
        </div>
        <div style={{ fontSize: 12 }}>
          {lang === 'ar' ? '\u0627\u0646\u062A\u0642\u0644 \u0644\u062A\u0628\u0648\u064A\u0628 \u0627\u0644\u0641\u0631\u064A\u0642 \u0648\u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0623\u064A \u0628\u0637\u0627\u0642\u0629' : 'Go to Team tab and click any card'}
        </div>
      </div>
    )
  }

  const s = currentSpecialist
  const ctxData = CTX_DATA[s.ctx]

  return (
    <div className="chat-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14, flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* CHAT MAIN */}
      <div className="chat-main" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* HEADER */}
        <div className="chat-header">
          <div className="chat-hav" style={{ background: `${s.color}18`, overflow: 'hidden' }}>
            <span style={{ fontSize: 22 }}>{s.em}</span>
          </div>
          <div>
            <div className="chat-hname">
              {lang === 'ar' ? `\u062F. ${s.nameAr}` : `Dr. ${s.name}`}
            </div>
            <div className="chat-hrole">{tv(s.role)}</div>
          </div>
          <div className="chat-actions">
            <button className="chat-btn btn-second">
              {lang === 'ar' ? '\uD83D\uDD01 \u0631\u0623\u064A \u062B\u0627\u0646\u064D' : '\uD83D\uDD01 2nd Opinion'}
            </button>
            <button className="chat-btn btn-ghost">
              {lang === 'ar' ? '\uD83D\uDCCB \u0645\u0644\u062E\u0635' : '\uD83D\uDCCB Summary'}
            </button>
          </div>
        </div>

        {/* CONTEXT STRIP */}
        <div className="ctx-strip">
          <span className="ctx-strip-lbl">{lang === 'ar' ? '\u0633\u064A\u0627\u0642 \u0645\u062D\u0645\u0651\u0644:' : 'Loaded context:'}</span>
          {ctxData.slice(0, 5).map((c, i) => {
            const cls = c.color === 'var(--rbg)' ? 'ctx-chip alert' : c.color === 'var(--abg)' ? 'ctx-chip warn' : 'ctx-chip'
            return <span key={i} className={cls}>{c.icon} {tv(c.val)}</span>
          })}
        </div>

        {/* MESSAGES */}
        <div ref={bodyRef} className="chat-body" style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} className={`msg${m.role === 'user' ? ' user' : ' spec'} anim`}>
              {m.role === 'assistant' && (
                <div className="msg-av" style={{ background: `${s.color}18`, color: s.color }}>{s.em}</div>
              )}
              <div>
                <div className="msg-bubble">{m.content || (streaming && i === messages.length - 1 ? '' : '')}</div>
                {m.role === 'assistant' && m.conf && (
                  <div className="conf-bar">
                    <div className="conf-pips">
                      {[0,1,2,3].map(j => (
                        <div key={j} className="conf-pip" style={{ background: j < m.conf! ? 'var(--grn)' : 'var(--brd)' }} />
                      ))}
                    </div>
                    <span className="conf-text" style={{ color: 'var(--gtx)' }}>
                      {lang === 'ar' ? '\u0639\u0627\u0644\u064A' : 'High'}
                    </span>
                    <span className="conf-src">{lang === 'ar' ? '\u0628\u064A\u0627\u0646\u0627\u062A\u0643' : 'Your data'}</span>
                  </div>
                )}
                <div className="msg-time">{m.timestamp}</div>
              </div>
              {m.role === 'user' && (
                <div className="msg-av uav">{lang === 'ar' ? '\u0623\u0633' : 'U'}</div>
              )}
            </div>
          ))}
          {streaming && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1].content === '' && (
            <div className="msg spec">
              <div className="msg-av" style={{ background: `${s.color}18`, color: s.color }}>{s.em}</div>
              <div className="msg-bubble" style={{ padding: '8px 14px' }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0,1,2].map(i => <div key={i} className="ld" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="chat-input-row">
          <textarea
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder={lang === 'ar' ? `\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643 \u0644\u0640 \u062F. ${s.nameAr}...` : `Ask Dr. ${s.name}...`}
            rows={1}
          />
          <button className="send-btn" onClick={handleSend} disabled={streaming}>
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: '#fff', strokeWidth: 2, fill: 'none' }}>
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* SIDE PANEL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        <div className="panel-card">
          <div className="panel-lbl">{lang === 'ar' ? '\u0627\u0644\u0633\u064A\u0627\u0642 \u0627\u0644\u0645\u062D\u0645\u0651\u0644' : 'LOADED CONTEXT'}</div>
          {ctxData.map((c, i) => (
            <div key={i} className="ctx-row">
              <div className="ctx-icon" style={{ background: c.color }}>{c.icon}</div>
              <div className="ctx-nm">{tv(c.key)}</div>
              <div className="ctx-vl" style={{ color: c.vclr }}>{tv(c.val)}</div>
            </div>
          ))}
        </div>
        <div className="panel-card" style={{ flex: 1, overflow: 'auto' }}>
          <div className="panel-lbl">{lang === 'ar' ? '\u0627\u0644\u0630\u0627\u0643\u0631\u0629' : 'MEMORY'}</div>
          <div className="mem-item">{lang === 'ar' ? '\u062C\u0627\u0631\u064D \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0627\u0644\u0633\u0627\u0628\u0642\u0629...' : 'Loading previous sessions...'}</div>
        </div>
      </div>
    </div>
  )
}
'@

[System.IO.File]::WriteAllText("$PWD\app\team\components\IndividualChat.tsx", $indChat, $utf8)
Write-Host "IndividualChat.tsx written"

# ============================================================
# FILE 11: app/team/components/MeetingRoom.tsx
# ============================================================
$meetRoom = @'
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
'@

[System.IO.File]::WriteAllText("$PWD\app\team\components\MeetingRoom.tsx", $meetRoom, $utf8)
Write-Host "MeetingRoom.tsx written"
Write-Host "PART 4 DONE"
