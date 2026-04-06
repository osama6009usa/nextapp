'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateStep, loadSetupData, setSetupStep } from '@/lib/profile-store'
import { defaultStep4, type Step4Data } from '@/lib/profile-types'

const OPTS = {
  activity: [
    { v:'sedentary', icon:'??', t:'???? ??????',   s:'?? ????? — ??? ?????' },
    { v:'light',     icon:'??', t:'???? ????',    s:'??? ???? ?? ???? ????' },
    { v:'moderate',  icon:'???', t:'?????',        s:'2-3 ?????? ????????' },
    { v:'active',    icon:'??', t:'????',          s:'4-5 ?????? ????????' },
    { v:'athlete',   icon:'??', t:'?????',         s:'?????? ?? ?????' },
  ],
  diet: [
    { v:'balanced',      icon:'??', t:'??????' },
    { v:'keto',          icon:'??', t:'????' },
    { v:'mediterranean', icon:'??', t:'??????' },
    { v:'vegetarian',    icon:'??', t:'?????' },
    { v:'unhealthy',     icon:'??', t:'??? ??? ???' },
    { v:'no_system',     icon:'??', t:'???? ????' },
  ],
  meals: [
    { v:'1', t:'????', s:'OMAD' },
    { v:'2', t:'??????', s:'' },
    { v:'3', t:'3 ?????', s:'' },
    { v:'4', t:'4 ?????', s:'' },
    { v:'5', t:'5+ ?????', s:'' },
    { v:'irregular', t:'??? ?????', s:'' },
  ],
  lastmeal: [
    { v:'before6', t:'??? 6?',  s:'???? ????' },
    { v:'6to7',    t:'6 – 7?',  s:'' },
    { v:'7to8',    t:'7 – 8?',  s:'' },
    { v:'8to9',    t:'8 – 9?',  s:'' },
    { v:'9to10',   t:'9 – 10?', s:'' },
    { v:'after10', t:'??? 10?', s:'' },
  ],
  snacktype: [
    { v:'nuts',    icon:'??', t:'??????' },
    { v:'fruit',   icon:'??', t:'?????' },
    { v:'sweets',  icon:'??', t:'??????' },
    { v:'chips',   icon:'??', t:'?????' },
    { v:'protein', icon:'??', t:'??????' },
    { v:'mixed',   icon:'??', t:'?????' },
  ],
  caftype: [
    { v:'coffee', icon:'?', t:'????' },
    { v:'tea',    icon:'??', t:'???' },
    { v:'energy', icon:'?', t:'????' },
    { v:'both',   icon:'??', t:'?????' },
  ],
  caftime: [
    { v:'before12', t:'??? 12?', s:'' },
    { v:'12to2',    t:'12 – 2?', s:'' },
    { v:'2to4',     t:'2 – 4?',  s:'' },
    { v:'4to6',     t:'4 – 6?',  s:'' },
    { v:'after6',   t:'??? 6?',  s:'' },
  ],
  water: [
    { v:'less1',  icon:'??', t:'??? ?? ???',   s:'' },
    { v:'1to2',   icon:'??', t:'1 – 2 ???',    s:'' },
    { v:'2to3',   icon:'??', t:'2 – 3 ???',    s:'' },
    { v:'more3',  icon:'??', t:'???? ?? 3 ???', s:'' },
    { v:'unknown', icon:'??', t:'?? ????',       s:'' },
  ],
  fasting: [
    { v:'never',        icon:'??', t:'?? ???? ??' },
    { v:'beginner',     icon:'??', t:'?????', s:'??????? 12-14 ????' },
    { v:'intermediate', icon:'??', t:'?????', s:'16/8 ???? ?????' },
    { v:'advanced',     icon:'?', t:'?????', s:'18+ ???? ?? OMAD' },
  ],
}

const SECTIONS = ['activity','diet','meals','lastmeal','snack','caf','water','fasting','sleep'] as const
const SEC_LABELS: Record<string,string> = {
  activity:'??????', diet:'???????', meals:'???????', lastmeal:'??? ????',
  snack:'??????', caf:'????????', water:'?????', fasting:'??????', sleep:'?????'
}

// -- Time Picker helpers --------------------------
const HOURS = Array.from({length:12},(_,i)=>i+1)
const MINS  = Array.from({length:12},(_,i)=>i*5)

