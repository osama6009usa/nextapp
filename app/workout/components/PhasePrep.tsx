'use client'
import { useState, useEffect } from 'react'
import { Exercise, EXERCISES } from '../exercises'
import { AIWorkoutPlan, DailyContext } from '@/lib/workoutAI'

interface Props {
  ar: boolean
  todayPlan: { nameAr: string; nameEn: string; groups: string[] }
  exercises: Exercise[]
  dailyContext: DailyContext
  aiPlan: AIWorkoutPlan | null
  isPlanLoading: boolean
  onStart: (restSeconds: number) => void
  onSwapExercise: (oldId: string, newExercise: Exercise) => void
  completedExercises?: string[]
  exerciseResults?: Record<string, { maxWeight: number; setsCompleted: number; newPR: boolean }>
  onToggleLang?: () => void
}

const MC: Record<string, { color: string; dark: string; bg: string; stripe: string; glow: string }> = {
  chest:     { color: '#60A5FA', dark: '#1d4ed8', bg: 'rgba(96,165,250,0.08)',  stripe: 'linear-gradient(90deg,#1d4ed8,#3b82f6)', glow: 'rgba(59,130,246,0.35)' },
  biceps:    { color: '#A78BFA', dark: '#6d28d9', bg: 'rgba(167,139,250,0.08)', stripe: 'linear-gradient(90deg,#6d28d9,#8b5cf6)', glow: 'rgba(124,58,237,0.35)' },
  back:      { color: '#34D399', dark: '#065f46', bg: 'rgba(52,211,153,0.08)',  stripe: 'linear-gradient(90deg,#065f46,#10b981)', glow: 'rgba(16,185,129,0.35)' },
  legs:      { color: '#FCD34D', dark: '#b45309', bg: 'rgba(252,211,77,0.08)',  stripe: 'linear-gradient(90deg,#b45309,#f59e0b)', glow: 'rgba(245,158,11,0.35)' },
  shoulders: { color: '#FCA5A5', dark: '#991b1b', bg: 'rgba(252,165,165,0.08)', stripe: 'linear-gradient(90deg,#991b1b,#ef4444)', glow: 'rgba(239,68,68,0.35)' },
  triceps:   { color: '#67E8F9', dark: '#0e7490', bg: 'rgba(103,232,249,0.08)', stripe: 'linear-gradient(90deg,#0e7490,#06b6d4)', glow: 'rgba(6,182,212,0.35)' },
}


