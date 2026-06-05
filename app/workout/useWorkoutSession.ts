'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Exercise } from './exercises'
import { AIWorkoutPlan, AISetSuggestion, WhoopAnalysis } from '@/lib/workoutAI'

export type Phase = 'prep' | 'active' | 'rest' | 'whoop' | 'summary'

export interface SetEntry {
  setNumber: number
  suggestedWeight: number
  suggestedReps: number
  targetRPE: number
  actualWeight: number | null
  actualReps: number | null
  actualRPE: number | null
  completedAt: number | null
  noteAr?: string
  note?: string
}

export interface ExerciseSession {
  exercise: Exercise
  sets: SetEntry[]
  startedAt: number | null
  completedAt: number | null
  restBetweenSets: number[]
  isComplete: boolean
}

export interface WorkoutState {
  phase: Phase
  currentExerciseIndex: number
  exercises: ExerciseSession[]
  aiPlan: AIWorkoutPlan | null
  isPlanLoading: boolean
  restCountdown: number
  restTarget: number
  restIsActive: boolean
  // NEW: track which set just completed for inline rest
  lastCompletedSetIndex: number | null
  whoopImage: string | null
  whoopAnalysis: WhoopAnalysis | null
  whoopLoading: boolean
  sessionStartedAt: number | null
  sessionEndedAt: number | null
  totalVolume: number
  newPRs: { exercise: string; weight: number; reps: number }[]
  ar: boolean
}

