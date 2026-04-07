import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9
}

const WORK_FACTORS: Record<string, number> = {
  desk: 0, standing: 150, physical: 300, mobile: 200
}

const GOAL_LABELS: Record<string, string> = {
  fat_loss: 'fat loss', muscle_gain: 'muscle gain',
  maintenance: 'maintenance', performance: 'athletic performance'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('AI-GOALS REQUEST:', JSON.stringify(body))

    const { age, weight, height, bio_constitution, blood_type,
            user_goals, custom_goal_text, activity_level, work_type } = body

    const actFactor = ACTIVITY_FACTORS[activity_level] ?? 1.55
    const workBonus = WORK_FACTORS[work_type] ?? 0
    const safeGoals = Array.isArray(user_goals) && user_goals.length > 0 ? user_goals : ['maintenance']
    const goalsText = safeGoals.map((g: string) => GOAL_LABELS[g] ?? g).join(' + ')
    const customText = custom_goal_text ? 'User context: ' + custom_goal_text : ''

    const lines = [
      'You are an expert in sports nutrition and functional medicine.',
      'Calculate optimal daily health goals using exact scientific formulas.',
      'Person: Male, Age=' + age + ', Weight=' + weight + 'kg, Height=' + height + 'cm',
      'Bio=' + bio_constitution + ', Blood=' + blood_type,
      'Goals=' + goalsText + ', Activity=' + actFactor + ', WorkBonus=' + workBonus + 'kcal',
      'Climate=Saudi Arabia hot dry +0.5L water',
      customText,
      'Steps: LBM=Boer, BMR=Mifflin, TDEE=BMR*factor+workBonus',
      'Calories: fat_loss=TDEE-500, muscle_gain=TDEE+300, maintenance=TDEE, performance=TDEE+200, multi=weighted avg',
      'Protein per LBM: fat_loss=2.6, muscle_gain=2.2, maintenance=1.8, performance=2.4, multi=highest',
      'Water=weight*0.04+0.5 round 0.5',
      'Fasting: Vata=14h Pitta=16h Kapha=18h, O:+1h A:-1h B:0 AB:-1h',
      'Return ONLY JSON:',
      '{"protein_goal":0,"water_goal":0,"calorie_goal":0,"fasting_window_hours":0,"eating_window_start":"12:00","reasoning":{"protein":"","water":"","calories":"","fasting":""}}'
    ]

    const prompt = lines.filter(Boolean).join('\n')
    console.log('PROMPT LENGTH:', prompt.length)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    console.log('AI RESPONSE:', JSON.stringify(message.content))
    const raw = (message.content[0] as any).text
    const match = raw.match(/\{[\s\S]*\}/)
    const result = match ? match[0] : raw

    return NextResponse.json({ result })
  } catch (e: any) {
    console.error('AI-GOALS ERROR:', e.message, e.stack)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
