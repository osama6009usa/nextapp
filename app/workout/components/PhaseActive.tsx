'use client'

import { useState, useEffect } from 'react'
import { ExerciseSession, SetEntry } from '../useWorkoutSession'
import { AIWorkoutPlan, DailyContext } from '@/lib/workoutAI'

interface Props {
  ar: boolean
  exerciseSession: ExerciseSession
  exerciseIndex: number
  totalExercises: number
  aiPlan: AIWorkoutPlan | null
  dailyContext: DailyContext
  sessionVolume: number
  sessionStartedAt: number | null
  onUpdateSet: (exIndex: number, setIndex: number, field: 'actualWeight' | 'actualReps' | 'actualRPE', value: number) => void
  onCompleteSet: (exIndex: number, setIndex: number) => void
  onNextExercise: () => void
  onCheckPR: (exId: string, weight: number, reps: number) => boolean
  newPRs: { exercise: string; weight: number; reps: number }[]
}

const RPE_OPTS = [
  { v: 6,  emoji: '😊', ar: 'سهل',    en: 'Easy'      },
  { v: 7,  emoji: '😤', ar: 'متوسط',  en: 'Moderate'  },
  { v: 8,  emoji: '💪', ar: 'صعب',    en: 'Hard'      },
  { v: 9,  emoji: '🔥', ar: 'شديد',   en: 'Very hard' },
  { v: 10, emoji: '💀', ar: 'فشل',    en: 'Failure'   },
]

function fmtMs(ms: number) {
  const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}
function fmtClock(ms: number) {
  const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

// ── AI Weight Card ──
function AIWeightCard({ sets, ar, recoveryScore, hrv, onApply }: {
  sets: SetEntry[]; ar: boolean; recoveryScore: number; hrv: number; onApply: () => void
}) {
  const [active, setActive] = useState(0)
  const [applied, setApplied] = useState(false)

  const reasons = sets.map((s, i) => {
    if (i === 0) return ar
      ? `HRV <strong>${hrv}ms</strong> · Recovery <strong>${recoveryScore}%</strong> — ${recoveryScore >= 80 ? 'جسمك أفضل من المعتاد، تقدّم طفيف مقترح.' : 'حافظ على نفس الأوزان.'}`
      : `HRV <strong>${hrv}ms</strong> · Recovery <strong>${recoveryScore}%</strong> — ${recoveryScore >= 80 ? 'Above baseline, slight progression suggested.' : 'Maintain same weights.'}`
    if (i === sets.length - 1) return ar
      ? 'آخر set وأثقله — توقف عند RPE 9 ولا تخاطر بالإصابة.'
      : 'Final and heaviest set — stop at RPE 9, avoid injury.'
    return ar
      ? `الـ Set ${i + 1}: <strong>${s.suggestedWeight} kg × ${s.suggestedReps}</strong> — تقدم تدريجي.`
      : `Set ${i + 1}: <strong>${s.suggestedWeight} kg × ${s.suggestedReps}</strong> — gradual progression.`
  })

  return (
    <div style={{
      background: 'linear-gradient(135deg,rgba(124,58,237,.18),rgba(0,168,122,.1))',
      border: '1px solid rgba(124,58,237,.3)', borderRadius: 16,
      padding: '14px 16px', marginBottom: 14, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,.15),transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 22, height: 22, background: 'rgba(124,58,237,.3)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✦</div>
        <div style={{ fontSize: 11, color: '#C4B5FD', fontWeight: 700, flex: 1 }}>
          {ar ? 'اقتراح Claude لليوم' : "Claude's suggestion"}
        </div>
        <div style={{ fontSize: 10, color: '#94A3B8', background: 'rgba(0,168,122,.1)', border: '1px solid rgba(0,168,122,.2)', borderRadius: 6, padding: '2px 7px' }}>
          Recovery {recoveryScore}%
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {sets.map((s, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            flex: 1, background: active === i ? 'rgba(124,58,237,.25)' : 'rgba(255,255,255,.04)',
            border: `1px solid ${active === i ? '#7C3AED' : 'rgba(124,58,237,.2)'}`,
            borderRadius: 12, padding: '10px 8px', textAlign: 'center', cursor: 'pointer',
            position: 'relative', transition: 'all .2s', fontFamily: 'inherit',
          }}>
            {i > 0 && (
              <div style={{ position: 'absolute', top: 7, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,168,122,.2)', color: '#00A87A', fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                +{s.suggestedWeight - sets[i-1].suggestedWeight} kg
              </div>
            )}
            <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 4, fontWeight: 600 }}>Set {s.setNumber}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', lineHeight: 1 }}>{s.suggestedWeight}</div>
            <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 1 }}>kg</div>
            <div style={{ fontSize: 10, color: '#A78BFA', marginTop: 3, fontWeight: 600 }}>× {s.suggestedReps}</div>
          </button>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, padding: '8px 10px', fontSize: 11, color: '#94A3B8', lineHeight: 1.6, marginBottom: 10 }}
        dangerouslySetInnerHTML={{ __html: reasons[active] || '' }} />
      <button onClick={() => { setApplied(true); onApply() }} style={{
        width: '100%', background: applied ? 'rgba(0,168,122,.2)' : 'rgba(124,58,237,.25)',
        border: applied ? '1px solid rgba(0,168,122,.3)' : '1px solid rgba(124,58,237,.4)',
        borderRadius: 9, color: applied ? '#00A87A' : '#E9D5FF',
        padding: '8px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        fontFamily: 'inherit', transition: 'all .18s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <span>{applied ? '✓' : '↓'}</span>
        <span>{applied ? (ar ? 'تم التطبيق' : 'Applied') : (ar ? 'تطبيق على الجلسة' : 'Apply to session')}</span>
      </button>
    </div>
  )
}

