'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateStep, loadSetupData, clearSetupData } from '@/lib/profile-store'
import { defaultStep6, type Step6Data } from '@/lib/profile-types'
import { supabase } from '@/lib/supabase'

const GOALS = [
  { k:'fat_loss',     icon:'🔥', t:'خسارة الدهون',      s:'تقليل نسبة الدهون مع الحفاظ على العضلات' },
  { k:'muscle',       icon:'💪', t:'بناء العضلات',       s:'زيادة الكتلة العضلية والقوة' },
  { k:'recovery',     icon:'⚡', t:'تحسين التعافي',      s:'رفع HRV وتسريع التعافي بعد التمرين' },
  { k:'sleep',        icon:'😴', t:'تحسين النوم',        s:'جودة نوم أعمق ووقت أقصر للغفو' },
  { k:'hormones',     icon:'🧬', t:'توازن الهرمونات',    s:'تحسين التستوستيرون والكورتيزول' },
  { k:'energy',       icon:'🌟', t:'رفع مستوى الطاقة',   s:'طاقة ثابتة طوال اليوم بدون انهيار' },
  { k:'fasting',      icon:'⏱️', t:'الصيام المتقطع',     s:'بناء عادة صيام منتظمة ومستدامة' },
  { k:'longevity',    icon:'🧪', t:'Longevity',           s:'إطالة العمر الصحي وإبطاء الشيخوخة' },
  { k:'performance',  icon:'🏆', t:'الأداء الرياضي',     s:'تحسين القوة والتحمل والسرعة' },
  { k:'inflammation', icon:'🛡️', t:'تقليل الالتهاب',    s:'خفض مؤشرات الالتهاب المزمن' },
]

const GOAL_LABELS: Record<string,string> = Object.fromEntries(GOALS.map(g=>[g.k,g.t]))

