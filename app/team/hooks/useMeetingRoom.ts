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