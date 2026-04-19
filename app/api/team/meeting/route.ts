import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { SPECIALISTS, buildSystemPrompt } from '@/lib/specialists'
import { getTodayContext, getSpecialistMemory, createMeetingRoom, updateMeetingRoom } from '@/lib/team-supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { specialistIds, question, lang, userId } = await req.json()

    if (!specialistIds?.length || !question || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    const context = await getTodayContext(userId)
    const roomId = await createMeetingRoom(userId, question, specialistIds)

    const specialists = SPECIALISTS.filter(s => specialistIds.includes(s.id))

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(
            new TextEncoder().encode('data: ' + JSON.stringify(data) + '\n\n')
          )
        }

        const responses: Record<string, string> = {}

        for (const specialist of specialists) {
          send({ type: 'start', specialistId: specialist.id })

          const memory = await getSpecialistMemory(userId, specialist.id)
          const systemPrompt = buildSystemPrompt(specialist, context, memory, lang || 'ar')

          let text = ''
          const stream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 300,
            system: systemPrompt,
            messages: [{ role: 'user', content: question }],
          })

          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              text += chunk.delta.text
              send({ type: 'token', specialistId: specialist.id, text: chunk.delta.text })
            }
          }

          responses[specialist.id] = text
          send({ type: 'done', specialistId: specialist.id, fullText: text })
        }

        if (roomId) {
          await updateMeetingRoom(roomId, { responses, status: 'done' })
        }

        send({ type: 'complete', roomId })
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('[team/meeting]', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
}