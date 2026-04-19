$utf8 = [System.Text.UTF8Encoding]::new($false)

# ============================================================
# FILE 6: app/team/hooks/useSpecialistChat.ts
# ============================================================
$chatHook = @'
'use client'
import { useState, useCallback, useRef } from 'react'
import type { Specialist } from '@/lib/specialists'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  conf?: number
  timestamp: string
}

export function useSpecialistChat(userId: string, lang: 'ar' | 'en') {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [currentSpecialist, setCurrentSpecialist] = useState<Specialist | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const openChat = useCallback((specialist: Specialist) => {
    setCurrentSpecialist(specialist)
    setMessages([])
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !currentSpecialist || streaming) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setStreaming(true)

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      conf: currentSpecialist.conf,
    }
    setMessages(prev => [...prev, assistantMsg])

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/team/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialistId: currentSpecialist.id,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          lang,
          userId,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) throw new Error('Request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: lang === 'ar' ? '\u062D\u062F\u062B \u062E\u0637\u0623\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.' : 'An error occurred. Please try again.',
          }
          return updated
        })
      }
    } finally {
      setStreaming(false)
    }
  }, [messages, currentSpecialist, streaming, userId, lang])

  const abortStream = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { messages, streaming, currentSpecialist, openChat, sendMessage, abortStream }
}
'@

[System.IO.File]::WriteAllText("$PWD\app\team\hooks\useSpecialistChat.ts", $chatHook, $utf8)
Write-Host "useSpecialistChat.ts written"

# ============================================================
# FILE 7: app/team/hooks/useMeetingRoom.ts
# ============================================================
$meetHook = @'
'use client'
import { useState, useCallback } from 'react'
import type { Specialist } from '@/lib/specialists'

export interface MeetingResponse {
  specialistId: string
  text: string
  done: boolean
}

export type MeetingStatus = 'idle' | 'running' | 'done'

export function useMeetingRoom(userId: string, lang: 'ar' | 'en') {
  const [selected, setSelected] = useState<string[]>(['AT', 'PL', 'CE', 'IR'])
  const [status, setStatus] = useState<MeetingStatus>('idle')
  const [responses, setResponses] = useState<Record<string, MeetingResponse>>({})
  const [roomId, setRoomId] = useState<string | null>(null)

  const toggleSpecialist = useCallback((id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(s => s !== id) : prev
        : [...prev, id]
    )
  }, [])

  const startSession = useCallback(async (question: string) => {
    if (!question.trim() || status === 'running') return

    setStatus('running')
    setResponses({})

    const initResponses: Record<string, MeetingResponse> = {}
    selected.forEach(id => {
      initResponses[id] = { specialistId: id, text: '', done: false }
    })
    setResponses(initResponses)

    try {
      const res = await fetch('/api/team/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialistIds: selected, question, lang, userId }),
      })

      if (!res.ok || !res.body) throw new Error('Request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))

            if (event.type === 'token') {
              setResponses(prev => ({
                ...prev,
                [event.specialistId]: {
                  ...prev[event.specialistId],
                  text: (prev[event.specialistId]?.text || '') + event.text,
                },
              }))
            } else if (event.type === 'done') {
              setResponses(prev => ({
                ...prev,
                [event.specialistId]: { ...prev[event.specialistId], done: true },
              }))
            } else if (event.type === 'complete') {
              setRoomId(event.roomId)
              setStatus('done')
            }
          } catch {}
        }
      }
    } catch {
      setStatus('idle')
    }
  }, [selected, status, userId, lang])

  const resetSession = useCallback(() => {
    setStatus('idle')
    setResponses({})
    setRoomId(null)
  }, [])

  return { selected, toggleSpecialist, status, responses, roomId, startSession, resetSession }
}
'@

[System.IO.File]::WriteAllText("$PWD\app\team\hooks\useMeetingRoom.ts", $meetHook, $utf8)
Write-Host "useMeetingRoom.ts written"

# ============================================================
# FILE 8: app/team/page.tsx  (Main orchestrator)
# ============================================================
$pageTs = @'
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SpecialistGrid from './components/SpecialistGrid'
import IndividualChat from './components/IndividualChat'
import MeetingRoom from './components/MeetingRoom'
import WeeklyReview from './components/WeeklyReview'
import MonthlyReview from './components/MonthlyReview'
import WhatIfModal from './components/WhatIfModal'
import { useSpecialistChat } from './hooks/useSpecialistChat'
import { useMeetingRoom } from './hooks/useMeetingRoom'
import type { Specialist } from '@/lib/specialists'

type Tab = 0 | 1 | 2 | 3 | 4
type Lang = 'ar' | 'en'

