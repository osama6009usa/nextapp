import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export interface ScoreBreakdown {
  recovery:  { score: number; raw: number; max: number }
  protein:   { score: number; raw: number; goal: number; max: number }
  water:     { score: number; raw: number; goal: number; max: number }
  fasting:   { score: number; completed: boolean; hours: number; max: number }
  workout:   { score: number; exists: boolean; max: number }
  days_used?:  number
  days_total?: number
  milestones_achieved?: string[]
}

export interface OneActionBoost {
  label:  string
  points: number
  icon:   string
}

export interface DailyScoreResult {
  dailyScore:  number
  biosovScore: number
  breakdown:   ScoreBreakdown
  daysUsed:    number
  trend:       'up' | 'down' | 'stable'
  forecast:    number
  forecastMsg: string
  oneAction:   OneActionBoost | null
  milestones:  string[]
  isLoading:   boolean
  recalculate: () => void
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function useDailyScore(): DailyScoreResult {
  const [dailyScore,  setDailyScore]  = useState(0)
  const [biosovScore, setBiosovScore] = useState(0)
  const [breakdown,   setBreakdown]   = useState<ScoreBreakdown>({
    recovery: { score: 0, raw: 0,  max: 30 },
    protein:  { score: 0, raw: 0,  goal: 165, max: 20 },
    water:    { score: 0, raw: 0,  goal: 3500, max: 20 },
    fasting:  { score: 0, completed: false, hours: 0, max: 20 },
    workout:  { score: 0, exists: false, max: 10 },
  })
  const [daysUsed,    setDaysUsed]    = useState(0)
  const [trend,       setTrend]       = useState<'up' | 'down' | 'stable'>('stable')
  const [forecast,    setForecast]    = useState(0)
  const [forecastMsg, setForecastMsg] = useState('')
  const [oneAction,   setOneAction]   = useState<OneActionBoost | null>(null)
  const [milestones,  setMilestones]  = useState<string[]>([])
  const [isLoading,   setIsLoading]   = useState(true)

  const calculate = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = todayISO()
      const now   = new Date()

      // ── Profile ──────────────────────────────────────────────────────────
      const { data: profile } = await supabase
        .from('profiles')
        .select('protein_goal, water_goal_ml, fasting_window')
        .eq('user_id', user.id)
        .single()

      const proteinGoal = profile?.protein_goal   ?? 165
      const waterGoal   = profile?.water_goal_ml  ?? 3500
      const fastingWin  = profile?.fasting_window ?? 16

      // ── daily_logs ────────────────────────────────────────────────────────
      const { data: dailyLog } = await supabase
        .from('daily_logs')
        .select('recovery_score, fasting_start')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      // ── Meals (protein) ───────────────────────────────────────────────────
      const { data: mealsData } = await supabase
        .from('meals')
        .select('protein')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`)

      const proteinRaw = (mealsData ?? []).reduce((s: number, m: any) => s + (m.protein ?? 0), 0)

      // ── Water ─────────────────────────────────────────────────────────────
      const { data: waterData } = await supabase
        .from('water_logs')
        .select('amount_ml')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`)

      const waterRaw = (waterData ?? []).reduce((s: number, w: any) => s + (w.amount_ml ?? 0), 0)

