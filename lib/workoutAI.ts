import { Exercise } from '@/app/workout/exercises'

export interface DailyContext {
  hrv: number
  recoveryScore: number
  kneePainLevel: number
  lastSessions: LastSession[]
  prRecords: PRRecord[]
  userGoals?: string
}

export interface LastSession {
  exercise_name: string
  sets: SetRecord[]
  date: string
}

export interface SetRecord {
  weight: number
  reps: number
  rpe: number
}

export interface PRRecord {
  exercise_name: string
  weight: number
  reps: number
  date: string
}

export interface AISetSuggestion {
  setNumber: number
  suggestedWeight: number
  suggestedReps: number
  targetRPE: number
  note?: string
  noteAr?: string
}

export interface AIExercisePlan {
  exerciseId: string
  sets: AISetSuggestion[]
  restSeconds: number
  warningAr?: string
  warningEn?: string
}

export interface AIWorkoutPlan {
  summaryAr: string
  summaryEn: string
  overallTone: 'push' | 'maintain' | 'deload'
  exercises: AIExercisePlan[]
  sessionTipAr: string
  sessionTipEn: string
}

export async function fetchWorkoutPlan(
  context: DailyContext,
  exercises: Exercise[]
): Promise<AIWorkoutPlan> {
  const exerciseList = exercises.map(e => ({
    id: e.id,
    nameEn: e.nameEn,
    nameAr: e.nameAr,
    muscleGroup: e.muscleGroup,
    kneeFlag: e.kneeFlag,
    defaultSets: e.defaultSets,
    defaultReps: e.defaultReps,
  }))

  const lastSessionsMap: Record<string, SetRecord[]> = {}
  context.lastSessions.forEach(s => {
    lastSessionsMap[s.exercise_name] = s.sets
  })

  const prompt = `
Ø£Ù†Øª Ù…Ø¯Ø±Ø¨ Ù„ÙŠØ§Ù‚Ø© Ø¨Ø¯Ù†ÙŠØ© Ù…ØªØ®ØµØµ ÙˆÙ…Ø³Ø§Ø¹Ø¯ ØµØ­ÙŠ Ø´Ø®ØµÙŠ Ù„Ù€ Ø¯. Ø£Ø³Ø§Ù…Ø©.

## Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙŠÙˆÙ…:
- Recovery Score: ${context.recoveryScore}%
- HRV: ${context.hrv}ms
- Ø£Ù„Ù… Ø§Ù„Ø±ÙƒØ¨Ø©: ${context.kneePainLevel}/10
- Ø§Ù„Ø£Ù‡Ø¯Ø§Ù: ${context.userGoals || 'Ø¨Ù†Ø§Ø¡ Ø¹Ø¶Ù„ÙŠ + Ù‚ÙˆØ© Ø¹Ø§Ù…Ø©'}

## Ø§Ù„ØªÙ…Ø§Ø±ÙŠÙ† Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ ØªØ®Ø·ÙŠØ·Ù‡Ø§ Ø§Ù„ÙŠÙˆÙ…:
${JSON.stringify(exerciseList, null, 2)}

## Ø¢Ø®Ø± Ø¬Ù„Ø³Ø© Ù„ÙƒÙ„ ØªÙ…Ø±ÙŠÙ†:
${JSON.stringify(lastSessionsMap, null, 2)}

## Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„Ù‚ÙŠØ§Ø³ÙŠØ© Ø§Ù„Ø­Ø§Ù„ÙŠØ© (PR):
${JSON.stringify(context.prRecords, null, 2)}

## Ø§Ù„Ù…Ø·Ù„ÙˆØ¨:
Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ ÙƒÙ„ Ù‡Ø°Ù‡ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§ØªØŒ Ø§Ù‚ØªØ±Ø­ Ø®Ø·Ø© ØªÙØµÙŠÙ„ÙŠØ© Ù„Ø¬Ù„Ø³Ø© Ø§Ù„ÙŠÙˆÙ…. 
- Ø¥Ø°Ø§ recovery > 80: Ø§Ù‚ØªØ±Ø­ Ø²ÙŠØ§Ø¯Ø© Ø§Ù„Ø£ÙˆØ²Ø§Ù† Ø¨Ù€ 2.5-5kg
- Ø¥Ø°Ø§ recovery 60-80: Ø­Ø§ÙØ¸ Ø¹Ù„Ù‰ Ù†ÙØ³ Ø§Ù„Ø£ÙˆØ²Ø§Ù† Ø£Ùˆ Ø²ÙŠØ§Ø¯Ø© Ø·ÙÙŠÙØ© 1.25kg
- Ø¥Ø°Ø§ recovery < 60: deload Ø¨ØªØ®ÙÙŠØ¶ 10-15%
- Ø¥Ø°Ø§ Ø£Ù„Ù… Ø§Ù„Ø±ÙƒØ¨Ø© > 0: ØªÙ†Ø¨ÙŠÙ‡ Ø¹Ù„Ù‰ ØªÙ…Ø§Ø±ÙŠÙ† Ø§Ù„Ø£Ø±Ø¬Ù„ ÙˆØªØ¹Ø¯ÙŠÙ„ Ø§Ù„ÙˆØ²Ù†
- RPE Ø§Ù„Ù…Ø³ØªÙ‡Ø¯Ù: 7-8 Ù„Ù„Ø¹Ø¯Ø§Øª Ø§Ù„Ø¹Ø§Ø¯ÙŠØ©ØŒ 8-9 Ù„Ù„Ø¹Ø¯Ø© Ø§Ù„Ø£Ø®ÙŠØ±Ø©
- ÙˆÙ‚Øª Ø§Ù„Ø±Ø§Ø­Ø©: 90-120 Ø«Ø§Ù†ÙŠØ© Ù‚ÙˆØ©ØŒ 60 Ø«Ø§Ù†ÙŠØ© Ø¹Ø²Ù„

ÙŠØ¬Ø¨ Ø£Ù† ØªÙØ±Ø¬Ø¹ JSON ÙÙ‚Ø· Ø¨Ù‡Ø°Ø§ Ø§Ù„Ø´ÙƒÙ„ Ø¨Ø§Ù„Ø¶Ø¨Ø· Ø¨Ø¯ÙˆÙ† Ø£ÙŠ markdown Ø£Ùˆ backticks:
{
  "summaryAr": "Ù…Ù„Ø®Øµ Ø§Ù„ØªÙˆØµÙŠØ© Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© (Ø¬Ù…Ù„Ø© ÙˆØ§Ø­Ø¯Ø©)",
  "summaryEn": "Summary in English (one sentence)",
  "overallTone": "push|maintain|deload",
  "sessionTipAr": "Ù†ØµÙŠØ­Ø© ÙˆØ§Ø­Ø¯Ø© Ù…Ù‡Ù…Ø© Ù„Ù„Ø¬Ù„Ø³Ø©",
  "sessionTipEn": "One important tip for the session",
  "exercises": [
    {
      "exerciseId": "bench-press",
      "restSeconds": 90,
      "warningAr": null,
      "warningEn": null,
      "sets": [
        { "setNumber": 1, "suggestedWeight": 60, "suggestedReps": 10, "targetRPE": 6, "noteAr": "Ø¥Ø­Ù…Ø§Ø¡", "note": "Warm-up" },
        { "setNumber": 2, "suggestedWeight": 75, "suggestedReps": 8, "targetRPE": 7 },
        { "setNumber": 3, "suggestedWeight": 80, "suggestedReps": 6, "targetRPE": 8 },
        { "setNumber": 4, "suggestedWeight": 80, "suggestedReps": 6, "targetRPE": 9, "noteAr": "Ø¹Ø¯Ø© ÙØ§ØµÙ„Ø©", "note": "Top set" }
      ]
    }
  ]
}
`

  const response = await fetch('/api/workout-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  const text = data.content?.find((b: any) => b.type === 'text')?.text || '{}'

  try {
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned) as AIWorkoutPlan
  } catch {
    return buildFallbackPlan(exercises, context)
  }
}

