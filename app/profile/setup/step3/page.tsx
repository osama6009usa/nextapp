'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateStep, loadSetupData, setSetupStep } from '@/lib/profile-store'
import { defaultStep3, type Step3Data, type Constitution } from '@/lib/profile-types'

const QUESTIONS = [
  {
    q: 'كيف تصف بنية جسمك الطبيعية؟',
    opts: [
      { v:'vata',  t:'نحيف بطبعي', s:'صعب يزيد حتى لو أكل كثير' },
      { v:'pitta', t:'متوسط ومتناسق', s:'يتغير بسهولة عند التغيير' },
      { v:'kapha', t:'ضخم أو ممتلئ', s:'يكتسب الوزن بسرعة' },
    ]
  },
  {
    q: 'كيف تكون طاقتك خلال اليوم؟',
    opts: [
      { v:'vata',  t:'متقلبة', s:'موجات عالية ثم انهيار مفاجئ' },
      { v:'pitta', t:'مرتفعة وثابتة', s:'أكمل أي شيء أبدأه' },
      { v:'kapha', t:'ثابتة لكن بطيئة', s:'أحتاج وقتاً للإقلاع' },
    ]
  },
  {
    q: 'كيف تصف نومك بشكل عام؟',
    opts: [
      { v:'vata',  t:'خفيف ومتقطع', s:'أستيقظ كثيراً أو أتقلب' },
      { v:'pitta', t:'متوسط نسبياً', s:'ذهني نشط قبل النوم' },
      { v:'kapha', t:'ثقيل وطويل', s:'صعب أصحى وأنا راضٍ' },
      { v:'other', t:'أخرى', s:'لا ينطبق عليّ ما سبق' },
    ]
  },
  {
    q: 'كيف يكون هضمك وعلاقتك بالطعام؟',
    opts: [
      { v:'vata',  t:'متقلب وحساس', s:'أحياناً جيد وأحياناً مشاكل' },
      { v:'pitta', t:'قوي جداً', s:'أجوع بسرعة وأهضم بسرعة' },
      { v:'kapha', t:'بطيء ومنتظم', s:'لا أجوع كثيراً لكن أحب الأكل' },
    ]
  },
  {
    q: 'كيف تستجيب للضغط والتحديات؟',
    opts: [
      { v:'vata',  t:'قلق وتشتت', s:'أفكر بكل الاحتمالات وأتوتر' },
      { v:'pitta', t:'تحدي وحسم', s:'أتحرك فوراً وأحياناً أنفجر' },
      { v:'kapha', t:'تجنب وانسحاب', s:'أحتاج وقت وحدي ثم أعود' },
    ]
  },
  {
    q: 'كيف يتعافى جسمك بعد التمرين الشاق؟',
    opts: [
      { v:'vata',  t:'بطيء جداً', s:'أحتاج يومين أو أكثر' },
      { v:'pitta', t:'متوسط', s:'يوم راحة يكفي' },
      { v:'kapha', t:'سريع', s:'أقدر أتمرن في اليوم التالي' },
    ]
  },
  {
    q: 'متى كان آخر التزام رياضي منتظم؟',
    opts: [
      { v:'vata',  t:'أقل من شهر', s:'لا زلت في روتين منتظم' },
      { v:'pitta', t:'1-3 أشهر', s:'انقطعت مؤخراً' },
      { v:'kapha', t:'3-6 أشهر', s:'انقطعت فترة' },
      { v:'other', t:'أكثر من 6 أشهر أو لم أمارس قط', s:'بداية جديدة' },
    ]
  },
  {
    q: 'كيف تتحمل درجات الحرارة؟',
    opts: [
      { v:'vata',  t:'أحب الدفء', s:'البرد يزعجني' },
      { v:'pitta', t:'أحب البرد', s:'الحرارة تزعجني وأتعرق بسرعة' },
      { v:'kapha', t:'معتدل', s:'لا أتأثر كثيراً' },
    ]
  },
]

