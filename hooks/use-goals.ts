'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface GoalsData {
  protein_goal: number
  water_goal: number
  calorie_goal: number
  fasting_window_hours: number
  eating_window_start: string
  goals_completed_at: string | null
}

const DEFAULTS: GoalsData = {
  protein_goal: 165,
  water_goal: 5.0,
  calorie_goal: 2200,
  fasting_window_hours: 18,
  eating_window_start: '12:00',
  goals_completed_at: null,
}

export function useGoals() {
  const [goals, setGoals] = useState<GoalsData>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isReview, setIsReview] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('protein_goal, water_goal, calorie_goal, fasting_window_hours, eating_window_start, goals_completed_at')
        .eq('id', user.id)
        .single()
      if (data) {
        setGoals({
          protein_goal: data.protein_goal ?? DEFAULTS.protein_goal,
          water_goal: data.water_goal ?? DEFAULTS.water_goal,
          calorie_goal: data.calorie_goal ?? DEFAULTS.calorie_goal,
          fasting_window_hours: data.fasting_window_hours ?? DEFAULTS.fasting_window_hours,
          eating_window_start: data.eating_window_start?.slice(0, 5) ?? DEFAULTS.eating_window_start,
          goals_completed_at: data.goals_completed_at,
        })
        if (data.goals_completed_at) setIsReview(true)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function saveGoals(values: GoalsData) {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'no user' }
    const payload = {
      ...values,
      goals_completed_at: values.goals_completed_at ?? new Date().toISOString(),
    }
    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)
    setSaving(false)
    if (!error) setIsReview(true)
    return { error }
  }

  return { goals, setGoals, loading, saving, isReview, saveGoals }
}