function buildFallbackPlan(exercises: Exercise[], ctx: DailyContext): AIWorkoutPlan {
  const tone = ctx.recoveryScore >= 80 ? 'push' : ctx.recoveryScore >= 60 ? 'maintain' : 'deload'
  const multiplier = tone === 'push' ? 1.05 : tone === 'maintain' ? 1 : 0.875

  return {
    summaryAr: `Recovery ${ctx.recoveryScore}% â€” Ø¬Ù„Ø³Ø© ${tone === 'push' ? 'ØªÙ‚Ø¯Ù…ÙŠØ©' : tone === 'maintain' ? 'Ù…Ø­Ø§ÙØ¸Ø©' : 'ØªØ®ÙÙŠÙ'}`,
    summaryEn: `Recovery ${ctx.recoveryScore}% â€” ${tone} session`,
    overallTone: tone,
    sessionTipAr: 'Ø±ÙƒÙ‘Ø² Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø¯Ø§Ø¡ Ø§Ù„ØµØ­ÙŠØ­ Ù‚Ø¨Ù„ Ø§Ù„ÙˆØ²Ù†',
    sessionTipEn: 'Focus on form before weight',
    exercises: exercises.map(ex => {
      const last = ctx.lastSessions.find(s => s.exercise_name === ex.id)
      const lastWeight = last?.sets?.[0]?.weight || 60
      const baseWeight = Math.round((lastWeight * multiplier) / 2.5) * 2.5

      return {
        exerciseId: ex.id,
        restSeconds: ex.muscleGroup === 'legs' || ex.muscleGroup === 'back' ? 120 : 90,
        warningAr: ex.kneeFlag && ctx.kneePainLevel > 0 ? `ØªÙ†Ø¨ÙŠÙ‡: Ø£Ù„Ù… Ø§Ù„Ø±ÙƒØ¨Ø© ${ctx.kneePainLevel}/10 â€” Ø¥Ø­Ù…Ø§Ø¡ Ù…ÙˆØ³Ù‘Ø¹` : undefined,
        warningEn: ex.kneeFlag && ctx.kneePainLevel > 0 ? `Warning: Knee pain ${ctx.kneePainLevel}/10 â€” extended warm-up` : undefined,
        sets: Array.from({ length: ex.defaultSets }, (_, i) => ({
          setNumber: i + 1,
          suggestedWeight: i === 0 ? Math.round(baseWeight * 0.7) : baseWeight,
          suggestedReps: i === 0 ? ex.defaultReps + 2 : ex.defaultReps,
          targetRPE: i === 0 ? 6 : i === ex.defaultSets - 1 ? 9 : 7 + i * 0.5,
          noteAr: i === 0 ? 'Ø¥Ø­Ù…Ø§Ø¡' : undefined,
          note: i === 0 ? 'Warm-up' : undefined,
        })),
      }
    }),
  }
}

