'use client'
import { Exercise } from '../exercises'

interface Props {
  ar: boolean
  countdown: number
  target: number
  onSkip: () => void
  currentExercise?: Exercise
  nextExercise?: Exercise
}

export default function PhaseRest({ ar, countdown, target, onSkip, currentExercise, nextExercise }: Props) {
  const pct = Math.max(0, countdown / target)
  const r = 58
  const circ = 2 * Math.PI * r
  const offset = circ * pct
  const urgency = countdown <= 10 ? '#DC2626' : countdown <= 30 ? '#D97706' : '#00A87A'
  const bgUrgency = countdown <= 10 ? 'rgba(220,38,38,0.06)' : countdown <= 30 ? 'rgba(217,119,6,0.06)' : 'rgba(0,168,122,0.06)'

  const tip = countdown > 60
    ? (ar ? '💧 هذا وقت مثالي للشرب' : '💧 Perfect time to hydrate')
    : countdown > 30
    ? (ar ? '🧘 استرخِ — العضل يتعافى الآن' : '🧘 Relax — muscles recovering now')
    : (ar ? '🎯 حضّر الوزن للعدة القادمة' : '🎯 Set up weight for next set')

  const hint = countdown <= 15
    ? (ar ? '🔔 استعد! العدة القادمة تبدأ الآن' : '🔔 Get ready! Next set starting')
    : countdown <= 30
    ? (ar ? '🧘 تنفس عميق — 4 داخل · 4 خارج' : '🧘 Deep breath — 4s in · 4s out')
    : (ar ? '💧 اشرب الماء واسترخِ' : '💧 Drink water and relax')

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '65vh', gap: 20,
      textAlign: 'center', padding: '0 8px',
    }}>

      {/* Ring */}
      <div style={{ position: 'relative', width: 150, height: 150 }}>
        <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', background: bgUrgency, transition: 'background .5s', filter: 'blur(12px)' }} />
        <svg width="150" height="150" viewBox="0 0 150 150" style={{ position: 'relative' }}>
          <circle cx="75" cy="75" r={r} fill="none" stroke="rgba(30,50,90,0.07)" strokeWidth="9"/>
          <circle cx="75" cy="75" r={r} fill="none" stroke={urgency} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ - offset}
            transform="rotate(-90 75 75)"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke .5s' }}/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 42, fontWeight: 700, color: urgency, lineHeight: 1, transition: 'color .5s' }}>{countdown}</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{ar ? 'ثانية' : 'seconds'}</div>
        </div>
      </div>

      {/* Label */}
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#0D1B2A', marginBottom: 6 }}>
          {ar ? '😮‍💨 فترة الراحة' : '😮‍💨 Rest Period'}
        </div>
        {currentExercise && (
          <div style={{ fontSize: 12, color: '#5A6A82' }}>
            {ar ? `بعد: ${currentExercise.nameAr}` : `After: ${currentExercise.nameEn}`}
          </div>
        )}
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{hint}</div>
      </div>

      {/* Next exercise preview */}
      {nextExercise && (
        <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(30,50,90,0.08)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 12px rgba(13,27,42,0.05)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.5px' }}>
            {ar ? 'التمرين التالي' : 'Up next'}
          </div>
          <div style={{ fontSize: 14 }}>{nextExercise.thumbnailEmoji}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0D1B2A' }}>
            {ar ? nextExercise.nameAr : nextExercise.nameEn}
          </div>
        </div>
      )}

      {/* Tip */}
      <div style={{ padding: '10px 16px', background: 'rgba(0,168,122,0.07)', border: '1px solid rgba(0,168,122,0.18)', borderRadius: 12, maxWidth: 300, fontSize: 12, color: '#006B4F', lineHeight: 1.6 }}>
        {tip}
      </div>

      {/* Skip */}
      <button onClick={onSkip} style={{
        padding: '10px 28px', borderRadius: 10,
        background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(30,50,90,0.1)',
        color: '#5A6A82', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        fontFamily: "'Cairo',sans-serif", boxShadow: '0 2px 8px rgba(13,27,42,0.05)',
      }}>
        {ar ? 'تخطي الراحة ←' : 'Skip Rest →'}
      </button>
    </div>
  )
}
