'use client'
import { useEffect, useState } from 'react'
import { ExerciseSession } from '../useWorkoutSession'
import { WhoopAnalysis, DailyContext } from '@/lib/workoutAI'
import { supabase } from '@/lib/supabase'

interface Props {
  ar: boolean
  exercises: ExerciseSession[]
  totalVolume: number
  newPRs: { exercise: string; weight: number; reps: number }[]
  whoopAnalysis: WhoopAnalysis | null
  sessionDuration: number
  userId: string
  dailyContext: DailyContext
}

const C = {
  surf: 'rgba(255,255,255,0.88)', surf2: '#F5F8FC',
  brd: 'rgba(30,50,90,0.08)',
  t1: '#0D1B2A', t2: '#5A6A82', t3: '#94A3B8',
  grn: '#00A87A', gbg: 'rgba(0,168,122,0.08)', gtx: '#006B4F',
  pur: '#7C3AED', pbg: 'rgba(124,58,237,0.08)', ptx: '#5B21B6',
  blu: '#1A73E8', bbg: 'rgba(26,115,232,0.08)',
  shadow: '0 2px 12px rgba(13,27,42,0.06)', r: '14px', rs: '9px',
}

export default function PhaseSummary({
  ar, exercises, totalVolume, newPRs, whoopAnalysis,
  sessionDuration, userId, dailyContext,
}: Props) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const durationMin = Math.round(sessionDuration / 60000)
  const completedExercises = exercises.filter(e => e.isComplete)

  const exerciseVolumes = exercises.map(ex => {
    const vol = ex.sets.reduce((sum, s) => sum + (s.actualWeight || 0) * (s.actualReps || 0), 0)
    const sets = ex.sets.filter(s => s.completedAt !== null).length
    const maxWeight = Math.max(0, ...ex.sets.map(s => s.actualWeight || 0))
    return { exercise: ex.exercise, vol, sets, maxWeight }
  })

  useEffect(() => {
    if (!saved && !saving) saveToSupabase()
  }, [])

  async function saveToSupabase() {
    setSaving(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const rows = exercises.map(ex => ({
        user_id: userId,
        date: today,
        exercise_name: ex.exercise.id,
        sets: ex.sets.map(s => ({
          weight: s.actualWeight || s.suggestedWeight,
          reps: s.actualReps || s.suggestedReps,
          rpe: s.actualRPE || s.targetRPE,
        })),
        hrv_at_time: (dailyContext as any)?.hrv ?? 0,
        recovery_score: (dailyContext as any)?.recovery_score ?? 0,
        knee_flagged: ex.exercise.kneeFlag,
        ai_suggestion: '',
        notes: whoopAnalysis
          ? (ar ? whoopAnalysis.performanceMatchAr : whoopAnalysis.performanceMatchEn)
          : null,
      }))
      await supabase.from('workouts').insert(rows)
      for (const pr of newPRs) {
        await supabase.from('pr_records').upsert({
          user_id: userId,
          exercise_name: pr.exercise,
          weight: pr.weight,
          reps: pr.reps,
          date: today,
        }, { onConflict: 'user_id,exercise_name' })
      }
      setSaved(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto', padding: '16px 16px 40px',
      direction: ar ? 'rtl' : 'ltr',
      fontFamily: "\'Cairo\',\'DM Sans\',sans-serif",
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(13,27,60,0.84),rgba(20,35,80,0.80))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: C.r, padding: '20px 14px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(13,27,60,0.3)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.25),transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>🏋️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            {ar ? 'جلسة ممتازة!' : 'Great Session!'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
            {ar
              ? `${completedExercises.length} تمرين · ${durationMin} دقيقة`
              : `${completedExercises.length} exercises · ${durationMin} min`}
          </div>
          <div style={{
            marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20,
            background: saved ? 'rgba(0,168,122,0.2)' : saving ? 'rgba(26,115,232,0.2)' : 'rgba(220,38,38,0.2)',
            border: `1px solid ${saved ? 'rgba(0,168,122,0.3)' : saving ? 'rgba(26,115,232,0.3)' : 'rgba(220,38,38,0.3)'}`,
          }}>
            {saving && (
              <div style={{ width: 10, height: 10, border: '1.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
            )}
            <span style={{ fontSize: 9, fontWeight: 700, color: saved ? '#86EFAC' : saving ? '#93C5FD' : '#FCA5A5' }}>
              {saved
                ? (ar ? '✓ محفوظ في Supabase' : '✓ Saved to Supabase')
                : saving
                ? (ar ? 'يحفظ...' : 'Saving...')
                : (ar ? 'خطأ في الحفظ' : 'Save error')}
            </span>
          </div>
        </div>
      </div>

      {/* Volume stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
        {[
          { label: ar ? 'الحجم الكلي' : 'Total Volume', value: totalVolume > 1000 ? `${(totalVolume/1000).toFixed(1)}t` : `${totalVolume}kg`, color: C.pur },
          { label: ar ? 'التمارين' : 'Exercises', value: String(completedExercises.length), color: C.blu },
          { label: ar ? 'PRs جديدة' : 'New PRs', value: String(newPRs.length), color: C.grn },
        ].map(m => (
          <div key={m.label} style={{ background: C.surf, border: `1px solid ${C.brd}`, borderRadius: C.rs, padding: '10px', textAlign: 'center', boxShadow: C.shadow }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: m.color, lineHeight: 1.1 }}>{m.value}</div>
            <div style={{ fontSize: 9, color: C.t3, fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '.5px' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Per-exercise breakdown */}
      <div style={{ background: C.surf, border: `1px solid ${C.brd}`, borderRadius: C.r, padding: '12px 14px', boxShadow: C.shadow }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.t3, letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 10 }}>
          {ar ? 'تفصيل التمارين' : 'Exercise Breakdown'}
        </div>
        {exerciseVolumes.map(({ exercise, vol, sets, maxWeight }) => {
          const pr = newPRs.find(p => p.exercise === exercise.id)
          return (
            <div key={exercise.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.brd}` }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>{exercise.thumbnailEmoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.t1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {ar ? exercise.nameAr : exercise.nameEn}
                  {pr && (
                    <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 20, background: C.gbg, color: C.gtx, fontWeight: 700 }}>
                      🏆 PR
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>
                  {sets} {ar ? 'عدات' : 'sets'} · {ar ? 'أقصى وزن' : 'max'}: {maxWeight}kg
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.pur }}>{vol > 0 ? vol.toLocaleString() : '—'}</div>
                <div style={{ fontSize: 8, color: C.t3 }}>kg × reps</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* New PRs */}
      {newPRs.length > 0 && (
        <div style={{ background: C.gbg, border: '1px solid rgba(0,168,122,0.2)', borderRadius: C.r, padding: '12px 14px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.gtx, letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 8 }}>
            🏆 {ar ? 'أرقام قياسية جديدة!' : 'New Personal Records!'}
          </div>
          {newPRs.map(pr => (
            <div key={pr.exercise} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: `1px solid rgba(0,168,122,0.1)` }}>
              <span style={{ fontSize: 11, color: C.gtx, fontWeight: 600 }}>{pr.exercise}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.grn }}>{pr.weight}kg × {pr.reps}</span>
            </div>
          ))}
        </div>
      )}

      {/* WHOOP Analysis */}
      {whoopAnalysis && (
        <div style={{ background: 'linear-gradient(135deg,rgba(13,27,60,0.75),rgba(20,35,80,0.70))', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: C.r, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 18 }}>⚡</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.6px', textTransform: 'uppercase' }}>
              {ar ? 'تحليل WHOOP' : 'WHOOP Analysis'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 10 }}>
            {[
              { label: 'Strain', value: whoopAnalysis.strainScore?.toFixed(1) || '—', color: '#FCD34D' },
              { label: 'HRV Post', value: whoopAnalysis.hrvPost ? `${whoopAnalysis.hrvPost}ms` : '—', color: '#86EFAC' },
            ].map(m => (
              <div key={m.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 9, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: m.color, lineHeight: 1.1 }}>{m.value}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '7px 9px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,.7)', lineHeight: 1.5, marginBottom: 6 }}>
            {ar ? whoopAnalysis.performanceMatchAr : whoopAnalysis.performanceMatchEn}
          </div>
          <div style={{ padding: '7px 9px', background: 'rgba(0,168,122,0.12)', borderRadius: 8, border: '1px solid rgba(0,168,122,0.2)', fontSize: 10, color: '#86EFAC' }}>
            💡 {ar ? whoopAnalysis.nextSessionTipAr : whoopAnalysis.nextSessionTipEn}
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: 'rgba(255,255,255,.4)', textAlign: 'center' }}>
            {ar ? `Recovery القادم: ${whoopAnalysis.recoveryNextDay}` : `Next recovery: ${whoopAnalysis.recoveryNextDay}`}
          </div>
        </div>
      )}

      {/* Back */}
      <a href="/" style={{ display: 'block', background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.brd}`, borderRadius: C.rs, padding: '12px 24px', fontSize: 13, fontWeight: 700, color: C.t1, textAlign: 'center', textDecoration: 'none', boxShadow: C.shadow }}>
        {ar ? '← العودة للداشبورد' : '← Back to Dashboard'}
      </a>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
