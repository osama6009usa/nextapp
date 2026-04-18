code = """'use client'
import React, { useState, useRef, useEffect } from 'react'
import CircularGauge from '@/components/CircularGauge'
import { useDailyScore } from '@/hooks/useDailyScore'

const ML: Record<string, string> = {
  first_70: 'اول مرة 70+',
  first_80: 'اول مرة 80+',
  first_90: 'اول مرة 90+',
  streak_3: '3 ايام متتالية',
  streak_7: 'اسبوع كامل',
  biosov_700: 'BioSov 700+',
  biosov_800: 'BioSov 800+',
}

function Toast({ messages }: { messages: string[] }) {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState('')
  const queue = useRef<string[]>([])
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (!messages.length) return
    queue.current = messages.map(m => ML[m] ?? m)
    showNext()
  }, [messages])
  function showNext() {
    if (!queue.current.length) return
    setCurrent(queue.current.shift()!)
    setVisible(true)
    timer.current = setTimeout(() => { setVisible(false); setTimeout(showNext, 400) }, 4000)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  if (!current) return null
  const ty = visible ? '0' : '60px'
  const tr = 'translateX(-50%) translateY(' + ty + ')'
  return (
    <div style={{
      position:'fixed', bottom:28, left:'50%', zIndex:9999,
      transform:tr, opacity:visible?1:0,
      transition:'all 0.35s ease', background:'#0F1629',
      color:'#fff', padding:'10px 24px', borderRadius:99,
      fontSize:13, fontWeight:600, whiteSpace:'nowrap', pointerEvents:'none',
    }}>{current}</div>
  )
}

export default function DailyScoreCard() {
  const { dailyScore, biosovScore, breakdown, daysUsed, trend, forecast, forecastMsg, oneAction, milestones, isLoading } = useDailyScore()
  const [expanded, setExpanded] = useState(false)
  const ti = trend==='up' ? '↑' : trend==='down' ? '↓' : '—'
  const tc = trend==='up' ? '#22C55E' : trend==='down' ? '#EF4444' : '#9ca3af'
  const gc = dailyScore>=85 ? '#22C55E' : dailyScore>=70 ? '#4F46E5' : dailyScore>=50 ? '#F59E0B' : '#EF4444'
  const gb = dailyScore>=85 ? '#f0fdf4' : dailyScore>=70 ? '#f5f3ff' : dailyScore>=50 ? '#fffbeb' : '#fef2f2'
  const gbb = dailyScore>=85 ? '#dcfce7' : dailyScore>=70 ? '#ede9fe' : dailyScore>=50 ? '#fef9c3' : '#fee2e2'
  const sl = dailyScore>=85 ? 'مثالي' : dailyScore>=70 ? 'ممتاز' : dailyScore>=50 ? 'جيد' : 'يحتاج تحسين'
  const gradBg = 'linear-gradient(90deg,' + gc + ',#7C3AED)'
  const axes = [
    { label:'🔄 التعافي',  score:breakdown.recovery.score, max:30, extra:String(breakdown.recovery.raw)+'/100' },
    { label:'🥩 البروتين', score:breakdown.protein.score,  max:20, extra:Math.round(breakdown.protein.raw)+'g/'+String(breakdown.protein.goal)+'g' },
    { label:'💧 الماء',    score:breakdown.water.score,    max:20, extra:String(breakdown.water.raw)+'/'+String(breakdown.water.goal)+'ml' },
    { label:'🌙 الصيام',  score:breakdown.fasting.score,  max:20, extra:breakdown.fasting.completed ? 'مكتمل' : breakdown.fasting.hours>0 ? String(breakdown.fasting.hours)+'h' : 'لم يبدأ' },
    { label:'💪 التمرين', score:breakdown.workout.score,  max:10, extra:breakdown.workout.exists ? 'مسجل' : '—' },
  ]
  if (isLoading) return (
    <div style={{borderRadius:16,border:'0.5px solid #e5e7eb',background:'#fff',overflow:'hidden'}}>
      <div style={{height:3,background:'linear-gradient(90deg,#4F46E5,#7C3AED)'}} />
      <div style={{padding:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{background:'#f5f3ff',borderRadius:12,height:160}} />
        <div style={{background:'#0F1629',borderRadius:12,height:160}} />
      </div>
    </div>
  )
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <Toast messages={milestones} />
      <div style={{borderRadius:16,border:'0.5px solid #e5e7eb',background:'#fff',overflow:'hidden'}}>
        <div style={{height:3,background:gradBg}} />
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px 0'}}>
          <span style={{fontSize:11,color:'#6b7280',fontWeight:500}}>الدرجة اليومية</span>
          <span style={{fontSize:10,fontWeight:600,color:gc,background:gbb,padding:'2px 8px',borderRadius:99}}>● لحظي</span>
        </div>
        <div style={{padding:'14px 16px 16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div onClick={()=>setExpanded(e=>!e)} style={{background:gb,borderRadius:12,padding:'14px 10px',display:'flex',flexDirection:'column',alignItems:'center',gap:8,cursor:'pointer'}}>
            <CircularGauge value={dailyScore} max={100} size={100} color={gc} />
            <span style={{fontSize:11,fontWeight:700,color:gc,background:gbb,padding:'2px 12px',borderRadius:99}}>{sl}</span>
            <span style={{fontSize:10,color:'#a5b4fc'}}>{expanded ? '▲ اخفاء' : '▼ تفاصيل'}</span>
          </div>
          <div style={{background:'linear-gradient(160deg,#0F1629,#1e2a4a)',borderRadius:12,padding:14,display:'flex',flexDirection:'column',justifyContent:'space-between',minHeight:168}}>
            <span style={{fontSize:10,color:'#a5b4fc',fontWeight:600}}>🧬 BIOSOV</span>
            <div>
              <div style={{display:'flex',alignItems:'baseline',gap:4}}>
                <span style={{fontSize:30,fontWeight:800,lineHeight:1,color:biosovScore>0?'#fff':'#4b5563',fontFamily:'monospace'}}>{biosovScore}</span>
                <span style={{fontSize:11,color:'#6366f1'}}>/1000</span>
                <span style={{fontSize:13,fontWeight:800,color:tc,marginRight:2}}>{ti}</span>
              </div>
              <span style={{fontSize:10,color:'#6366f1',marginTop:2,display:'block'}}>({daysUsed}/10 ايام)</span>
            </div>
            <div style={{borderTop:'1px solid #1e3a5f',paddingTop:8}}>
              <p style={{fontSize:10,color:'#a5b4fc',margin:0,fontWeight:600}}>📈 متوقع: <span style={{color:'#fff',fontWeight:800}}>{forecast}/100</span></p>
              {forecastMsg && <p style={{fontSize:10,color:'#4ade80',margin:'3px 0 0'}}>{forecastMsg}</p>}
            </div>
          </div>
        </div>
      </div>
      {expanded && (
        <div style={{background:'#fff',borderRadius:16,border:'0.5px solid #e5e7eb',padding:16}}>
          <span style={{fontSize:10,color:'#9ca3af',fontWeight:600,display:'block',marginBottom:12}}>تفاصيل المحاور</span>
          {axes.map(ax => {
            const p = Math.min(ax.score/ax.max,1)
            const c = p>=0.85?'#22C55E':p>=0.70?'#4F46E5':p>=0.50?'#F59E0B':'#EF4444'
            const t = p>=0.85?'#16a34a':p>=0.70?'#4F46E5':p>=0.50?'#d97706':'#dc2626'
            return (
              <div key={ax.label} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                  <span style={{fontSize:12,color:'#374151',fontWeight:500}}>{ax.label}</span>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:10,color:'#9ca3af',background:'#f9fafb',padding:'1px 6px',borderRadius:99}}>{ax.extra}</span>
                    <span style={{fontSize:11,fontWeight:700,color:t,fontFamily:'monospace'}}>{Math.round(ax.score*10)/10}/{ax.max}</span>
                  </div>
                </div>
                <div style={{height:5,borderRadius:99,background:'#f1f5f9',overflow:'hidden'}}>
                  <div style={{width:String(p*100)+'%',height:'100%',borderRadius:99,background:c,transition:'width 0.8s ease'}}/>
                </div>
              </div>
            )
          })}
          <div style={{marginTop:12,padding:'10px 12px',background:'#eef2ff',borderRadius:10,border:'0.5px solid #e0e7ff'}}>
            <p style={{fontSize:12,fontWeight:600,color:'#3730a3',margin:0}}>📈 متوقع: <span style={{color:'#4F46E5',fontWeight:800}}>{forecast}/100</span></p>
          </div>
        </div>
      )}
      {oneAction && dailyScore<=90 && (
        <div style={{background:'#4F46E5',borderRadius:16,padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:40,height:40,borderRadius:11,flexShrink:0,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{oneAction.icon}</div>
          <div>
            <p style={{fontSize:10,color:'rgba(255,255,255,0.55)',margin:'0 0 3px',fontWeight:600}}>افضل اجراء الان</p>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <p style={{fontSize:13,fontWeight:700,color:'#fff',margin:0}}>{oneAction.label}</p>
              <span style={{fontSize:11,color:'#fff',background:'rgba(255,255,255,0.2)',padding:'2px 10px',borderRadius:99}}>+{oneAction.points} نقطة</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}"""

with open('C:/nextapp/components/DailyScoreCard.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('done')