const TYPES = {
  other: { name:'أخرى', badge:'غير محدد', color:'#94A3B8',
    desc:'', traits:[] },
  vata:  { name:'Vata — واتا',  badge:'الدستور الريحي',  color:'#6366F1',
    desc:'طاقة إبداعية عالية مع حساسية في الهضم والنوم. جسمك يستجيب بسرعة للتغيير لكنه يحتاج روتيناً منتظماً.',
    traits:['نوم خفيف','هضم حساس','طاقة متقلبة','إبداع عالي','يحتاج دفء'] },
  pitta: { name:'Pitta — بيتا', badge:'الدستور الناري',  color:'#F59E0B',
    desc:'أداء ومنافسة — جسمك يحرق ويبني بكفاءة. قوة هضمية ممتازة وطاقة مستدامة لكن الالتهاب نقطة ضعفك.',
    traits:['هضم قوي','طاقة ثابتة','تنافسي','يحتاج تبريد','عرضة للالتهاب'] },
  kapha: { name:'Kapha — كافا', badge:'الدستور الأرضي', color:'#10B981',
    desc:'تحمّل عالٍ وثبات نفسي قوي. جسمك يخزن الطاقة بكفاءة ويتعافى ببطء لكن بعمق.',
    traits:['تحمّل عالي','ثبات نفسي','نوم عميق','يحتاج كارديو','استقلاب بطيء'] },
}

