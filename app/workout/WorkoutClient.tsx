'use client'
import { useEffect, useState } from 'react'
import { getExercisesForGroups, getTodayPlan, Exercise } from './exercises'
import { useWorkoutSession } from './useWorkoutSession'
import { fetchWorkoutPlan, DailyContext } from '@/lib/workoutAI'
import PhasePrep    from './components/PhasePrep'
import PhaseActive  from './components/PhaseActive'
import PhaseRest    from './components/PhaseRest'
import PhaseWhoop   from './components/PhaseWhoop'
import PhaseSummary from './components/PhaseSummary'

interface Props { dailyContext: DailyContext; prRecords: any[]; userId: string }

export default function WorkoutClient({ dailyContext, prRecords, userId }: Props) {
  const todayPlan = getTodayPlan()
  const [exerciseList, setExerciseList] = useState<Exercise[]>(
    getExercisesForGroups(todayPlan.groups)
  )

  const {
    state, startSession, updateSet, completeSet,
    skipRest, nextExercise, uploadWhoopImage,
    skipWhoop, checkPR, toggleLang, setState,
  } = useWorkoutSession(exerciseList, dailyContext, prRecords)

  useEffect(() => {
    if (!exerciseList.length) return
    setState(s => ({ ...s, isPlanLoading: true }))
    fetchWorkoutPlan(dailyContext, exerciseList)
      .then(plan => setState(s => ({ ...s, aiPlan: plan, isPlanLoading: false })))
      .catch(() => setState(s => ({ ...s, isPlanLoading: false })))
  }, [])

  function handleSwap(oldId: string, newEx: Exercise) {
    setExerciseList(prev => prev.map(e => e.id === oldId ? newEx : e))
  }

  const completedExercises = state.exercises
    .filter(e => e.isComplete)
    .map(e => e.exercise.id)

  const exerciseResults: Record<string, { maxWeight: number; setsCompleted: number; newPR: boolean }> = {}
  state.exercises.forEach(ex => {
    if (ex.isComplete) {
      const maxWeight = Math.max(...ex.sets.map(s => s.actualWeight || 0))
      const setsCompleted = ex.sets.filter(s => s.completedAt !== null).length
      const newPR = state.newPRs.some(p => p.exercise === ex.exercise.id)
      exerciseResults[ex.exercise.id] = { maxWeight, setsCompleted, newPR }
    }
  })

  const { ar, phase } = state

  return (
    <div style={{
      fontFamily: "'Cairo','DM Sans',sans-serif",
      direction: ar ? 'rtl' : 'ltr',
      minHeight: '100vh',
    }}>
      {phase !== 'prep' && (
        <div style={{ position: 'fixed', top: 12, left: ar ? 12 : 'auto', right: ar ? 'auto' : 12, zIndex: 101 }}>
          <button onClick={toggleLang} style={{ padding: '5px 11px', borderRadius: 7, background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(30,50,90,0.1)', fontSize: 9, fontWeight: 700, color: '#7C3AED', cursor: 'pointer' }}>
            {ar ? 'EN' : 'عر'}
          </button>
        </div>
      )}

      {phase !== 'prep' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 3, background: 'rgba(30,50,90,0.08)' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg,#7C3AED,#1A73E8,#00A87A)',
            width: `${(['prep','active','rest','whoop','summary'].indexOf(phase) / 4) * 100}%`,
            transition: 'width .5s ease',
          }} />
        </div>
      )}

      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>

        {phase === 'prep' && (
          <PhasePrep
            ar={ar}
            todayPlan={todayPlan}
            exercises={exerciseList}
            dailyContext={dailyContext}
            aiPlan={state.aiPlan}
            isPlanLoading={state.isPlanLoading}
            onStart={(restSecs) => {
              if (state.aiPlan) startSession(state.aiPlan)
            }}
            onSwapExercise={handleSwap}
            completedExercises={completedExercises}
            exerciseResults={exerciseResults}
            onToggleLang={toggleLang}
          />
        )}

        {phase === 'active' && (
          <PhaseActive
            ar={ar}
            exerciseSession={state.exercises[state.currentExerciseIndex]}
            exerciseIndex={state.currentExerciseIndex}
            totalExercises={state.exercises.length}
            aiPlan={state.aiPlan}
            dailyContext={dailyContext}
            sessionVolume={state.totalVolume}
            sessionStartedAt={state.sessionStartedAt}
            onUpdateSet={updateSet}
            onCompleteSet={completeSet}
            onNextExercise={nextExercise}
            onCheckPR={checkPR}
            newPRs={state.newPRs}
            lastCompletedSetIndex={state.lastCompletedSetIndex}
            restCountdown={state.restCountdown}
            restTarget={state.restTarget}
          />
        )}

        {phase === 'rest' && (
          <PhaseRest
            ar={ar}
            countdown={state.restCountdown}
            target={state.restTarget}
            onSkip={skipRest}
            currentExercise={state.exercises[state.currentExerciseIndex]?.exercise}
            nextExercise={state.exercises[state.currentExerciseIndex + 1]?.exercise}
          />
        )}

        {phase === 'whoop' && (
          <PhaseWhoop ar={ar} onUpload={uploadWhoopImage} onSkip={skipWhoop} isLoading={state.whoopLoading} />
        )}

        {phase === 'summary' && (
          <PhaseSummary
            ar={ar}
            exercises={state.exercises}
            totalVolume={state.totalVolume}
            newPRs={state.newPRs}
            whoopAnalysis={state.whoopAnalysis}
            sessionDuration={state.sessionEndedAt && state.sessionStartedAt ? state.sessionEndedAt - state.sessionStartedAt : 0}
            userId={userId}
            dailyContext={dailyContext}
          />
        )}
      </div>
    </div>
  )
}
