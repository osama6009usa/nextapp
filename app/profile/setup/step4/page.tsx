'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateStep, loadSetupData, setSetupStep } from '@/lib/profile-store'
import { defaultStep4, type Step4Data } from '@/lib/profile-types'

const OPTS = {
  activity: [
    { v:'sedentary', icon:'🪑', t:'خامل جداً',    s:'لا تمرين — عمل مكتبي' },
    { v:'light',     icon:'🚶', t:'نشاط خفيف',    s:'حركة بسيطة في اليوم' },
    { v:'moderate',  icon:'🏃', t:'معتدل',         s:'2-3 تمارين أسبوعياً' },
    { v:'active',    icon:'💪', t:'نشيط',          s:'4-5 تمارين أسبوعياً' },
    { v:'athlete',   icon:'🏆', t:'رياضي',         s:'تدريب يومي أو أكثر' },
  ],
  diet: [
    { v:'balanced',      icon:'🥗', t:'متوازن' },
    { v:'keto',          icon:'🥩', t:'كيتو' },
    { v:'mediterranean', icon:'🫒', t:'متوسطي' },
    { v:'vegetarian',    icon:'🥦', t:'نباتي' },
    { v:'carnivore',     icon:'🍖', t:'لحوم فقط' },
    { v:'other',         icon:'🍽️', t:'أخرى' },
  ],
  meals: ['1','2','3','4','5+'],
  water: ['1L أو أقل','1-2L','2-3L','3-4L','4-5L','أكثر من 5L'],
  fasting: [
    { v:'none',  t:'لا أصوم' },
    { v:'12/12', t:'12/12' },
    { v:'16/8',  t:'16/8' },
    { v:'18/6',  t:'18/6' },
    { v:'20/4',  t:'20/4' },
    { v:'omad',  t:'OMAD' },
  ],
}

