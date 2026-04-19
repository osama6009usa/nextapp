import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { SPECIALISTS, buildSystemPrompt } from '@/lib/specialists'
import { getSpecialistMemory, saveMemorySnapshot, getTodayContext } from '@/lib/team-supabase'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { specialistId, messages, lang, userId } = await req.json()

    if (!specialistId || !messages || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    const specialist = SPECIALISTS.find(s => s.id === specialistId)
    if (!specialist) {
      return new Response(JSON.stringify({ error: 'Specialist not found' }), { status: 404 })
    }

    const [memory, context] = await Promise.all([
      getSpecialistMemory(userId, specialistId),
      getTodayContext(userId),
    ])

    const systemPrompt = buildSystemPrompt(specialist, context, memory, lang || 'ar')

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const readable = new ReadableStream({
      async start(controller) {
        let fullText = ''
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            fullText += chunk.delta.text
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
        controller.close()

        if (fullText.length > 20) {
          const userMsg = messages[messages.length - 1]?.content || ''
          const summary = `Q: ${userMsg.slice(0, 60)} | A: ${fullText.slice(0, 80)}`
          await saveMemorySnapshot(userId, specialistId, summary).catch(() => {})
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('[team/chat]', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
}