function fmtTime(h:number,m:number,ap:string){
  if(!h) return ''
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ap}`
}

function toHr24(h:number,m:number,ap:string):number{
  let h24=h
  if(ap==='?'&&h!==12) h24+=12
  if(ap==='?'&&h===12) h24=0
  return h24+m/60
}

interface TimePicker {
  ampm: string; hour: number; min: number
  openGrid: 'h'|'m'|''
  done: boolean
}
const defTP = ():TimePicker => ({ ampm:'', hour:0, min:0, openGrid:'', done:false })

export default function Step4Page() {
  const router = useRouter()
  const [form, setForm] = useState<Step4Data>(defaultStep4)
  const [doneSecs, setDoneSecs] = useState<Record<string,boolean>>({})
  const [sleepTP, setSleepTP] = useState<TimePicker>(defTP())
  const [wakeTP,  setWakeTP]  = useState<TimePicker>(defTP())

  // ????? ???????? ???????? ??? ??????
  useEffect(() => {
    const saved = loadSetupData()
    if (saved.step4) setForm(p => ({ ...p, ...saved.step4 }))
  }, [])

  // ??? ?????? ??? ?? ????? ?? form
  useEffect(() => {
    updateStep('step4', form)
  }, [form])

  const set = (k:keyof Step4Data, v:any) => setForm(p=>({...p,[k]:v}))

  function pickOpt(sec:string, val:string){
    set(sec as keyof Step4Data, val)
    setDoneSecs(p=>({...p,[sec]:true}))
  }

  // -- Time Picker ---------------------------------
  function setAMPM(type:'sleep'|'wake', ap:string){
    if(type==='sleep') setSleepTP(p=>({...p,ampm:ap,openGrid:'h'}))
    else setWakeTP(p=>({...p,ampm:ap,openGrid:'h'}))
  }
  function setHour(type:'sleep'|'wake', h:number){
    if(type==='sleep') setSleepTP(p=>({...p,hour:h,openGrid:'m'}))
    else setWakeTP(p=>({...p,hour:h,openGrid:'m'}))
  }
  function setMin(type:'sleep'|'wake', m:number){
    if(type==='sleep'){
      setSleepTP(p=>{ const n={...p,min:m,openGrid:'' as const,done:true}
        set('sleep_time', fmtTime(n.hour,m,n.ampm)); checkSleep(n,wakeTP); return n })
    } else {
      setWakeTP(p=>{ const n={...p,min:m,openGrid:'' as const,done:true}
        set('wake_time', fmtTime(n.hour,m,n.ampm)); checkSleep(sleepTP,n); return n })
    }
  }
  function toggleGrid(type:'sleep'|'wake', mode:'h'|'m'){
    if(type==='sleep') setSleepTP(p=>({...p,openGrid:p.openGrid===mode?'':mode}))
    else setWakeTP(p=>({...p,openGrid:p.openGrid===mode?'':mode}))
  }
  function checkSleep(s:TimePicker, w:TimePicker){
    if(!s.done||!w.done) return
    const sv=toHr24(s.hour,s.min,s.ampm), wv=toHr24(w.hour,w.min,w.ampm)
    let diff=wv-sv; if(diff<=0)diff+=24
    diff=Math.round(diff*10)/10
    set('sleep_hours', diff)
    setDoneSecs(p=>({...p,sleep:true}))
  }

  function isDone(sec:string){
    if(sec==='snack')    return form.has_snack!==null&&(form.has_snack===false||!!form.snack_type)
    if(sec==='caf')      return form.has_caffeine!==null&&(form.has_caffeine===false||(!!form.caffeine_type&&!!form.last_caffeine_time))
    if(sec==='sleep')    return !!form.sleep_hours
    if(sec==='activity') return !!form.activity_level
    if(sec==='diet')     return !!form.diet_type
    if(sec==='meals')    return !!form.meals_per_day
    if(sec==='lastmeal') return !!form.last_meal_time
    if(sec==='water')    return !!form.daily_water
    if(sec==='fasting')  return !!form.fasting_level
    return false
  }

  const allDone = SECTIONS.every(s=>isDone(s))
  const sleepHrs = form.sleep_hours??0
  SECTIONS.forEach(s => console.log(s, ':', isDone(s), '| value:', form[s as keyof Step4Data]))


  function handleNext(){
    if(!allDone) return
    updateStep('step4', form)
    setSetupStep(5)
    router.push('/profile/setup/step5')
  }

  const prog = (label:string, active:boolean, done:boolean) => (
    <div style={{ width:'26px', height:'26px', borderRadius:'50%', display:'flex',
      alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:600, flexShrink:0,
      background: done?'#10B981':active?'#4F46E5':'#E2E8F0',
      color: (done||active)?'#fff':'#94A3B8' }}>{done?'?':label}</div>
  )

  const secDot = (sec:string) => (
    <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'20px', fontWeight:500,
      background: isDone(sec)?'rgba(16,185,129,0.1)':'rgba(245,158,11,0.1)',
      color: isDone(sec)?'#047857':'#B45309',
      border:`0.5px solid ${isDone(sec)?'rgba(16,185,129,0.2)':'rgba(245,158,11,0.2)'}` }}>
      {isDone(sec)?'? ?????':'?????'}
    </span>
  )

  const row2 = (items:any[], field:string, cols=2) => (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:'7px' }}>
      {items.map(o=>{
        const sel=(form[field as keyof Step4Data] as string)===o.v
        return(
          <div key={o.v} onClick={()=>pickOpt(field,o.v)}
            style={{ display:'flex', alignItems:'center', gap:'8px', padding:'9px 11px',
              border:`1.5px solid ${sel?'#4F46E5':'#E2E8F0'}`,
              borderRadius:'8px', cursor:'pointer', background:sel?'rgba(79,70,229,0.05)':'#FAFAFA',
              transition:'all 0.15s' }}>
            <div style={{ width:'14px', height:'14px', borderRadius:'50%', flexShrink:0,
              border:`2px solid ${sel?'#4F46E5':'#CBD5E1'}`,
              background:sel?'#4F46E5':'transparent' }} />
            {o.icon&&<span style={{fontSize:'14px'}}>{o.icon}</span>}
            <div style={{flex:1}}>
              <div style={{fontSize:'12px',fontWeight:500,color:'#0F1629'}}>{o.t}</div>
              {o.s&&<div style={{fontSize:'10px',color:'#94A3B8'}}>{o.s}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )

  const timePicker = (type:'sleep'|'wake') => {
    const tp = type==='sleep'?sleepTP:wakeTP
    const C  = type==='sleep'?'#6366F1':'#F59E0B'
    const label = type==='sleep'?'?? ??? ?????':'?? ??? ?????????'
    return (
      <div>
        <div style={{fontSize:'11px',fontWeight:600,color:'#475569',marginBottom:'6px'}}>{label}</div>
        {/* ?/? */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5px',marginBottom:'6px'}}>
          {['?','?'].map(ap=>(
            <button key={ap} onClick={()=>setAMPM(type,ap)}
              style={{padding:'6px',borderRadius:'8px',border:`1.5px solid ${tp.ampm===ap?C:'#E2E8F0'}`,
                fontSize:'12px',fontFamily:'inherit',cursor:'pointer',fontWeight:500,
                background:tp.ampm===ap?C:'#FAFAFA',color:tp.ampm===ap?'#fff':'#475569',transition:'all 0.12s'}}>{ap}</button>
          ))}
        </div>
        {/* ????? ?????? ???????? */}
        <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:'4px',marginBottom:'6px',direction:'ltr'}}>
          <div>
            <div onClick={()=>tp.ampm&&toggleGrid(type,'h')}
              style={{padding:'10px 6px',borderRadius:'8px',fontSize:'22px',fontWeight:700,textAlign:'center',
                cursor:tp.ampm?'pointer':'not-allowed',transition:'all 0.15s',
                border:`1.5px solid ${tp.openGrid==='h'||tp.hour?C:'#E2E8F0'}`,
                background:tp.openGrid==='h'||tp.hour?`${C}0D`:'#FAFAFA',color:tp.hour?C:'#94A3B8'}}>
              {tp.hour?String(tp.hour).padStart(2,'0'):'--'}
            </div>
            <div style={{fontSize:'9px',color:'#94A3B8',textAlign:'center',marginTop:'2px'}}>????</div>
          </div>
          <div style={{fontSize:'20px',fontWeight:700,color:'#94A3B8',textAlign:'center'}}>:</div>
          <div>
            <div onClick={()=>tp.hour&&toggleGrid(type,'m')}
              style={{padding:'10px 6px',borderRadius:'8px',fontSize:'22px',fontWeight:700,textAlign:'center',
                cursor:tp.hour?'pointer':'not-allowed',transition:'all 0.15s',
                border:`1.5px solid ${tp.openGrid==='m'||tp.done?C:'#E2E8F0'}`,
                background:tp.openGrid==='m'||tp.done?`${C}0D`:'#FAFAFA',color:tp.done?C:'#94A3B8'}}>
              {tp.done?String(tp.min).padStart(2,'0'):'--'}
            </div>
            <div style={{fontSize:'9px',color:'#94A3B8',textAlign:'center',marginTop:'2px'}}>?????</div>
          </div>
        </div>
        {/* ???? ??????? */}
        {tp.openGrid==='h'&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'4px',marginBottom:'4px',
            border:`0.5px solid ${C}30`,borderRadius:'8px',overflow:'hidden',direction:'ltr'}}>
            {HOURS.map(h=>(
              <div key={h} onClick={()=>setHour(type,h)}
                style={{padding:'8px 4px',textAlign:'center',fontSize:'13px',fontWeight:500,cursor:'pointer',
                  border:`0.5px solid #E2E8F040`,
                  background:tp.hour===h?C:'#FAFAFA',color:tp.hour===h?'#fff':'#475569',transition:'all 0.1s'}}>
                {String(h).padStart(2,'0')}
              </div>
            ))}
          </div>
        )}
        {/* ???? ??????? */}
        {tp.openGrid==='m'&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'4px',marginBottom:'4px',
            border:`0.5px solid ${C}30`,borderRadius:'8px',overflow:'hidden',direction:'ltr'}}>
            {MINS.map(m=>(
              <div key={m} onClick={()=>setMin(type,m)}
                style={{padding:'8px 4px',textAlign:'center',fontSize:'13px',fontWeight:500,cursor:'pointer',
                  border:`0.5px solid #E2E8F040`,
                  background:tp.min===m&&tp.done?C:'#FAFAFA',color:tp.min===m&&tp.done?'#fff':'#475569',transition:'all 0.1s'}}>
                {String(m).padStart(2,'0')}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#EEF2F8',display:'flex',
      alignItems:'center',justifyContent:'center',padding:'24px 16px',
      fontFamily:"'IBM Plex Sans Arabic', system-ui, sans-serif",direction:'rtl'}}>
      <div style={{background:'#fff',borderRadius:'14px',padding:'36px',
        width:'100%',maxWidth:'520px',boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}}>

        {/* Progress bar */}
        <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'28px'}}>
          {[1,2,3,4,5,6].map(n=>(
            <div key={n} style={{display:'flex',alignItems:'center',gap:'6px',flex:n<6?1:'none'}}>
              {prog(String(n), n===4, n<4)}
              {n<6&&<div style={{flex:1,height:'2px',borderRadius:'2px',background:n<4?'#10B981':'#E2E8F0'}}/>}
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div style={{display:'flex',gap:'5px',flexWrap:'wrap',marginBottom:'20px'}}>
          {SECTIONS.map(s=>(
            <span key={s} style={{fontSize:'10px',padding:'3px 9px',borderRadius:'20px',
              border:'0.5px solid',transition:'all 0.2s',
              borderColor:isDone(s)?'#10B981':'#E2E8F0',
              background:isDone(s)?'rgba(16,185,129,0.08)':'#F8FAFC',
              color:isDone(s)?'#047857':'#94A3B8'}}>
              {isDone(s)?'? ':''}{SEC_LABELS[s]}
            </span>
          ))}
        </div>

        <p style={{fontSize:'11px',color:'#64748B',margin:'0 0 4px'}}>?????? 4 ?? 6</p>
        <h1 style={{fontSize:'22px',fontWeight:700,color:'#0F1629',margin:'0 0 4px'}}>??? ????? ??????</h1>
        <p style={{fontSize:'13px',color:'#64748B',margin:'0 0 24px'}}>9 ????? — ????? ?????? ????? ??????? ?? ????? ?????</p>

        <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>

          {/* ?????? */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px',paddingBottom:'6px',borderBottom:'0.5px solid #E2E8F0'}}>
              <span style={{fontSize:'10px',fontWeight:700,color:'#64748B',letterSpacing:'0.8px'}}>????? ????? ??????</span>
              {secDot('activity')}
            </div>
            {row2(OPTS.activity,'activity_level',1)}
          </div>

          {/* ??????? */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px',paddingBottom:'6px',borderBottom:'0.5px solid #E2E8F0'}}>
              <span style={{fontSize:'10px',fontWeight:700,color:'#64748B',letterSpacing:'0.8px'}}>??? ?????? ??????</span>
              {secDot('diet')}
            </div>
            {row2(OPTS.diet,'diet_type',2)}
          </div>

          {/* ??? ??????? */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px',paddingBottom:'6px',borderBottom:'0.5px solid #E2E8F0'}}>
              <span style={{fontSize:'10px',fontWeight:700,color:'#64748B',letterSpacing:'0.8px'}}>?? ???? ???? ?? ??????</span>
              {secDot('meals')}
            </div>
            {row2(OPTS.meals,'meals_per_day',3)}
          </div>

          {/* ??? ???? */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px',paddingBottom:'6px',borderBottom:'0.5px solid #E2E8F0'}}>
              <span style={{fontSize:'10px',fontWeight:700,color:'#64748B',letterSpacing:'0.8px'}}>???? ??? ???? ?? ??????</span>
              {secDot('lastmeal')}
            </div>
            {row2(OPTS.lastmeal,'last_meal_time',3)}
          </div>

          {/* ?????? */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px',paddingBottom:'6px',borderBottom:'0.5px solid #E2E8F0'}}>
              <span style={{fontSize:'10px',fontWeight:700,color:'#64748B',letterSpacing:'0.8px'}}>?? ?????? ???? ??? ????????</span>
              {secDot('snack')}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom: form.has_snack?'10px':'0'}}>
              {[{v:true,t:'??? — ?????'},{v:false,t:'?? — ?? ????'}].map(o=>(
                <div key={String(o.v)} onClick={()=>{set('has_snack',o.v);if(!o.v)setDoneSecs(p=>({...p,snack:true}))}}
                  style={{padding:'9px',border:`1.5px solid ${form.has_snack===o.v?(o.v?'#4F46E5':'#10B981'):'#E2E8F0'}`,
                    borderRadius:'8px',cursor:'pointer',textAlign:'center',fontSize:'13px',fontWeight:500,
                    background:form.has_snack===o.v?(o.v?'rgba(79,70,229,0.05)':'rgba(16,185,129,0.05)'):'#FAFAFA',
                    color:form.has_snack===o.v?(o.v?'#4338CA':'#047857'):'#475569',transition:'all 0.15s'}}>
                  {o.t}
                </div>
              ))}
            </div>

          </div>

                    {/* ?????? — multi-select */}
          {form.has_snack===true&&(
            <div style={{marginTop:'10px'}}>
              <div style={{fontSize:'11px',color:'#475569',marginBottom:'8px',fontWeight:500}}>??? ?????? (???? ?????? ???? ?? ????):</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'7px'}}>
                {OPTS.snacktype.map(o=>{
                  const selected = Array.isArray(form.snack_type) ? form.snack_type.includes(o.v) : form.snack_type===o.v
                  return(
                    <div key={o.v} onClick={()=>{
                      const prev = Array.isArray(form.snack_type) ? form.snack_type : (form.snack_type?[form.snack_type]:[])
                      const next = prev.includes(o.v) ? prev.filter((x:string)=>x!==o.v) : [...prev,o.v]
                      set('snack_type', next)
                      if(next.length>0) setDoneSecs(p=>({...p,snack:true}))
                    }}
                      style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',
                        padding:'10px 6px',border:`1.5px solid ${selected?'#4F46E5':'#E2E8F0'}`,
                        borderRadius:'10px',cursor:'pointer',
                        background:selected?'rgba(79,70,229,0.07)':'#FAFAFA',transition:'all 0.15s'}}>
                      <span style={{fontSize:'18px'}}>{o.icon}</span>
                      <span style={{fontSize:'11px',fontWeight:selected?600:400,color:selected?'#4338CA':'#475569'}}>{o.t}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
{/* ???????? */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px',paddingBottom:'6px',borderBottom:'0.5px solid #E2E8F0'}}>
              <span style={{fontSize:'10px',fontWeight:700,color:'#64748B',letterSpacing:'0.8px'}}>?? ???? ?????????</span>
              {secDot('caf')}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:form.has_caffeine?'10px':'0'}}>
              {[{v:true,t:'???'},{v:false,t:'?? ????'}].map(o=>(
                <div key={String(o.v)} onClick={()=>{set('has_caffeine',o.v);if(!o.v)setDoneSecs(p=>({...p,caf:true}))}}
                  style={{padding:'9px',border:`1.5px solid ${form.has_caffeine===o.v?(o.v?'#4F46E5':'#10B981'):'#E2E8F0'}`,
                    borderRadius:'8px',cursor:'pointer',textAlign:'center',fontSize:'13px',fontWeight:500,
                    background:form.has_caffeine===o.v?(o.v?'rgba(79,70,229,0.05)':'rgba(16,185,129,0.05)'):'#FAFAFA',
                    color:form.has_caffeine===o.v?(o.v?'#4338CA':'#047857'):'#475569',transition:'all 0.15s'}}>
                  {o.t}
                </div>
              ))}
            </div>
            {form.has_caffeine===true&&(
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                <div>
                  <div style={{fontSize:'11px',color:'#475569',marginBottom:'6px',fontWeight:500}}>??? ????????:</div>
                  {row2(OPTS.caftype,'caffeine_type',2)}
                </div>
                <div>
                  <div style={{fontSize:'11px',color:'#475569',marginBottom:'6px',fontWeight:500}}>??? ???? ???? ???:</div>
                  {row2(OPTS.caftime,'last_caffeine_time',2)}
                </div>
              </div>
            )}
          </div>

          {/* ????? */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px',paddingBottom:'6px',borderBottom:'0.5px solid #E2E8F0'}}>
              <span style={{fontSize:'10px',fontWeight:700,color:'#64748B',letterSpacing:'0.8px'}}>???? ????? ??????? ???????</span>
              {secDot('water')}
            </div>
            {row2(OPTS.water,'daily_water',2)}
          </div>

          {/* ?????? */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px',paddingBottom:'6px',borderBottom:'0.5px solid #E2E8F0'}}>
              <span style={{fontSize:'10px',fontWeight:700,color:'#64748B',letterSpacing:'0.8px'}}>?????? ?? ?????? ???????</span>
              {secDot('fasting')}
            </div>
            {row2(OPTS.fasting,'fasting_level',1)}
          </div>

          {/* ????? */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px',paddingBottom:'6px',borderBottom:'0.5px solid #E2E8F0'}}>
              <span style={{fontSize:'10px',fontWeight:700,color:'#64748B',letterSpacing:'0.8px'}}>???? ???? — ???? ?? ????</span>
              {secDot('sleep')}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
              {timePicker('sleep')}
              {timePicker('wake')}
            </div>
            {form.sleep_hours&&form.sleep_hours>0&&(
              <div style={{marginTop:'10px',display:'flex',alignItems:'center',gap:'10px',padding:'10px 13px',
                background:'#F8FAFC',border:'0.5px solid #E2E8F0',borderRadius:'8px'}}>
                <div style={{fontSize:'18px',fontWeight:700,color:'#0F1629'}}>{form.sleep_hours} ????</div>
                <span style={{fontSize:'11px',color:'#94A3B8'}}>
                  {form.sleep_time} — {form.wake_time}
                </span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 3fr',gap:'8px',marginTop:'4px'}}>
            <button onClick={()=>router.push('/profile/setup/step3')}
              style={{padding:'14px',borderRadius:'10px',border:'1.5px solid #E2E8F0',
                background:'transparent',color:'#64748B',fontSize:'14px',cursor:'pointer'}}>?</button>
            <button onClick={handleNext} disabled={!allDone}
              style={{background:allDone?'#4F46E5':'#A5B4FC',color:'#fff',border:'none',
                borderRadius:'10px',padding:'14px',fontSize:'15px',fontWeight:600,
                cursor:allDone?'pointer':'not-allowed'}}>
              ?????? — ????? ?????? ?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
