// Claude Vision â€” ØªØ­Ù„ÙŠÙ„ ØµÙˆØ±Ø© WHOOP Ø¨Ø¹Ø¯ Ø§Ù„Ø¬Ù„Ø³Ø©
export interface WhoopAnalysis {
  strainScore: number
  hrvPost: number
  recoveryNextDay: string
  performanceMatchAr: string
  performanceMatchEn: string
  nextSessionTipAr: string
  nextSessionTipEn: string
}

export async function analyzeWhoopImage(
  base64Image: string,
  sessionVolume: number,
  sessionExercises: string[]
): Promise<WhoopAnalysis> {
  const prompt = `
Ø­Ù„Ù‘Ù„ ØµÙˆØ±Ø© WHOOP Ù‡Ø°Ù‡ ÙˆØ§Ø³ØªØ®Ø±Ø¬ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªØ§Ù„ÙŠØ©:

Ø¬Ù„Ø³Ø© Ø§Ù„ØªÙ…Ø±ÙŠÙ† Ø§Ù„Ù…ÙÙ†Ø¬Ø²Ø©:
- Ø§Ù„Ø­Ø¬Ù… Ø§Ù„ÙƒÙ„ÙŠ: ${sessionVolume}kg Ã— reps
- Ø§Ù„ØªÙ…Ø§Ø±ÙŠÙ†: ${sessionExercises.join(', ')}

Ù…Ù† Ø§Ù„ØµÙˆØ±Ø©ØŒ Ø§Ø³ØªØ®Ø±Ø¬: Strain Score, HRV, Recovery Score Ø¥Ù† ÙˆØ¬Ø¯.
Ø«Ù… Ù‚Ø§Ø±Ù† Strain Ù…Ø¹ Ø­Ø¬Ù… Ø§Ù„Ø¬Ù„Ø³Ø© ÙˆØ£Ø¹Ø·Ù ØªÙ‚ÙŠÙŠÙ…Ø§Ù‹.

Ø£Ø±Ø¬Ø¹ JSON ÙÙ‚Ø· Ø¨Ø¯ÙˆÙ† markdown:
{
  "strainScore": 14.5,
  "hrvPost": 48,
  "recoveryNextDay": "Ù…ØªÙˆØ³Ø· â€” 65-75%",
  "performanceMatchAr": "Ø§Ù„Ø£Ø¯Ø§Ø¡ Ù…ØªÙˆØ§ÙÙ‚ Ù…Ø¹ Strain â€” Ø¬Ù„Ø³Ø© Ù…ØªÙˆØ§Ø²Ù†Ø©",
  "performanceMatchEn": "Performance matches strain â€” balanced session",
  "nextSessionTipAr": "Ø±Ø§Ø­Ø© ØºØ¯Ø§Ù‹ â€” Ù†ÙˆÙ… 8 Ø³Ø§Ø¹Ø§Øª Ù„Ø§Ø³ØªØ¹Ø§Ø¯Ø© HRV",
  "nextSessionTipEn": "Rest tomorrow â€” 8h sleep to restore HRV"
}
`

  const response = await fetch('/api/workout-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  })

  const data = await response.json()
  const text = data.content?.find((b: any) => b.type === 'text')?.text || '{}'
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return {
      strainScore: 0,
      hrvPost: 0,
      recoveryNextDay: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
      performanceMatchAr: 'ØªØ¹Ø°Ù‘Ø± Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØµÙˆØ±Ø© â€” ØªØ£ÙƒØ¯ Ù…Ù† ÙˆØ¶ÙˆØ­Ù‡Ø§',
      performanceMatchEn: 'Could not read image â€” ensure clarity',
      nextSessionTipAr: 'Ø±Ø§Ø¬Ø¹ ØµÙˆØ±Ø© WHOOP ÙˆØ£Ø¹Ø¯ Ø§Ù„Ø±ÙØ¹',
      nextSessionTipEn: 'Check WHOOP screenshot and retry',
    }
  }
}
