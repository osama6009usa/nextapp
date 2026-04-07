'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface GoalsData {
  protein_goal: number
  water_goal: number
  calorie_goal: number
  fasting_window_hours: number
  eating_window_start: string
  goals_completed_at: string | null
}

interface Reasoning {
  protein: string
  water: string
  calories: string
  fasting: string
}

const WORK_OPTIONS = [
  { value: 'desk', label: 'Desk Job' },
  { value: 'standing', label: 'Standing' },
  { value: 'physical', label: 'Physical' },
  { value: 'mobile', label: 'Mobile' },
]
const GOAL_OPTIONS = [
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'performance', label: 'Performance' },
]
const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'No exercise' },
  { value: 'light', label: 'Light 1-2x/week' },
  { value: 'moderate', label: 'Moderate 3-4x' },
  { value: 'active', label: 'Active 5-6x' },
  { value: 'athlete', label: 'Athlete daily' },
]
const FASTING_OPTIONS = [
  { label: '14/10', hours: 14, start: '10:00' },
  { label: '16/8', hours: 16, start: '12:00' },
  { label: '18/6', hours: 18, start: '12:00' },
  { label: '20/4', hours: 20, start: '14:00' },
]
const DEFAULTS: GoalsData = {
  protein_goal: 165, water_goal: 5.0, calorie_goal: 2200,
  fasting_window_hours: 18, eating_window_start: '12:00', goals_completed_at: null,
}