export default function Step6Page() {
  const router = useRouter()
  const [form, setForm]       = useState<Step6Data>(defaultStep6)
  const [mode, setMode]       = useState<'manual'|'ai'>('manual')
  const [aiText, setAiText]   = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiGoals, setAiGoals] = useState<{title:string;why:string;conf:string;on:boolean}[]>([])
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    const saved = loadSetupData()
    if (saved.step6.goals.length) setForm(saved.step6)
  }, [])

  function toggleGoal(k: string) {
    setForm(p => {
      const has = p.goals.includes(k)
      const goals = has ? p.goals.filter(g => g !== k) : [...p.goals, k]
      return { ...p, goals }
    })
  }

  async function analyzeGoals() {
    if (!aiText.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `أنت مساعد صحي في منصة BioSovereignty. المستخدم كتب:\n"${aiText}"\nاستخرج 3-4 أهداف صحية. أجب بـ JSON فقط:\n{"goals":[{"title":"اسم قصير","why":"سبب مناسب","confidence":"عالي أو متوسط"}],"summary":"جملة تلخيصية"}`
          }]
        })
      })
      const data = await res.json()
      const txt = data.content[0].text.replace(/```json|```/g,'').trim()
      const parsed = JSON.parse(txt)
      setAiGoals(parsed.goals.map((g:any) => ({ ...g, on: true })))
      setForm(p => ({ ...p, goals: parsed.goals.map((g:any) => g.title), goals_mode:'ai' }))
    } catch {
      setError('تعذّر التحليل — حاول مرة أخرى')
    }
    setAiLoading(false)
  }

  function toggleAiGoal(i: number) {
    const updated = aiGoals.map((g,idx) => idx===i ? {...g,on:!g.on} : g)
    setAiGoals(updated)
    setForm(p => ({ ...p, goals: updated.filter(g=>g.on).map(g=>g.title) }))
  }

  async function handleSave() {
    if (form.goals.length === 0) { setError('اختر هدفاً واحداً على الأقل'); return }
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('غير مسجّل')

      const all = loadSetupData()
      const s1 = all.step1
      const s2 = all.step2
      const s3 = all.step3
      const s4 = all.step4
      const s5 = all.step5

      const payload = {
        id:               user.id,
        // الخطوة 1
        first_name:       s1.first_name,
        last_name:        s1.last_name,
        full_name:        `${s1.first_name} ${s1.last_name}`.trim(),
        dob:              s1.dob || null,
        gender:           s1.gender || null,
        weight_kg:        s1.weight_kg,
        height_cm:        s1.height_cm,
        blood_type:       s1.blood_type || null,
        timezone:         s1.timezone,
        // الخطوة 2
        inbody_weight:    s2.inbody_data?.weight ?? null,
        inbody_fat:       s2.inbody_data?.fat ?? null,
        inbody_muscle:    s2.inbody_data?.muscle ?? null,
        inbody_visceral:  s2.inbody_data?.visceral ?? null,
        inbody_bmr:       s2.inbody_data?.bmr ?? null,
        inbody_water:     s2.inbody_data?.water ?? null,
        inbody_date:      s2.inbody_date || null,
        wearable_device:  s2.wearable_device,
        // الخطوة 3
        bio_constitution:     s3.bio_constitution || null,
        constitution_scores:  s3.constitution_scores,
        // الخطوة 4
        activity_level:      s4.activity_level,
        diet_type:           s4.diet_type,
        meals_per_day:       s4.meals_per_day,
        last_meal_time:      s4.last_meal_time,
        has_snack:           s4.has_snack,
        snack_type:          s4.snack_type || null,
        has_caffeine:        s4.has_caffeine,
        caffeine_type:       s4.caffeine_type || null,
        last_caffeine_time:  s4.last_caffeine_time || null,
        daily_water:         s4.daily_water,
        fasting_level:       s4.fasting_level,
        sleep_time:          s4.sleep_time,
        wake_time:           s4.wake_time,
        sleep_hours:         s4.sleep_hours,
        // الخطوة 5
        chronic_conditions:  s5.chronic_conditions,
        injuries:            s5.injuries,
        surgeries:           s5.surgeries,
        medications:         s5.medications,
        no_medications:      s5.no_medications,
        smoking_status:      s5.smoking_status || null,
        smoking_packs:       s5.smoking_packs,
        smoking_years:       s5.smoking_years,
        allergies:           s5.allergies,
        health_notes:        s5.health_notes || null,
        // الخطوة 6
        goals:               form.goals,
        goals_mode:          mode,
        // الحالة
        setup_step:          6,
        setup_completed:     true,
        updated_at:          new Date().toISOString(),
      }

      const { error: dbErr } = await supabase.from('profiles').upsert(payload)
      if (dbErr) throw new Error(dbErr.message)

      clearSetupData()
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message || 'حدث خطأ — حاول مرة أخرى')
    }
    setSaving(false)
  }

  const selectedCount = form.goals.length

  return (
    <div style={{ minHeight:'100vh', background:'#EEF2F8', display:'flex',
      alignItems:'center', justifyContent:'center', padding:'24px 16px',
      fontFamily:"'IBM Plex Sans Arabic', system-ui, sans-serif", direction:'rtl' }}>
      <div style={{ background:'#fff', borderRadius:'14px', padding:'36px',
        width:'100%', maxWidth:'520px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>

        {/* Progress */}
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'28px' }}>
          {[1,2,3,4,5,6].map(n => (
            <div key={n} style={{ display:'flex', alignItems:'center', gap:'6px', flex:n<6?1:'none' }}>
              <div style={{ width:'26px', height:'26px', borderRadius:'50%', display:'flex',
                alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:600, flexShrink:0,
                background:n<6?'#10B981':n===6?'#4F46E5':'#E2E8F0',
                color:n<=6?'#fff':'#94A3B8' }}>{n<6?'✓':n}</div>
              {n<6&&<div style={{ flex:1, height:'2px', borderRadius:'2px',
                background:n<6?'#10B981':'#E2E8F0' }}/>}
            </div>
          ))}
        </div>

        <p style={{ fontSize:'11px', color:'#64748B', margin:'0 0 4px' }}>الخطوة 6 من 6 — الأخيرة</p>
        <h1 style={{ fontSize:'22px', fontWeight:700, color:'#0F1629', margin:'0 0 4px' }}>أهدافك الصحية</h1>
        <p style={{ fontSize:'13px', color:'#64748B', margin:'0 0 24px' }}>حدد ما تريد تحقيقه — المنصة تبني خارطة طريقك</p>

        {/* Mode toggle */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'20px' }}>
          {([['manual','اختر من القائمة','أهداف جاهزة — اختر ما يناسبك'],
             ['ai','اكتب بكلامك','الذكاء الاصطناعي يقترح أهدافك']] as const).map(([v,t,s])=>(
            <div key={v} onClick={()=>setMode(v)}
              style={{ padding:'10px 12px', border:`1.5px solid ${mode===v?'#4F46E5':'#E2E8F0'}`,
                borderRadius:'10px', cursor:'pointer', transition:'all 0.15s',
                background:mode===v?'rgba(79,70,229,0.05)':'#FAFAFA' }}>
              <div style={{ fontSize:'13px', fontWeight:600, color:mode===v?'#4338CA':'#0F1629', marginBottom:'2px' }}>{t}</div>
              <div style={{ fontSize:'11px', color:'#94A3B8' }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Manual */}
        {mode==='manual'&&(
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'14px' }}>
              {GOALS.map(g=>{
                const sel = form.goals.includes(g.k)
                return(
                  <div key={g.k} onClick={()=>toggleGoal(g.k)}
                    style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'11px 12px',
                      border:`1.5px solid ${sel?'#4F46E5':'#E2E8F0'}`,
                      borderRadius:'10px', cursor:'pointer', transition:'all 0.15s',
                      background:sel?'rgba(79,70,229,0.05)':'#FAFAFA' }}>
                    <div style={{ width:'16px', height:'16px', borderRadius:'4px', flexShrink:0, marginTop:'1px',
                      border:`1.5px solid ${sel?'#4F46E5':'#CBD5E1'}`,
                      background:sel?'#4F46E5':'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {sel&&<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                    </div>
                    <span style={{ fontSize:'14px' }}>{g.icon}</span>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:600, color:'#0F1629', lineHeight:1.3 }}>{g.t}</div>
                      <div style={{ fontSize:'10px', color:'#94A3B8', marginTop:'2px' }}>{g.s}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedCount >= 2 && (
              <div style={{ marginBottom:'14px' }}>
                <div style={{ fontSize:'11px', color:'#64748B', marginBottom:'6px', textAlign:'center' }}>
                  اسحب لترتيب أهدافك حسب الأولوية
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', justifyContent:'center' }}>
                  {form.goals.map((k,i)=>(
                    <div key={k} style={{ display:'inline-flex', alignItems:'center', gap:'6px',
                      padding:'5px 12px', borderRadius:'20px', fontSize:'12px',
                      border:`1.5px solid ${i===0?'#4F46E5':i===1?'#7C3AED':'#94A3B8'}`,
                      background:i===0?'rgba(79,70,229,0.08)':i===1?'rgba(124,58,237,0.06)':'rgba(148,163,184,0.06)',
                      color:i===0?'#4338CA':i===1?'#6D28D9':'#64748B' }}>
                      <span style={{ width:'16px', height:'16px', borderRadius:'50%', display:'flex',
                        alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:700,
                        background:i===0?'#4F46E5':i===1?'#7C3AED':'#94A3B8', color:'#fff' }}>{i+1}</span>
                      {GOAL_LABELS[k]||k}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI */}
        {mode==='ai'&&(
          <div style={{ marginBottom:'14px' }}>
            <p style={{ fontSize:'12px', color:'#64748B', margin:'0 0 8px', lineHeight:1.6 }}>
              اكتب ما تريد تحقيقه بكلامك الخاص — الذكاء الاصطناعي يحللها ويقترح أهدافاً:
            </p>
            <textarea value={aiText} onChange={e=>setAiText(e.target.value)}
              placeholder="مثال: أريد أن أخسر وزناً وأحسن طاقتي في الصباح، أعاني من تعب مزمن..."
              style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px',
                fontSize:'13px', color:'#0F1629', background:'#FAFAFA', outline:'none',
                boxSizing:'border-box', fontFamily:"'IBM Plex Sans Arabic', system-ui, sans-serif",
                resize:'vertical', minHeight:'80px', lineHeight:1.5, marginBottom:'8px' }} />
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'8px' }}>
              {['أريد بناء عضلات مع تحسين النوم','أعاني من إرهاق وأريد تحسين التعافي',
                'هدفي إطالة العمر الصحي وتحسين الهرمونات'].map(ex=>(
                <span key={ex} onClick={()=>setAiText(ex)}
                  style={{ fontSize:'11px', padding:'4px 10px', borderRadius:'20px',
                    border:'0.5px solid #E2E8F0', color:'#64748B', background:'#F8FAFC',
                    cursor:'pointer', transition:'all 0.15s' }}>{ex}</span>
              ))}
            </div>
            <button onClick={analyzeGoals} disabled={aiLoading||!aiText.trim()}
              style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none',
                fontSize:'13px', fontWeight:500, cursor:aiLoading||!aiText.trim()?'not-allowed':'pointer',
                fontFamily:'inherit', background:aiLoading||!aiText.trim()?'#A5B4FC':'#4F46E5',
                color:'#fff', marginBottom:'10px' }}>
              {aiLoading ? 'جاري التحليل...' : 'تحليل بالذكاء الاصطناعي ←'}
            </button>

            {aiGoals.length > 0 && (
              <div>
                <div style={{ fontSize:'11px', color:'#64748B', marginBottom:'8px' }}>
                  الأهداف المقترحة — اضغط على أي هدف لاعتماده أو إلغائه:
                </div>
                {aiGoals.map((g,i)=>(
                  <div key={i} onClick={()=>toggleAiGoal(i)}
                    style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'10px 13px',
                      border:`1.5px solid ${g.on?'#4F46E5':'#E2E8F0'}`,
                      borderRadius:'10px', marginBottom:'7px', cursor:'pointer', transition:'all 0.15s',
                      background:g.on?'rgba(79,70,229,0.04)':'#FAFAFA' }}>
                    <div style={{ width:'16px', height:'16px', borderRadius:'4px', flexShrink:0, marginTop:'2px',
                      border:`1.5px solid ${g.on?'#4F46E5':'#CBD5E1'}`,
                      background:g.on?'#4F46E5':'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {g.on&&<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'13px', fontWeight:500, color:'#0F1629' }}>{g.title}</div>
                      <div style={{ fontSize:'11px', color:'#64748B', marginTop:'2px' }}>{g.why}</div>
                    </div>
                    <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'20px',
                      background:'rgba(16,185,129,0.08)', color:'#047857',
                      border:'0.5px solid rgba(16,185,129,0.2)', flexShrink:0 }}>{g.conf}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ملخص */}
        {form.goals.length > 0 && (
          <div style={{ background:'rgba(79,70,229,0.04)', border:'0.5px solid rgba(79,70,229,0.15)',
            borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'#64748B',
            lineHeight:1.9, marginBottom:'12px' }}>
            <strong style={{ color:'#0F1629' }}>أهدافك: </strong>
            {form.goals.map(g=>(
              <span key={g} style={{ display:'inline-block', padding:'1px 8px', borderRadius:'20px',
                background:'rgba(79,70,229,0.08)', color:'#4338CA', fontSize:'11px', margin:'2px' }}>
                {GOAL_LABELS[g]||g}
              </span>
            ))}
          </div>
        )}

        {error&&(
          <div style={{ background:'#FEF2F2', border:'1px solid #FCA5A5', borderRadius:'8px',
            padding:'10px 14px', color:'#DC2626', fontSize:'13px', marginBottom:'10px' }}>⚠️ {error}</div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 3fr', gap:'8px' }}>
          <button onClick={()=>router.push('/profile/setup/step5')}
            style={{ padding:'14px', borderRadius:'10px', border:'1.5px solid #E2E8F0',
              background:'transparent', color:'#64748B', fontSize:'14px', cursor:'pointer' }}>→</button>
          <button onClick={handleSave} disabled={saving||form.goals.length===0}
            style={{ background:saving||form.goals.length===0?'#A5B4FC':'#4F46E5',
              color:'#fff', border:'none', borderRadius:'10px', padding:'14px',
              fontSize:'15px', fontWeight:600,
              cursor:saving||form.goals.length===0?'not-allowed':'pointer' }}>
            {saving ? 'جاري الحفظ...' : 'إنهاء الإعداد وبدء رحلتك 🚀'}
          </button>
        </div>
      </div>
    </div>
  )
}