const TAB_LABELS = {
  ar: ['\u0627\u0644\u0641\u0631\u064A\u0642', '\u0645\u062D\u0627\u062F\u062B\u0629', '\u063A\u0631\u0641\u0629 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639', '\u0627\u0644\u0646\u0642\u0627\u0634 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A', '\u0627\u0644\u0646\u0642\u0627\u0634 \u0627\u0644\u0634\u0647\u0631\u064A'],
  en: ['Team', 'Chat', 'Meeting Room', 'Weekly Review', 'Monthly Review'],
}

export default function TeamPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('ar')
  const [tab, setTab] = useState<Tab>(0)
  const [userId, setUserId] = useState<string>('')
  const [wiOpen, setWiOpen] = useState(false)
  const [liveTime, setLiveTime] = useState('')

  const chat = useSpecialistChat(userId, lang)
  const meeting = useMeetingRoom(userId, lang)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setUserId(data.user.id)
    })
  }, [router])

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      const h = n.getHours() % 12 || 12
      const m = String(n.getMinutes()).padStart(2, '0')
      if (lang === 'ar') {
        const p = n.getHours() >= 12 ? '\u0645' : '\u0635'
        setLiveTime(`\u0645\u0628\u0627\u0634\u0631 \u2014 ${h}:${m}${p}`)
      } else {
        const p = n.getHours() >= 12 ? 'pm' : 'am'
        setLiveTime(`Live \u2014 ${h}:${m}${p}`)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lang])

  const handleSpecialistClick = (s: Specialist) => {
    chat.openChat(s)
    setTab(1)
  }

  return (
    <div
      className="main"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4px)', overflow: 'hidden', padding: '16px 20px 0', gap: 12 }}
    >
      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)' }}>
            {lang === 'ar' ? '\u0627\u0644\u0641\u0631\u064A\u0642 \u0627\u0644\u0639\u0644\u0645\u064A' : 'Scientific Team'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 3 }}>
            {lang === 'ar' ? '14 \u0645\u062A\u062E\u0635\u0635\u0627\u064B \u2014 \u0633\u064A\u0627\u0642 \u0645\u062D\u0645\u0651\u0644 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B' : '14 Specialists \u2014 Smart context auto-loaded'}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div className="badge-live">
          <div className="pulse-dot" />
          <span>{liveTime}</span>
        </div>
        <button
          onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
          className="lbtn"
        >
          {lang === 'ar' ? 'EN' : 'AR'}
        </button>
        <div className="tabs-wrap" style={{ display: 'flex', gap: 6 }}>
          {TAB_LABELS[lang].map((label, i) => (
            <div
              key={i}
              className={`tab${tab === i ? ' on' : ''}`}
              onClick={() => setTab(i as Tab)}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* SCREENS */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 0 && (
          <SpecialistGrid
            lang={lang}
            onSpecialistClick={handleSpecialistClick}
            onOpenWI={() => setWiOpen(true)}
            currentSpecialistId={chat.currentSpecialist?.id}
          />
        )}
        {tab === 1 && (
          <IndividualChat
            lang={lang}
            userId={userId}
            chat={chat}
          />
        )}
        {tab === 2 && (
          <MeetingRoom
            lang={lang}
            meeting={meeting}
          />
        )}
        {tab === 3 && (
          <WeeklyReview lang={lang} userId={userId} />
        )}
        {tab === 4 && (
          <MonthlyReview lang={lang} userId={userId} />
        )}
      </div>

      {/* WHAT-IF MODAL */}
      {wiOpen && <WhatIfModal lang={lang} onClose={() => setWiOpen(false)} />}

      {/* FOOTER */}
      <div className="footer-disc" style={{ fontSize: 10, color: 'var(--t3)', padding: '6px 0', borderTop: '1px solid var(--brd)', flexShrink: 0 }}>
        {lang === 'ar'
          ? '\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0645\u0648\u0644\u0651\u062F\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0644\u0623\u063A\u0631\u0627\u0636 \u062A\u0648\u0639\u0648\u064A\u0629 \u0641\u0642\u0637 \u2014 \u0644\u0627 \u062A\u064F\u063A\u0646\u064A \u0639\u0646 \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0637\u0628\u064A\u0628 \u0645\u062E\u062A\u0635.'
          : 'AI-generated information for educational purposes only \u2014 does not replace professional medical advice.'}
      </div>
    </div>
  )
}
'@

[System.IO.File]::WriteAllText("$PWD\app\team\page.tsx", $pageTs, $utf8)
Write-Host "app/team/page.tsx written"
Write-Host "PART 3 DONE"