      // ── Workout ───────────────────────────────────────────────────────────
      const { data: workoutData } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`)
        .limit(1)

      // ── Calc Axes ─────────────────────────────────────────────────────────
      const recoveryRaw   = dailyLog?.recovery_score ?? 0
      const recoveryScore = Math.round((recoveryRaw / 100) * 30 * 10) / 10
      const proteinScore  = Math.round(Math.min(proteinRaw / proteinGoal, 1) * 20 * 10) / 10
      const waterScore    = Math.round(Math.min(waterRaw   / waterGoal,   1) * 20 * 10) / 10

      let fastingScore = 0, fastingHours = 0, fastingDone = false
      if (dailyLog?.fasting_start) {
        fastingHours = (now.getTime() - new Date(dailyLog.fasting_start).getTime()) / 3600000
        fastingDone  = fastingHours >= fastingWin
        fastingScore = fastingDone ? 20 : 0
      }

      const workoutExists = (workoutData?.length ?? 0) > 0
      const workoutScore  = workoutExists ? 10 : 0
      const todayTotal    = Math.min(
        Math.round(recoveryScore + proteinScore + waterScore + fastingScore + workoutScore),
        100
      )

      // ── BioSov (last 10 days) ─────────────────────────────────────────────
      const tenDaysAgo = new Date()
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 9)
      const from10 = tenDaysAgo.toISOString().split('T')[0]

      const { data: historyData } = await supabase
        .from('behavioral_scores')
        .select('date, daily_score, breakdown')
        .eq('user_id', user.id)
        .gte('date', from10)
        .lte('date', today)
        .order('date', { ascending: false })

      const pastScores = (historyData ?? []).filter((r: any) => r.date !== today)
      const allScores  = [{ date: today, daily_score: todayTotal }, ...pastScores]
      const daysCount  = allScores.length
      const sumScores  = allScores.reduce((s: number, r: any) => s + (r.daily_score ?? 0), 0)
      const biosov     = Math.min(Math.round((sumScores / daysCount) * 10), 1000)

      // ── Trend ─────────────────────────────────────────────────────────────
      const prevEntry = pastScores[0]
      const prevVal   = prevEntry?.daily_score ?? null
      const t: 'up' | 'down' | 'stable' =
        prevVal === null ? 'stable'
        : todayTotal > prevVal ? 'up'
        : todayTotal < prevVal ? 'down'
        : 'stable'

      // ── Milestones ────────────────────────────────────────────────────────
      const prevAchieved: string[] = (historyData?.[0] as any)?.breakdown?.milestones_achieved ?? []
      const newMilestones: string[] = []
      const check = (key: string, cond: boolean) => {
        if (cond && !prevAchieved.includes(key)) newMilestones.push(key)
      }
      check('first_70',   todayTotal >= 70)
      check('first_80',   todayTotal >= 80)
      check('first_90',   todayTotal >= 90)
      check('biosov_700', biosov >= 700)
      check('biosov_800', biosov >= 800)
      const sorted = [...allScores].sort((a, b) => a.date < b.date ? 1 : -1)
      let streak = 0
      for (const s of sorted) { if (s.daily_score >= 70) streak++; else break }
      check('streak_3', streak >= 3)
      check('streak_7', streak >= 7)

      // ── Breakdown ─────────────────────────────────────────────────────────
      const bd: ScoreBreakdown = {
        recovery: { score: recoveryScore, raw: recoveryRaw,  max: 30 },
        protein:  { score: proteinScore,  raw: proteinRaw,   goal: proteinGoal, max: 20 },
        water:    { score: waterScore,    raw: waterRaw,     goal: waterGoal,   max: 20 },
        fasting:  { score: fastingScore,  completed: fastingDone, hours: Math.round(fastingHours * 10) / 10, max: 20 },
        workout:  { score: workoutScore,  exists: workoutExists, max: 10 },
        days_used:  daysCount,
        days_total: 10,
        milestones_achieved: [...prevAchieved, ...newMilestones],
      }

      // ── Forecast ──────────────────────────────────────────────────────────
      const hourOfDay   = now.getHours() + now.getMinutes() / 60
      const dayFraction = Math.min(hourOfDay / 24, 1)
      const fProt  = dayFraction > 0.05 ? Math.min(proteinRaw / dayFraction / proteinGoal, 1) * 20 : proteinScore
      const fWater = dayFraction > 0.05 ? Math.min(waterRaw   / dayFraction / waterGoal,   1) * 20 : waterScore
      let fFasting = fastingScore, fFastingDone = fastingScore
      if (!fastingDone && dailyLog?.fasting_start) {
        const remH = fastingWin - fastingHours
        fFasting      = remH <= (24 - hourOfDay) ? 20 : 0
        fFastingDone  = 20
      }
      const forecastVal = Math.min(Math.round(recoveryScore + fProt + fWater + fFasting + workoutScore), 100)
      const fIfFasting  = Math.min(Math.round(recoveryScore + fProt + fWater + fFastingDone + workoutScore), 100)
      const fMsg = (!fastingDone && dailyLog?.fasting_start && fIfFasting > forecastVal)
        ? `إذا أكملت الصيام → ${fIfFasting}`
        : ''

      // ── One-Action ────────────────────────────────────────────────────────
      let action: OneActionBoost | null = null
      if (!fastingDone && dailyLog?.fasting_start) {
        const remH = fastingWin - fastingHours
        if (remH > 0 && remH <= (24 - hourOfDay))
          action = { label: 'أكمل صيامك', points: 20, icon: '🌙' }
      }
      if (!action && !workoutExists)
        action = { label: 'سجّل تمريناً', points: 10, icon: '💪' }
      if (!action && waterRaw / waterGoal < 0.7) {
        const need = Math.round(waterGoal * 0.7 - waterRaw)
        action = { label: `اشرب ${need} مل ماء`, points: Math.round((need / waterGoal) * 20), icon: '💧' }
      }
      if (!action && proteinRaw / proteinGoal < 0.7) {
        const pts = Math.round(((proteinGoal * 0.7 - proteinRaw) / proteinGoal) * 20)
        action = { label: 'أضف وجبة بروتين', points: Math.max(pts, 1), icon: '🥩' }
      }

      // ── Upsert ────────────────────────────────────────────────────────────
      await supabase.from('behavioral_scores').upsert({
        user_id:      user.id,
        date:         today,
        daily_score:  todayTotal,
        biosov_score: biosov,
        breakdown:    bd,
      }, { onConflict: 'user_id,date' })

      // ── Set State ─────────────────────────────────────────────────────────
      setDailyScore(todayTotal)
      setBiosovScore(biosov)
      setBreakdown(bd)
      setDaysUsed(daysCount)
      setTrend(t)
      setForecast(forecastVal)
      setForecastMsg(fMsg)
      setOneAction(action)
      setMilestones(newMilestones)

    } catch (e) {
      console.error('[useDailyScore]', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    calculate()
    const tables = ['water_logs', 'meals', 'daily_logs', 'workouts']
    const channels = tables.map(table =>
      supabase
        .channel(`ds-${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => calculate())
        .subscribe()
    )
    return () => { channels.forEach(c => supabase.removeChannel(c)) }
  }, [calculate])

  return {
    dailyScore, biosovScore, breakdown, daysUsed, trend,
    forecast, forecastMsg, oneAction, milestones, isLoading,
    recalculate: calculate,
  }
}