export default function Step4Page() {
  const router = useRouter()
  const [form, setForm] = useState<Step4Data>(defaultStep4)

  useEffect(() => {
    const saved = loadSetupData()
    if (saved.step4.activity_level) setForm(saved.step4)
  }, [])

  const set = (k: keyof Step4Data, v: any) => setForm(p => ({ ...p, [k]: v }))

  function handleNext() {
    if (!form.activity_level) return
    updateStep('step4', form)
    setSetupStep(5)
    router.push('/profile/setup/step5')
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
            <div key={n} style={{ display:'flex', alignItems:'center', gap:'6px', flex:n<6?1:'none' }}>
              <div style={{ width:'26px', height:'26px', borderRadius:'50%', display:'flex',
                alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:600, flexShrink:0,
                background:n<4?'#10B981':n===4?'#4F46E5':'#E2E8F0',
                color:n<=4?'#fff':'#94A3B8' }}>{n<4?'✓':n}</div>
              {n<6&&<div style={{ flex:1, height:'2px', borderRadius:'2px',
                background:n<4?'#10B981':'#E2E8F0' }}/>}
            </div>
          ))}
        </div>

        <p style={{ fontSize:'11px', color:'#64748B', margin:'0 0 4px' }}>الخطوة 4 من 6</p>
        <h1 style={{ fontSize:'22px', fontWeight:700, color:'#0F1629', margin:'0 0 4px' }}>نمط حياتك</h1>
        <p style={{ fontSize:'13px', color:'#64748B', margin:'0 0 24px' }}>عاداتك اليومية تحدد توصياتك الصحية</p>

        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

          {/* مستوى النشاط */}
          <div>
            <label style={lbl}>مستوى النشاط البدني <span style={{ color:'#EF4444' }}>*</span></label>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {OPTS.activity.map(o => (
                <div key={o.v} onClick={() => set('activity_level', o.v)}
                  style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px',
                    border:`1.5px solid ${form.activity_level===o.v?'#4F46E5':'#E2E8F0'}`,
                    borderRadius:'10px', cursor:'pointer', transition:'all 0.15s',
                    background:form.activity_level===o.v?'rgba(79,70,229,0.05)':'#FAFAFA' }}>
                  <span style={{ fontSize:'18px' }}>{o.icon}</span>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:600, color:'#0F1629' }}>{o.t}</div>
                    <div style={{ fontSize:'11px', color:'#94A3B8' }}>{o.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* نوع الغذاء */}
          <div>
            <label style={lbl}>النظام الغذائي</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
              {OPTS.diet.map(o => (
                <div key={o.v} onClick={() => set('diet_type', o.v)}
                  style={{ padding:'10px 8px', border:`1.5px solid ${form.diet_type===o.v?'#4F46E5':'#E2E8F0'}`,
                    borderRadius:'10px', cursor:'pointer', textAlign:'center', transition:'all 0.15s',
                    background:form.diet_type===o.v?'rgba(79,70,229,0.05)':'#FAFAFA' }}>
                  <div style={{ fontSize:'20px', marginBottom:'4px' }}>{o.icon}</div>
                  <div style={{ fontSize:'12px', fontWeight:500, color:form.diet_type===o.v?'#4338CA':'#475569' }}>{o.t}</div>
                </div>
              ))}
            </div>
          </div>

          {/* عدد الوجبات */}
          <div>
            <label style={lbl}>عدد الوجبات يومياً</label>
            <div style={{ display:'flex', gap:'6px' }}>
              {OPTS.meals.map(m => (
                <div key={m} onClick={() => set('meals_per_day', m)}
                  style={{ flex:1, padding:'10px 4px', border:`1.5px solid ${form.meals_per_day===m?'#4F46E5':'#E2E8F0'}`,
                    borderRadius:'8px', cursor:'pointer', textAlign:'center', fontSize:'13px', fontWeight:600,
                    background:form.meals_per_day===m?'rgba(79,70,229,0.05)':'#FAFAFA',
                    color:form.meals_per_day===m?'#4338CA':'#475569', transition:'all 0.15s' }}>{m}</div>
              ))}
            </div>
          </div>

          {/* الصيام */}
          <div>
            <label style={lbl}>نظام الصيام المتقطع</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
              {OPTS.fasting.map(o => (
                <div key={o.v} onClick={() => set('fasting_level', o.v)}
                  style={{ padding:'10px', border:`1.5px solid ${form.fasting_level===o.v?'#4F46E5':'#E2E8F0'}`,
                    borderRadius:'8px', cursor:'pointer', textAlign:'center', fontSize:'12px', fontWeight:600,
                    background:form.fasting_level===o.v?'rgba(79,70,229,0.05)':'#FAFAFA',
                    color:form.fasting_level===o.v?'#4338CA':'#475569', transition:'all 0.15s' }}>{o.t}</div>
              ))}
            </div>
          </div>

          {/* الماء */}
          <div>
            <label style={lbl}>شرب الماء يومياً</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
              {OPTS.water.map(w => (
                <div key={w} onClick={() => set('daily_water', w)}
                  style={{ padding:'8px 6px', border:`1.5px solid ${form.daily_water===w?'#4F46E5':'#E2E8F0'}`,
                    borderRadius:'8px', cursor:'pointer', textAlign:'center', fontSize:'11px', fontWeight:500,
                    background:form.daily_water===w?'rgba(79,70,229,0.05)':'#FAFAFA',
                    color:form.daily_water===w?'#4338CA':'#475569', transition:'all 0.15s' }}>{w}</div>
              ))}
            </div>
          </div>

          {/* أوقات النوم */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <div>
              <label style={lbl}>وقت النوم</label>
              <input type="time" style={inp} value={form.sleep_time}
                onChange={e => set('sleep_time', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>وقت الاستيقاظ</label>
              <input type="time" style={inp} value={form.wake_time}
                onChange={e => set('wake_time', e.target.value)} />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 3fr', gap:'8px', marginTop:'4px' }}>
            <button onClick={() => router.push('/profile/setup/step3')}
              style={{ padding:'14px', borderRadius:'10px', border:'1.5px solid #E2E8F0',
                background:'transparent', color:'#64748B', fontSize:'14px', cursor:'pointer' }}>→</button>
            <button onClick={handleNext} disabled={!form.activity_level}
              style={{ background:!form.activity_level?'#A5B4FC':'#4F46E5', color:'#fff',
                border:'none', borderRadius:'10px', padding:'14px', fontSize:'15px',
                fontWeight:600, cursor:!form.activity_level?'not-allowed':'pointer', width:'100%' }}>
              التالي — الحالة الصحية ←
            </button>
          </div>
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
