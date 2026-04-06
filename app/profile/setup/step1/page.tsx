'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateStep, loadSetupData, setSetupStep } from '@/lib/profile-store'
import { defaultStep1, type Step1Data } from '@/lib/profile-types'

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

function calcAge(dob: string): number {
  if (!dob) return 0
  const t = new Date(), b = new Date(dob)
  let a = t.getFullYear() - b.getFullYear()
  const m = t.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--
  return a
}

function calcBMI(w: number, h: number): number {
  if (!w || !h) return 0
  return Math.round((w / Math.pow(h / 100, 2)) * 10) / 10
}

function calcIdeal(h: number, gender: string): number {
  const hm = h / 100
  return Math.round((gender === 'female' ? 21.5 : 22.5) * hm * hm)
}

export default function Step1Page() {
  const router = useRouter()
  const [form, setForm] = useState<Step1Data>(defaultStep1)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = loadSetupData()
    if (saved.step1.first_name) setForm(saved.step1)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setForm(p => ({ ...p, timezone: p.timezone || tz }))
  }, [])

  const set = (k: keyof Step1Data, v: string | number | null) =>
    setForm(p => ({ ...p, [k]: v }))

  const age    = calcAge(form.dob)
  const bmi    = form.weight_kg && form.height_cm ? calcBMI(form.weight_kg, form.height_cm) : 0
  const ideal  = form.height_cm ? calcIdeal(form.height_cm, form.gender) : 0
  const bmiColor = bmi < 18.5 ? '#60A5FA' : bmi < 25 ? '#34D399' : bmi < 30 ? '#FBBF24' : '#F87171'
  const bmiLabel = bmi < 18.5 ? 'نقص في الوزن' : bmi < 25 ? 'وزن مثالي' : bmi < 30 ? 'زيادة طفيفة' : 'زيادة في الوزن'

  function validate(): boolean {
    if (!form.first_name.trim()) { setError('الاسم الأول مطلوب'); return false }
    if (!form.last_name.trim())  { setError('اسم العائلة مطلوب'); return false }
    if (!form.dob)               { setError('تاريخ الميلاد مطلوب'); return false }
    if (age < 10 || age > 100)   { setError('تاريخ الميلاد غير صحيح'); return false }
    if (!form.gender)            { setError('الجنس مطلوب'); return false }
    if (!form.weight_kg)         { setError('الوزن مطلوب'); return false }
    if (!form.height_cm)         { setError('الطول مطلوب'); return false }
    return true
  }

  function handleNext() {
    if (!validate()) return
    updateStep('step1', form)
    setSetupStep(2)
    router.push('/profile/setup/step2')
  }

  return (
    <div style={{ minHeight:'100vh', background:'#EEF2F8', display:'flex',
      alignItems:'center', justifyContent:'center', padding:'24px 16px',
      fontFamily:"'IBM Plex Sans Arabic', system-ui, sans-serif", direction:'rtl' }}>
      <div style={{ background:'#fff', borderRadius:'14px', padding:'36px',
        width:'100%', maxWidth:'500px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>

        {/* Progress */}
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'28px' }}>
          {[1,2,3,4,5,6].map(n => (
            <div key={n} style={{ display:'flex', alignItems:'center', gap:'6px', flex: n < 6 ? 1 : 'none' }}>
              <div style={{ width:'26px', height:'26px', borderRadius:'50%', display:'flex',
                alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:600,
                background: n === 1 ? '#4F46E5' : '#E2E8F0',
                color: n === 1 ? '#fff' : '#94A3B8', flexShrink:0 }}>{n}</div>
              {n < 6 && <div style={{ flex:1, height:'2px', background:'#E2E8F0', borderRadius:'2px' }} />}
            </div>
          ))}
        </div>

        <p style={{ fontSize:'11px', color:'#64748B', margin:'0 0 4px', letterSpacing:'0.5px' }}>الخطوة 1 من 6</p>
        <h1 style={{ fontSize:'22px', fontWeight:700, color:'#0F1629', margin:'0 0 4px' }}>بياناتك الأساسية</h1>
        <p style={{ fontSize:'13px', color:'#64748B', margin:'0 0 24px' }}>المعلومات التي تبني عليها المنصة كل شيء</p>

        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

          {/* الاسم */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <div>
              <label style={lbl}>الاسم الأول <span style={{ color:'#EF4444' }}>*</span></label>
              <input style={inp} placeholder="أسامة" value={form.first_name}
                onChange={e => set('first_name', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>اسم العائلة <span style={{ color:'#EF4444' }}>*</span></label>
              <input style={inp} placeholder="العمري" value={form.last_name}
                onChange={e => set('last_name', e.target.value)} />
            </div>
          </div>

          {/* تاريخ الميلاد */}
          <div>
            <label style={lbl}>تاريخ الميلاد <span style={{ color:'#EF4444' }}>*</span></label>
            <div style={{ position:'relative' }}>
              <input style={{ ...inp, paddingLeft: age > 0 ? '76px' : '12px' }}
                type="date" max={new Date().toISOString().split('T')[0]}
                value={form.dob} onChange={e => set('dob', e.target.value)} />
              {age > 0 && (
                <div style={{ position:'absolute', left:'8px', top:'50%', transform:'translateY(-50%)',
                  background:'#4F46E5', color:'#fff', borderRadius:'6px', padding:'2px 10px',
                  fontSize:'12px', fontWeight:700, pointerEvents:'none' }}>{age} سنة</div>
              )}
            </div>
          </div>

          {/* الجنس */}
          <div>
            <label style={lbl}>الجنس <span style={{ color:'#EF4444' }}>*</span></label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              {(['male','female'] as const).map(g => (
                <div key={g} onClick={() => set('gender', g)} style={{
                  padding:'10px', border:`1.5px solid ${form.gender === g ? '#4F46E5' : '#E2E8F0'}`,
                  borderRadius:'8px', cursor:'pointer', textAlign:'center', fontSize:'13px',
                  fontWeight:500, background: form.gender === g ? 'rgba(79,70,229,0.05)' : '#FAFAFA',
                  color: form.gender === g ? '#4338CA' : '#475569', transition:'all 0.15s' }}>
                  {g === 'male' ? 'ذكر' : 'أنثى'}
                </div>
              ))}
            </div>
          </div>

          {/* الوزن والطول */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <div>
              <label style={lbl}>الوزن (kg) <span style={{ color:'#EF4444' }}>*</span></label>
              <input style={inp} type="number" placeholder="85"
                value={form.weight_kg ?? ''} onChange={e => set('weight_kg', parseFloat(e.target.value) || null)} />
            </div>
            <div>
              <label style={lbl}>الطول (cm) <span style={{ color:'#EF4444' }}>*</span></label>
              <input style={inp} type="number" placeholder="178"
                value={form.height_cm ?? ''} onChange={e => set('height_cm', parseFloat(e.target.value) || null)} />
            </div>
          </div>

          {/* مؤشرات حية */}
          {bmi > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
              {[
                { label:'العمر', val: age > 0 ? `${age} سنة` : '—' },
                { label:'مؤشر الكتلة', val: bmi > 0 ? String(bmi) : '—' },
                { label:'الوزن المثالي', val: ideal > 0 ? `${ideal} kg` : '—' },
              ].map(m => (
                <div key={m.label} style={{ background:'#F8FAFC', border:'0.5px solid #E2E8F0',
                  borderRadius:'8px', padding:'10px', textAlign:'center' }}>
                  <div style={{ fontSize:'16px', fontWeight:700, color:'#0F1629' }}>{m.val}</div>
                  <div style={{ fontSize:'10px', color:'#94A3B8', marginTop:'2px' }}>{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {bmi > 0 && (
            <div>
              <div style={{ height:'4px', borderRadius:'2px', background:'#E2E8F0', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:'2px', background:bmiColor,
                  width:`${Math.min(95, bmi < 18.5 ? (bmi/18.5)*20 : bmi < 25 ? 20+((bmi-18.5)/6.5)*30 : bmi < 30 ? 50+((bmi-25)/5)*25 : 75)}%`,
                  transition:'width 0.5s' }} />
              </div>
              <div style={{ fontSize:'11px', color:'#64748B', marginTop:'3px' }}>BMI {bmi} — {bmiLabel}</div>
            </div>
          )}

          {/* فصيلة الدم */}
          <div>
            <label style={lbl}>فصيلة الدم <span style={{ fontSize:'10px', color:'#94A3B8', fontWeight:400 }}>(اختياري)</span></label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px' }}>
              {BLOOD_TYPES.map(bt => (
                <div key={bt} onClick={() => set('blood_type', form.blood_type === bt ? '' : bt)} style={{
                  padding:'8px 4px', border:`1.5px solid ${form.blood_type === bt ? '#EF4444' : '#E2E8F0'}`,
                  borderRadius:'8px', cursor:'pointer', textAlign:'center', fontSize:'12px', fontWeight:600,
                  background: form.blood_type === bt ? 'rgba(239,68,68,0.06)' : '#FAFAFA',
                  color: form.blood_type === bt ? '#DC2626' : '#475569', transition:'all 0.15s' }}>{bt}</div>
              ))}
            </div>
          </div>

          {/* المنطقة الزمنية */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'9px 12px',
            border:'0.5px solid #E2E8F0', borderRadius:'8px', background:'#F8FAFC' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#34D399', flexShrink:0 }} />
            <div style={{ fontSize:'13px', color:'#0F1629', flex:1 }}>{form.timezone || 'جاري الكشف...'}</div>
            <div style={{ fontSize:'10px', color:'#10B981', background:'rgba(16,185,129,0.08)',
              padding:'2px 8px', borderRadius:'20px' }}>تلقائي</div>
          </div>

          {error && (
            <div style={{ background:'#FEF2F2', border:'1px solid #FCA5A5', borderRadius:'8px',
              padding:'10px 14px', color:'#DC2626', fontSize:'13px' }}>⚠️ {error}</div>
          )}

          <button onClick={handleNext} style={{
            background:'#4F46E5', color:'#fff', border:'none', borderRadius:'10px',
            padding:'14px', fontSize:'15px', fontWeight:600, cursor:'pointer',
            marginTop:'4px', transition:'background 0.15s', width:'100%' }}>
            التالي — InBody والجهاز ←
          </button>
        </div>
      </div>
    </div>
  )
}

const lbl: React.CSSProperties = {
  display:'block', fontSize:'12px', fontWeight:600,
  color:'#475569', marginBottom:'6px', letterSpacing:'0.3px'
}
const inp: React.CSSProperties = {
  width:'100%', padding:'10px 12px', border:'1.5px solid #E2E8F0',
  borderRadius:'8px', fontSize:'14px', color:'#0F1629', background:'#FAFAFA',
  outline:'none', boxSizing:'border-box', fontFamily:"'IBM Plex Sans Arabic', system-ui, sans-serif"
}
