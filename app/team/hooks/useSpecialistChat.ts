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