export function useWorkoutSession(
  exercises: Exercise[],
  dailyContext: any,
  prRecords: any[]
) {
  const [state, setState] = useState<WorkoutState>({
    phase: 'prep',
    currentExerciseIndex: 0,
    exercises: [],
    aiPlan: null,
    isPlanLoading: false,
    restCountdown: 0,
    restTarget: 90,
    restIsActive: false,
    lastCompletedSetIndex: null,
    whoopImage: null,
    whoopAnalysis: null,
    whoopLoading: false,
    sessionStartedAt: null,
    sessionEndedAt: null,
    totalVolume: 0,
    newPRs: [],
    ar: true,
  })

  const restTimer = useRef<NodeJS.Timeout | null>(null)

  const hydrateExercises = useCallback((plan: AIWorkoutPlan): ExerciseSession[] => {
    return exercises.map(ex => {
      const aiEx = plan.exercises.find(p => p.exerciseId === ex.id)
      const sets: SetEntry[] = aiEx
        ? aiEx.sets.map(s => ({
            setNumber: s.setNumber,
            suggestedWeight: s.suggestedWeight,
            suggestedReps: s.suggestedReps,
            targetRPE: s.targetRPE,
            actualWeight: null,
            actualReps: null,
            actualRPE: null,
            completedAt: null,
            noteAr: s.noteAr,
            note: s.note,
          }))
        : Array.from({ length: ex.defaultSets }, (_, i) => ({
            setNumber: i + 1,
            suggestedWeight: 60,
            suggestedReps: ex.defaultReps,
            targetRPE: i === 0 ? 6 : 7 + Math.min(i, 2) * 0.5,
            actualWeight: null,
            actualReps: null,
            actualRPE: null,
            completedAt: null,
          }))
      return {
        exercise: ex,
        sets,
        startedAt: null,
        completedAt: null,
        restBetweenSets: [],
        isComplete: false,
      }
    })
  }, [exercises])

  const startSession = useCallback((plan: AIWorkoutPlan) => {
    const hydrated = hydrateExercises(plan)
    hydrated[0] = { ...hydrated[0], startedAt: Date.now() }
    setState(s => ({
      ...s,
      phase: 'active',
      exercises: hydrated,
      sessionStartedAt: Date.now(),
    }))
  }, [hydrateExercises])

  const updateSet = useCallback((exIndex: number, setIndex: number, field: 'actualWeight' | 'actualReps' | 'actualRPE', value: number) => {
    setState(s => {
      const exercises = [...s.exercises]
      const ex = { ...exercises[exIndex] }
      const sets = [...ex.sets]
      sets[setIndex] = { ...sets[setIndex], [field]: value }
      ex.sets = sets
      exercises[exIndex] = ex
      return { ...s, exercises }
    })
  }, [])

  const completeSet = useCallback((exIndex: number, setIndex: number) => {
    const now = Date.now()
    setState(s => {
      const exercises = [...s.exercises]
      const ex = { ...exercises[exIndex] }
      const sets = [...ex.sets]
      const prev = sets[setIndex - 1]?.completedAt
      sets[setIndex] = { ...sets[setIndex], completedAt: now }
      if (prev) ex.restBetweenSets = [...ex.restBetweenSets, now - prev]
      ex.sets = sets
      exercises[exIndex] = ex

      const isLastSet = setIndex === ex.sets.length - 1
      const isLastExercise = exIndex === exercises.length - 1

      if (isLastSet) {
        exercises[exIndex] = { ...exercises[exIndex], isComplete: true, completedAt: now }
      }

      const plan = s.aiPlan
      const restTarget = plan?.exercises.find(p => p.exerciseId === ex.exercise.id)?.restSeconds || 90

      // ── KEY CHANGE ──
      // بين الـ sets: نبقى في 'active' ونشغّل الـ rest inline
      // بين التمارين: ننتقل لـ 'rest' كالمعتاد
      const shouldGoToRestPage = isLastSet && !isLastExercise

      return {
        ...s,
        exercises,
        restCountdown: restTarget,
        restTarget,
        restIsActive: shouldGoToRestPage,
        lastCompletedSetIndex: isLastSet ? null : setIndex,
        // انتقل لصفحة rest فقط بين التمارين
        phase: shouldGoToRestPage ? 'rest' : s.phase,
      }
    })
  }, [])

  // rest countdown — بين التمارين فقط
  useEffect(() => {
    if (state.restIsActive && state.restCountdown > 0) {
      restTimer.current = setTimeout(() => {
        setState(s => ({ ...s, restCountdown: s.restCountdown - 1 }))
      }, 1000)
    } else if (state.restIsActive && state.restCountdown === 0) {
      setState(s => ({ ...s, restIsActive: false, phase: 'active' }))
    }
    return () => { if (restTimer.current) clearTimeout(restTimer.current) }
  }, [state.restIsActive, state.restCountdown])

  const skipRest = useCallback(() => {
    setState(s => ({ ...s, restIsActive: false, restCountdown: 0, phase: 'active' }))
  }, [])

  const nextExercise = useCallback(() => {
    setState(s => {
      const nextIndex = s.currentExerciseIndex + 1
      if (nextIndex >= s.exercises.length) {
        return { ...s, phase: 'whoop', sessionEndedAt: Date.now() }
      }
      const exercises = [...s.exercises]
      exercises[nextIndex] = { ...exercises[nextIndex], startedAt: Date.now() }
      return { ...s, currentExerciseIndex: nextIndex, exercises, phase: 'active', lastCompletedSetIndex: null }
    })
  }, [])

  const uploadWhoopImage = useCallback(async (base64: string) => {
    setState(s => ({ ...s, whoopImage: base64, whoopLoading: true }))
    try {
      const { analyzeWhoopImage } = await import('@/lib/workoutAI')
      const volume = calcTotalVolume(state.exercises)
      const exerciseNames = state.exercises.map(e => e.exercise.nameEn)
      const analysis = await analyzeWhoopImage(base64, volume, exerciseNames)
      setState(s => ({ ...s, whoopAnalysis: analysis, whoopLoading: false, phase: 'summary' }))
    } catch {
      setState(s => ({ ...s, whoopLoading: false, phase: 'summary' }))
    }
  }, [state.exercises])

  const skipWhoop = useCallback(() => {
    setState(s => ({ ...s, phase: 'summary' }))
  }, [])

  const checkPR = useCallback((exId: string, weight: number, reps: number) => {
    const pr = prRecords.find(p => p.exercise_name === exId)
    if (!pr || weight > pr.weight || (weight === pr.weight && reps > pr.reps)) {
      setState(s => ({
        ...s,
        newPRs: [...s.newPRs.filter(p => p.exercise !== exId), { exercise: exId, weight, reps }]
      }))
      return true
    }
    return false
  }, [prRecords])

  const toggleLang = useCallback(() => setState(s => ({ ...s, ar: !s.ar })), [])

  const totalVolume = calcTotalVolume(state.exercises)

  return {
    state: { ...state, totalVolume },
    startSession,
    updateSet,
    completeSet,
    skipRest,
    nextExercise,
    uploadWhoopImage,
    skipWhoop,
    checkPR,
    toggleLang,
    setState,
  }
}

function calcTotalVolume(exercises: ExerciseSession[]): number {
  return exercises.reduce((total, ex) => {
    return total + ex.sets.reduce((sum, set) => {
      const w = set.actualWeight || 0
      const r = set.actualReps || 0
      return sum + w * r
    }, 0)
  }, 0)
}