export default function SetupGoalsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [goals, setGoals] = useState<GoalsData>(DEFAULTS)
  const [reasoning, setReasoning] = useState<Reasoning | null>(null)
  const [workType, setWorkType] = useState('desk')
  const [userGoals, setUserGoals] = useState<string[]>(['maintenance'])
  const [customGoal, setCustomGoal] = useState('')
  const [activityLevel, setActivity] = useState('moderate')
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isReview, setIsReview] = useState(false)
  const [step, setStep] = useState<'setup' | 'result'>('setup')
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setWorkType(data.work_type ?? 'desk')
        setUserGoals(data.user_goals ?? ['maintenance'])
        setCustomGoal(data.custom_goal_text ?? '')
        setActivity(data.activity_level ?? 'moderate')
        if (data.goals_completed_at) {
          setGoals({
            protein_goal: data.protein_goal ?? DEFAULTS.protein_goal,
            water_goal: data.water_goal ?? DEFAULTS.water_goal,
            calorie_goal: data.calorie_goal ?? DEFAULTS.calorie_goal,
            fasting_window_hours: data.fasting_window_hours ?? DEFAULTS.fasting_window_hours,
            eating_window_start: data.eating_window_start?.slice(0,5) ?? DEFAULTS.eating_window_start,
            goals_completed_at: data.goals_completed_at,
          })
          setIsReview(true)
          setStep('result')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  function toggleGoal(val: string) {
    setUserGoals(prev => prev.includes(val) ? prev.filter(g => g !== val) : [...prev, val])
  }

  async function getAIRecommendation() {
    if (!profile) { setApiError('Profile not loaded - please refresh'); return }
    setAiLoading(true)
    setApiError('')
    setStep('result')
    try {
      const res = await fetch('/api/ai-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: profile.age ?? 30,
          weight: profile.weight ?? 80,
          height: profile.height ?? 175,
          bio_constitution: profile.bio_constitution ?? 'Pitta',
          blood_type: profile.blood_type ?? 'O+',
          user_goals: userGoals,
          custom_goal_text: customGoal,
          activity_level: activityLevel,
          work_type: workType,
        }),
      })
      if (!res.ok) { const t = await res.text(); throw new Error('HTTP ' + res.status + ': ' + t) }
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const parsed = JSON.parse(json.result)
      setGoals({
        protein_goal: parsed.protein_goal,
        water_goal: parsed.water_goal,
        calorie_goal: parsed.calorie_goal,
        fasting_window_hours: parsed.fasting_window_hours,
        eating_window_start: parsed.eating_window_start,
        goals_completed_at: null,
      })
      setReasoning(parsed.reasoning)
    } catch (e: any) {
      setApiError(e.message ?? 'Unknown error')
      setStep('setup')
    }
    setAiLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      ...goals,
      work_type: workType,
      user_goals: userGoals,
      user_goal: userGoals[0] ?? 'maintenance',
      custom_goal_text: customGoal,
      activity_level: activityLevel,
      goals_completed_at: new Date().toISOString(),
    }).eq('id', user.id)
    setSaving(false)
    router.push('/dashboard')
  }

  const card = (s?: any) => ({
    background: '#fff', borderRadius: 14, padding: '20px',
    boxShadow: '0 2px 12px rgba(79,70,229,0.07)', marginBottom: 14, ...s
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF2F8' }}>
      <div style={{ color: '#4F46E5' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#EEF2F8', padding: '32px 16px', fontFamily: 'system-ui,sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>ðŸŽ¯</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F1629', margin: 0 }}>Health Goals Setup</h1>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 6 }}>
            {isReview ? 'Your saved goals - review or edit' : 'AI calculates your goals from your full profile'}
          </p>
        </div>

        {apiError && (
          <div style={{ ...card({ background: '#FEF2F2', border: '1px solid #FECACA' }) }}>
            <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 600, wordBreak: 'break-all' }}>{apiError}</div>
          </div>
        )}

        {isReview && (
          <div style={{ ...card({ background: '#F0FDF4', border: '1px solid #BBF7D0' }) }}>
            <div style={{ fontSize: 13, color: '#16A34A', fontWeight: 600 }}>Goals saved - showing for review only</div>
          </div>
        )}

        {step === 'setup' && (
          <>
            <div style={card()}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Work Type</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>Affects total calorie calculation</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {WORK_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => setWorkType(o.value)} style={{
                    padding: '12px 8px', borderRadius: 10, border: '2px solid',
                    borderColor: workType === o.value ? '#4F46E5' : '#E5E7EB',
                    background: workType === o.value ? '#EEF2FF' : '#fff',
                    color: workType === o.value ? '#4F46E5' : '#374151',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer'
                  }}>{o.label}</button>
                ))}
              </div>
            </div>

            <div style={card()}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Health Goals</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>Select one or more</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {GOAL_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => toggleGoal(o.value)} style={{
                    padding: '12px 8px', borderRadius: 10, border: '2px solid', position: 'relative',
                    borderColor: userGoals.includes(o.value) ? '#4F46E5' : '#E5E7EB',
                    background: userGoals.includes(o.value) ? '#EEF2FF' : '#fff',
                    color: userGoals.includes(o.value) ? '#4F46E5' : '#374151',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer'
                  }}>
                    {userGoals.includes(o.value) && <span style={{ position: 'absolute', top: 4, left: 6, fontSize: 10 }}>âœ“</span>}
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={card()}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Tell Us More</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>Optional - AI adapts your plan based on this</div>
              <textarea value={customGoal} onChange={e => setCustomGoal(e.target.value)}
                placeholder="e.g. I want to lose 8kg before Ramadan..."
                rows={3} style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: '2px solid #E5E7EB',
                  fontSize: 13, color: '#374151', resize: 'none', outline: 'none',
                  fontFamily: 'system-ui,sans-serif', direction: 'rtl', boxSizing: 'border-box'
                }} />
            </div>

            <div style={card()}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Exercise Level</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>Workouts only - separate from work type</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ACTIVITY_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => setActivity(o.value)} style={{
                    padding: '10px 14px', borderRadius: 10, border: '2px solid', textAlign: 'right',
                    borderColor: activityLevel === o.value ? '#4F46E5' : '#E5E7EB',
                    background: activityLevel === o.value ? '#EEF2FF' : '#fff',
                    color: activityLevel === o.value ? '#4F46E5' : '#374151',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer'
                  }}>{o.label}</button>
                ))}
              </div>
            </div>

            <button onClick={getAIRecommendation} disabled={userGoals.length === 0} style={{
              width: '100%', padding: '15px', borderRadius: 10, border: 'none',
              background: userGoals.length === 0 ? '#C7D2FE' : 'linear-gradient(135deg,#4F46E5,#7C3AED)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: userGoals.length === 0 ? 'not-allowed' : 'pointer', marginBottom: 10
            }}>ðŸ¤– Calculate My Goals with AI</button>
            <button onClick={() => setStep('result')} style={{
              width: '100%', padding: '12px', borderRadius: 10, border: '2px solid #E5E7EB',
              background: '#fff', color: '#6B7280', fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}>âœï¸ Manual Setup</button>
          </>
        )}

        {step === 'result' && (
          <>
            {aiLoading ? (
              <div style={{ ...card({ textAlign: 'center', padding: '56px 20px' }) }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>ðŸ¤–</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#4F46E5', marginBottom: 8 }}>Analyzing your health profile...</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Mifflin-St Jeor Â· Boer LBM Â· ISSN 2022 Â· Ayurveda Chronobiology</div>
              </div>
            ) : (
              <>
                {reasoning && (
                  <div style={{ ...card({ background: 'linear-gradient(135deg,#EEF2FF,#F5F3FF)', border: '1px solid #C7D2FE' }) }}>
                    <div style={{ fontSize: 13, color: '#4F46E5', fontWeight: 700, marginBottom: 12 }}>ðŸ¤– AI Recommendation</div>
                    {(['protein', 'water', 'calories', 'fasting'] as const).map(key => (
                      <div key={key} style={{ fontSize: 12, color: '#4338CA', marginBottom: 7, lineHeight: 1.6, paddingRight: 8, borderRight: '2px solid #C7D2FE' }}>
                        <strong>{key}:</strong> {reasoning[key === 'calories' ? 'calories' : key]}
                      </div>
                    ))}
                  </div>
                )}

                {[
                  { label: 'Protein Goal', key: 'protein_goal' as const, min: 80, max: 300, step: 5, color: '#4F46E5', unit: 'g' },
                  { label: 'Water Goal', key: 'water_goal' as const, min: 1, max: 10, step: 0.5, color: '#22C55E', unit: 'L' },
                  { label: 'Calorie Goal', key: 'calorie_goal' as const, min: 1200, max: 4000, step: 50, color: '#F59E0B', unit: 'kcal' },
                ].map(({ label, key, min, max, step, color, unit }) => (
                  <div key={key} style={card()}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input type="range" min={min} max={max} step={step} value={goals[key] as number}
                        onChange={e => setGoals({ ...goals, [key]: Number(e.target.value) })}
                        style={{ flex: 1, accentColor: color }} />
                      <span style={{ fontWeight: 700, color, minWidth: 72, textAlign: 'center' }}>{goals[key]} {unit}</span>
                    </div>
                  </div>
                ))}

                <div style={card()}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Fasting Window</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {FASTING_OPTIONS.map(opt => (
                      <button key={opt.label} onClick={() => setGoals({ ...goals, fasting_window_hours: opt.hours, eating_window_start: opt.start })} style={{
                        padding: '10px 8px', borderRadius: 10, border: '2px solid',
                        borderColor: goals.fasting_window_hours === opt.hours ? '#4F46E5' : '#E5E7EB',
                        background: goals.fasting_window_hours === opt.hours ? '#EEF2FF' : '#fff',
                        color: goals.fasting_window_hours === opt.hours ? '#4F46E5' : '#374151',
                        fontWeight: 600, fontSize: 14, cursor: 'pointer'
                      }}>{opt.label}</button>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8, textAlign: 'center' }}>
                    Eating starts: {goals.eating_window_start} â€” ends after {24 - goals.fasting_window_hours}h
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                  <button onClick={() => setStep('setup')} style={{
                    flex: 1, padding: '12px', borderRadius: 10, border: '2px solid #E5E7EB',
                    background: '#fff', color: '#6B7280', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                  }}>Recalculate</button>
                  <button onClick={handleSave} disabled={saving} style={{
                    flex: 2, padding: '14px', borderRadius: 10, border: 'none',
                    background: saving ? '#A5B4FC' : '#4F46E5', color: '#fff',
                    fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer'
                  }}>{saving ? 'Saving...' : isReview ? 'Update Goals' : 'Save & Continue'}</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