export default function Step3Page() {
  const router = useRouter()
  const [form, setForm] = useState<Step3Data>(defaultStep3)

  useEffect(() => {
    const saved = loadSetupData()
    if (saved.step3.answers.some(a => a !== null)) setForm(saved.step3)
  }, [])

  function pick(qIdx: number, val: 'vata' | 'pitta' | 'kapha') {
    const newAnswers = [...form.answers] as Step3Data['answers']
    newAnswers[qIdx] = val
    const counts = { vata: 0, pitta: 0, kapha: 0 }
    newAnswers.forEach(a => { if (a) counts[a]++ })
    const done = newAnswers.filter(a => a !== null).length
    const scores = {
      vata:  done ? Math.round(counts.vata  / done * 100) : 0,
      pitta: done ? Math.round(counts.pitta / done * 100) : 0,
      kapha: done ? Math.round(counts.kapha / done * 100) : 0,
    }
    const winner = (Object.keys(counts) as Constitution[]).reduce((a, b) =>
      counts[a as keyof typeof counts] >= counts[b as keyof typeof counts] ? a : b
    ) as Constitution
    setForm({ answers: newAnswers, bio_constitution: done === 8 ? winner : '', constitution_scores: scores })
  }

  function handleNext() {
    if (form.answers.filter(a => a !== null).length < 8) return
    updateStep('step3', form)
    setSetupStep(4)
    router.push('/profile/setup/step4')
  }

  const answered = form.answers.filter(a => a !== null).length
  const winner = form.bio_constitution
  const T = winner ? TYPES[winner as keyof typeof TYPES] : null

  return (
    <div style={{ minHeight:'100vh', background:'#EEF2F8', display:'flex',
      alignItems:'center', justifyContent:'center', padding:'24px 16px',
      fontFamily:"'IBM Plex Sans Arabic', system-ui, sans-serif", direction:'rtl' }}>
      <div style={{ background:'#fff', borderRadius:'14px', padding:'36px',
        width:'100%', maxWidth:'520px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>

        {/* Progress */}
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'28px' }}>
          {[1,2,3,4,5,6].map(n => (
            <div key={n} style={{ display:'flex', alignItems:'center', gap:'6px', flex: n < 6 ? 1 : 'none' }}>
              <div style={{ width:'26px', height:'26px', borderRadius:'50%', display:'flex',
                alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:600, flexShrink:0,
                background: n < 3 ? '#10B981' : n === 3 ? '#4F46E5' : '#E2E8F0',
                color: n <= 3 ? '#fff' : '#94A3B8' }}>
                {n < 3 ? '✓' : n}
              </div>
              {n < 6 && <div style={{ flex:1, height:'2px', borderRadius:'2px',
                background: n < 3 ? '#10B981' : '#E2E8F0' }} />}
            </div>
          ))}
        </div>

        <p style={{ fontSize:'11px', color:'#64748B', margin:'0 0 4px' }}>الخطوة 3 من 6</p>
        <h1 style={{ fontSize:'22px', fontWeight:700, color:'#0F1629', margin:'0 0 4px' }}>طبيعة جسمك</h1>
        <p style={{ fontSize:'13px', color:'#64748B', margin:'0 0 6px' }}>8 أسئلة — المنصة تستنتج دستورك الحيوي تلقائياً</p>

        {/* شريط تقدم الأسئلة */}
        <div style={{ height:'3px', background:'#E2E8F0', borderRadius:'2px', marginBottom:'24px', overflow:'hidden' }}>
          <div style={{ height:'100%', background:'#4F46E5', borderRadius:'2px',
            width:`${(answered/7)*100}%`, transition:'width 0.4s' }} />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {QUESTIONS.map((q, qi) => (
            <div key={qi}>
              <div style={{ fontSize:'10px', fontWeight:600, color:'#94A3B8', marginBottom:'4px' }}>
                السؤال {qi+1} من 8
              </div>
              <div style={{ fontSize:'14px', fontWeight:500, color:'#0F1629', marginBottom:'8px', lineHeight:1.5 }}>
                {q.q}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {q.opts.map(o => {
                  const sel = form.answers[qi] === o.v
                  const C = TYPES[o.v as keyof typeof TYPES].color
                  return (
                    <div key={o.v} onClick={() => pick(qi, o.v as any)}
                      style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 13px',
                        border:`1.5px solid ${sel ? C : '#E2E8F0'}`,
                        borderRadius:'10px', cursor:'pointer',
                        background: sel ? C + '10' : '#FAFAFA', transition:'all 0.15s' }}>
                      <div style={{ width:'14px', height:'14px', borderRadius:'50%', flexShrink:0,
                        border:`2px solid ${C}`, background: sel ? C : 'transparent', transition:'all 0.15s' }} />
                      <div>
                        <div style={{ fontSize:'13px', fontWeight:600, color:'#0F1629' }}>{o.t}</div>
                        <div style={{ fontSize:'11px', color:'#64748B', marginTop:'1px' }}>{o.s}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {qi < QUESTIONS.length - 1 && (
                <div style={{ height:'0.5px', background:'#E2E8F0', marginTop:'16px' }} />
              )}
            </div>
          ))}

          {/* شريط الثقة */}
          {answered > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginTop:'4px' }}>
              {([['vata','#6366F1'],['pitta','#F59E0B'],['kapha','#10B981']] as const).map(([k,c]) => (
                <div key={k} style={{ background:'#F8FAFC', border:'0.5px solid #E2E8F0',
                  borderRadius:'8px', padding:'8px 10px', textAlign:'center' }}>
                  <div style={{ fontSize:'10px', color:'#64748B', marginBottom:'4px',
                    textTransform:'capitalize' }}>{k}</div>
                  <div style={{ height:'3px', background:'#E2E8F0', borderRadius:'2px', overflow:'hidden', marginBottom:'3px' }}>
                    <div style={{ height:'100%', background:c, borderRadius:'2px',
                      width:`${form.constitution_scores[k as keyof typeof form.constitution_scores]}%`,
                      transition:'width 0.5s' }} />
                  </div>
                  <div style={{ fontSize:'12px', fontWeight:700, color:'#0F1629' }}>
                    {form.constitution_scores[k as keyof typeof form.constitution_scores]}%
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* النتيجة */}
          {T && winner && (
            <div style={{ border:`1.5px solid ${T.color}`, borderRadius:'12px',
              padding:'16px', background:`${T.color}08` }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                <div style={{ fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'20px',
                  background:`${T.color}18`, color:T.color }}>{T.badge}</div>
                <div style={{ fontSize:'18px', fontWeight:700, color:'#0F1629' }}>{T.name}</div>
              </div>
              <div style={{ fontSize:'13px', color:'#475569', lineHeight:1.6, marginBottom:'10px' }}>{T.desc}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {T.traits.map(t => (
                  <span key={t} style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px',
                    border:'0.5px solid #E2E8F0', color:'#64748B', background:'#F8FAFC' }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {answered > 0 && answered < 8 && (
            <div style={{ fontSize:'12px', color:'#94A3B8', textAlign:'center' }}>
              {8 - answered} سؤال متبقٍ لاستكمال الدستور
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 3fr', gap:'8px' }}>
            <button onClick={() => router.push('/profile/setup/step2')}
              style={{ padding:'14px', borderRadius:'10px', border:'1.5px solid #E2E8F0',
                background:'transparent', color:'#64748B', fontSize:'14px', cursor:'pointer' }}>→</button>
            <button onClick={handleNext} disabled={answered < 8}
              style={{ background: answered < 8 ? '#A5B4FC' : '#4F46E5',
                color:'#fff', border:'none', borderRadius:'10px', padding:'14px',
                fontSize:'15px', fontWeight:600,
                cursor: answered < 8 ? 'not-allowed' : 'pointer' }}>
              التالي — نمط الحياة ←
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