// ── Video Bottom Sheet ──
function VideoSheet({ exercise, ar, onClose }: { exercise: ExerciseSession['exercise']; ar: boolean; onClose: () => void }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: '#1A2744', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, padding: 16 }}>
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 2, margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>
            {ar ? `شرح — ${exercise.nameAr}` : `Tutorial — ${exercise.nameEn}`}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div onClick={() => window.open(exercise.videoUrl, '_blank')} style={{ width: '100%', height: 160, background: 'linear-gradient(160deg,#0D1B2A,#1a2744)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: 52 }}>{exercise.thumbnailEmoji}</div>
          <div style={{ position: 'absolute', width: 52, height: 52, background: 'rgba(239,68,68,.85)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '18px solid white', marginRight: -3 }} />
          </div>
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(124,58,237,.7)', color: '#E9D5FF', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 5 }}>
            {ar ? exercise.muscleGroupAr : exercise.muscleGroup}
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.55, marginBottom: 12 }}>
          {ar ? exercise.notesAr || 'فيديو شرح التمرين على YouTube.' : exercise.notes || 'Full exercise tutorial on YouTube.'}
        </div>
        <button onClick={() => window.open(exercise.videoUrl, '_blank')} style={{ width: '100%', background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 9, color: '#F87171', padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          {ar ? 'فتح في YouTube' : 'Open in YouTube'}
        </button>
      </div>
    </div>
  )
}

// ── Inline Rest Timer ──
// يبدأ عند اكتمال set ويُخفى عند بدء الـ set التالي أو Skip
function InlineRestTimer({ targetSecs, nextSet, ar, onDone }: {
  targetSecs: number; nextSet: SetEntry | null; ar: boolean; onDone: () => void
}) {
  const [secs, setSecs] = useState(targetSecs)

  useEffect(() => {
    const iv = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { clearInterval(iv); onDone(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [])  // eslint-disable-line

  const pct = secs / targetSecs
  const circ = 188.5
  const color = pct > 0.5 ? '#7C3AED' : pct > 0.25 ? '#F59E0B' : '#EF4444'

  return (
    <div style={{ background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.22)', borderRadius: 14, padding: '14px 16px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
          <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(124,58,237,.15)" strokeWidth="5"/>
            <circle cx="36" cy="36" r="30" fill="none" stroke={color} strokeWidth="5"
              strokeDasharray={circ} strokeDashoffset={(circ * (1 - pct)).toFixed(1)}
              strokeLinecap="round" style={{ transition: 'stroke .5s' }}/>
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 20, fontWeight: 700, color: '#C4B5FD' }}>{secs}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#C4B5FD', marginBottom: 3 }}>
            {ar ? 'استرح — أداؤك ممتاز' : 'Rest — great set!'}
          </div>
          {nextSet && (
            <div style={{ fontSize: 10, color: '#94A3B8' }}>
              {ar ? 'الـ Set التالي: ' : 'Next set: '}
              <strong style={{ color: '#E9D5FF' }}>{nextSet.suggestedWeight} kg × {nextSet.suggestedReps}</strong>
            </div>
          )}
          {nextSet?.noteAr && (
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 5, padding: '4px 8px', background: 'rgba(255,255,255,.04)', borderRadius: 6, border: '1px solid rgba(255,255,255,.08)' }}>
              💡 {ar ? nextSet.noteAr : nextSet.note}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
        <button onClick={onDone} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(124,58,237,.3)', borderRadius: 8, color: '#A78BFA', padding: '7px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          {ar ? 'تخطي الراحة ←' : 'Skip rest →'}
        </button>
        {[30, 60].map(n => (
          <button key={n} onClick={() => setSecs(s => Math.min(s + n, 300))} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: '#94A3B8', padding: '7px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
            +{n}s
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function PhaseActive({
  ar, exerciseSession, exerciseIndex, totalExercises,
  aiPlan, dailyContext, sessionVolume, sessionStartedAt,
  onUpdateSet, onCompleteSet, onNextExercise, onCheckPR, newPRs,
}: Props) {
  const ex = exerciseSession?.exercise
  const sets = exerciseSession?.sets || []

  const [kneeState, setKneeState] = useState<'g' | 'a' | 'r' | null>(null)
  const [rpeSelected, setRpeSelected] = useState<number | null>(null)
  const [showVideo, setShowVideo] = useState(false)
  const [prBanner, setPrBanner] = useState<string | null>(null)

  // ── Rest timer state ──
  // activeRestAfter = index الـ set المكتمل الذي يعقبه rest
  // نستخدم Set لتتبع كل الـ sets التي انتهت راحتها
  const [activeRestAfter, setActiveRestAfter] = useState<number | null>(null)
  const [restDoneFor, setRestDoneFor] = useState<Set<number>>(new Set())

  // ── Set start times — لحساب elapsed ──
  const [setStartTimes, setSetStartTimes] = useState<Record<number, number>>({ 0: Date.now() })

  const [clock, setClock] = useState('0:00')

  useEffect(() => {
    const iv = setInterval(() => {
      if (sessionStartedAt) setClock(fmtClock(Date.now() - sessionStartedAt))
    }, 500)
    return () => clearInterval(iv)
  }, [sessionStartedAt])

  // reset عند تغيير التمرين
  useEffect(() => {
    setKneeState(null)
    setRpeSelected(null)
    setActiveRestAfter(null)
    setRestDoneFor(new Set())
    setSetStartTimes({ 0: Date.now() })
  }, [exerciseIndex])

  const restTarget = aiPlan?.exercises.find(p => p.exerciseId === ex?.id)?.restSeconds || 90
  const recoveryScore: number = (dailyContext as any)?.recovery_score ?? 75
  const hrv: number = (dailyContext as any)?.hrv ?? 55

  const handleCompleteSet = (setIndex: number) => {
    const s = sets[setIndex]
    const w = s.actualWeight ?? s.suggestedWeight
    const r = s.actualReps ?? s.suggestedReps
    if (w && r) {
      const isPR = onCheckPR(ex.id, w, r)
      if (isPR) {
        setPrBanner(`${ar ? ex.nameAr : ex.nameEn} — ${w} kg × ${r}`)
        setTimeout(() => setPrBanner(null), 4500)
      }
    }
    if (rpeSelected) onUpdateSet(exerciseIndex, setIndex, 'actualRPE', rpeSelected)
    onCompleteSet(exerciseIndex, setIndex)

    // ابدأ Rest إذا ليس آخر set
    if (setIndex < sets.length - 1) {
      setActiveRestAfter(setIndex)
    }
  }

  // عند انتهاء الراحة (تلقائي أو Skip)
  const handleRestDone = (setIndex: number) => {
    const nextIdx = setIndex + 1
    setActiveRestAfter(null)
    setRestDoneFor(prev => new Set(prev).add(setIndex))
    // سجّل وقت بداية الـ set التالي
    setSetStartTimes(prev => ({ ...prev, [nextIdx]: Date.now() }))
  }

  const handleApplyAI = () => {
    sets.forEach((s, i) => {
      onUpdateSet(exerciseIndex, i, 'actualWeight', s.suggestedWeight)
      onUpdateSet(exerciseIndex, i, 'actualReps', s.suggestedReps)
    })
  }

  const completedCount = sets.filter(s => s.completedAt !== null).length
  const allDone = completedCount === sets.length && sets.length > 0

  if (!ex) return null

  const C = {
    bg: '#0F1629', card: '#1A2744', card2: '#1E2D3D',
    grn: '#00A87A', amb: '#F59E0B', red: '#EF4444',
    t1: '#F1F5F9', t2: '#94A3B8', t3: '#64748B',
    brd: 'rgba(255,255,255,0.08)',
  }

  return (
    <>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 60px', direction: ar ? 'rtl' : 'ltr', fontFamily: "'Cairo','DM Sans',sans-serif", background: C.bg }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.t1, flex: 1 }}>{ar ? ex.nameAr : ex.nameEn}</div>
          <button onClick={() => setShowVideo(true)} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.25)', color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <div style={{ background: 'rgba(124,58,237,.2)', color: '#A78BFA', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>
            {ar ? ex.muscleGroupAr : ex.muscleGroup}
          </div>
        </div>

        {/* stats strip */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
          {[
            { label: 'Recovery', val: `${recoveryScore}%`, color: recoveryScore >= 70 ? C.grn : C.amb },
            { label: 'HRV', val: `${hrv}ms`, color: C.t1 },
            { label: ar ? 'وقت' : 'Time', val: clock, color: C.t1 },
            { label: ar ? 'حجم' : 'Vol', val: `${sessionVolume.toLocaleString()}`, color: C.t1 },
          ].map(m => (
            <div key={m.label} style={{ flex: 1, background: C.card, borderRadius: 9, padding: '7px 6px', textAlign: 'center', border: `1px solid ${C.brd}` }}>
              <div style={{ fontSize: 9, color: C.t3, marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.val}</div>
            </div>
          ))}
        </div>

        {/* progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#7C3AED,#00A87A)', width: `${((exerciseIndex + 1) / totalExercises) * 100}%`, transition: 'width .4s ease' }} />
          </div>
          <span style={{ fontSize: 10, color: C.t2, fontWeight: 600 }}>{exerciseIndex + 1}/{totalExercises}</span>
        </div>

        {/* knee flag — only for kneeFlag exercises */}
        {ex.kneeFlag && (
          <div style={{ background: C.card, borderRadius: 14, padding: '11px 13px', marginBottom: 12, border: `1px solid ${C.brd}` }}>
            <div style={{ fontSize: 11, color: C.t2, fontWeight: 700, marginBottom: 7 }}>
              {ar ? 'حال الركبة اليوم؟' : 'How is your knee today?'}
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              {(['g', 'a', 'r'] as const).map(k => (
                <button key={k} onClick={() => setKneeState(k)} style={{
                  flex: 1, padding: '7px 0', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1.5px solid ${kneeState === k ? (k === 'g' ? C.grn : k === 'a' ? C.amb : C.red) : C.brd}`,
                  background: kneeState === k ? (k === 'g' ? 'rgba(0,168,122,.15)' : k === 'a' ? 'rgba(245,158,11,.15)' : 'rgba(239,68,68,.15)') : 'transparent',
                  color: kneeState === k ? (k === 'g' ? C.grn : k === 'a' ? C.amb : C.red) : C.t1,
                  fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all .18s',
                }}>
                  <span>{k === 'g' ? '🟢' : k === 'a' ? '🟡' : '🔴'}</span>
                  <span>{ar ? (k === 'g' ? 'ممتاز' : k === 'a' ? 'بسيط' : 'ألم') : (k === 'g' ? 'Great' : k === 'a' ? 'Slight' : 'Pain')}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PR banner */}
        {prBanner && (
          <div style={{ background: 'linear-gradient(135deg,rgba(245,158,11,.18),rgba(239,68,68,.12))', border: '1px solid rgba(245,158,11,.4)', borderRadius: 14, padding: '11px 13px', marginBottom: 11, display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ fontSize: 22 }}>🏆</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.amb }}>{ar ? 'رقم قياسي جديد!' : 'New personal record!'}</div>
              <div style={{ fontSize: 11, color: C.t2 }}>{prBanner}</div>
            </div>
          </div>
        )}

        {/* AI weight card */}
        <AIWeightCard sets={sets} ar={ar} recoveryScore={recoveryScore} hrv={hrv} onApply={handleApplyAI} />

        {/* sets label */}
        <div style={{ fontSize: 10, color: C.t3, fontWeight: 700, letterSpacing: '.04em', marginBottom: 9 }}>
          {ar ? 'الجلسة' : 'SETS'}
        </div>

        {/* ── Set rows ── */}
        {sets.map((s, i) => {
          const isDone = s.completedAt !== null
          const isCurrent = !isDone && setStartTimes[i] !== null
          const startT = setStartTimes[i]
          const elapsedMs = (isDone && startT && s.completedAt) ? s.completedAt - startT : null

          // يظهر الـ rest timer بعد الـ set المكتمل إذا:
          // 1. activeRestAfter === i (هذا الـ set هو الذي اكتمل مؤخراً)
          // 2. لم تنته الراحة بعد (restDoneFor لا يحتوي على i)
          const showRest = activeRestAfter === i && !restDoneFor.has(i)

          return (
            <div key={i}>
              <div style={{
                background: C.card2, borderRadius: 11, padding: '10px 14px',
                display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 10,
                border: `1.5px solid ${isCurrent ? 'rgba(124,58,237,.35)' : 'transparent'}`,
                opacity: isDone ? 0.55 : 1, marginBottom: 7,
                transition: 'border .2s, opacity .2s',
              }}>
                {/* Set number — أقصى اليمين دائماً */}
                <div style={{ fontSize: 10, color: C.t3, fontWeight: 700, paddingBottom: 9, minWidth: 30, order: ar ? 3 : 0 }}>Set {s.setNumber}</div>
                {/* reps × kg — المنتصف */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flex: 1, order: ar ? 2 : 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <span style={{ fontSize: 9, color: C.t3 }}>reps</span>
                    <input type="number" value={s.actualReps ?? s.suggestedReps}
                      onChange={e => onUpdateSet(exerciseIndex, i, 'actualReps', Number(e.target.value))}
                      style={{ width: 65, background: C.bg, border: `1px solid ${C.brd}`, borderRadius: 9, color: C.t1, textAlign: 'center', fontSize: 16, fontWeight: 700, padding: '7px 4px', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ fontSize: 13, color: C.t3, paddingBottom: 9 }}>×</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <span style={{ fontSize: 9, color: C.t3 }}>kg</span>
                    <input type="number" value={s.actualWeight ?? s.suggestedWeight}
                      onChange={e => onUpdateSet(exerciseIndex, i, 'actualWeight', Number(e.target.value))}
                      style={{ width: 65, background: C.bg, border: `1px solid ${C.brd}`, borderRadius: 9, color: C.t1, textAlign: 'center', fontSize: 16, fontWeight: 700, padding: '7px 4px', fontFamily: 'inherit' }} />
                  </div>
                </div>
                {/* elapsed */}
                <div style={{ fontSize: 9, color: C.grn, fontWeight: 700, paddingBottom: 9, minWidth: 28, textAlign: 'center', order: ar ? 1 : 2 }}>
                  {elapsedMs ? fmtMs(elapsedMs) : ''}
                </div>
                {/* ✓ — أقصى اليسار دائماً */}
                <button onClick={() => !isDone && handleCompleteSet(i)} style={{
                  width: 40, height: 40, borderRadius: 9,
                  border: `1.5px solid ${isDone ? C.grn : C.brd}`,
                  background: isDone ? 'rgba(0,168,122,.15)' : 'transparent',
                  color: isDone ? C.grn : C.t3,
                  cursor: isDone ? 'default' : 'pointer',
                  fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .18s', flexShrink: 0, order: ar ? 0 : 3,
                }}>✓</button>
              </div>

              {/* Rest Timer — يظهر بعد هذا الـ set ويختفي عند Skip أو انتهاء الوقت */}
              {showRest && (
                <InlineRestTimer
                  key={`rest-${i}-${exerciseIndex}`}
                  targetSecs={restTarget}
                  nextSet={sets[i + 1] || null}
                  ar={ar}
                  onDone={() => handleRestDone(i)}
                />
              )}
            </div>
          )
        })}

        {/* RPE */}
        <div style={{ background: C.card, borderRadius: 14, padding: 13, marginTop: 4, marginBottom: 12, border: `1px solid ${C.brd}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.t2, marginBottom: 8 }}>
            <span>{ar ? 'مستوى الجهد (RPE)' : 'Effort level (RPE)'}</span>
            <span style={{ color: C.t1, fontWeight: 700 }}>{rpeSelected ? `${rpeSelected}/10` : '—'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>
            {RPE_OPTS.map(opt => {
              const sel = rpeSelected === opt.v
              const sc = opt.v <= 7 ? C.grn : opt.v === 8 ? C.amb : C.red
              return (
                <button key={opt.v} onClick={() => setRpeSelected(opt.v)} style={{
                  padding: '7px 0', borderRadius: 8, textAlign: 'center',
                  border: `1.5px solid ${sel ? sc : C.brd}`,
                  background: sel ? `${sc}33` : 'transparent',
                  color: sel ? sc : C.t2, cursor: 'pointer',
                  transform: sel ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all .15s', fontFamily: 'inherit',
                }}>
                  <div style={{ fontSize: 14, marginBottom: 2 }}>{opt.emoji}</div>
                  <div style={{ fontSize: 8 }}>{ar ? opt.ar : opt.en}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* next / finish */}
        <button onClick={onNextExercise} disabled={!allDone} style={{
          width: '100%', padding: '14px',
          background: allDone ? C.grn : 'transparent',
          border: allDone ? 'none' : `1.5px solid ${C.brd}`,
          borderRadius: 14, color: allDone ? '#fff' : C.t3,
          fontSize: 15, fontWeight: 700,
          cursor: allDone ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit', transition: 'all .2s',
        }}>
          {exerciseIndex < totalExercises - 1
            ? (ar ? 'التمرين التالي ←' : 'Next exercise →')
            : (ar ? 'إنهاء الجلسة ✓' : 'Finish session ✓')
          }
        </button>

        {!allDone && (
          <div style={{ textAlign: 'center', fontSize: 10, color: C.t3, marginTop: 8 }}>
            {ar ? `أكمل ${sets.length - completedCount} set متبقية` : `Complete ${sets.length - completedCount} remaining set(s)`}
          </div>
        )}
      </div>

      {showVideo && <VideoSheet exercise={ex} ar={ar} onClose={() => setShowVideo(false)} />}

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop { 0%{opacity:0;transform:scale(.85)} 70%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
      `}</style>
    </>
  )
}
