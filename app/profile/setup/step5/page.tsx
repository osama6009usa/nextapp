'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateStep, loadSetupData, setSetupStep } from '@/lib/profile-store'
import { defaultStep5, type Step5Data, type SurgeryItem } from '@/lib/profile-types'

const CHRONIC = [
  { k:'diabetes',    t:'سكري / مقاومة إنسولين', c:'red' },
  { k:'bp',         t:'ضغط الدم المرتفع',       c:'red' },
  { k:'heart',      t:'أمراض القلب والشرايين',  c:'red' },
  { k:'thyroid',    t:'مشاكل الغدة الدرقية',    c:'amber' },
  { k:'hormones',   t:'اضطرابات هرمونية',       c:'amber' },
  { k:'digestion',  t:'مشاكل هضمية مزمنة',      c:'amber' },
  { k:'sleep_d',    t:'اضطرابات النوم المزمنة', c:'amber' },
  { k:'asthma',     t:'ربو / مشاكل التنفس',     c:'amber' },
  { k:'cholesterol',t:'ارتفاع الكوليسترول',     c:'normal' },
  { k:'autoimmune', t:'أمراض مناعية ذاتية',     c:'normal' },
]

const INJURIES = [
  { k:'knee',     t:'ألم / إصابة الركبة', s:'يؤثر على التمرين', c:'red' },
  { k:'back',     t:'ألم / مشاكل الظهر',  s:'',                 c:'amber' },
  { k:'shoulder', t:'إصابة الكتف',        s:'',                 c:'amber' },
  { k:'ankle',    t:'إصابة الكاحل',       s:'',                 c:'normal' },
]

const ALLERGIES = [
  { k:'gluten',    t:'غلوتين' },
  { k:'lactose',   t:'لاكتوز' },
  { k:'nuts',      t:'مكسرات' },
  { k:'shellfish', t:'بحريات' },
  { k:'eggs',      t:'بيض' },
  { k:'soy',       t:'صويا' },
]

const SEV = [
  { v:'mild', t:'خفيفة', c:'#10B981' },
  { v:'mod',  t:'متوسطة', c:'#F59E0B' },
  { v:'sev',  t:'شديدة',  c:'#EF4444' },
]

const BORDER_COLORS: Record<string,string> = {
  red:'#EF4444', amber:'#F59E0B', normal:'#4F46E5'
}

