'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateStep, loadSetupData, setSetupStep } from '@/lib/profile-store'
import { defaultStep2, type Step2Data, type InBodyData } from '@/lib/profile-types'

const PROGRESS = [
  { n:1, done:true }, { n:2, active:true }, { n:3, done:false },
  { n:4, done:false }, { n:5, done:false }, { n:6, done:false },
]

export default function Step2Page() {
  const router = useRouter()
  const [form, setForm]         = useState<Step2Data>(defaultStep2)
  const [file, setFile]         = useState<File | null>(null)
  const [preview, setPreview]   = useState<string>('')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError]       = useState('')
  const fileRef                 = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = loadSetupData()
    if (saved.step2.has_inbody) setForm(saved.step2)
  }, [])

  function handleFile(f: File) {
    setFile(f)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
    setForm(p => ({ ...p, inbody_data: null }))
  }

  async function analyzeInBody() {
    if (!file || !preview) return
    setAnalyzing(true)
    try {
      const base64 = preview.split(',')[1]
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
              { type: 'text', text: 'هذه صورة تقرير InBody. استخرج منها الأرقام وأجب بـ JSON فقط:\n{"weight":0,"fat":0,"muscle":0,"visceral":0,"bmr":0,"water":0,"note":"ملاحظة بالعربي","goals_hint":["هدف1","هدف2"]}' }
            ]
          }]
        })
      })
      const data = await res.json()
      const txt = data.content[0].text.replace(/```json|```/g, '').trim()
      const parsed: InBodyData = JSON.parse(txt)
      setForm(p => ({ ...p, inbody_data: parsed, inbody_date: new Date().toISOString().split('T')[0] }))
    } catch {
      setError('تعذّر قراءة التقرير — تأكد أن الصورة واضحة')
    }
    setAnalyzing(false)
  }

  function validate(): boolean {
    if (!form.has_inbody) { setError('هل لديك فحص InBody؟'); return false }
    if (form.has_inbody === 'yes' && !form.inbody_data) { setError('يرجى رفع صورة InBody وتحليلها'); return false }
    if (!form.wearable_device) { setError('اختر جهاز القياس'); return false }
    return true
  }

  function handleNext() {
    if (!validate()) return
    updateStep('step2', form)
    setSetupStep(3)
    router.push('/profile/setup/step3')
  }

  const fat = form.inbody_data?.fat ?? 0
  const fatColor = fat > 25 ? '#F87171' : fat > 20 ? '#FBBF24' : '#34D399'

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
                alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:600, flexShrink:0,
                background: n < 2 ? '#10B981' : n === 2 ? '#4F46E5' : '#E2E8F0',
                color: n <= 2 ? '#fff' : '#94A3B8' }}>
                {n < 2 ? '✓' : n}
              </div>
              {n < 6 && <div style={{ flex:1, height:'2px', borderRadius:'2px',
                background: n < 2 ? '#10B981' : '#E2E8F0' }} />}
            </div>
          ))}
        </div>

        <p style={{ fontSize:'11px', color:'#64748B', margin:'0 0 4px' }}>الخطوة 2 من 6</p>
        <h1 style={{ fontSize:'22px', fontWeight:700, color:'#0F1629', margin:'0 0 4px' }}>بياناتك وأجهزتك</h1>
        <p style={{ fontSize:'13px', color:'#64748B', margin:'0 0 24px' }}>كلما أضفت أكثر — كانت توصيات المنصة أدق</p>

        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

          {/* ── InBody ── */}
          <div>
            <div style={{ fontSize:'10px', fontWeight:700, color:'#64748B', letterSpacing:'0.8px',
              marginBottom:'10px', paddingBottom:'6px', borderBottom:'0.5px solid #E2E8F0' }}>
              فحص INBODY
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'10px' }}>
              {(['yes','no'] as const).map(v => (
                <div key={v} onClick={() => { setForm(p => ({ ...p, has_inbody: v })); setError('') }}
                  style={{ padding:'10px 12px', border:`1.5px solid ${form.has_inbody === v ? (v==='yes'?'#4F46E5':'#94A3B8') : '#E2E8F0'}`,
                    borderRadius:'8px', cursor:'pointer', textAlign:'center', fontSize:'13px', fontWeight:500,
                    background: form.has_inbody === v ? (v==='yes'?'rgba(79,70,229,0.05)':'rgba(148,163,184,0.05)') : '#FAFAFA',
                    color: form.has_inbody === v ? (v==='yes'?'#4338CA':'#64748B') : '#475569',
                    transition:'all 0.15s' }}>
                  {v === 'yes' ? 'نعم، لديّ فحص InBody' : 'لا، ليس لديّ حالياً'}
                </div>
              ))}
            </div>

            {form.has_inbody === 'yes' && (
              <div>
                {!preview ? (
                  <div onClick={() => fileRef.current?.click()}
                    style={{ border:'1.5px dashed #CBD5E1', borderRadius:'10px', padding:'24px 16px',
                      textAlign:'center', cursor:'pointer', background:'#F8FAFC',
                      transition:'all 0.15s' }}>
                    <div style={{ fontSize:'28px', marginBottom:'8px' }}>🩻</div>
                    <div style={{ fontSize:'13px', fontWeight:500, color:'#0F1629', marginBottom:'3px' }}>ارفع صورة تقرير InBody</div>
                    <div style={{ fontSize:'11px', color:'#94A3B8' }}>JPG أو PNG — صورة واضحة للتقرير كاملاً</div>
                    <div style={{ marginTop:'10px', display:'inline-block', padding:'7px 18px',
                      borderRadius:'8px', border:'0.5px solid #4F46E5', background:'rgba(79,70,229,0.06)',
                      color:'#4338CA', fontSize:'12px', cursor:'pointer' }}>اختر صورة</div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
                      onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  </div>
                ) : (
                  <div>
                    <div style={{ display:'flex', gap:'12px', alignItems:'flex-start', marginBottom:'10px' }}>
                      <img src={preview} alt="" style={{ width:'80px', height:'80px',
                        borderRadius:'8px', objectFit:'cover', border:'0.5px solid #E2E8F0' }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'13px', fontWeight:500, color:'#0F1629', marginBottom:'4px' }}>{file?.name}</div>
                        <div style={{ fontSize:'11px', color:'#94A3B8', marginBottom:'8px' }}>
                          {file ? `${(file.size/1024).toFixed(0)} KB` : ''}
                        </div>
                        <div style={{ display:'flex', gap:'8px' }}>
                          <button onClick={analyzeInBody} disabled={analyzing} style={{
                            padding:'7px 14px', borderRadius:'8px', border:'none',
                            background: analyzing ? '#A5B4FC' : '#4F46E5', color:'#fff',
                            fontSize:'12px', cursor: analyzing ? 'not-allowed' : 'pointer' }}>
                            {analyzing ? 'جاري التحليل...' : form.inbody_data ? 'إعادة التحليل' : 'تحليل بالذكاء الاصطناعي'}
                          </button>
                          <button onClick={() => { setPreview(''); setFile(null); setForm(p=>({...p,inbody_data:null})) }}
                            style={{ padding:'7px 12px', borderRadius:'8px',
                              border:'0.5px solid #E2E8F0', background:'transparent',
                              color:'#64748B', fontSize:'12px', cursor:'pointer' }}>حذف</button>
                        </div>
                      </div>
                    </div>

                    {form.inbody_data && (
                      <div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px', marginBottom:'8px' }}>
                          {[
                            { l:'الوزن', v:`${form.inbody_data.weight} kg`, c:'#0F1629' },
                            { l:'الدهون', v:`${form.inbody_data.fat}%`, c:fatColor },
                            { l:'العضلات', v:`${form.inbody_data.muscle} kg`, c:'#0F1629' },
                            { l:'دهون حشوية', v:`${form.inbody_data.visceral}`, c: (form.inbody_data.visceral??0)>10?'#F87171':'#0F1629' },
                            { l:'معدل الحرق', v:`${form.inbody_data.bmr} kcal`, c:'#0F1629' },
                            { l:'نسبة الماء', v:`${form.inbody_data.water}%`, c:'#0F1629' },
                          ].map(m => (
                            <div key={m.l} style={{ background:'#F8FAFC', border:'0.5px solid #E2E8F0',
                              borderRadius:'8px', padding:'9px', textAlign:'center' }}>
                              <div style={{ fontSize:'15px', fontWeight:700, color:m.c }}>{m.v}</div>
                              <div style={{ fontSize:'10px', color:'#94A3B8', marginTop:'2px' }}>{m.l}</div>
                            </div>
                          ))}
                        </div>
                        {form.inbody_data.note && (
                          <div style={{ background:'rgba(79,70,229,0.04)', border:'0.5px solid rgba(79,70,229,0.15)',
                            borderRadius:'8px', padding:'10px 12px', fontSize:'12px', color:'#475569', lineHeight:1.6 }}>
                            {form.inbody_data.note}
                            {form.inbody_data.goals_hint?.length ? (
                              <><br/><strong style={{color:'#0F1629'}}>أهداف مقترحة: </strong>
                              {form.inbody_data.goals_hint.join(' · ')}</>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── الجهاز ── */}
          <div>
            <div style={{ fontSize:'10px', fontWeight:700, color:'#64748B', letterSpacing:'0.8px',
              marginBottom:'10px', paddingBottom:'6px', borderBottom:'0.5px solid #E2E8F0' }}>
              جهاز القياس القابل للارتداء
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              {[
                { v:'whoop', name:'WHOOP', desc:'رفع صورة يومية → Vision', tag:'مفعّل', tagColor:'#0D9488', active:true },
                { v:'none',  name:'لا يوجد جهاز', desc:'إدخال يدوي كامل', tag:'', tagColor:'', active:true },
                { v:'oura',  name:'Oura Ring', desc:'الأدق في HRV والنوم', tag:'قريباً', tagColor:'#94A3B8', active:false },
                { v:'apple', name:'Apple Watch', desc:'تصدير من Health app', tag:'قريباً', tagColor:'#94A3B8', active:false },
                { v:'garmin',name:'Garmin', desc:'Body Battery + HRV', tag:'قريباً', tagColor:'#94A3B8', active:false },
                { v:'samsung',name:'Samsung Watch', desc:'Samsung Health', tag:'قريباً', tagColor:'#94A3B8', active:false },
              ].map(d => (
                <div key={d.v}
                  onClick={() => d.active && setForm(p => ({ ...p, wearable_device: d.v as any }))}
                  style={{ position:'relative', padding:'11px 13px',
                    border:`1.5px solid ${form.wearable_device === d.v ? (d.v==='whoop'?'#0D9488':'#4F46E5') : '#E2E8F0'}`,
                    borderRadius:'10px', cursor: d.active ? 'pointer' : 'not-allowed',
                    background: form.wearable_device === d.v ? (d.v==='whoop'?'rgba(13,148,136,0.05)':'rgba(79,70,229,0.05)') : '#FAFAFA',
                    opacity: d.active ? 1 : 0.5, transition:'all 0.15s' }}>
                  {d.tag && (
                    <div style={{ position:'absolute', top:'6px', left:'6px', fontSize:'9px',
                      padding:'1px 6px', borderRadius:'20px', fontWeight:600,
                      background: d.v==='whoop'?'rgba(13,148,136,0.12)':'rgba(148,163,184,0.12)',
                      color:d.tagColor, border:`0.5px solid ${d.tagColor}30` }}>{d.tag}</div>
                  )}
                  <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'3px', marginTop: d.tag?'10px':'0' }}>
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', flexShrink:0,
                      background: form.wearable_device === d.v ? (d.v==='whoop'?'#0D9488':'#4F46E5') : '#CBD5E1' }} />
                    <div style={{ fontSize:'13px', fontWeight:600, color:'#0F1629' }}>{d.name}</div>
                  </div>
                  <div style={{ fontSize:'11px', color:'#64748B' }}>{d.desc}</div>
                </div>
              ))}
            </div>

            {form.wearable_device === 'whoop' && (
              <div style={{ marginTop:'10px', padding:'10px 13px', background:'rgba(13,148,136,0.04)',
                border:'0.5px solid rgba(13,148,136,0.2)', borderRadius:'8px', fontSize:'12px',
                color:'#475569', lineHeight:1.6 }}>
                ⌚ <strong style={{color:'#0F1629'}}>كيف يعمل مع WHOOP: </strong>
                كل صباح تُصوِّر شاشة WHOOP → Vision يستخرج Recovery + HRV + النوم + Strain → Dashboard يتحدث فوراً.
              </div>
            )}
          </div>

          {error && (
            <div style={{ background:'#FEF2F2', border:'1px solid #FCA5A5',
              borderRadius:'8px', padding:'10px 14px', color:'#DC2626', fontSize:'13px' }}>⚠️ {error}</div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 3fr', gap:'8px' }}>
            <button onClick={() => router.push('/profile/setup/step1')}
              style={{ padding:'14px', borderRadius:'10px', border:'1.5px solid #E2E8F0',
                background:'transparent', color:'#64748B', fontSize:'14px', cursor:'pointer' }}>→</button>
            <button onClick={handleNext}
              style={{ background:'#4F46E5', color:'#fff', border:'none', borderRadius:'10px',
                padding:'14px', fontSize:'15px', fontWeight:600, cursor:'pointer' }}>
              التالي — طبيعة الجسم ←
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