function MuscleSVG({ group, color }: { group: string; color: string }) {
  const c = color
  const bg = color + '18'
  const icons: Record<string, JSX.Element> = {
    chest: (
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <rect x="4" y="4" width="72" height="72" rx="16" fill={bg}/>
        {/* Chest - two pec muscles */}
        <path d="M12 28 Q20 20 38 26 Q38 42 20 46 Q10 42 12 28Z" fill={c} opacity="0.9"/>
        <path d="M68 28 Q60 20 42 26 Q42 42 60 46 Q70 42 68 28Z" fill={c} opacity="0.9"/>
        {/* Center line */}
        <line x1="40" y1="22" x2="40" y2="48" stroke={c} strokeWidth="1.5" opacity="0.4"/>
        {/* Collar bones */}
        <path d="M16 24 Q28 18 40 20 Q52 18 64 24" stroke={c} strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round"/>
      </svg>
    ),
    back: (
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <rect x="4" y="4" width="72" height="72" rx="16" fill={bg}/>
        {/* Traps */}
        <path d="M20 16 Q40 12 60 16 L56 30 Q40 26 24 30Z" fill={c} opacity="0.85"/>
        {/* Lats left */}
        <path d="M14 30 Q20 28 28 34 L26 58 Q14 52 12 40Z" fill={c} opacity="0.85"/>
        {/* Lats right */}
        <path d="M66 30 Q60 28 52 34 L54 58 Q66 52 68 40Z" fill={c} opacity="0.85"/>
        {/* Spine */}
        <line x1="40" y1="20" x2="40" y2="62" stroke={c} strokeWidth="1.5" opacity="0.35" strokeDasharray="3,3"/>
      </svg>
    ),
    biceps: (
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <rect x="4" y="4" width="72" height="72" rx="16" fill={bg}/>
        {/* Left arm */}
        <path d="M16 18 Q10 30 12 46 Q18 50 24 46 Q30 30 26 18Z" fill={c} opacity="0.85"/>
        {/* Bicep peak left */}
        <ellipse cx="19" cy="32" rx="6" ry="9" fill={c} opacity="0.5"/>
        {/* Right arm */}
        <path d="M64 18 Q70 30 68 46 Q62 50 56 46 Q50 30 54 18Z" fill={c} opacity="0.85"/>
        {/* Bicep peak right */}
        <ellipse cx="61" cy="32" rx="6" ry="9" fill={c} opacity="0.5"/>
        {/* Dumbbell */}
        <rect x="32" y="56" width="16" height="5" rx="2.5" fill={c} opacity="0.6"/>
        <rect x="28" y="54" width="6" height="9" rx="2" fill={c} opacity="0.8"/>
        <rect x="46" y="54" width="6" height="9" rx="2" fill={c} opacity="0.8"/>
      </svg>
    ),
    triceps: (
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <rect x="4" y="4" width="72" height="72" rx="16" fill={bg}/>
        {/* Left tricep - back of arm */}
        <path d="M14 20 Q8 34 10 50 Q16 56 22 50 Q24 34 20 20Z" fill={c} opacity="0.85"/>
        <path d="M14 32 Q10 42 14 50" stroke={c} strokeWidth="2" fill="none" opacity="0.5"/>
        {/* Right tricep */}
        <path d="M66 20 Q72 34 70 50 Q64 56 58 50 Q56 34 60 20Z" fill={c} opacity="0.85"/>
        <path d="M66 32 Q70 42 66 50" stroke={c} strokeWidth="2" fill="none" opacity="0.5"/>
        {/* Label */}
        <rect x="30" y="56" width="20" height="5" rx="2.5" fill={c} opacity="0.4"/>
      </svg>
    ),
    shoulders: (
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <rect x="4" y="4" width="72" height="72" rx="16" fill={bg}/>
        {/* Left deltoid */}
        <ellipse cx="18" cy="34" rx="13" ry="16" fill={c} opacity="0.85"/>
        <ellipse cx="18" cy="30" rx="8" ry="10" fill={c} opacity="0.5"/>
        {/* Right deltoid */}
        <ellipse cx="62" cy="34" rx="13" ry="16" fill={c} opacity="0.85"/>
        <ellipse cx="62" cy="30" rx="8" ry="10" fill={c} opacity="0.5"/>
        {/* Neck/trap center */}
        <rect x="34" y="14" width="12" height="20" rx="6" fill={c} opacity="0.5"/>
        {/* Collarbone */}
        <path d="M14 26 Q40 20 66 26" stroke={c} strokeWidth="2.5" fill="none" opacity="0.6" strokeLinecap="round"/>
      </svg>
    ),
    legs: (
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <rect x="4" y="4" width="72" height="72" rx="16" fill={bg}/>
        {/* Left quad */}
        <path d="M18 14 Q12 30 14 52 Q20 58 28 54 Q34 30 30 14Z" fill={c} opacity="0.85"/>
        {/* Left inner */}
        <path d="M28 18 Q32 32 30 52 Q26 56 24 52" stroke={c} strokeWidth="1.5" fill="none" opacity="0.4"/>
        {/* Right quad */}
        <path d="M62 14 Q68 30 66 52 Q60 58 52 54 Q46 30 50 14Z" fill={c} opacity="0.85"/>
        {/* Right inner */}
        <path d="M52 18 Q48 32 50 52 Q54 56 56 52" stroke={c} strokeWidth="1.5" fill="none" opacity="0.4"/>
        {/* Hip line */}
        <path d="M18 14 Q40 10 62 14" stroke={c} strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round"/>
      </svg>
    ),
  }
  return (
    <div style={{ width: "100%", height: "100%" }}>
      {icons[group] || icons.chest}
    </div>
  )
}