export default function Step5Page() {
  const router = useRouter()
  const [form, setForm] = useState<Step5Data>(defaultStep5)
  const [surgName, setSurgName] = useState('')
  const [surgYear, setSurgYear] = useState('')
  const [medInput, setMedInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = loadSetupData()
    if (saved.step5.surgery_status) setForm(saved.step5)
  }, [])

  // ── Chronic ──────────────────────────────────
  function toggleChronic(k: string) {
    clearChronicExcl()
    setForm(p => ({ ...p, chronic_conditions: { ...p.chronic_conditions, [k]: !p.chronic_conditions[k] } }))
  }
  function setChronicExcl(k: string) {
    setForm(p => ({ ...p, chronic_conditions: { [k]: true }, chronic_other: '' }))
  }
  function clearChronicExcl() {
    setForm(p => {
      const cc = { ...p.chronic_conditions }
      delete cc['c_none']; delete cc['c_unknown']
      return { ...p, chronic_conditions: cc }
    })
  }
  const chronicExcl = form.chronic_conditions['c_none'] || form.chronic_conditions['c_unknown']
  const chronicDone = Object.values(form.chronic_conditions).some(v => v) || !!form.chronic_other

  // ── Injuries ─────────────────────────────────
  function toggleInjury(k: string) {
    if (form.no_injuries) setForm(p => ({ ...p, no_injuries: false }))
    const cur = form.injuries[k]
    if (cur) {
      const inj = { ...form.injuries }; delete inj[k]
      setForm(p => ({ ...p, injuries: inj }))
    } else {
      setForm(p => ({ ...p, injuries: { ...p.injuries, [k]: { key: k, severity: '' } } }))
    }
  }
  function setSev(k: string, v: string) {
    setForm(p => ({ ...p, injuries: { ...p.injuries, [k]: { key: k, severity: v as any } } }))
  }
  const injuryDone = form.no_injuries || Object.keys(form.injuries).length > 0

  // ── Surgery ──────────────────────────────────
  function addSurg() {
    if (!surgName.trim()) return
    const item: SurgeryItem = { name: surgName.trim(), year: surgYear.trim() }
    setForm(p => ({ ...p, surgeries: [...p.surgeries, item] }))
    setSurgName(''); setSurgYear('')
  }
  function removeSurg(i: number) {
    setForm(p => ({ ...p, surgeries: p.surgeries.filter((_, idx) => idx !== i) }))
  }
  const surgDone = form.surgery_status === 'no' || (form.surgery_status === 'yes' && form.surgeries.length > 0)

  // ── Medications ──────────────────────────────
  function addMed() {
    const v = medInput.trim()
    if (!v || form.medications.includes(v)) return
    setForm(p => ({ ...p, medications: [...p.medications, v], no_medications: false }))
    setMedInput('')
  }
  function removeMed(m: string) {
    setForm(p => ({ ...p, medications: p.medications.filter(x => x !== m) }))
  }
  const medDone = form.no_medications || form.medications.length > 0

  // ── Allergies ────────────────────────────────
  function toggleAllergy(k: string) {
    clearAllergyExcl()
    setForm(p => ({ ...p, allergies: { ...p.allergies, [k]: !p.allergies[k] } }))
  }
  function setAllergyExcl(k: string) {
    setForm(p => ({ ...p, allergies: { [k]: true }, allergy_other: '' }))
  }
  function clearAllergyExcl() {
    setForm(p => {
      const a = { ...p.allergies }
      delete a['a_none']; delete a['a_unknown']
      return { ...p, allergies: a }
    })
  }
  const allergyDone = Object.values(form.allergies).some(v => v) || !!form.allergy_other

  const smokeDone = !!form.smoking_status
  const allDone = chronicDone && injuryDone && surgDone && medDone && smokeDone && allergyDone

  function handleNext() {
    if (!allDone) { setError('يرجى الإجابة على جميع الأقسام'); return }
    updateStep('step5', form)
    setSetupStep(6)
    router.push('/profile/setup/step6')
  }

  // ── Styles ───────────────────────────────────
  const secHdr = (title: string, done: boolean) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      marginBottom:'10px', paddingBottom:'7px', borderBottom:'0.5px solid #E2E8F0' }}>
      <span style={{ fontSize:'10px', fontWeight:700, color:'#64748B', letterSpacing:'0.8px' }}>{title}</span>
      <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'20px', fontWeight:500,
        background: done?'rgba(16,185,129,0.1)':'rgba(245,158,11,0.1)',
        color: done?'#047857':'#B45309',
        border:`0.5px solid ${done?'rgba(16,185,129,0.2)':'rgba(245,158,11,0.2)'}` }}>
        {done ? '✓ مكتمل' : 'مطلوب'}
      </span>
    </div>
  )

  const cb = (label: string, sub: string, active: boolean, color: string, onClick: ()=>void) => (
    <div onClick={onClick} style={{ display:'flex', alignItems:'flex-start', gap:'9px', padding:'10px 12px',
      border:`1.5px solid ${active ? color : '#E2E8F0'}`,
      borderRadius:'8px', cursor:'pointer', transition:'all 0.15s',
      background: active ? color + '08' : '#FAFAFA' }}>
      <div style={{ width:'16px', height:'16px', borderRadius:'4px', flexShrink:0, marginTop:'1px',
        border:`1.5px solid ${active ? color : '#CBD5E1'}`,
        background: active ? color : 'transparent', display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all 0.15s' }}>
        {active && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
      </div>
      <div>
        <div style={{ fontSize:'13px', color:'#0F1629', fontWeight:500, lineHeight:1.3 }}>{label}</div>
        {sub && <div style={{ fontSize:'10px', color:'#94A3B8', marginTop:'1px' }}>{sub}</div>}
      </div>
    </div>
  )

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
                background:n<5?'#10B981':n===5?'#4F46E5':'#E2E8F0',
                color:n<=5?'#fff':'#94A3B8' }}>{n<5?'✓':n}</div>
              {n<6&&<div style={{ flex:1, height:'2px', borderRadius:'2px', background:n<5?'#10B981':'#E2E8F0' }}/>}
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'20px' }}>
          {[['أمراض',chronicDone],['إصابات',injuryDone],['عمليات',surgDone],
            ['أدوية',medDone],['تدخين',smokeDone],['حساسية',allergyDone]].map(([l,d])=>(
            <span key={l as string} style={{ fontSize:'10px', padding:'3px 9px', borderRadius:'20px',
              border:'0.5px solid', borderColor:d?'#10B981':'#E2E8F0',
              background:d?'rgba(16,185,129,0.08)':'#F8FAFC', color:d?'#047857':'#94A3B8' }}>
              {d?'✓ ':''}{l}
            </span>
          ))}
        </div>

        <p style={{ fontSize:'11px', color:'#64748B', margin:'0 0 4px' }}>الخطوة 5 من 6</p>
        <h1 style={{ fontSize:'22px', fontWeight:700, color:'#0F1629', margin:'0 0 4px' }}>حالتك الصحية</h1>
        <p style={{ fontSize:'13px', color:'#64748B', margin:'0 0 24px' }}>جميع الأقسام إلزامية — تبقى خاصة بك تماماً</p>

        <div style={{ display:'flex', flexDirection:'column', gap:'22px' }}>

          {/* الأمراض المزمنة */}
          <div>
            {secHdr('الأمراض المزمنة والحالات الطبية', chronicDone)}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'7px' }}>
              {CHRONIC.map(c => cb(c.t, '', !!form.chronic_conditions[c.k] && !chronicExcl, BORDER_COLORS[c.c], ()=>toggleChronic(c.k)))}
              {cb('أخرى — اكتب حالتك', '', !!form.chronic_conditions['c_other'] && !chronicExcl, '#0D9488', ()=>{clearChronicExcl();setForm(p=>({...p,chronic_conditions:{...p.chronic_conditions,c_other:!p.chronic_conditions['c_other']}}))})}
              {cb('لا أعلم', '', !!form.chronic_conditions['c_unknown'], '#94A3B8', ()=>setChronicExcl('c_unknown'))}
              {cb('لا شيء مما سبق', '', !!form.chronic_conditions['c_none'], '#10B981', ()=>setChronicExcl('c_none'))}
            </div>
            {form.chronic_conditions['c_other'] && !chronicExcl && (
              <input placeholder="اكتب الحالة الصحية..." value={form.chronic_other}
                onChange={e=>setForm(p=>({...p,chronic_other:e.target.value}))}
                style={{ ...inpS, marginTop:'8px' }} />
            )}
          </div>

          {/* الإصابات */}
          <div>
            {secHdr('الإصابات والمشاكل العضلية والمفصلية', injuryDone)}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'7px' }}>
              {INJURIES.map(inj => (
                <div key={inj.k}>
                  {cb(inj.t, inj.s, !!form.injuries[inj.k] && !form.no_injuries, BORDER_COLORS[inj.c], ()=>toggleInjury(inj.k))}
                </div>
              ))}
              {cb('لا إصابات', '', form.no_injuries, '#10B981', ()=>setForm(p=>({...p,no_injuries:!p.no_injuries,injuries:{}})))}
            </div>
            {Object.keys(form.injuries).filter(k=>!form.no_injuries).map(k=>(
              <div key={k} style={{ marginTop:'6px', padding:'8px 12px', background:'#F8FAFC',
                borderRadius:'8px', border:'0.5px solid #E2E8F0' }}>
                <div style={{ fontSize:'11px', color:'#475569', marginBottom:'5px' }}>
                  شدة {INJURIES.find(i=>i.k===k)?.t}:
                </div>
                <div style={{ display:'flex', gap:'6px' }}>
                  {SEV.map(s=>(
                    <button key={s.v} onClick={()=>setSev(k,s.v)}
                      style={{ flex:1, padding:'6px', borderRadius:'6px', border:`1.5px solid ${form.injuries[k]?.severity===s.v?s.c:'#E2E8F0'}`,
                        fontSize:'12px', fontFamily:'inherit', cursor:'pointer',
                        background:form.injuries[k]?.severity===s.v?s.c+'12':'#FAFAFA',
                        color:form.injuries[k]?.severity===s.v?s.c:'#475569',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
                      <div style={{ width:'12px', height:'12px', borderRadius:'3px', flexShrink:0,
                        border:`1.5px solid ${s.c}`,
                        background:form.injuries[k]?.severity===s.v?s.c:'transparent' }}>
                        {form.injuries[k]?.severity===s.v&&<svg width="8" height="8" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
                      </div>
                      {s.t}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* العمليات */}
          <div>
            {secHdr('العمليات الجراحية السابقة', surgDone)}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'8px' }}>
              {[{v:'no',t:'لا، لم أُجرِ عمليات'},{v:'yes',t:'نعم، أجريت عملية أو أكثر'}].map(o=>(
                <div key={o.v} onClick={()=>setForm(p=>({...p,surgery_status:o.v as any}))}
                  style={{ padding:'10px', border:`1.5px solid ${form.surgery_status===o.v?(o.v==='yes'?'#4F46E5':'#10B981'):'#E2E8F0'}`,
                    borderRadius:'8px', cursor:'pointer', textAlign:'center', fontSize:'13px', fontWeight:500,
                    background:form.surgery_status===o.v?(o.v==='yes'?'rgba(79,70,229,0.05)':'rgba(16,185,129,0.05)'):'#FAFAFA',
                    color:form.surgery_status===o.v?(o.v==='yes'?'#4338CA':'#047857'):'#475569', transition:'all 0.15s' }}>
                  {o.t}
                </div>
              ))}
            </div>
            {form.surgery_status==='yes'&&(
              <div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'8px' }}>
                  {form.surgeries.map((s,i)=>(
                    <div key={i} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'4px 10px',
                      background:'rgba(239,68,68,0.08)', border:'0.5px solid rgba(239,68,68,0.2)',
                      borderRadius:'20px', fontSize:'12px', color:'#B91C1C' }}>
                      {s.year?`${s.year} — `:''}  {s.name}
                      <span onClick={()=>removeSurg(i)} style={{ cursor:'pointer', fontSize:'14px', opacity:0.7 }}>×</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                  <input placeholder="اسم العملية — مثال: رباط الركبة" value={surgName}
                    onChange={e=>setSurgName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addSurg()}
                    style={{ ...inpS, flex:2 }} />
                  <input placeholder="السنة" type="number" value={surgYear}
                    onChange={e=>setSurgYear(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addSurg()}
                    style={{ ...inpS, flex:1, maxWidth:'80px' }} />
                  <button onClick={addSurg}
                    style={{ padding:'9px 14px', borderRadius:'8px', border:'0.5px solid #4F46E5',
                      background:'rgba(79,70,229,0.06)', color:'#4338CA', fontSize:'13px',
                      fontFamily:'inherit', cursor:'pointer', whiteSpace:'nowrap' }}>+ أضف</button>
                </div>
              </div>
            )}
          </div>

          {/* الأدوية */}
          <div>
            {secHdr('الأدوية والمكملات الحالية', medDone)}
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'8px' }}>
              {form.medications.map(m=>(
                <div key={m} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'4px 10px',
                  background:'rgba(79,70,229,0.08)', border:'0.5px solid rgba(79,70,229,0.2)',
                  borderRadius:'20px', fontSize:'12px', color:'#4338CA' }}>
                  {m}<span onClick={()=>removeMed(m)} style={{ cursor:'pointer', fontSize:'14px', opacity:0.7 }}>×</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px' }}>
              <input placeholder="اكتب دواء أو مكمل ثم اضغط +" value={medInput}
                onChange={e=>setMedInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addMed()}
                style={{ ...inpS, flex:1 }} />
              <button onClick={addMed}
                style={{ padding:'9px 14px', borderRadius:'8px', border:'0.5px solid #4F46E5',
                  background:'rgba(79,70,229,0.06)', color:'#4338CA', fontSize:'13px',
                  fontFamily:'inherit', cursor:'pointer' }}>+ أضف</button>
            </div>
            <div onClick={()=>setForm(p=>({...p,no_medications:!p.no_medications,medications:[]}))}
              style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px',
                border:`0.5px dashed ${form.no_medications?'#10B981':'#CBD5E1'}`,
                borderRadius:'8px', cursor:'pointer',
                background:form.no_medications?'rgba(16,185,129,0.05)':'#FAFAFA', transition:'all 0.15s' }}>
              <div style={{ width:'16px', height:'16px', borderRadius:'4px',
                border:`1.5px solid ${form.no_medications?'#10B981':'#CBD5E1'}`,
                background:form.no_medications?'#10B981':'transparent', display:'flex',
                alignItems:'center', justifyContent:'center' }}>
                {form.no_medications&&<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
              </div>
              <span style={{ fontSize:'13px', color:'#64748B' }}>لا أتناول أدوية أو مكملات حالياً</span>
            </div>
          </div>

          {/* التدخين */}
          <div>
            {secHdr('التدخين', smokeDone)}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'7px' }}>
              {[{v:'no',t:'لا أدخّن'},{v:'past',t:'دخّنت سابقاً وتوقفت'},{v:'yes',t:'أدخّن حالياً'}].map(o=>(
                <div key={o.v} onClick={()=>setForm(p=>({...p,smoking_status:o.v as any}))}
                  style={{ padding:'9px 8px', border:`1.5px solid ${form.smoking_status===o.v?(o.v==='no'?'#10B981':o.v==='yes'?'#EF4444':'#F59E0B'):'#E2E8F0'}`,
                    borderRadius:'8px', cursor:'pointer', textAlign:'center', fontSize:'12px', fontWeight:500,
                    background:form.smoking_status===o.v?(o.v==='no'?'rgba(16,185,129,0.05)':o.v==='yes'?'rgba(239,68,68,0.05)':'rgba(245,158,11,0.05)'):'#FAFAFA',
                    color:form.smoking_status===o.v?(o.v==='no'?'#047857':o.v==='yes'?'#B91C1C':'#B45309'):'#475569',
                    transition:'all 0.15s', lineHeight:1.4 }}>{o.t}</div>
              ))}
            </div>
            {(form.smoking_status==='yes'||form.smoking_status==='past')&&(
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginTop:'8px' }}>
                <div>
                  <label style={lblS}>{form.smoking_status==='yes'?'عدد السجائر يومياً':'كم كانت السجائر يومياً؟'}</label>
                  <input type="number" placeholder="20" value={form.smoking_packs??''}
                    onChange={e=>setForm(p=>({...p,smoking_packs:parseInt(e.target.value)||null}))}
                    style={inpS} />
                </div>
                <div>
                  <label style={lblS}>{form.smoking_status==='yes'?'منذ كم سنة؟':'منذ كم سنة توقفت؟'}</label>
                  <input type="number" placeholder="5" value={form.smoking_years??''}
                    onChange={e=>setForm(p=>({...p,smoking_years:parseInt(e.target.value)||null}))}
                    style={inpS} />
                </div>
              </div>
            )}
          </div>

          {/* الحساسية */}
          <div>
            {secHdr('الحساسية الغذائية', allergyDone)}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'7px' }}>
              {ALLERGIES.map(a=>cb(a.t,'',!!form.allergies[a.k]&&!form.allergies['a_none']&&!form.allergies['a_unknown'],'#4F46E5',()=>toggleAllergy(a.k)))}
              {cb('أخرى','',!!form.allergies['a_other']&&!form.allergies['a_none']&&!form.allergies['a_unknown'],'#0D9488',()=>{clearAllergyExcl();setForm(p=>({...p,allergies:{...p.allergies,a_other:!p.allergies['a_other']}}))})}
              {cb('لا أعلم','',!!form.allergies['a_unknown'],'#94A3B8',()=>setAllergyExcl('a_unknown'))}
              {cb('لا شيء مما سبق','',!!form.allergies['a_none'],'#10B981',()=>setAllergyExcl('a_none'))}
            </div>
            {form.allergies['a_other']&&!form.allergies['a_none']&&!form.allergies['a_unknown']&&(
              <input placeholder="اكتب الحساسية..." value={form.allergy_other}
                onChange={e=>setForm(p=>({...p,allergy_other:e.target.value}))}
                style={{ ...inpS, marginTop:'8px' }} />
            )}
          </div>

          {/* ملاحظات */}
          <div>
            <label style={{ ...lblS, display:'block', marginBottom:'6px' }}>
              ملاحظات إضافية <span style={{ fontSize:'10px', color:'#94A3B8', fontWeight:400 }}>(اختياري)</span>
            </label>
            <textarea value={form.health_notes} onChange={e=>setForm(p=>({...p,health_notes:e.target.value}))}
              placeholder="عمليات سابقة، حالات خاصة، أي شيء تريد أن يعرفه فريقك الصحي..."
              style={{ ...inpS, resize:'vertical', minHeight:'68px', lineHeight:1.5 }} />
          </div>

          {error&&(
            <div style={{ background:'#FEF2F2', border:'1px solid #FCA5A5', borderRadius:'8px',
              padding:'10px 14px', color:'#DC2626', fontSize:'13px' }}>⚠️ {error}</div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 3fr', gap:'8px' }}>
            <button onClick={()=>router.push('/profile/setup/step4')}
              style={{ padding:'14px', borderRadius:'10px', border:'1.5px solid #E2E8F0',
                background:'transparent', color:'#64748B', fontSize:'14px', cursor:'pointer' }}>→</button>
            <button onClick={handleNext} disabled={!allDone}
              style={{ background:allDone?'#4F46E5':'#A5B4FC', color:'#fff', border:'none',
                borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:600,
                cursor:allDone?'pointer':'not-allowed' }}>
              التالي — أهدافك الصحية ←
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const inpS: React.CSSProperties = {
  width:'100%', padding:'9px 11px', border:'1.5px solid #E2E8F0', borderRadius:'8px',
  fontSize:'13px', color:'#0F1629', background:'#FAFAFA', outline:'none',
  boxSizing:'border-box', fontFamily:"'IBM Plex Sans Arabic', system-ui, sans-serif"
}
const lblS: React.CSSProperties = {
  fontSize:'11px', fontWeight:600, color:'#475569', letterSpacing:'0.3px'
}
