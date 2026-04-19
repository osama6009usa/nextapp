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