const SWAP_OPTIONS: Record<string, string[]> = {
  'bench-press':     ['incline-bench', 'dumbbell-fly', 'cable-crossover', 'pushup'],
  'incline-bench':   ['bench-press', 'dumbbell-fly', 'cable-crossover'],
  'barbell-curl':    ['hammer-curl', 'incline-curl', 'cable-curl'],
  'hammer-curl':     ['barbell-curl', 'incline-curl', 'cable-curl'],
  'deadlift':        ['barbell-row', 'lat-pulldown', 'pullup'],
  'pullup':          ['lat-pulldown', 'barbell-row'],
  'barbell-row':     ['pullup', 'lat-pulldown'],
  'lat-pulldown':    ['pullup', 'barbell-row'],
  'squat':           ['leg-press', 'leg-curl'],
  'leg-press':       ['squat', 'leg-curl'],
  'ohp':             ['lateral-raise'],
  'lateral-raise':   ['ohp'],
  'tricep-pushdown': ['skull-crusher', 'dips'],
  'skull-crusher':   ['tricep-pushdown', 'dips'],
  'dips':            ['tricep-pushdown', 'skull-crusher'],
}

export default function PhasePrep({
  ar, todayPlan, exercises, dailyContext, aiPlan, isPlanLoading,
  onStart, onSwapExercise,
  completedExercises = [],
  exerciseResults = {},
  onToggleLang,
}: Props) {
  const [now, setNow] = useState(new Date())
  const [videoEx, setVideoEx] = useState<string | null>(null)
  const [swapEx, setSwapEx] = useState<string | null>(null)
  const [showRestModal, setShowRestModal] = useState(false)
  const [restSeconds, setRestSeconds] = useState(90)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const days = ar
    ? ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
    : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ar
    ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const dateStr = ar
    ? `${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]}`
    : `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`
  const timeStr = now.toLocaleTimeString(ar ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })

  const tone = aiPlan?.overallTone
  const toneLabel = ar
    ? (tone === 'push' ? '🔥 تقدمية' : tone === 'deload' ? '😴 تخفيف' : '💪 محافظة')
    : (tone === 'push' ? '🔥 Push' : tone === 'deload' ? '😴 Deload' : '💪 Maintain')
  const primaryGroup = todayPlan.groups[0] || 'back'
  const primaryMC = MC[primaryGroup] || MC.back
  const doneCount = completedExercises.length

  function getSwapOptions(exId: string): Exercise[] {
    return EXERCISES.filter(e => (SWAP_OPTIONS[exId] || []).includes(e.id))
  }

  const cols = 2
  const rows = Math.ceil(exercises.length / cols)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
      background: '#070B1A',
    }}>

      {/* HERO */}
      <div style={{
        flexShrink: 0,
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(175deg,#070B1A 0%,#0D1535 50%,#0A1128 100%)',
        padding: '8px 14px 10px',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '38px 38px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -60, right: -40, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle,${primaryMC.glow} 0%,transparent 70%)`, filter: 'blur(35px)', pointerEvents: 'none' }} />

        {/* Nav row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, position: 'relative', zIndex: 3 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.4)', fontSize: 9, padding: '4px 9px', borderRadius: 7, background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none' }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            {ar ? 'الرئيسية' : 'Home'}
          </a>
          <button onClick={onToggleLang} style={{ padding: '4px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', letterSpacing: '.5px' }}>
            {ar ? 'EN' : 'عر'}
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1 }} suppressHydrationWarning>{timeStr}</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>{dateStr}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ textAlign: ar ? 'left' : 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>د. أسامة</div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.28)' }}>Dr. Osama</div>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', border: '2px solid rgba(124,58,237,0.55)' }}>أس</div>
          </div>
        </div>

        {/* Title + metrics row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 3, gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
              {ar ? todayPlan.nameAr : todayPlan.nameEn}
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
              {tone && <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(52,211,153,0.15)', color: '#34D399', border: '1px solid rgba(52,211,153,0.25)' }}>{toneLabel}</span>}
              <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>{exercises.length} {ar ? 'تمارين' : 'exercises'}</span>
              {doneCount > 0 && <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(52,211,153,0.15)', color: '#34D399', border: '1px solid rgba(52,211,153,0.25)' }}>✓ {doneCount} {ar ? 'مكتمل' : 'done'}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            {[
              { val: `${dailyContext.recoveryScore}%`, lbl: 'REC', color: dailyContext.recoveryScore >= 70 ? '#34D399' : dailyContext.recoveryScore >= 50 ? '#FCD34D' : '#FCA5A5' },
              { val: `${dailyContext.hrv}ms`, lbl: 'HRV', color: '#60A5FA' },
              { val: `${dailyContext.kneePainLevel}/10`, lbl: ar ? 'ركبة' : 'Knee', color: dailyContext.kneePainLevel > 3 ? '#FCA5A5' : dailyContext.kneePainLevel > 0 ? '#FCD34D' : '#34D399' },
            ].map(m => (
              <div key={m.lbl} style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 8, padding: '4px 8px', textAlign: 'center', minWidth: 44 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.val}</div>
                <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.28)', marginTop: 1, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>{m.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Strip */}
        <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '5px 10px', display: 'flex', gap: 7, alignItems: 'center', position: 'relative', zIndex: 3, border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>🤖</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 1 }}>Claude AI</div>
            {isPlanLoading
              ? <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{ar ? 'يحلل بياناتك...' : 'Analyzing...'}</div>
              : <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ar ? aiPlan?.summaryAr : aiPlan?.summaryEn}</div>
            }
          </div>
        </div>
      </div>

      {/* EXERCISE GRID */}
      <div style={{
        flex: 1, overflow: 'hidden',
        background: '#EEF2F8',
        padding: '6px 8px 52px',
        display: 'flex', flexDirection: 'column',
      }}>
        {exercises.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>😴</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0D1B2A', marginBottom: 4 }}>{ar ? 'يوم راحة' : 'Rest Day'}</div>
            <div style={{ fontSize: 11, color: '#5A6A82' }}>{ar ? 'جسمك يبني العضل أثناء الراحة' : 'Muscles grow during rest'}</div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, minmax(0, calc((100vh - 195px) / ${rows})))`,
            gap: 6,
          }}>
            {exercises.map((ex, i) => {
              const mc = MC[ex.muscleGroup] || MC.back
              const aiEx = aiPlan?.exercises.find(p => p.exerciseId === ex.id)
              const topSet = aiEx?.sets[aiEx.sets.length - 1]
              const isDone = completedExercises.includes(ex.id)
              const result = exerciseResults[ex.id]
              const ytId = ex.videoUrl.split('v=')[1]?.split('&')[0]
              const isV = videoEx === ex.id
              const isS = swapEx === ex.id
              const swapOpts = getSwapOptions(ex.id)

              if (isDone && result) {
                return (
                  <div key={ex.id} style={{ background: 'linear-gradient(145deg,#f0fdf8,#fff)', borderRadius: 12, overflow: 'hidden', border: '1.5px solid rgba(16,185,129,0.2)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div style={{ height: 2, background: mc.stripe, flexShrink: 0 }} />
                    <div style={{ flex: 1, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>✓</div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#0D1B2A', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ar ? ex.nameAr : ex.nameEn}</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        <div style={{ padding: '4px', borderRadius: 7, background: result.newPR ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.06)', border: `1px solid ${result.newPR ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.12)'}`, textAlign: 'center' }}>
                          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 800, color: result.newPR ? '#D97706' : '#059669', lineHeight: 1 }}>{result.maxWeight}<span style={{ fontSize: 7, color: '#94A3B8' }}>kg</span></div>
                          <div style={{ fontSize: 7, color: '#94A3B8', marginTop: 1, fontWeight: 600 }}>{result.newPR ? '🏆 PR' : 'Max'}</div>
                        </div>
                        <div style={{ padding: '4px', borderRadius: 7, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)', textAlign: 'center' }}>
                          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 800, color: '#7C3AED', lineHeight: 1 }}>{result.setsCompleted}</div>
                          <div style={{ fontSize: 7, color: '#94A3B8', marginTop: 1, fontWeight: 600 }}>sets</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={ex.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${isV || isS ? mc.color + '35' : 'rgba(30,50,90,0.06)'}`, display: 'flex', flexDirection: 'column', transition: 'all .25s', minHeight: 0, gridColumn: (exercises.length % 2 !== 0 && i === exercises.length - 1) ? 'span 2' : 'auto' }}>
                  <div style={{ height: 2, background: mc.stripe, flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 5, minHeight: 0, overflow: 'hidden' }}>
                    {/* Top row: emoji + name + weight */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>{ex.thumbnailEmoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#0D1B2A', lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ar ? ex.nameAr : ex.nameEn}</div>
                        <div style={{ fontSize: 7, fontWeight: 700, padding: '1px 5px', borderRadius: 20, background: mc.bg, color: mc.dark, display: 'inline-block', marginTop: 2 }}>
                          {ar ? ex.muscleGroupAr : ex.muscleGroup}
                          {ex.kneeFlag && dailyContext.kneePainLevel > 0 && <span style={{ marginRight: 3, color: '#D97706' }}> ⚠</span>}
                        </div>
                      </div>
                      <div style={{ width: 52, height: 64, flexShrink: 0, opacity: 0.9, filter: `drop-shadow(0 2px 6px ${mc.color}50)` }}>
                        <MuscleSVG group={ex.muscleGroup} color={mc.color} />
                      </div>
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        {isPlanLoading
                          ? <div style={{ width: 30, height: 14, borderRadius: 3, background: 'rgba(30,50,90,0.06)', animation: 'pulse 1.5s infinite' }} />
                          : <><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 800, color: mc.color, lineHeight: 1 }}>{topSet?.suggestedWeight || '-'}</span><span style={{ fontSize: 7, color: '#94A3B8' }}>kg</span></>
                        }
                        <div style={{ fontSize: 7, color: '#94A3B8', lineHeight: 1.3, marginTop: 1 }}>
                          {aiEx?.sets.length || ex.defaultSets}s ×{topSet?.suggestedReps || ex.defaultReps}
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 'auto' }}>
                      <button onClick={() => { setVideoEx(isV ? null : ex.id); setSwapEx(null) }}
                        style={{ padding: '4px 3px', borderRadius: 6, background: isV ? mc.color : mc.bg, border: `1px solid ${mc.color}30`, color: isV ? '#fff' : mc.dark, fontSize: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontFamily: "'Cairo',sans-serif", transition: 'all .2s' }}>
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                        {ar ? 'شرح' : 'Tutorial'}
                      </button>
                      <button onClick={() => { setSwapEx(isS ? null : ex.id); setVideoEx(null) }}
                        style={{ padding: '4px 3px', borderRadius: 6, background: isS ? mc.color : mc.bg, border: `1px solid ${mc.color}30`, color: isS ? '#fff' : mc.dark, fontSize: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontFamily: "'Cairo',sans-serif", transition: 'all .2s' }}>
                        ⇄ {ar ? 'تغيير' : 'Swap'}
                      </button>
                    </div>

                    {isV && ytId && (
                      <iframe width="100%" height="90" src={`https://www.youtube.com/embed/${ytId}?autoplay=0`} title={ex.nameEn} frameBorder="0" allowFullScreen style={{ display: 'block', borderRadius: 6, flexShrink: 0 }} />
                    )}

                    {isS && (
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: 7, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>
                          {ar ? 'بدائل' : 'Alternatives'}
                        </div>
                        {swapOpts.length > 0 ? swapOpts.slice(0,2).map(opt => (
                          <button key={opt.id} onClick={() => { onSwapExercise(ex.id, opt); setSwapEx(null) }}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 7px', background: mc.bg, border: `1px solid ${mc.color}25`, borderRadius: 6, cursor: 'pointer', width: '100%', marginBottom: 3, fontFamily: "'Cairo',sans-serif" }}>
                            <span style={{ fontSize: 11 }}>{opt.thumbnailEmoji}</span>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#0D1B2A' }}>{ar ? opt.nameAr : opt.nameEn}</div>
                          </button>
                        )) : (
                          <div style={{ padding: 5, background: 'rgba(30,50,90,0.04)', borderRadius: 6, fontSize: 8, color: '#5A6A82', textAlign: 'center' }}>
                            {ar ? 'لا توجد بدائل' : 'No alternatives'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* STICKY BUTTON */}
      {exercises.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '6px 12px 14px', background: 'linear-gradient(to top,#EEF2F8 60%,transparent)', zIndex: 50 }}>
          <button onClick={() => setShowRestModal(true)} disabled={isPlanLoading || !aiPlan}
            style={{ width: '100%', maxWidth: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, border: 'none', color: '#fff', fontSize: 14, fontWeight: 800, cursor: isPlanLoading || !aiPlan ? 'not-allowed' : 'pointer', fontFamily: "'Cairo',sans-serif", background: isPlanLoading || !aiPlan ? 'rgba(16,185,129,0.3)' : `linear-gradient(135deg,${primaryMC.color},${primaryMC.dark})`, boxShadow: isPlanLoading || !aiPlan ? 'none' : `0 8px 30px ${primaryMC.glow}`, transition: 'all .3s', position: 'relative', overflow: 'hidden', margin: '0 auto' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)', transform: 'translateX(-100%)', animation: 'shine 3s ease infinite' }} />
            {isPlanLoading
              ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />{ar ? 'يحضّر...' : 'Preparing...'}</>
              : <><span style={{ fontSize: 15 }}>🏋️</span>{ar ? 'ابدأ جلسة التمرين' : 'Start Workout Session'}</>
            }
          </button>
        </div>
      )}

      {/* REST MODAL */}
      {showRestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,11,26,0.8)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setShowRestModal(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '18px 18px 28px', width: '100%', maxWidth: 900, animation: 'slideUp .3s ease' }}>
            <div style={{ width: 36, height: 3, borderRadius: 2, background: 'rgba(30,50,90,0.12)', margin: '0 auto 14px' }} />
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0D1B2A', marginBottom: 3 }}>⚙️ {ar ? 'إعدادات الجلسة' : 'Session Settings'}</div>
            <div style={{ fontSize: 10, color: '#5A6A82', marginBottom: 14 }}>{ar ? 'وقت الراحة بين العدات' : 'Rest time between sets'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, marginBottom: 10 }}>
              {[60, 90, 120, 180].map(s => (
                <button key={s} onClick={() => setRestSeconds(s)}
                  style={{ padding: '10px 6px', borderRadius: 10, border: `2px solid ${restSeconds === s ? primaryMC.dark : 'rgba(30,50,90,0.1)'}`, background: restSeconds === s ? primaryMC.bg : '#fff', color: restSeconds === s ? primaryMC.dark : '#5A6A82', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", transition: 'all .2s', textAlign: 'center' }}>
                  {s >= 60 ? `${s / 60}m` : `${s}s`}
                  {s === 90 && <div style={{ fontSize: 7, color: restSeconds === 90 ? primaryMC.dark : '#94A3B8', marginTop: 2, fontFamily: "'Cairo',sans-serif", fontWeight: 700 }}>{ar ? 'مقترح' : 'AI pick'}</div>}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(30,50,90,0.04)', borderRadius: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 10, color: '#5A6A82', flexShrink: 0 }}>{ar ? 'مخصص:' : 'Custom:'}</span>
              <input type="number" value={restSeconds} min={30} max={300} step={15}
                onChange={e => setRestSeconds(parseInt(e.target.value) || 90)}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 17, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: primaryMC.dark, outline: 'none', textAlign: 'center' }} />
              <span style={{ fontSize: 10, color: '#5A6A82', flexShrink: 0 }}>{ar ? 'ثانية' : 'sec'}</span>
            </div>
            <button onClick={() => { setShowRestModal(false); onStart(restSeconds) }}
              style={{ width: '100%', padding: '13px', borderRadius: 11, border: 'none', background: `linear-gradient(135deg,${primaryMC.color},${primaryMC.dark})`, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: "'Cairo',sans-serif", boxShadow: `0 6px 20px ${primaryMC.glow}` }}>
              🏋️ {ar ? 'ابدأ الآن' : 'Start Now'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes shine { 0%{transform:translateX(-100%)} 50%,100%{transform:translateX(100%)} }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4 }
      `}</style>
    </div>
  )
}
